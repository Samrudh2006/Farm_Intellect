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

interface DeliveryPayload {
  provider_msg_id?: string;
  status?: string;
  error?: string;
  phone?: string;
  keyword?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sigFail = requireWebhookSecret(req);
  if (sigFail) return sigFail;

  try {
    const payload = (await req.json().catch(() => ({}))) as DeliveryPayload;
    const providerMsgId = payload.provider_msg_id ?? "";
    const status = (payload.status ?? "delivered").toLowerCase();

    if (providerMsgId) {
      await supabase
        .from("sms_log")
        .update({
          status,
          error: payload.error ?? null,
          sent_at: status === "delivered" || status === "sent" ? new Date().toISOString() : null,
        })
        .eq("provider_msg_id", providerMsgId);
    }

    const keyword = (payload.keyword ?? "").trim().toUpperCase();
    const shouldOptOut = keyword === "STOP" || keyword === "UNSUBSCRIBE";
    if (shouldOptOut && payload.phone) {
      const phone = toIndianE164(payload.phone);
      const { data: subscriber } = await supabase
        .from("sms_subscribers")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (subscriber?.id) {
        await supabase
          .from("sms_subscribers")
          .update({ active: false })
          .eq("id", subscriber.id);

        await supabase.from("sms_opt_out_events").insert({
          subscriber_id: subscriber.id,
          phone,
          keyword,
          source: "sms_reply",
          payload: payload as unknown as Record<string, unknown>,
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
