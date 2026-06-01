import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

export interface MarketPrice {
  id: string;
  crop_name: string;
  mandi_name: string;
  state?: string;
  price_per_unit: number;
  unit: string;
  date: string;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = "market_prices_cache";

const DEFAULT_MOCK_PRICES: MarketPrice[] = [
  {
    id: "price1",
    crop_name: "Wheat",
    mandi_name: "Delhi Mandi",
    state: "Delhi",
    price_per_unit: 2450,
    unit: "quintal",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "price2",
    crop_name: "Rice",
    mandi_name: "Mumbai Mandi",
    state: "Maharashtra",
    price_per_unit: 3100,
    unit: "quintal",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "price3",
    crop_name: "Tomato",
    mandi_name: "Bangalore Mandi",
    state: "Karnataka",
    price_per_unit: 28,
    unit: "kg",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "price4",
    crop_name: "Onion",
    mandi_name: "Nasik Mandi",
    state: "Maharashtra",
    price_per_unit: 22,
    unit: "kg",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "price5",
    crop_name: "Potato",
    mandi_name: "Jalandhar Mandi",
    state: "Punjab",
    price_per_unit: 18,
    unit: "kg",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "price6",
    crop_name: "Mustard",
    mandi_name: "Jaipur Mandi",
    state: "Rajasthan",
    price_per_unit: 5100,
    unit: "quintal",
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useMarketPrices(cropName?: string) {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);

        if (!hasSupabaseEnv) {
          const filtered = cropName
            ? DEFAULT_MOCK_PRICES.filter(
                (p) =>
                  p.crop_name.toLowerCase().includes(cropName.toLowerCase())
              )
            : DEFAULT_MOCK_PRICES;
          const cachedPrices = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setPrices(cachedPrices);
          return;
        }

        let query = supabase
          .from("market_prices")
          .select("*")
          .order("date", { ascending: false });

        if (cropName) {
          query = query.eq("crop_name", cropName);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("[useMarketPrices] Error fetching prices:", fetchError);
          const filtered = cropName
            ? DEFAULT_MOCK_PRICES.filter(
                (p) =>
                  p.crop_name.toLowerCase().includes(cropName.toLowerCase())
              )
            : DEFAULT_MOCK_PRICES;
          const cachedPrices = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setPrices(cachedPrices);
        } else {
          setPrices(data || []);
          await setCache(CACHE_KEY, data || []);
        }
      } catch (err) {
        console.error("[useMarketPrices] Exception:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch market prices"
        );
        const filtered = cropName
          ? DEFAULT_MOCK_PRICES.filter(
              (p) =>
                p.crop_name.toLowerCase().includes(cropName.toLowerCase())
            )
          : DEFAULT_MOCK_PRICES;
        const cachedPrices = await withOfflineCache(CACHE_KEY, async () =>
          filtered
        );
        setPrices(cachedPrices);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [cropName]);

  return {
    prices,
    loading,
    error,
  };
}
