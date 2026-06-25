import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    const { record, table } = payload;
    
    // table is either 'schemes' or 'crop_diseases'
    if (!record || !table) {
      return new Response("Missing record or table", { status: 400 });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    let contextData = "";
    if (table === "schemes") {
      contextData = `Scheme Name: ${record.title}\nDescription: ${record.description}\nEligibility: ${record.eligibility}`;
    } else {
      contextData = `Disease Name: ${record.name}\nSymptoms: ${record.symptoms}\nCauses: ${record.causes}`;
    }

    const systemPrompt = `You are an AI assistant generating FAQs for agricultural content.
Context Data:
${contextData}

Generate exactly 3 FAQs based on the Context Data.
Output MUST be a strictly valid JSON array of objects with 'question' and 'answer' properties.`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: "Generate the FAQs now." }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (!aiRes.ok) throw new Error("Gemini API Error");

    const aiData = await aiRes.json();
    const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const faqs = JSON.parse(resultText);

    const entityType = table === "schemes" ? "scheme" : "disease";
    
    const inserts = faqs.map((faq: any) => ({
      entity_type: entityType,
      entity_id: record.id,
      question: faq.question,
      answer: faq.answer
    }));

    await supabase.from("faqs").insert(inserts);

    return new Response(JSON.stringify({ success: true, count: inserts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error generating FAQs:", e);
    return new Response(JSON.stringify({ error: "Failed to generate FAQs" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
