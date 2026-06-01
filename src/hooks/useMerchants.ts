import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

export interface Merchant {
  id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
  rating: number;
  reviews_count: number;
  contact_phone?: string;
  website_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = "merchants_cache";

const DEFAULT_MOCK_MERCHANTS: Merchant[] = [
  {
    id: "merchant1",
    name: "Sharma Seeds & Fertilizers",
    category: "Seeds & Fertilizers",
    description: "Leading supplier of quality seeds and organic fertilizers",
    location: "Jaipur, Rajasthan",
    rating: 4.8,
    reviews_count: 245,
    contact_phone: "+91-9876543210",
    website_url: "www.sharmaseedfarm.com",
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "merchant2",
    name: "AgriTools Store",
    category: "Agricultural Equipment",
    description: "Supplier of modern farming equipment and machinery",
    location: "Pune, Maharashtra",
    rating: 4.5,
    reviews_count: 187,
    contact_phone: "+91-8765432109",
    website_url: "www.agritoolsstore.com",
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "merchant3",
    name: "Green Pesticides Co.",
    category: "Pest Control",
    description: "Eco-friendly pest control solutions for sustainable farming",
    location: "Indore, Madhya Pradesh",
    rating: 4.6,
    reviews_count: 156,
    contact_phone: "+91-7654321098",
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "merchant4",
    name: "Fresh Produce Buyer",
    category: "Buyers",
    description: "Direct buyer of fresh vegetables and fruits for retail chains",
    location: "Delhi, India",
    rating: 4.3,
    reviews_count: 98,
    contact_phone: "+91-6543210987",
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "merchant5",
    name: "Organic Certification Services",
    category: "Services",
    description: "Certification and training for organic farming",
    location: "Bangalore, Karnataka",
    rating: 4.7,
    reviews_count: 73,
    contact_phone: "+91-5432109876",
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useMerchants(category?: string) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMerchants() {
      try {
        setLoading(true);
        setError(null);

        if (!hasSupabaseEnv) {
          const filtered = category
            ? DEFAULT_MOCK_MERCHANTS.filter(
                (m) => m.category.toLowerCase() === category.toLowerCase()
              )
            : DEFAULT_MOCK_MERCHANTS;
          const cachedMerchants = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setMerchants(cachedMerchants);
          return;
        }

        let query = supabase
          .from("merchants")
          .select("*")
          .eq("verified", true)
          .order("rating", { ascending: false });

        if (category) {
          query = query.eq("category", category);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("[useMerchants] Error fetching merchants:", fetchError);
          const filtered = category
            ? DEFAULT_MOCK_MERCHANTS.filter(
                (m) => m.category.toLowerCase() === category.toLowerCase()
              )
            : DEFAULT_MOCK_MERCHANTS;
          const cachedMerchants = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setMerchants(cachedMerchants);
        } else {
          setMerchants(data || []);
          await setCache(CACHE_KEY, data || []);
        }
      } catch (err) {
        console.error("[useMerchants] Exception:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch merchants"
        );
        const filtered = category
          ? DEFAULT_MOCK_MERCHANTS.filter(
              (m) => m.category.toLowerCase() === category.toLowerCase()
            )
          : DEFAULT_MOCK_MERCHANTS;
        const cachedMerchants = await withOfflineCache(CACHE_KEY, async () =>
          filtered
        );
        setMerchants(cachedMerchants);
      } finally {
        setLoading(false);
      }
    }

    fetchMerchants();
  }, [category]);

  return {
    merchants,
    loading,
    error,
  };
}
