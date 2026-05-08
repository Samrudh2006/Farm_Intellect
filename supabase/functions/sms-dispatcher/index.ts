// SMS dispatcher: sends weather / market / crop alerts to active sms_subscribers
// via MSG91. If MSG91 secrets are missing, logs entries as `queued` and returns
// counts — useful for staging / dry runs before DLT approval is in place.
//
// Body: { kind: "weather"|"market"|"crop", dryRun?: boolean, limit?: number }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY") ?? "";
const MSG91_SENDER_ID = Deno.env.get("MSG91_SENDER_ID") ?? "KSARTH";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

type Kind = "weather" | "market" | "crop";

interface Subscriber {
  id: string; phone: string; language: string; crop: string | null;
  state: string; district: string;
}

// Minimal vernacular fallback templates. In production these come from the
// sms_templates table after DLT approval. Hindi-only fallback keeps cost low.
function fallbackBody(kind: Kind, sub: Subscriber): string {
  const crop = sub.crop ?? "फसल";
  const place = sub.district;
  if (kind === "weather") return `${place}: अगले 2 दिन हल्की बारिश संभव। छिड़काव टालें। -KrishiSarthi`;
  if (kind === "market")  return `${place} मंडी ${crop} आज का भाव देखने हेतु ऐप खोलें या PRICE ${crop.toUpperCase()} reply करें। -KrishiSarthi`;
  return `${crop} में रोग/कीट का खतरा। नीम तेल 5ml/L छिड़काव करें। विवरण ऐप में। -KrishiSarthi`;
}

async function sendViaMsg91(phoneE164: string, body: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!MSG91_AUTH_KEY) return { ok: false, error: "MSG91_AUTH_KEY not configured" };
  // Strip + for MSG91 mobiles param (expects 91XXXXXXXXXX).
  const mobile = phoneE164.replace(/^\+/, "");
  try {
    const r = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: { authkey: MSG91_AUTH_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: MSG91_SENDER_ID,
        // Generic transactional route. For Unicode templates use DLT-approved template_id.
        route: "4",
        country: "91",
        sms: [{ message: body, to: [mobile] }],
      }),
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, error: `MSG91 ${r.status}: ${text.slice(0, 180)}` };
    return { ok: true, id: text.slice(0, 64) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { kind = "weather", dryRun = false, limit = 200 } = await req.json().catch(() => ({}));
    if (!["weather", "market", "crop"].includes(kind)) {
      return new Response(JSON.stringify({ ok: false, error: "invalid kind" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subs, error } = await supabase
      .from("sms_subscribers")
      .select("id, phone, language, crop, state, district")
      .eq("active", true)
      .limit(Math.min(Math.max(limit, 1), 1000));
    if (error) throw error;

    let sent = 0, failed = 0, skipped = 0;
    const logs: Array<Record<string, unknown>> = [];

    for (const s of (subs ?? []) as Subscriber[]) {
      const body = fallbackBody(kind as Kind, s).slice(0, 320);
      if (dryRun || !MSG91_AUTH_KEY) {
        logs.push({
          subscriber_id: s.id, template_key: `${kind}_default`, body,
          status: dryRun ? "skipped" : "queued",
          error: dryRun ? "dry-run" : "MSG91 not configured",
        });
        if (dryRun) skipped++; else skipped++;
        continue;
      }
      const r = await sendViaMsg91(s.phone, body);
      logs.push({
        subscriber_id: s.id, template_key: `${kind}_default`, body,
        status: r.ok ? "sent" : "failed",
        provider_msg_id: r.id ?? null,
        error: r.error ?? null,
        sent_at: r.ok ? new Date().toISOString() : null,
      });
      if (r.ok) sent++; else failed++;
    }

    if (logs.length > 0) {
      for (let i = 0; i < logs.length; i += 500) {
        await supabase.from("sms_log").insert(logs.slice(i, i + 500));
      }
    }

    return new Response(JSON.stringify({ ok: true, kind, total: subs?.length ?? 0, sent, failed, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
