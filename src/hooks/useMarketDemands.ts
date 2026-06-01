import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

export interface MarketDemand {
  id: string;
  title: string;
  description?: string;
  crop_name: string;
  quantity_needed: number;
  unit: string;
  price_per_unit?: number;
  buyer_location?: string;
  deadline?: string;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = "market_demands_cache";

const DEFAULT_MOCK_DEMANDS: MarketDemand[] = [
  {
    id: "demand1",
    title: "Looking for Fresh Tomatoes",
    description: "Need quality tomatoes for restaurant chain",
    crop_name: "Tomato",
    quantity_needed: 500,
    unit: "kg",
    price_per_unit: 25,
    buyer_location: "Delhi",
    deadline: "2026-06-15",
    status: "Active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demand2",
    title: "Organic Wheat Needed",
    description: "Certified organic wheat for export",
    crop_name: "Wheat",
    quantity_needed: 2000,
    unit: "kg",
    price_per_unit: 35,
    buyer_location: "Mumbai",
    deadline: "2026-07-01",
    status: "Active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useMarketDemands() {
  const { user } = useAuth();
  const [demands, setDemands] = useState<MarketDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDemands() {
      try {
        setLoading(true);
        setError(null);

        if (!hasSupabaseEnv) {
          // Offline mode: use mock data
          const cachedDemands = await withOfflineCache(CACHE_KEY, async () =>
            DEFAULT_MOCK_DEMANDS
          );
          setDemands(cachedDemands);
          return;
        }

        // Fetch all market demands (public data)
        const { data, error: fetchError } = await supabase
          .from("market_demands")
          .select("*")
          .eq("status", "Active")
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("[useMarketDemands] Error fetching demands:", fetchError);
          const cachedDemands = await withOfflineCache(CACHE_KEY, async () =>
            DEFAULT_MOCK_DEMANDS
          );
          setDemands(cachedDemands);
        } else {
          setDemands(data || []);
          await setCache(CACHE_KEY, data || []);
        }
      } catch (err) {
        console.error("[useMarketDemands] Exception:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch market demands"
        );
        const cachedDemands = await withOfflineCache(CACHE_KEY, async () =>
          DEFAULT_MOCK_DEMANDS
        );
        setDemands(cachedDemands);
      } finally {
        setLoading(false);
      }
    }

    fetchDemands();
  }, []);

  const addDemand = async (
    newDemand: Omit<MarketDemand, "id" | "created_at" | "updated_at">
  ) => {
    if (!user || !hasSupabaseEnv) {
      const demand: MarketDemand = {
        ...newDemand,
        id: `demand-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedDemands = [demand, ...demands];
      setDemands(updatedDemands);
      await setCache(CACHE_KEY, updatedDemands);
      return demand;
    }

    const { data, error: insertError } = await supabase
      .from("market_demands")
      .insert([{ ...newDemand, created_by: user.id }])
      .select()
      .single();

    if (insertError) {
      console.error("[useMarketDemands] Error adding demand:", insertError);
      throw insertError;
    }

    const updatedDemands = [data, ...demands];
    setDemands(updatedDemands);
    await setCache(CACHE_KEY, updatedDemands);
    return data;
  };

  return {
    demands,
    loading,
    error,
    addDemand,
  };
}
