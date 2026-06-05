import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

import { supabase } from "@/integrations/supabase/client";
import { useMarketPrices } from "./useMarketPrices";

const invoke = supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>;

describe("useMarketPrices resilience", () => {
  beforeEach(() => invoke.mockReset());

  it("returns live prices on success", async () => {
    invoke.mockResolvedValueOnce({
      data: { prices: [{ crop: "Wheat", market: "Ludhiana", minPrice: 2100, maxPrice: 2300, modalPrice: 2200, unit: "per quintal" }], source: "live" },
      error: null,
    });
    const { result } = renderHook(() => useMarketPrices("Punjab"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.source).toBe("live");
    expect(result.current.prices).toHaveLength(1);
    expect(result.current.lastFetched).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("retries on failure and surfaces error after max attempts", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("boom") });
    const { result } = renderHook(() => useMarketPrices("Punjab"));
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });
    expect(result.current.source).toBe("unavailable");
    expect(result.current.prices).toEqual([]);
    expect(result.current.error).toBeTruthy();
    expect(invoke).toHaveBeenCalledTimes(3);
  });

  it("recovers on a later attempt (exponential backoff path)", async () => {
    invoke
      .mockResolvedValueOnce({ data: null, error: new Error("net 1") })
      .mockResolvedValueOnce({ data: null, error: new Error("net 2") })
      .mockResolvedValueOnce({
        data: { prices: [{ crop: "Rice", market: "X", minPrice: 1, maxPrice: 2, modalPrice: 1.5, unit: "q" }], source: "live" },
        error: null,
      });
    const { result } = renderHook(() => useMarketPrices("Punjab"));
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });
    expect(invoke).toHaveBeenCalledTimes(3);
    expect(result.current.source).toBe("live");
    expect(result.current.error).toBeNull();
  });

  it("exposes ai-fallback source from the edge function", async () => {
    invoke.mockResolvedValueOnce({
      data: { prices: [{ crop: "Maize", market: "X", minPrice: 1800, maxPrice: 2000, modalPrice: 1900, unit: "per quintal" }], source: "ai-fallback" },
      error: null,
    });
    const { result } = renderHook(() => useMarketPrices("Punjab"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.source).toBe("ai-fallback");
    expect(result.current.prices).toHaveLength(1);
  });

  it("exposes stale cache source so UI can warn user", async () => {
    invoke.mockResolvedValueOnce({
      data: { prices: [{ crop: "Rice", market: "X", minPrice: 1, maxPrice: 2, modalPrice: 1.5, unit: "q" }], source: "cache-stale", staleAgeMs: 9000 },
      error: null,
    });
    const { result } = renderHook(() => useMarketPrices("Punjab"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.source).toBe("cache-stale");
    expect(result.current.staleAgeMs).toBe(9000);
  });

  it("refresh() refetches and updates lastFetched", async () => {
    invoke.mockResolvedValue({ data: { prices: [], source: "ai-fallback" }, error: null });
    const { result } = renderHook(() => useMarketPrices("Punjab"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const first = result.current.lastFetched;
    await new Promise((r) => setTimeout(r, 2));
    await act(async () => { await result.current.refresh(); });
    expect(result.current.lastFetched).not.toBe(first);
    expect(result.current.source).toBe("ai-fallback");
  });
});
