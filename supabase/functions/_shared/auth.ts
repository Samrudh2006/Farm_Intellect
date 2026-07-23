// Shared auth helpers for edge functions.
// Provides two guards:
//  - requireAdminOrSecret: allow either a valid admin JWT or a matching X-Admin-Secret header.
//  - requireWebhookSecret: verify an X-Webhook-Secret header for provider webhooks.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Constant-time-ish string compare
function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function requireAdminOrSecret(req: Request): Promise<Response | null> {
  const adminSecret = Deno.env.get("ADMIN_TASK_SECRET") ?? "";
  const providedSecret = req.headers.get("x-admin-secret") ?? "";
  if (adminSecret && providedSecret && safeEqual(adminSecret, providedSecret)) {
    return null;
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7)
    : "";
  if (!token) {
    return unauthorized("Authentication required");
  }

  try {
    const anon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? SERVICE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user) return unauthorized("Invalid token");

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const { data: isAdmin, error: rpcErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (rpcErr || !isAdmin) return forbidden("Admin role required");
    return null;
  } catch {
    return unauthorized("Auth check failed");
  }
}

export function requireWebhookSecret(req: Request): Response | null {
  const expected = Deno.env.get("WEBHOOK_SECRET") ?? "";
  if (!expected) return unauthorized("Webhook secret not configured");
  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!safeEqual(expected, provided)) return unauthorized("Invalid webhook signature");
  return null;
}

function unauthorized(msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 401,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
function forbidden(msg: string) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status: 403,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

// SSRF guard: only allow http(s) URLs to specific host suffixes, and reject private IPs.
export function isAllowedOutboundUrl(rawUrl: string, allowedHostSuffixes: string[]): boolean {
  let u: URL;
  try { u = new URL(rawUrl); } catch { return false; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();

  // Block IP literals (v4 and v6) outright — allow-list is domain-based.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
  if (host.includes(":")) return false; // IPv6 literal
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  if (host.endsWith(".internal") || host.endsWith(".local")) return false;

  return allowedHostSuffixes.some((suf) => host === suf || host.endsWith(`.${suf}`));
}
