// Streaming chat reply for the voice agent, personalized to the farmer.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LANG_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", ta: "Tamil",
  mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
  or: "Odia", as: "Assamese", ur: "Urdu",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: authError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const transcript: string = String(body.transcript || "").trim();
    const language: string = String(body.language || "en");
    const history: Array<{ role: string; content: string }> = Array.isArray(body.history) ? body.history : [];

    if (!transcript) {
      return new Response(JSON.stringify({ error: "Empty transcript" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Personalize from profile + crops
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, location, phone, preferred_voice")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: crops } = await supabase
      .from("crop_plans")
      .select("crop_name, season, status")
      .eq("user_id", userId)
      .limit(5);

    const name = profile?.display_name || "friend";
    const region = profile?.location || "India";
    const cropList = (crops || []).map((c: any) => c.crop_name).filter(Boolean).join(", ") || "no crops registered yet";
    const langName = LANG_NAMES[language] || "English";

    const systemPrompt = `You are ${name}'s trusted farming friend on a phone call. You know them personally.

CONTEXT ABOUT ${name.toUpperCase()}:
- Region: ${region}
- Crops they grow: ${cropList}
- Preferred language: ${langName}

HOW TO SPEAK (critical):
- Reply ONLY in ${langName}. Never mix languages unless the user does.
- Sound like a real human friend on a call, not an assistant. Use contractions, natural fillers ("hmm", "okay so", "you know"), and short pauses shown as "...".
- Keep replies 1 to 3 short sentences. This is voice — nobody wants a paragraph.
- NEVER use bullet points, lists, headings, markdown, emojis, or the phrase "As an AI".
- Use ${name}'s name naturally, maybe once every few turns, not every reply.
- If they ask about crops, reference what they actually grow (${cropList}) when relevant.
- If you don't know, say so simply and suggest who they could ask (KVK, local officer).
- Be warm, unhurried, respectful. Speak like an older cousin who farms.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: transcript },
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `Chat failed: ${resp.status} ${text}` }),
        { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
