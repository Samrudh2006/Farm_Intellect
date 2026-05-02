// Generates crop, weather, and market-price push notifications for users.
// Triggered by pg_cron (daily) or invoked manually by admins.
// Uses service_role to bypass RLS on notifications.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  user_id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "alert" | "weather" | "market" | "crop";
  metadata?: Record<string, unknown>;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OWM_API_KEY = Deno.env.get("OWM_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function fetchWeatherAlertForLocation(location: string): Promise<{ title: string; message: string } | null> {
  if (!OWM_API_KEY || !location) return null;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&appid=${OWM_API_KEY}&units=metric`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const w = await r.json();
    const temp = w?.main?.temp;
    const cond = w?.weather?.[0]?.main ?? "";
    const wind = w?.wind?.speed ?? 0;

    if (typeof temp === "number" && temp >= 40) {
      return { title: "🌡️ Heatwave Alert", message: `Extreme heat (${Math.round(temp)}°C) expected in ${location}. Irrigate crops in early morning and provide shade for livestock.` };
    }
    if (typeof temp === "number" && temp <= 5) {
      return { title: "❄️ Frost Warning", message: `Low temperature (${Math.round(temp)}°C) in ${location}. Protect tender crops with mulch or covers tonight.` };
    }
    if (cond === "Thunderstorm" || cond === "Rain") {
      return { title: "⛈️ Rain Alert", message: `${cond} expected in ${location}. Postpone spraying and harvest mature crops if possible.` };
    }
    if (wind >= 15) {
      return { title: "💨 Strong Wind Warning", message: `High winds (${Math.round(wind)} m/s) expected in ${location}. Stake tall crops and secure greenhouse covers.` };
    }
  } catch (_) {
    return null;
  }
  return null;
}

async function generateCropTaskAlerts(): Promise<AlertPayload[]> {
  // Find user_tasks due today or overdue and notify the owner.
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

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

  // Cache per location to avoid duplicate API hits
  const cache = new Map<string, { title: string; message: string } | null>();
  const out: AlertPayload[] = [];
  for (const p of profiles) {
    const loc = (p.location ?? "").trim();
    if (!loc) continue;
    if (!cache.has(loc)) {
      cache.set(loc, await fetchWeatherAlertForLocation(loc));
    }
    const alert = cache.get(loc);
    if (alert) {
      out.push({
        user_id: p.user_id,
        title: alert.title,
        message: alert.message,
        type: "weather",
        metadata: { kind: "weather_alert", location: loc },
      });
    }
  }
  return out;
}

// Static market-price movements demo source (replace with live agmarknet feed if available).
const MARKET_MOVEMENTS = [
  { crop: "Wheat", change: 6.2, mandi: "Karnal" },
  { crop: "Onion", change: -8.4, mandi: "Lasalgaon" },
  { crop: "Tomato", change: 12.0, mandi: "Kolar" },
];

async function generateMarketAlerts(): Promise<AlertPayload[]> {
  const { data: farmers, error } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "farmer");
  if (error || !farmers) return [];

  const big = MARKET_MOVEMENTS.filter((m) => Math.abs(m.change) >= 5);
  if (big.length === 0) return [];
  const out: AlertPayload[] = [];
  for (const f of farmers) {
    for (const m of big) {
      out.push({
        user_id: f.user_id,
        title: `📈 ${m.crop} price ${m.change > 0 ? "up" : "down"} ${Math.abs(m.change).toFixed(1)}%`,
        message: `${m.crop} at ${m.mandi} mandi moved ${m.change > 0 ? "+" : ""}${m.change.toFixed(1)}% today. Review your selling plan.`,
        type: "market",
        metadata: { kind: "market_alert", crop: m.crop, mandi: m.mandi, change: m.change },
      });
    }
  }
  return out;
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
  // Insert in chunks of 500
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error, count } = await supabase
      .from("notifications")
      .insert(chunk, { count: "exact" });
    if (error) {
      console.error("insert error", error);
      continue;
    }
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
    const flat = groups.flat();
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
