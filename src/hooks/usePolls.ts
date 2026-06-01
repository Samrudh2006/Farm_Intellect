import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  votes_count: number;
  created_at: string;
}

export interface Poll {
  id: string;
  user_id: string;
  question: string;
  description?: string;
  options?: PollOption[];
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = "polls_cache";

const DEFAULT_MOCK_POLLS: Poll[] = [
  {
    id: "poll1",
    user_id: "user1",
    question: "What is your preferred crop for monsoon season?",
    description: "Help us understand which crops farmers prefer during monsoon",
    options: [
      { id: "opt1", poll_id: "poll1", option_text: "Rice", votes_count: 145 },
      { id: "opt2", poll_id: "poll1", option_text: "Cotton", votes_count: 87 },
      { id: "opt3", poll_id: "poll1", option_text: "Sugarcane", votes_count: 62 },
      { id: "opt4", poll_id: "poll1", option_text: "Maize", votes_count: 53 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "poll2",
    user_id: "user2",
    question: "Which irrigation method do you use most?",
    description: "Community poll on irrigation preferences",
    options: [
      { id: "opt5", poll_id: "poll2", option_text: "Drip Irrigation", votes_count: 234 },
      { id: "opt6", poll_id: "poll2", option_text: "Sprinkler System", votes_count: 156 },
      { id: "opt7", poll_id: "poll2", option_text: "Flood Irrigation", votes_count: 98 },
      { id: "opt8", poll_id: "poll2", option_text: "Micro Irrigation", votes_count: 112 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "poll3",
    user_id: "user3",
    question: "Do you practice organic farming?",
    description: "Understanding organic farming adoption",
    options: [
      { id: "opt9", poll_id: "poll3", option_text: "Yes, completely organic", votes_count: 89 },
      { id: "opt10", poll_id: "poll3", option_text: "Partially organic", votes_count: 167 },
      { id: "opt11", poll_id: "poll3", option_text: "No, conventional farming", votes_count: 134 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function usePolls() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPolls() {
      try {
        setLoading(true);
        setError(null);

        if (!hasSupabaseEnv) {
          const cachedPolls = await withOfflineCache(CACHE_KEY, async () =>
            DEFAULT_MOCK_POLLS
          );
          setPolls(cachedPolls);
          return;
        }

        // Fetch polls with their options
        const { data: pollsData, error: fetchError } = await supabase
          .from("polls")
          .select(
            `
            *,
            poll_options(*)
          `
          )
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("[usePolls] Error fetching polls:", fetchError);
          const cachedPolls = await withOfflineCache(CACHE_KEY, async () =>
            DEFAULT_MOCK_POLLS
          );
          setPolls(cachedPolls);
        } else {
          const pollsWithOptions = (pollsData || []).map((poll: any) => ({
            ...poll,
            options: poll.poll_options || [],
          }));
          setPolls(pollsWithOptions);
          await setCache(CACHE_KEY, pollsWithOptions);
        }
      } catch (err) {
        console.error("[usePolls] Exception:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch polls"
        );
        const cachedPolls = await withOfflineCache(CACHE_KEY, async () =>
          DEFAULT_MOCK_POLLS
        );
        setPolls(cachedPolls);
      } finally {
        setLoading(false);
      }
    }

    fetchPolls();
  }, []);

  const addPoll = async (
    newPoll: Omit<Poll, "id" | "options" | "created_at" | "updated_at">,
    options: string[]
  ) => {
    if (!user || !hasSupabaseEnv) {
      const poll: Poll = {
        ...newPoll,
        id: `poll-${Date.now()}`,
        options: options.map((opt, idx) => ({
          id: `opt-${Date.now()}-${idx}`,
          poll_id: `poll-${Date.now()}`,
          option_text: opt,
          votes_count: 0,
          created_at: new Date().toISOString(),
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedPolls = [poll, ...polls];
      setPolls(updatedPolls);
      await setCache(CACHE_KEY, updatedPolls);
      return poll;
    }

    const { data: pollData, error: pollError } = await supabase
      .from("polls")
      .insert([{ ...newPoll, user_id: user.id }])
      .select()
      .single();

    if (pollError) {
      console.error("[usePolls] Error adding poll:", pollError);
      throw pollError;
    }

    // Add options
    const optionsToInsert = options.map((opt) => ({
      poll_id: pollData.id,
      option_text: opt,
      votes_count: 0,
    }));

    const { data: optionsData, error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionsToInsert)
      .select();

    if (optionsError) {
      console.error("[usePolls] Error adding options:", optionsError);
      throw optionsError;
    }

    const pollWithOptions: Poll = {
      ...pollData,
      options: optionsData || [],
    };

    const updatedPolls = [pollWithOptions, ...polls];
    setPolls(updatedPolls);
    await setCache(CACHE_KEY, updatedPolls);
    return pollWithOptions;
  };

  const voteOnPoll = async (pollId: string, optionId: string) => {
    if (!user || !hasSupabaseEnv) {
      // Offline: just increment vote count
      const updatedPolls = polls.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            options: p.options?.map((opt) => ({
              ...opt,
              votes_count:
                opt.id === optionId ? opt.votes_count + 1 : opt.votes_count,
            })),
          };
        }
        return p;
      });
      setPolls(updatedPolls);
      await setCache(CACHE_KEY, updatedPolls);
      return;
    }

    const { error: voteError } = await supabase
      .from("poll_votes")
      .insert([{ poll_id: pollId, user_id: user.id, option_id: optionId }]);

    if (voteError) {
      console.error("[usePolls] Error voting:", voteError);
      throw voteError;
    }

    // Update local state
    const updatedPolls = polls.map((p) => {
      if (p.id === pollId) {
        return {
          ...p,
          options: p.options?.map((opt) => ({
            ...opt,
            votes_count:
              opt.id === optionId ? opt.votes_count + 1 : opt.votes_count,
          })),
        };
      }
      return p;
    });
    setPolls(updatedPolls);
    await setCache(CACHE_KEY, updatedPolls);
  };

  return {
    polls,
    loading,
    error,
    addPoll,
    voteOnPoll,
  };
}
