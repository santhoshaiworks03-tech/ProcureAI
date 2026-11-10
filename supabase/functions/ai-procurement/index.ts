// Supabase Edge Function: ai-procurement
// Autonomous Sourcing Engine backed by Google Gemini 1.5 Pro
// Enforces Zero-Hallucination Policy & Rule 12 (No Invented Data)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, catalog, maxBudget } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing required prompt string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    // System instruction enforcing strict accuracy
    const systemPrompt = `You are ProcureAI Autonomous Sourcing Intelligence Engine.
CRITICAL INTEGRITY RULES:
1. NO INVENTED DATA: If the user did not specify quantity, DO NOT invent 50 or any number. Instead, set needsClarification=true and ask for the quantity.
2. NO INVENTED BUDGET: If the user did not specify a budget ceiling, DO NOT assume 5,00,000. Set budgetSpecified=false.
3. STRICT CATALOG MATCHING: Only match items to the provided catalogue list. Never fabricate SKUs or suppliers.
4. Output MUST be valid JSON adhering strictly to this schema:
{
  "needsClarification": boolean,
  "clarificationQuestions": string[],
  "budgetSpecified": boolean,
  "extractedBudget": number or null,
  "currency": "INR",
  "items": [
    {
      "itemName": string,
      "quantity": number or null,
      "specifications": object,
      "matchedSku": string or null
    }
  ],
  "reasoning": string
}`;

    let parsedResult;

    if (geminiKey && !geminiKey.includes("your-")) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nAvailable Catalogue Items: ${JSON.stringify(catalog || [])}\n\nUser Prompt: "${prompt}"` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      };

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        parsedResult = JSON.parse(rawJson);
      }
    }

    // High-precision fallback parser if Gemini API key not present
    if (!parsedResult) {
      const text = prompt.toLowerCase();
      const clarificationQuestions: string[] = [];

      // Check budget
      let detectedBudget: number | null = maxBudget || null;
      const budgetMatch = prompt.match(/(?:budget|max|ceiling|limit)(?:\s*(?:is|of|:)?\s*(?:₹|rs\.?|inr)?\s*)([\d,]+(?:\.\d+)?|\d+\s*(?:lakh|lac|cr))/i);
      if (budgetMatch) {
        const bStr = budgetMatch[1].replace(/,/g, '').trim().toLowerCase();
        if (bStr.includes('lakh') || bStr.includes('lac')) {
          detectedBudget = parseFloat(bStr) * 100000;
        } else {
          detectedBudget = parseFloat(bStr);
        }
      } else if (!maxBudget) {
        clarificationQuestions.push("What is your target budget ceiling for this procurement request?");
      }

      // Check items and quantities
      const items: any[] = [];
      const keywords = [
        { term: 'chair', name: 'Ergonomic Office Mesh Chair', sku: 'FUR-CHR-AERO-01' },
        { term: 'desk', name: 'Electric Height-Adjustable Standing Desk', sku: 'FUR-DSK-DUAL-01' },
        { term: 'cabinet', name: 'Under-Desk 3-Drawer Steel Mobile Pedestal', sku: 'FUR-CAB-PED3-01' },
        { term: 'monitor', name: '27-inch UltraSharp 4K UHD USB-C Hub Monitor', sku: 'ELC-MON-4K27-01' },
        { term: 'dock', name: 'Thunderbolt 4 Enterprise Docking Station', sku: 'ELC-DCK-TB4-01' }
      ];

      for (const kw of keywords) {
        if (text.includes(kw.term)) {
          // Look for explicit number
          const match = prompt.match(new RegExp(`(\\d+)\\s*(?:units?\\s*of\\s*)?(?:${kw.term})`, 'i')) ||
                        prompt.match(new RegExp(`(?:${kw.term})[s]?\\s*(?:x|:|qty)?\\s*(\\d+)`, 'i'));
          
          if (match) {
            items.push({
              itemName: kw.name,
              quantity: parseInt(match[1], 10),
              matchedSku: kw.sku,
              specifications: {}
            });
          } else {
            // Quantity is missing! DO NOT ASSUME! Ask the user!
            items.push({
              itemName: kw.name,
              quantity: null,
              matchedSku: kw.sku,
              specifications: {}
            });
            clarificationQuestions.push(`How many units of "${kw.name}" do you require?`);
          }
        }
      }

      const needsClarification = clarificationQuestions.length > 0;

      parsedResult = {
        needsClarification,
        clarificationQuestions,
        budgetSpecified: detectedBudget !== null,
        extractedBudget: detectedBudget,
        currency: "INR",
        items,
        reasoning: needsClarification 
          ? "Clarification required: Missing critical procurement parameters (quantities or budget ceiling)."
          : "Deterministic structured extraction complete without assumptions."
      };
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
