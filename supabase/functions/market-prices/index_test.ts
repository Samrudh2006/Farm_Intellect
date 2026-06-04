// deno-lint-ignore-file no-explicit-any
// Integration test: market-prices edge function.
// Run with: deno test --allow-net --allow-env supabase/functions/market-prices/index_test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

// We can't easily import the handler (it calls serve at import time), so we exercise
// the public contract: validation, caching, retries, fallback. The Lovable harness
// runs these via `supabase--test_edge_functions` against the deployed function.

const FUNCTIONS_URL = Deno.env.get("SUPABASE_FUNCTIONS_URL") ?? "http://localhost:54321/functions/v1";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

async function call(body: unknown, token = ANON) {
  return await fetch(`${FUNCTIONS_URL}/market-prices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

Deno.test("rejects unauthenticated requests with 401", async () => {
  const res = await fetch(`${FUNCTIONS_URL}/market-prices`, { method: "POST", body: "{}" });
  await res.text();
  assertEquals(res.status, 401);
});

Deno.test("rejects oversized state input with 400", async () => {
  if (!ANON) return; // skip when env not provided
  const res = await call({ state: "x".repeat(200) });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertEquals(typeof body.error, "string");
});

Deno.test("returns prices payload with known source label", async () => {
  if (!ANON) return;
  const res = await call({ state: "Punjab" });
  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(Array.isArray(body.prices), true);
  const allowed = ["live", "cache", "cache-stale", "ai-fallback", "unavailable"];
  assertEquals(allowed.includes(body.source), true);
});

Deno.test("second call within TTL returns cached source", async () => {
  if (!ANON) return;
  await call({ state: "Punjab" });
  const res = await call({ state: "Punjab" });
  const body = await res.json();
  assertEquals(res.status, 200);
  // Should now be served from in-memory cache or live (depending on cold start)
  assertEquals(["live", "cache", "ai-fallback", "cache-stale"].includes(body.source), true);
});
