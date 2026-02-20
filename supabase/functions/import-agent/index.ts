import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Intelligent AI Sourcing Agent
// Uses OpenAI if API key available, falls back to smart simulation
async function generateSupplierQuotes(request: any): Promise<any[]> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a global sourcing expert specializing in finding suppliers for products to import to Ghana. Always respond with valid JSON only, no markdown.",
            },
            {
              role: "user",
              content: `Find 3 suppliers for this import request:
Product: ${request.title || request.product_name}
Description: ${request.description || request.notes || "N/A"}
Quantity: ${request.quantity}
Preferred Shipping: ${request.preferred_shipping || request.shipping_method || "air"}

Return a JSON array of exactly 3 supplier objects with these exact fields:
[{
  "name": "supplier company name",
  "country": "country name",
  "flag": "country flag emoji",
  "product_cost": number in USD,
  "air_shipping_cost": number in USD,
  "sea_shipping_cost": number in USD,
  "air_delivery_days": number between 5-12,
  "sea_delivery_days": number between 30-45,
  "moq": minimum order quantity as number,
  "rating": supplier rating 4.0-5.0
}]`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices[0].message.content.trim();
        return JSON.parse(content);
      }
    } catch (e) {
      console.error("OpenAI error, falling back to simulation:", e);
    }
  }

  // Smart simulation based on product type keywords
  const productName = (request.title || request.product_name || "").toLowerCase();
  const qty = request.quantity || 1;

  // Base product cost estimation
  let baseCost = 50;
  if (productName.includes("phone") || productName.includes("mobile")) baseCost = 200;
  else if (productName.includes("laptop") || productName.includes("computer")) baseCost = 450;
  else if (productName.includes("tv") || productName.includes("television")) baseCost = 350;
  else if (productName.includes("cloth") || productName.includes("fabric") || productName.includes("fashion")) baseCost = 15;
  else if (productName.includes("shoe") || productName.includes("sneaker")) baseCost = 35;
  else if (productName.includes("bag") || productName.includes("backpack")) baseCost = 25;
  else if (productName.includes("watch")) baseCost = 80;
  else if (productName.includes("machine") || productName.includes("equipment")) baseCost = 800;
  else if (productName.includes("food") || productName.includes("grocery")) baseCost = 20;

  const unitCost = baseCost * qty;

  return [
    {
      name: "Guangzhou Global Trade Co.",
      country: "China",
      flag: "🇨🇳",
      product_cost: +(unitCost * 0.85).toFixed(2),
      air_shipping_cost: +(unitCost * 0.15).toFixed(2),
      sea_shipping_cost: +(unitCost * 0.06).toFixed(2),
      air_delivery_days: 7,
      sea_delivery_days: 38,
      moq: 1,
      rating: 4.7,
    },
    {
      name: "Istanbul Premium Exports",
      country: "Turkey",
      flag: "🇹🇷",
      product_cost: +(unitCost * 0.95).toFixed(2),
      air_shipping_cost: +(unitCost * 0.12).toFixed(2),
      sea_shipping_cost: +(unitCost * 0.07).toFixed(2),
      air_delivery_days: 5,
      sea_delivery_days: 32,
      moq: 1,
      rating: 4.5,
    },
    {
      name: "Dubai International Supply",
      country: "UAE",
      flag: "🇦🇪",
      product_cost: +(unitCost * 1.05).toFixed(2),
      air_shipping_cost: +(unitCost * 0.1).toFixed(2),
      sea_shipping_cost: +(unitCost * 0.06).toFixed(2),
      air_delivery_days: 4,
      sea_delivery_days: 28,
      moq: 1,
      rating: 4.8,
    },
  ];
}

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { request_id } = await req.json();

    if (!request_id) {
      return new Response(JSON.stringify({ error: "request_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Fetch the import request
    const { data: request, error: reqError } = await supabase
      .from("import_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (reqError || !request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Update status to finding_supplier
    await supabase
      .from("import_requests")
      .update({ status: "finding_supplier" })
      .eq("id", request_id);

    // 3. Generate supplier quotes via AI
    const suppliers = await generateSupplierQuotes(request);

    // 4. Insert quotes for both air and sea shipping
    const quotesToInsert = [];
    for (const supplier of suppliers) {
      // Air shipping quote
      quotesToInsert.push({
        request_id,
        supplier_name: supplier.name,
        supplier_country: supplier.country,
        product_cost: supplier.product_cost,
        shipping_cost: supplier.air_shipping_cost,
        shipping_method: "air",
        delivery_days: supplier.air_delivery_days,
        total_cost: +(supplier.product_cost + supplier.air_shipping_cost).toFixed(2),
        service_fee: +(supplier.product_cost * 0.05).toFixed(2),
      });
      // Sea shipping quote
      quotesToInsert.push({
        request_id,
        supplier_name: supplier.name,
        supplier_country: supplier.country,
        product_cost: supplier.product_cost,
        shipping_cost: supplier.sea_shipping_cost,
        shipping_method: "sea",
        delivery_days: supplier.sea_delivery_days,
        total_cost: +(supplier.product_cost + supplier.sea_shipping_cost).toFixed(2),
        service_fee: +(supplier.product_cost * 0.05).toFixed(2),
      });
    }

    await supabase.from("import_quotes").insert(quotesToInsert);

    // 5. Mark request as processed and status as quoted
    await supabase
      .from("import_requests")
      .update({ ai_processed: true, status: "quoted" })
      .eq("id", request_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Import agent processed successfully",
        quotes_generated: quotesToInsert.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("Import agent error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
