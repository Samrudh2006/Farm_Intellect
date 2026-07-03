// Streaming TTS via Lovable AI (openai/gpt-4o-mini-tts) with SSE PCM output.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_VOICES = new Set([
  "alloy", "ash", "ballad", "coral", "echo", "fable",
  "nova", "onyx", "sage", "shimmer", "verse",
]);

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const text: string = String(body.text || "").slice(0, 4000);
    const voice: string = ALLOWED_VOICES.has(body.voice) ? body.voice : "alloy";
    const region: string = String(body.region || "India");
    const language: string = String(body.language || "en");
    const style: string = String(body.style || "warm"); // warm | calm | energetic

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "Empty text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LANG_HINTS: Record<string, string> = {
      en: "Speak clear Indian English with a gentle rural warmth.",
      hi: "हिंदी में बोलिए, धीरे और गर्मजोशी से, जैसे कोई अपना बात कर रहा हो।",
      bn: "বাংলায় বলুন, স্বাভাবিক গ্রামীণ উষ্ণতার সাথে।",
      te: "తెలుగులో మృదువుగా, స్నేహపూర్వకంగా మాట్లాడండి.",
      ta: "தமிழில் அமைதியாக, நண்பர் போல பேசுங்கள்.",
      mr: "मराठीत सहज, आपुलकीने बोला.",
      gu: "ગુજરાતીમાં હૂંફથી અને સહજ રીતે બોલો.",
      kn: "ಕನ್ನಡದಲ್ಲಿ ನಿಧಾನವಾಗಿ, ಆತ್ಮೀಯವಾಗಿ ಮಾತನಾಡಿ.",
      ml: "മലയാളത്തിൽ ശാന്തമായി, സൗഹൃദപൂർവ്വം സംസാരിക്കുക.",
      pa: "ਪੰਜਾਬੀ ਵਿੱਚ ਖੁੱਲ੍ਹਦਿਲੀ ਅਤੇ ਆਪਣੇਪਣ ਨਾਲ ਗੱਲ ਕਰੋ.",
      or: "ଓଡ଼ିଆରେ ସ୍ୱାଭାବିକ ଓ ସ୍ନେହପୂର୍ଣ୍ଣ ଭାବରେ କୁହନ୍ତୁ.",
      as: "অসমীয়াত মৃদুকৈ, বন্ধুৰ দৰে কওক.",
      ur: "اردو میں نرم اور دوستانہ لہجے میں بات کیجیے۔",
    };

    const styleHint =
      style === "energetic"
        ? "Slightly upbeat pace, bright energy, still natural."
        : style === "calm"
        ? "Slow, low, reassuring cadence with generous pauses."
        : "Warm, unhurried, friendly cadence.";

    const instructions = [
      `You are a real human friend from ${region}, not a voice assistant.`,
      LANG_HINTS[language] || LANG_HINTS.en,
      styleHint,
      "Use natural breath, contractions, gentle inflection, small pauses.",
      "Never sound robotic. Match emotion to the words.",
    ].join(" ");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice,
        instructions,
        stream_format: "sse",
        response_format: "pcm",
      }),
      signal: req.signal,
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `TTS failed: ${resp.status} ${errText}` }),
        { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    if ((err as any)?.name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
