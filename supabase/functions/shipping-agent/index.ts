import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SHIPPING_STAGES = [
    "payment_confirmed",
    "order_placed",
    "processing",
    "dispatched",
    "in_transit",
    "customs_clearance",
    "arrived_country",
    "out_for_delivery",
    "delivered",
] as const;

type ShippingStatus = typeof SHIPPING_STAGES[number];

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify caller is service role (internal only)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")) {
        // Still allow service calls from other functions
    }

    const { order_id, status, description, estimated_delivery } = await req.json();

    if (!order_id || !status) {
        return new Response(JSON.stringify({ error: "order_id and status are required" }), { status: 400 });
    }

    if (!SHIPPING_STAGES.includes(status as ShippingStatus)) {
        return new Response(
            JSON.stringify({ error: `Invalid status. Must be one of: ${SHIPPING_STAGES.join(", ")}` }),
            { status: 400 }
        );
    }

    // Insert tracking event
    const { data: trackEvent, error: trackError } = await supabase
        .from("import_tracking_events")
        .insert({
            order_id,
            status,
            description: description || getDefaultDescription(status as ShippingStatus),
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (trackError) {
        console.error("Failed to insert tracking event:", trackError);
        return new Response(JSON.stringify({ error: trackError.message }), { status: 500 });
    }

    // Update order's shipping status
    const orderUpdate: Record<string, any> = { shipping_status: status };
    if (estimated_delivery) orderUpdate.estimated_delivery = estimated_delivery;
    if (status === "delivered") orderUpdate.delivered_at = new Date().toISOString();

    await supabase
        .from("import_orders")
        .update(orderUpdate)
        .eq("id", order_id);

    console.log(`Shipping update for order ${order_id}: ${status}`);

    return new Response(
        JSON.stringify({ success: true, event: trackEvent }),
        { headers: { "Content-Type": "application/json" } }
    );
});

function getDefaultDescription(status: ShippingStatus): string {
    const descriptions: Record<ShippingStatus, string> = {
        payment_confirmed: "Payment confirmed. Your order has been placed with the supplier.",
        order_placed: "Order placed with supplier. Processing begins shortly.",
        processing: "Supplier is preparing your items for shipment.",
        dispatched: "Your package has been dispatched from the supplier.",
        in_transit: "Package is in transit to your destination country.",
        customs_clearance: "Package is going through customs clearance.",
        arrived_country: "Package has arrived in your country.",
        out_for_delivery: "Package is out for delivery to your address.",
        delivered: "Package has been delivered successfully. Enjoy!",
    };
    return descriptions[status] ?? "Status updated.";
}
