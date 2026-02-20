import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

const POLICY_RULES = `
You are a content moderation AI for EverydayAZA, a Ghanaian marketplace.
Analyze the listing title and description. Flag if it contains:
- Fraudulent or scam language
- Illegal items (weapons, drugs, stolen goods)
- Explicit/adult content
- Prohibited items (counterfeit goods, endangered species products)
- Spam or fake listings

Respond ONLY with valid JSON in this format:
{
  "flagged": boolean,
  "reason": "Brief reason if flagged, empty string if not",
  "confidence": number between 0 and 1,
  "category": "fraud|illegal|explicit|spam|ok"
}
`;

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const { listing_id } = await req.json();
    if (!listing_id) {
        return new Response(JSON.stringify({ error: "listing_id required" }), { status: 400 });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the listing
    const { data: listing, error } = await supabase
        .from("listings")
        .select("id, title, description, category, price")
        .eq("id", listing_id)
        .single();

    if (error || !listing) {
        return new Response(JSON.stringify({ error: "Listing not found" }), { status: 404 });
    }

    // Run AI moderation
    const prompt = `Title: ${listing.title}\nCategory: ${listing.category}\nPrice: GHS ${listing.price}\nDescription: ${listing.description || "No description"}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: POLICY_RULES },
                { role: "user", content: prompt },
            ],
            max_tokens: 200,
            temperature: 0.1,
        }),
    });

    const aiData = await response.json();
    let result = { flagged: false, reason: "", confidence: 0, category: "ok" };

    try {
        result = JSON.parse(aiData.choices[0].message.content);
    } catch {
        console.error("Failed to parse AI response:", aiData);
    }

    // Update listing with moderation result
    if (result.flagged) {
        await supabase
            .from("listings")
            .update({
                status: "flagged",
                moderation_reason: result.reason,
            })
            .eq("id", listing_id);

        // Log admin action
        await supabase.from("admin_actions").insert({
            action_type: "auto_flag",
            target_id: listing_id,
            target_type: "listing",
            reason: `AI Moderation (${result.category}): ${result.reason}`,
            created_at: new Date().toISOString(),
        });

        console.log(`Listing ${listing_id} FLAGGED: ${result.reason}`);
    } else {
        console.log(`Listing ${listing_id} passed moderation (confidence: ${result.confidence})`);
    }

    return new Response(JSON.stringify({ listing_id, ...result }), {
        headers: { "Content-Type": "application/json" },
    });
});
