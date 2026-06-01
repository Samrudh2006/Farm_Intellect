import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

export interface Crop {
  id: string;
  user_id: string;
  name: string;
  variety?: string;
  quantity: number;
  unit: string;
  health_status?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = "crops_cache";

const DEFAULT_MOCK_CROPS: Crop[] = [
  {
    id: "crop1",
    user_id: "mock-user",
    name: "Wheat",
    variety: "HD 2967",
    quantity: 50,
    unit: "quintal",
    health_status: "Healthy",
    planting_date: "2025-10-15",
    expected_harvest_date: "2026-04-15",
    notes: "Sown on time, looking healthy.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "crop2",
    user_id: "mock-user",
    name: "Mustard",
    variety: "RH-30",
    quantity: 20,
    unit: "quintal",
    health_status: "Healthy",
    planting_date: "2025-09-20",
    expected_harvest_date: "2026-03-10",
    notes: "Requires light irrigation soon.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useCrops() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCrops() {
      try {
        setLoading(true);
        setError(null);

        if (!hasSupabaseEnv || !user) {
          // Offline mode: use mock data
          const cachedCrops = await withOfflineCache(CACHE_KEY, async () =>
            DEFAULT_MOCK_CROPS
          );
          setCrops(cachedCrops);
          return;
        }

        // Try to fetch from Supabase
        const { data, error: fetchError } = await supabase
          .from("crops")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("[useCrops] Error fetching crops:", fetchError);
          // Fallback to cache or mock data
          const cachedCrops = await withOfflineCache(CACHE_KEY, async () =>
            DEFAULT_MOCK_CROPS
          );
          setCrops(cachedCrops);
        } else {
          setCrops(data || []);
          // Update cache
          await setCache(CACHE_KEY, data || []);
        }
      } catch (err) {
        console.error("[useCrops] Exception:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch crops"
        );
        // Fallback to mock data
        const cachedCrops = await withOfflineCache(CACHE_KEY, async () =>
          DEFAULT_MOCK_CROPS
        );
        setCrops(cachedCrops);
      } finally {
        setLoading(false);
      }
    }

    fetchCrops();
  }, [user]);

  const addCrop = async (newCrop: Omit<Crop, "id" | "created_at" | "updated_at">) => {
    if (!user || !hasSupabaseEnv) {
      // Offline: add to local state with mock ID
      const crop: Crop = {
        ...newCrop,
        id: `crop-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCrops([crop, ...crops]);
      await setCache(CACHE_KEY, [crop, ...crops]);
      return crop;
    }

    const { data, error: insertError } = await supabase
      .from("crops")
      .insert([newCrop])
      .select()
      .single();

    if (insertError) {
      console.error("[useCrops] Error adding crop:", insertError);
      throw insertError;
    }

    const updatedCrops = [data, ...crops];
    setCrops(updatedCrops);
    await setCache(CACHE_KEY, updatedCrops);
    return data;
  };

  const deleteCrop = async (id: string) => {
    const filteredCrops = crops.filter((c) => c.id !== id);
    setCrops(filteredCrops);
    await setCache(CACHE_KEY, filteredCrops);

    if (!user || !hasSupabaseEnv) return;

    const { error: deleteError } = await supabase
      .from("crops")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[useCrops] Error deleting crop:", deleteError);
      throw deleteError;
    }
  };

  return {
    crops,
    loading,
    error,
    addCrop,
    deleteCrop,
  };
}
