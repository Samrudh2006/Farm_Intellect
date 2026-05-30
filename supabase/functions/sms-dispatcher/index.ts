// SMS dispatcher with plan enforcement and provider adapter.
// Body:
// {
//   kind: "weather"|"market"|"crop"|"scheme",
//   dryRun?: boolean,
//   limit?: number,
//   provider?: "msg91"|"gupshup",
//   retryFailed?: boolean
// }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY") ?? "";
const MSG91_SENDER_ID = Deno.env.get("MSG91_SENDER_ID") ?? "KSARTH";
const GUPSHUP_API_KEY = Deno.env.get("GUPSHUP_API_KEY") ?? "";
const GUPSHUP_SOURCE = Deno.env.get("GUPSHUP_SOURCE") ?? "";
const SMS_PROVIDER = (Deno.env.get("SMS_PROVIDER") ?? "msg91").toLowerCase();

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

type Kind = "weather" | "market" | "crop" | "scheme";
type Provider = "msg91" | "gupshup";

interface Subscriber {
  id: string;
  phone: string;
  language: string;
  crop: string | null;
  state: string;
  district: string;
  active: boolean;
  plan_tier: "free" | "basic" | "pro" | "institutional";
  plan_status: "trial" | "active" | "paused" | "cancelled";
  monthly_sms_quota: number;
  sms_sent_this_month: number;
}

interface DispatchPayload {
  kind?: Kind;
  dryRun?: boolean;
  limit?: number;
  provider?: Provider;
  retryFailed?: boolean;
}

interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function truncateSmsBody(body: string): string {
  const segmenter = new Intl.Segmenter("hi", { granularity: "grapheme" });
  const segments = Array.from(segmenter.segment(body), (part) => part.segment);
  return segments.slice(0, 160).join("");
}

function fallbackBody(kind: Kind, sub: Subscriber): string {
  const crop = sub.crop ?? "फसल";
  const place = sub.district;
  if (kind === "weather") return `${place}: अगले 2 दिन हल्की बारिश संभव। छिड़काव टालें। -Farm Intellect`;
  if (kind === "market") return `${place} मंडी ${crop} आज का भाव देखने हेतु ऐप खोलें या PRICE ${crop.toUpperCase()} reply करें। -Farm Intellect`;
  if (kind === "scheme") return `${place}: PM-Kisan, बीज अनुदान व सिंचाई योजनाओं की नई अपडेट उपलब्ध। सहायता हेतु ग्राम सेवक से मिलें। -Farm Intellect`;
  return `${crop} में रोग/कीट का खतरा। नीम तेल 5ml/L छिड़काव करें। विवरण ऐप में। -Farm Intellect`;
}

async function getTemplateBody(templateKey: string, language: string, kind: Kind, sub: Subscriber): Promise<string> {
  const { data: templates } = await supabase
    .from("sms_templates")
    .select("body, language")
    .eq("key", templateKey)
    .in("language", [language, "hi", "en"]);

  const exact = templates?.find((row) => row.language === language)?.body;
  const hindi = templates?.find((row) => row.language === "hi")?.body;
  const english = templates?.find((row) => row.language === "en")?.body;
  return truncateSmsBody(exact ?? hindi ?? english ?? fallbackBody(kind, sub));
}

