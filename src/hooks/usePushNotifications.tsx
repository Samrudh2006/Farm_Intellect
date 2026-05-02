import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

const PRIORITY_TYPES = new Set(["warning", "error", "alert", "weather", "market", "crop"]);

/**
 * Subscribes to realtime notifications for the signed-in user and surfaces them as:
 *  - Toast (always)
 *  - Browser Notification API (when permission granted and document is hidden)
 *
 * Also exposes a requestPermission() helper for UI to call from a user gesture.
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const seenRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied" as NotificationPermission;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return "denied" as NotificationPermission;
    }
  }, []);

  const showBrowserNotification = useCallback((n: NotificationRow) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    // Only push to OS when document is hidden, to avoid duplicate UX with toast
    if (document.visibilityState === "visible") return;
    try {
      const browserNotif = new Notification(n.title, {
        body: n.message,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: n.id,
        data: { id: n.id, type: n.type },
      });
      browserNotif.onclick = () => {
        window.focus();
        browserNotif.close();
      };
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`push-notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as NotificationRow;
          if (!n || seenRef.current.has(n.id)) return;
          seenRef.current.add(n.id);

          const variant = n.type === "error" || n.type === "warning" ? "destructive" : "default";
          toast({ title: n.title, description: n.message, variant: variant as "default" | "destructive" });

          if (PRIORITY_TYPES.has(n.type)) {
            showBrowserNotification(n);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast, showBrowserNotification]);

  return { permission, requestPermission };
}
