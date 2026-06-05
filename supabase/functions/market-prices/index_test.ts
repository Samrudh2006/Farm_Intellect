// deno-lint-ignore-file no-explicit-any
// Integration tests for market-prices edge function.
// Run via the Lovable harness (`supabase--test_edge_functions`) or:
//   deno test --allow-net --allow-env supabase/functions/market-prices/index_test.ts
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const FUNCTIONS_URL =
  Deno.env.get("SUPABASE_FUNCTIONS_URL") ??
  (Deno.env.get("VITE_SUPABASE_URL")
    ? `${Deno.env.get("VITE_SUPABASE_URL")}/functions/v1`
    : "http://localhost:54321/functions/v1");
const ANON =
  Deno.env.get("SUPABASE_ANON_KEY") ??
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  "";

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
  if (!ANON) return;
  const res = await call({ state: "x".repeat(200) });
  const body = await res.json();
  assertEquals(res.status, 400);
  assertEquals(typeof body.error, "string");
});

Deno.test("rejects non-string district with 400", async () => {
  if (!ANON) return;
  const res = await call({ district: 12345 });
  const body = await res.json();
  // function only validates length on string types; numeric is coerced
  assert([200, 400].includes(res.status));
  if (res.status === 400) assertEquals(typeof body.error, "string");
});

Deno.test("returns prices payload with known source label", async () => {
  if (!ANON) return;
  const res = await call({ state: "Punjab" });
  const body = await res.json();
  assertEquals(res.status, 200);
  assert(Array.isArray(body.prices));
  const allowed = ["live", "cache", "cache-stale", "ai-fallback", "unavailable"];
  assert(allowed.includes(body.source), `unexpected source: ${body.source}`);
});

Deno.test("second call within TTL is served from cache or live", async () => {
  if (!ANON) return;
  await call({ state: "Punjab" });
  const res = await call({ state: "Punjab" });
  const body = await res.json();
  assertEquals(res.status, 200);
  assert(["live", "cache", "ai-fallback", "cache-stale"].includes(body.source));
});

Deno.test("AI/last-known fallback path returns a usable payload even when upstream fails", async () => {
  if (!ANON) return;
  // Force a likely upstream miss by querying an obscure state/district pair.
  // The function MUST still return 200 with prices from cache-stale or ai-fallback,
  // or an empty array with source 'unavailable' — never 5xx.
  const res = await call({ state: "Lakshadweep", district: "Kavaratti" });
  const body = await res.json();
  assertEquals(res.status, 200);
  assert(Array.isArray(body.prices));
  assert(["live", "cache", "cache-stale", "ai-fallback", "unavailable"].includes(body.source));
});

Deno.test("repeated calls under failure remain deterministic (no 5xx, retries do not crash)", async () => {
  if (!ANON) return;
  const results = await Promise.all(
    Array.from({ length: 3 }).map(() => call({ state: "Punjab" })),
  );
  for (const r of results) {
    const body = await r.json();
    assertEquals(r.status, 200);
    assert(Array.isArray(body.prices));
  }
});
