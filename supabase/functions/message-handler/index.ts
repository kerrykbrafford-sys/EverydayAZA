import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
    // This function is designed to be called via Supabase database webhooks
    // or directly from other edge functions when a new message is inserted.
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const payload = await req.json();

    // Support both direct calls and Supabase webhook format
    const record = payload.record ?? payload;
    const { id: message_id, conversation_id, sender_id, content } = record;

    if (!conversation_id || !sender_id) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update conversation last_message_at
    await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation_id);

    // Get conversation to find the recipient
    const { data: conversation } = await supabase
        .from("conversations")
        .select("buyer_id, seller_id, listings(title)")
        .eq("id", conversation_id)
        .single();

    if (!conversation) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
    }

    // Determine the recipient (the user who did NOT send the message)
    const recipient_id =
        conversation.buyer_id === sender_id
            ? conversation.seller_id
            : conversation.buyer_id;

    // Get sender info
    const { data: sender } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", sender_id)
        .single();

    const senderName = sender?.full_name || "Someone";
    const listingTitle = (conversation as any).listings?.title || "a listing";

    // Log notification (in a real system this would trigger email/push)
    console.log(`New message notification for user ${recipient_id}:`, {
        from: senderName,
        listing: listingTitle,
        preview: content?.slice(0, 100),
    });

    // Insert into a notifications table if it exists
    const { error: notifError } = await supabase.from("notifications").insert({
        user_id: recipient_id,
        type: "new_message",
        title: `New message from ${senderName}`,
        body: `Re: ${listingTitle} — "${content?.slice(0, 60)}${content?.length > 60 ? "..." : ""}"`,
        metadata: { conversation_id, message_id, sender_id },
        read: false,
        created_at: new Date().toISOString(),
    });

    if (notifError) {
        // Notifications table may not exist yet — log but don't fail
        console.warn("Could not insert notification:", notifError.message);
    }

    return new Response(
        JSON.stringify({ success: true, notified: recipient_id }),
        { headers: { "Content-Type": "application/json" } }
    );
});
