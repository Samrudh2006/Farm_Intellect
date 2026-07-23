import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { toIndianE164 } from "../_shared/phone.ts";
import { requireWebhookSecret } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

interface MissedCallPayload {
  phone?: string;
  caller?: string;
  call_id?: string;
  provider?: string;
  language?: string;
  district?: string;
  state?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as MissedCallPayload;
    const rawPhone = body.phone ?? body.caller ?? "";
    const phone = toIndianE164(rawPhone);
    const provider = body.provider ?? "placeholder";

    const { data: existing } = await supabase
      .from("sms_subscribers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    let subscriberId = existing?.id ?? null;
    if (!subscriberId) {
      const { data: inserted, error: insertError } = await supabase
        .from("sms_subscribers")
        .insert({
          name: `MissedCall-${(body.district ?? "Unknown").replace(/\s+/g, "")}-${Date.now()}`,
          phone,
          state: body.state ?? "Unknown",
          district: body.district ?? "Unknown",
          language: body.language ?? "hi",
          source: "missed_call",
          farmer_type: "self",
          plan_tier: "free",
          plan_status: "active",
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      subscriberId = inserted.id;
    } else {
      await supabase
        .from("sms_subscribers")
        .update({ source: "missed_call", active: true })
        .eq("id", subscriberId);
    }

    await supabase.from("missed_call_events").insert({
      phone,
      provider,
      provider_call_id: body.call_id ?? null,
      status: "processed",
      subscriber_id: subscriberId,
      payload: body as unknown as Record<string, unknown>,
      processed_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true, subscriberId, phone }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
