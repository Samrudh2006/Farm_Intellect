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

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "Empty text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const instructions = `Speak as a warm, unhurried Indian farming friend from ${region}. Use natural pauses, contractions, gentle inflection. Never sound like a text-to-speech robot. Match the emotion of the words. Slight regional warmth in the accent, but stay clear and easy to understand.`;

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
