import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "jsr:@std/crypto";

const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";

async function verifyPaystackSignature(body: string, signature: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(PAYSTACK_SECRET),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
    return hex === signature;
}

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    // Verify webhook authenticity
    const valid = await verifyPaystackSignature(body, signature);
    if (!valid) {
        console.error("Invalid Paystack signature");
        return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`Paystack event: ${event.event}`, event.data?.reference);

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.event === "charge.success") {
        const { reference, amount, metadata } = event.data;
        const amountGHS = amount / 100; // Paystack sends in pesewas

        // Update payment record
        await supabase
            .from("payments")
            .update({ status: "completed", paid_at: new Date().toISOString() })
            .eq("reference", reference);

        // Update associated order if linked
        const orderId = metadata?.order_id;
        if (orderId) {
            await supabase
                .from("import_orders")
                .update({ payment_status: "paid" })
                .eq("id", orderId);

            // Log tracking event
            await supabase.from("import_tracking_events").insert({
                order_id: orderId,
                status: "payment_confirmed",
                description: `Payment of GHS ${amountGHS.toFixed(2)} confirmed via Paystack (ref: ${reference})`,
                created_at: new Date().toISOString(),
            });
        }

        console.log(`Payment confirmed: ${reference} — GHS ${amountGHS}`);
    }

    if (event.event === "charge.failed") {
        const { reference } = event.data;
        await supabase
            .from("payments")
            .update({ status: "failed" })
            .eq("reference", reference);
        console.log(`Payment failed: ${reference}`);
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
    });
});
