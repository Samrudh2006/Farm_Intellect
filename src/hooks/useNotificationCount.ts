import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the count of unread notifications for the signed-in user.
 * Subscribes to realtime changes so the badge stays current.
 * Returns 0 when the user is signed out.
 */
export function useNotificationCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) {
        if (!cancelled) setCount(0);
        return;
      }
      const { count: c } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("is_read", false);
      if (!cancelled) setCount(c ?? 0);
    };

    load();

    const channel = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => load(),
      )
      .subscribe();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      sub.subscription.unsubscribe();
    };
  }, []);

  return count;
}
