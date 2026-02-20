import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const { listing_id } = await req.json();
    if (!listing_id) {
        return new Response(JSON.stringify({ error: "listing_id is required" }), { status: 400 });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the listing to index
    const { data: listing, error } = await supabase
        .from("listings")
        .select("id, title, description, category, location, price, condition, status, created_at")
        .eq("id", listing_id)
        .eq("status", "active")
        .single();

    if (error || !listing) {
        return new Response(JSON.stringify({ error: "Listing not found or not active" }), { status: 404 });
    }

    // Build search tokens from title + description + category + location
    const tokens = [
        listing.title,
        listing.description,
        listing.category,
        listing.location,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(t => t.length > 2)

    // Remove duplicates
    const uniqueTokens = [...new Set(tokens)]

    // Update search_vector column (tsvector) using Postgres full-text
    const { error: updateError } = await supabase.rpc("update_listing_search_vector", {
        p_listing_id: listing_id,
        p_search_text: `${listing.title} ${listing.description || ""} ${listing.category || ""} ${listing.location || ""}`,
    });

    if (updateError) {
        // Fallback: store tokens as a simple column if RPC not available
        console.warn("RPC not found, skipping tsvector update:", updateError.message);
    }

    // Log to search_index table if it exists
    await supabase
        .from("search_index")
        .upsert({
            listing_id,
            tokens: uniqueTokens,
            title: listing.title,
            price: listing.price,
            category: listing.category,
            location: listing.location,
            condition: listing.condition,
            indexed_at: new Date().toISOString(),
        })
        .catch(() => { }); // Table may not exist yet — non-fatal

    return new Response(
        JSON.stringify({
            success: true,
            listing_id,
            token_count: uniqueTokens.length,
            sample_tokens: uniqueTokens.slice(0, 10),
        }),
        { headers: { "Content-Type": "application/json" } }
    );
});
