import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  upvotes: number;
  views: number;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = "forum_posts_cache";

const DEFAULT_MOCK_POSTS: ForumPost[] = [
  {
    id: "post1",
    user_id: "user1",
    title: "Best time to plant wheat in Punjab",
    content: "I'm planning to plant wheat this season. When is the best time to start sowing in Punjab?",
    category: "Crop Planning",
    upvotes: 24,
    views: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "post2",
    user_id: "user2",
    title: "Dealing with crop diseases in monsoon",
    content: "My tomato plants are showing signs of fungal infection during the monsoon season. What should I do?",
    category: "Disease Management",
    upvotes: 31,
    views: 213,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "post3",
    user_id: "user3",
    title: "Share your organic farming success stories",
    content: "Let's share our experiences with organic farming. What crops are working best for you?",
    category: "Organic Farming",
    upvotes: 45,
    views: 324,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "post4",
    user_id: "user4",
    title: "Market rates for vegetables - June 2026",
    content: "Sharing current market rates for vegetables in different mandis for better price negotiation.",
    category: "Market Info",
    upvotes: 18,
    views: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useForumPosts(category?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        if (!hasSupabaseEnv) {
          const filtered = category
            ? DEFAULT_MOCK_POSTS.filter(
                (p) =>
                  p.category?.toLowerCase() === category.toLowerCase()
              )
            : DEFAULT_MOCK_POSTS;
          const cachedPosts = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setPosts(cachedPosts);
          return;
        }

        let query = supabase
          .from("forum_posts")
          .select("*")
          .order("upvotes", { ascending: false });

        if (category) {
          query = query.eq("category", category);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("[useForumPosts] Error fetching posts:", fetchError);
          const filtered = category
            ? DEFAULT_MOCK_POSTS.filter(
                (p) =>
                  p.category?.toLowerCase() === category.toLowerCase()
              )
            : DEFAULT_MOCK_POSTS;
          const cachedPosts = await withOfflineCache(CACHE_KEY, async () =>
            filtered
          );
          setPosts(cachedPosts);
        } else {
          setPosts(data || []);
          await setCache(CACHE_KEY, data || []);
        }
      } catch (err) {
        console.error("[useForumPosts] Exception:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch forum posts"
        );
        const filtered = category
          ? DEFAULT_MOCK_POSTS.filter(
              (p) =>
                p.category?.toLowerCase() === category.toLowerCase()
            )
          : DEFAULT_MOCK_POSTS;
        const cachedPosts = await withOfflineCache(CACHE_KEY, async () =>
          filtered
        );
        setPosts(cachedPosts);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [category]);

  const addPost = async (
    newPost: Omit<ForumPost, "id" | "upvotes" | "views" | "created_at" | "updated_at">
  ) => {
    if (!user || !hasSupabaseEnv) {
      const post: ForumPost = {
        ...newPost,
        id: `post-${Date.now()}`,
        upvotes: 0,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedPosts = [post, ...posts];
      setPosts(updatedPosts);
      await setCache(CACHE_KEY, updatedPosts);
      return post;
    }

    const { data, error: insertError } = await supabase
      .from("forum_posts")
      .insert([{ ...newPost, user_id: user.id, upvotes: 0, views: 0 }])
      .select()
      .single();

    if (insertError) {
      console.error("[useForumPosts] Error adding post:", insertError);
      throw insertError;
    }

    const updatedPosts = [data, ...posts];
    setPosts(updatedPosts);
    await setCache(CACHE_KEY, updatedPosts);
    return data;
  };

  return {
    posts,
    loading,
    error,
    addPost,
  };
}
