import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { withOfflineCache } from "@/lib/offline-cache";

export interface CropPlan {
  id: string;
  crop_name: string;
  season: string;
  sowing_date: string | null;
  expected_harvest: string | null;
  area_acres: number | null;
  status: string;
  notes: string | null;
}

export interface FieldEvent {
  id: string;
  event_type: string;
  event_description: string;
  field_name: string | null;
  event_date: string;
}

export interface UserTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string;
}

export interface SchemeMatch {
  id: string;
  scheme_name: string;
  scheme_type: string | null;
  eligibility_score: number;
  matched_at: string;
  status: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  action_type: string;
  created_at: string;
}

export interface DashboardData {
  cropPlans: CropPlan[];
  fieldEvents: FieldEvent[];
  tasks: UserTask[];
  schemeMatches: SchemeMatch[];
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([]);
  const [fieldEvents, setFieldEvents] = useState<FieldEvent[]>([]);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [schemeMatches, setSchemeMatches] = useState<SchemeMatch[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cacheKey = `dashboard-${user.id}`;
      const { data: result, fromCache } = await withOfflineCache(
        cacheKey,
        async () => {
          const [cropsRes, eventsRes, tasksRes, schemesRes, activityRes] = await Promise.all([
            supabase.from("crop_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
            supabase.from("field_events").select("*").eq("user_id", user.id).order("event_date", { ascending: false }).limit(10),
            supabase.from("user_tasks").select("*").eq("user_id", user.id).eq("status", "pending").order("due_date", { ascending: true }),
            supabase.from("scheme_matches").select("*").eq("user_id", user.id).order("matched_at", { ascending: false }),
            supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
          ]);

          if (cropsRes.error) throw cropsRes.error;
          if (eventsRes.error) throw eventsRes.error;
          if (tasksRes.error) throw tasksRes.error;
          if (schemesRes.error) throw schemesRes.error;
          if (activityRes.error) throw activityRes.error;

          return {
            cropPlans: (cropsRes.data || []) as CropPlan[],
            fieldEvents: (eventsRes.data || []) as FieldEvent[],
            tasks: (tasksRes.data || []) as UserTask[],
            schemeMatches: (schemesRes.data || []) as SchemeMatch[],
            activities: (activityRes.data || []) as ActivityItem[],
          };
        }
      );

      if (fromCache) {
        console.info("[Offline] Using cached dashboard data");
      }

      setCropPlans(result.cropPlans);
      setFieldEvents(result.fieldEvents);
      setTasks(result.tasks);
      setSchemeMatches(result.schemeMatches);
      setActivities(result.activities);
    } catch (err: any) {
      console.error("Dashboard data error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    cropPlans,
    fieldEvents,
    tasks,
    schemeMatches,
    activities,
    loading,
    error,
    refresh: fetchData,
  };
};

export const logActivity = async (action: string, actionType: string, metadata: Record<string, any> = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_log").insert({
    user_id: user.id,
    action,
    action_type: actionType,
    metadata,
  });
};

export const addTask = async (title: string, description?: string, dueDate?: Date, priority?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  return supabase.from("user_tasks").insert({
    user_id: user.id,
    title,
    description,
    due_date: dueDate?.toISOString(),
    priority: priority || "medium",
  });
};

export const completeTask = async (taskId: string) => {
  return supabase.from("user_tasks").update({
    status: "completed",
    completed_at: new Date().toISOString(),
  }).eq("id", taskId);
};
