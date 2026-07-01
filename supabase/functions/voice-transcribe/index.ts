// Streaming STT via Lovable AI (openai/gpt-4o-mini-transcribe)
// Accepts multipart audio, forwards SSE deltas to client.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inbound = await req.formData();
    const file = inbound.get("file") as File | null;
    const language = (inbound.get("language") as string | null) || undefined;

    if (!file || file.size < 512) {
      return new Response(
        JSON.stringify({ error: "Empty or missing audio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const upstream = new FormData();
    upstream.append("model", "openai/gpt-4o-mini-transcribe");
    upstream.append("file", file, "recording.wav");
    upstream.append("stream", "true");
    if (language) upstream.append("language", language);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: upstream,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `STT failed: ${resp.status} ${text}` }),
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
