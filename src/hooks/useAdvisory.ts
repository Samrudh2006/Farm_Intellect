import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

export interface AdvisoryArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  crop_type?: string;
  author_id?: string;
  featured_image_url?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = "advisory_cache";

const DEFAULT_MOCK_ARTICLES: AdvisoryArticle[] = [
  {
    id: "article1",
    title: "Best Practices for Wheat Farming",
    content: "Wheat farming requires proper soil preparation, timely sowing, and adequate irrigation...",
    category: "Crop Management",
    crop_type: "Wheat",
    view_count: 324,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "article2",
    title: "Pest Management in Tomato Crops",
    content: "Tomato crops are vulnerable to various pests. Integrated pest management (IPM) is recommended...",
    category: "Pest Control",
    crop_type: "Tomato",
    view_count: 256,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "article3",
    title: "Irrigation Scheduling During Monsoon",
    content: "During monsoon season, careful irrigation management is crucial to avoid waterlogging...",
    category: "Irrigation",
    view_count: 189,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "article4",
    title: "Soil Testing and Nutrient Management",
    content: "Regular soil testing helps identify nutrient deficiencies and guide fertilizer application...",
    category: "Soil Management",
    view_count: 412,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useAdvisory(category?: string) {
  const [articles, setArticles] = useState<AdvisoryArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);

        if (!hasSupabaseEnv) {
          // Offline mode: use mock data
          const filtered = category
            ? DEFAULT_MOCK_ARTICLES.filter(
                (a) => a.category.toLowerCase() === category.toLowerCase()
              )
            : DEFAULT_MOCK_ARTICLES;
          const cachedArticles = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setArticles(cachedArticles);
          return;
        }

        let query = supabase
          .from("advisory_articles")
          .select("*")
          .order("view_count", { ascending: false });

        if (category) {
          query = query.eq("category", category);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("[useAdvisory] Error fetching articles:", fetchError);
          const filtered = category
            ? DEFAULT_MOCK_ARTICLES.filter(
                (a) => a.category.toLowerCase() === category.toLowerCase()
              )
            : DEFAULT_MOCK_ARTICLES;
          const cachedArticles = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setArticles(cachedArticles);
        } else {
          setArticles(data || []);
          await setCache(CACHE_KEY, data || []);
        }
      } catch (err) {
        console.error("[useAdvisory] Exception:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch advisory articles"
        );
        const filtered = category
          ? DEFAULT_MOCK_ARTICLES.filter(
              (a) => a.category.toLowerCase() === category.toLowerCase()
            )
          : DEFAULT_MOCK_ARTICLES;
        const cachedArticles = await withOfflineCache(CACHE_KEY, async () =>
          filtered
        );
        setArticles(cachedArticles);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [category]);

  return {
    articles,
    loading,
    error,
  };
}
