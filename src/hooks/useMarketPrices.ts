import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MarketPriceSource = "live" | "cache" | "cache-stale" | "ai-fallback" | "unavailable";

export interface MarketPrice {
  crop: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date?: string;
}

export interface MarketPricesState {
  prices: MarketPrice[];
  source: MarketPriceSource;
  lastFetched: number | null;
  loading: boolean;
  error: string | null;
  staleAgeMs?: number;
  refresh: () => Promise<void>;
}

const MAX_RETRIES = 3;

async function callWithRetry(state: string, district: string): Promise<{ prices: MarketPrice[]; source: MarketPriceSource; staleAgeMs?: number }> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const { data, error } = await supabase.functions.invoke("market-prices", {
        body: { state, district },
      });
      if (error) throw error;
      return {
        prices: data?.prices ?? [],
        source: (data?.source as MarketPriceSource) ?? "unavailable",
        staleAgeMs: data?.staleAgeMs,
      };
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
    }
  }
  throw lastErr;
}

export function useMarketPrices(state = "Punjab", district = ""): MarketPricesState {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [source, setSource] = useState<MarketPriceSource>("unavailable");
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staleAgeMs, setStaleAgeMs] = useState<number | undefined>(undefined);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callWithRetry(state, district);
      setPrices(result.prices);
      setSource(result.source);
      setStaleAgeMs(result.staleAgeMs);
      setLastFetched(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch market prices");
      setSource("unavailable");
    } finally {
      setLoading(false);
    }
  }, [state, district]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { prices, source, lastFetched, loading, error, staleAgeMs, refresh };
}
