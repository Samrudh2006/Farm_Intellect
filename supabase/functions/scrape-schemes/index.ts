import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireAdminOrSecret, isAllowedOutboundUrl } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Replace with Deno.env in production
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// A system prompt telling Gemini exactly how to extract the schema
const SYSTEM_PROMPT = `
You are an expert AI for Farm Intellect. You read agricultural scheme documents, press releases, or raw text and extract the details into a STRICT JSON format. 
Your output MUST be a valid JSON array of objects, with NO Markdown wrapping (no \`\`\`json).

Each object must perfectly match this TypeScript interface:
{
  "id": "unique-kebab-case-string",
  "title": "Full Name of Scheme",
  "description": "A 1-2 sentence summary of what the scheme provides.",
  "category": "subsidy" | "loan" | "insurance" | "training" | "equipment",
  "amount": "The financial benefit (e.g., '₹6,000/year' or '50% subsidy')",
  "eligibility": ["Rule 1", "Rule 2", "Rule 3"],
  "deadline": "e.g., 'Ongoing' or a specific date",
  "status": "active" | "ending_soon" | "upcoming",
  "state": "All India" or a specific state name,
  "documents": ["Aadhaar Card", "Land Records", etc.],
  "target_farmer_types": array of ["marginal", "small", "large", "tenant", "fpo"],
  "interest_focus": array of ["income", "insurance", "credit", "equipment", "training"],
  "irrigation_needs": array of ["low", "medium", "high"],
  "min_land_holding": number (optional, e.g. 0),
  "max_land_holding": number (optional, e.g. 5),
  "requires_documents": boolean,
  "crop_focus": ["wheat", "rice", "all"],
  "apply_url": "https://url-to-apply",
  "learn_more_url": "https://url-to-learn"
}
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, url } = await req.json();
    
    if (!text && !url) {
      throw new Error("You must provide raw 'text' or a 'url' to parse.");
    }

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing from Edge Function secrets.");
    }

    let rawText = text;
    if (url && !text) {
        // Fetch raw text from URL (if possible)
        const r = await fetch(url);
        rawText = await r.text();
        // Just take the first 15000 characters to avoid huge payloads
        rawText = rawText.substring(0, 15000);
    }

    console.log("Sending data to Gemini API...");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [{
            parts: [{ text: `Parse this scheme information into JSON:\n\n${rawText}` }]
        }],
        generationConfig: {
            temperature: 0.1,
            response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
        throw new Error(`Gemini API returned ${response.status}: ${await response.text()}`);
    }

    const aiData = await response.json();
    const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("Failed to get text from Gemini");

    let schemes = [];
    try {
        schemes = JSON.parse(resultText);
        if (!Array.isArray(schemes)) schemes = [schemes];
    } catch (e) {
        throw new Error("Failed to parse Gemini output as JSON: " + resultText);
    }

    // Insert into Supabase
    const { data: inserted, error: insertError } = await supabase
        .from('schemes')
        .upsert(schemes, { onConflict: 'id' })
        .select();

    if (insertError) {
        throw new Error("Supabase insert failed: " + insertError.message);
    }

    return new Response(
      JSON.stringify({ ok: true, message: `Successfully upserted ${schemes.length} schemes.`, schemes: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Scrape Scheme Error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
