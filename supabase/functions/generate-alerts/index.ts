// Generates crop, weather, and market-price push notifications for users.
// Triggered by pg_cron (daily) or invoked manually by admins.
// Uses service_role to bypass RLS on notifications. Respects notification_preferences.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AlertKind = "crop" | "weather" | "market";

interface AlertPayload {
  user_id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "alert" | "weather" | "market" | "crop";
  kind: AlertKind;
  metadata?: Record<string, unknown>;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OWM_API_KEY = Deno.env.get("OWM_API_KEY") ?? "";
const DATA_GOV_API_KEY = Deno.env.get("DATA_GOV_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function fetchWeatherAlertForLocation(location: string) {
  if (!OWM_API_KEY || !location) return null;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&appid=${OWM_API_KEY}&units=metric`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const w = await r.json();
    const temp = w?.main?.temp;
    const cond = w?.weather?.[0]?.main ?? "";
    const wind = w?.wind?.speed ?? 0;
    if (typeof temp === "number" && temp >= 40) return { title: "🌡️ Heatwave Alert", message: `Extreme heat (${Math.round(temp)}°C) expected in ${location}. Irrigate crops in early morning and provide shade for livestock.` };
    if (typeof temp === "number" && temp <= 5) return { title: "❄️ Frost Warning", message: `Low temperature (${Math.round(temp)}°C) in ${location}. Protect tender crops with mulch or covers tonight.` };
    if (cond === "Thunderstorm" || cond === "Rain") return { title: "⛈️ Rain Alert", message: `${cond} expected in ${location}. Postpone spraying and harvest mature crops if possible.` };
    if (wind >= 15) return { title: "💨 Strong Wind Warning", message: `High winds (${Math.round(wind)} m/s) expected in ${location}. Stake tall crops and secure greenhouse covers.` };
  } catch {
    return null;
  }
  return null;
}

async function generateCropTaskAlerts(): Promise<AlertPayload[]> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { data, error } = await supabase
    .from("user_tasks")
    .select("id, user_id, title, due_date, status")
    .lte("due_date", tomorrow.toISOString())
    .neq("status", "completed");
  if (error || !data) return [];
  return data.map((t) => ({
    user_id: t.user_id,
    title: "🌾 Crop Task Due",
    type: "crop" as const,
    kind: "crop" as const,
    message: `Your task "${t.title}" is due ${new Date(t.due_date!).toLocaleDateString("en-IN")}. Open the calendar to mark it done.`,
    metadata: { task_id: t.id, kind: "crop_task_due" },
  }));
}

async function generateWeatherAlerts(): Promise<AlertPayload[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, location")
    .not("location", "is", null);
  if (error || !profiles) return [];
  const cache = new Map<string, { title: string; message: string } | null>();
  const out: AlertPayload[] = [];
  for (const p of profiles) {
    const loc = (p.location ?? "").trim();
    if (!loc) continue;
    if (!cache.has(loc)) cache.set(loc, await fetchWeatherAlertForLocation(loc));
    const alert = cache.get(loc);
    if (alert) {
      out.push({
        user_id: p.user_id,
        title: alert.title,
        message: alert.message,
        type: "weather",
        kind: "weather",
        metadata: { kind: "weather_alert", location: loc },
      });
    }
  }
  return out;
}

// Fetch real Agmarknet movements via data.gov.in. Returns "big movers" with >=5% change
// between min and max in the latest snapshot — a proxy for daily volatility when historic
// snapshots are unavailable.
async function fetchAgmarknetMovers(stateFilter?: string) {
  if (!DATA_GOV_API_KEY) return [];
  const base = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_API_KEY}&format=json&limit=200`;
  const url = stateFilter ? `${base}&filters[state]=${encodeURIComponent(stateFilter)}` : base;
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const json = await r.json();
    const records: any[] = json.records ?? [];
    const movers = records
      .map((r) => {
        const min = parseFloat(r.min_price);
        const max = parseFloat(r.max_price);
        const modal = parseFloat(r.modal_price);
        if (!min || !max || !modal) return null;
        const change = ((max - min) / Math.max(min, 1)) * 100;
        return {
          crop: r.commodity as string,
          mandi: `${r.market}, ${r.district}` as string,
          state: r.state as string,
          modal,
          change,
          date: r.arrival_date as string,
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x && Math.abs(x.change) >= 5);
    // Dedupe per crop+mandi keeping biggest change
    const map = new Map<string, typeof movers[number]>();
    for (const m of movers) {
      const k = `${m.crop}|${m.mandi}`;
      const existing = map.get(k);
      if (!existing || Math.abs(m.change) > Math.abs(existing.change)) map.set(k, m);
    }
    return Array.from(map.values()).slice(0, 5);
  } catch (e) {
    console.error("agmarknet fetch failed", e);
    return [];
  }
}

async function generateMarketAlerts(): Promise<AlertPayload[]> {
  const { data: farmers, error } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "farmer");
  if (error || !farmers) return [];

  // Pull farmer locations to scope mandi state when possible
  const ids = farmers.map((f) => f.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, location")
    .in("user_id", ids);
  const locByUser = new Map((profiles ?? []).map((p) => [p.user_id, (p.location ?? "").split(",").pop()?.trim()]));

  // Collect unique states
  const states = new Set<string>();
  for (const id of ids) {
    const s = locByUser.get(id);
    if (s) states.add(s);
  }

  const moversByState = new Map<string, Awaited<ReturnType<typeof fetchAgmarknetMovers>>>();
  if (states.size === 0) {
    moversByState.set("__all__", await fetchAgmarknetMovers());
  } else {
    for (const s of states) moversByState.set(s, await fetchAgmarknetMovers(s));
  }

  const out: AlertPayload[] = [];
  for (const f of farmers) {
    const state = locByUser.get(f.user_id) ?? "__all__";
    const movers = moversByState.get(state) ?? moversByState.get("__all__") ?? [];
    for (const m of movers) {
      out.push({
        user_id: f.user_id,
        title: `📈 ${m.crop} price swing ${m.change.toFixed(1)}%`,
        message: `${m.crop} at ${m.mandi} mandi traded with ${m.change.toFixed(1)}% min-max spread today (modal ₹${m.modal}/qtl). Review your selling plan.`,
        type: "market",
        kind: "market",
        metadata: { kind: "market_alert", crop: m.crop, mandi: m.mandi, change: m.change, modal: m.modal, date: m.date, source: "agmarknet" },
      });
    }
  }
  return out;
}

async function filterByPreferences(alerts: AlertPayload[]) {
  if (alerts.length === 0) return alerts;
  const userIds = Array.from(new Set(alerts.map((a) => a.user_id)));
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("user_id, crop_enabled, weather_enabled, market_enabled")
    .in("user_id", userIds);
  const map = new Map((prefs ?? []).map((p) => [p.user_id, p]));
  return alerts.filter((a) => {
    const p = map.get(a.user_id);
    if (!p) return true; // default: opted in
    if (a.kind === "crop") return p.crop_enabled;
    if (a.kind === "weather") return p.weather_enabled;
    if (a.kind === "market") return p.market_enabled;
    return true;
  });
}

async function insertAlerts(alerts: AlertPayload[]) {
  if (alerts.length === 0) return { inserted: 0 };
  const rows = alerts.map((a) => ({
    user_id: a.user_id,
    title: a.title,
    message: a.message,
    type: a.type,
    is_read: false,
    metadata: a.metadata ?? {},
  }));
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error, count } = await supabase
      .from("notifications")
      .insert(chunk, { count: "exact" });
    if (error) { console.error("insert error", error); continue; }
    inserted += count ?? chunk.length;
  }
  return { inserted };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const kinds = (url.searchParams.get("kinds") ?? "weather,market,crop").split(",");
    const tasks: Promise<AlertPayload[]>[] = [];
    if (kinds.includes("crop")) tasks.push(generateCropTaskAlerts());
    if (kinds.includes("weather")) tasks.push(generateWeatherAlerts());
    if (kinds.includes("market")) tasks.push(generateMarketAlerts());
    const groups = await Promise.all(tasks);
    const flat = await filterByPreferences(groups.flat());
    const result = await insertAlerts(flat);
    return new Response(
      JSON.stringify({ ok: true, generated: flat.length, ...result, kinds }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
