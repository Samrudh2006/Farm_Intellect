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

    const { rawText } = await req.json();

    if (!rawText) {
      return new Response(JSON.stringify({ error: "Missing rawText" }), { status: 400, headers: corsHeaders });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const systemPrompt = `You are an expert agricultural botanist and plant pathologist.
Extract disease information from the user's text and output it as JSON strictly adhering to this schema:
{
  "name": "Disease Name",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "causes": ["Cause 1"],
  "organic_treatments": ["Treatment 1"],
  "chemical_treatments": ["Treatment 1"],
  "prevention": ["Prevention 1"]
}`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: rawText }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const aiData = await aiRes.json();
    const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("No text returned from Gemini");
    }

    const parsedDisease = JSON.parse(resultText);

    // Insert into DB
    const { data, error } = await supabase.from("crop_diseases").insert({
      name: parsedDisease.name,
      symptoms: parsedDisease.symptoms || [],
      causes: parsedDisease.causes || [],
      organic_treatments: parsedDisease.organic_treatments || [],
      chemical_treatments: parsedDisease.chemical_treatments || [],
      prevention: parsedDisease.prevention || []
    }).select("*").single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error scraping disease:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