async function sendViaMSG91(phoneE164: string, body: string): Promise<SendResult> {
  if (!MSG91_AUTH_KEY) return { ok: false, error: "MSG91_AUTH_KEY not configured" };
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
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

async function sendViaGupshup(phoneE164: string, body: string): Promise<SendResult> {
  if (!GUPSHUP_API_KEY || !GUPSHUP_SOURCE) return { ok: false, error: "GUPSHUP credentials not configured" };
  const mobile = phoneE164.replace(/^\+/, "");
  const params = new URLSearchParams({
    channel: "sms",
    source: GUPSHUP_SOURCE,
    destination: mobile,
    message: body,
  });

  try {
    const response = await fetch("https://api.gupshup.io/sm/api/v1/msg", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apikey: GUPSHUP_API_KEY,
      },
      body: params,
    });
    const text = await response.text();
    if (!response.ok) return { ok: false, error: `Gupshup ${response.status}: ${text.slice(0, 180)}` };
    return { ok: true, id: text.slice(0, 64) };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

async function sendSMS(provider: Provider, phone: string, body: string): Promise<SendResult> {
  if (provider === "gupshup") return sendViaGupshup(phone, body);
  return sendViaMSG91(phone, body);
}

function canSendByPlan(subscriber: Subscriber): { ok: boolean; reason?: string } {
  if (!subscriber.active) return { ok: false, reason: "inactive_subscriber" };
  if (!["trial", "active"].includes(subscriber.plan_status)) {
    return { ok: false, reason: `plan_status_${subscriber.plan_status}` };
  }
  if (subscriber.sms_sent_this_month >= subscriber.monthly_sms_quota) {
    return { ok: false, reason: "plan_limit_reached" };
  }
  return { ok: true };
}

async function loadSubscribers(kind: Kind, limit: number, retryFailed: boolean): Promise<Subscriber[]> {
  if (retryFailed) {
    const { data: failedRows } = await supabase
      .from("sms_log")
      .select("subscriber_id")
      .in("status", ["failed", "retry_pending"])
      .like("template_key", `${kind}_%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    const ids = Array.from(
      new Set((failedRows ?? []).map((row) => row.subscriber_id).filter((id): id is string => !!id)),
    );
    if (ids.length === 0) return [];

    const { data: retrySubs, error: retrySubsError } = await supabase
      .from("sms_subscribers")
      .select("id, phone, language, crop, state, district, active, plan_tier, plan_status, monthly_sms_quota, sms_sent_this_month")
      .in("id", ids.slice(0, limit));
    if (retrySubsError) throw retrySubsError;
    return (retrySubs ?? []) as Subscriber[];
  }

  const { data: subs, error } = await supabase
    .from("sms_subscribers")
    .select("id, phone, language, crop, state, district, active, plan_tier, plan_status, monthly_sms_quota, sms_sent_this_month")
    .eq("active", true)
    .limit(limit);
  if (error) throw error;
  return (subs ?? []) as Subscriber[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Admin-only gate.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: claims } = await userClient.auth.getClaims(token);
    const userId = claims?.claims?.sub;
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ ok: false, error: "Admin role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json().catch(() => ({}))) as DispatchPayload;
    const kind: Kind = payload.kind ?? "weather";
    const dryRun = payload.dryRun ?? false;
    const retryFailed = payload.retryFailed ?? false;
    const limit = Math.min(Math.max(payload.limit ?? 200, 1), 1000);
    const requestedProvider = (payload.provider ?? SMS_PROVIDER).toLowerCase();
    if (requestedProvider !== "msg91" && requestedProvider !== "gupshup") {
      return new Response(JSON.stringify({ ok: false, error: `invalid provider: ${requestedProvider}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const provider = requestedProvider as Provider;

    if (!["weather", "market", "crop", "scheme"].includes(kind)) {
      return new Response(JSON.stringify({ ok: false, error: "invalid kind" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscribers = await loadSubscribers(kind, limit, retryFailed);

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    let blocked = 0;
    const logs: Array<Record<string, unknown>> = [];
    const sentSubscriberIds: string[] = [];

    for (const subscriber of subscribers) {
      const templateKey = `${kind}_default`;
      const body = await getTemplateBody(templateKey, subscriber.language, kind, subscriber);
      const planCheck = canSendByPlan(subscriber);
      if (!planCheck.ok) {
        blocked++;
        logs.push({
          subscriber_id: subscriber.id,
          template_key: templateKey,
          body,
          status: "blocked_plan_limit",
          error: planCheck.reason ?? "blocked",
        });
        continue;
      }

      const providerConfigured = provider === "msg91" ? !!MSG91_AUTH_KEY : !!(GUPSHUP_API_KEY && GUPSHUP_SOURCE);
      if (dryRun || !providerConfigured) {
        skipped++;
        logs.push({
          subscriber_id: subscriber.id,
          template_key: templateKey,
          body,
          status: dryRun ? "skipped" : "queued",
          error: dryRun ? "dry-run" : `${provider} not configured`,
        });
        continue;
      }

      const sendResult = await sendSMS(provider, subscriber.phone, body);
      logs.push({
        subscriber_id: subscriber.id,
        template_key: templateKey,
        body,
        status: sendResult.ok ? "sent" : "failed",
        provider_msg_id: sendResult.id ?? null,
        error: sendResult.error ?? null,
        sent_at: sendResult.ok ? new Date().toISOString() : null,
      });
      if (sendResult.ok) {
        sent++;
        sentSubscriberIds.push(subscriber.id);
      } else {
        failed++;
      }
    }

    if (logs.length > 0) {
      for (let i = 0; i < logs.length; i += 500) {
        await supabase.from("sms_log").insert(logs.slice(i, i + 500));
      }
    }

    if (sentSubscriberIds.length > 0) {
      await Promise.all(
        sentSubscriberIds.map((id) => supabase.rpc("increment_sms_counter", { subscriber_id_input: id })),
      );
    }

    return new Response(JSON.stringify({
      ok: true,
      kind,
      provider,
      retryFailed,
      total: subscribers.length,
      sent,
      failed,
      skipped,
      blocked,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
