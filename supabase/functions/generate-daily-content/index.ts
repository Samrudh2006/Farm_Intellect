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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    const systemPrompt = `You are an AI Content Engine for 'Farm Intellect', an Indian agricultural app.
Generate exactly ONE farming tip, ONE weather-based advisory, and ONE crop calendar task for today's date: ${new Date().toISOString()}.
Output MUST be a valid JSON array of objects with the properties: "content" (string) and "type" (one of: 'tip', 'alert', 'calendar', 'advisory').`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: "Generate the daily content." }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (!aiRes.ok) throw new Error("Gemini API Error");

    const aiData = await aiRes.json();
    const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const contents = JSON.parse(resultText);

    const inserts = contents.map((c: any) => ({
      content: c.content,
      type: c.type,
      published: true // auto-publish
    }));

    await supabase.from("social_posts").insert(inserts);

    return new Response(JSON.stringify({ success: true, count: inserts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error generating daily content:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
