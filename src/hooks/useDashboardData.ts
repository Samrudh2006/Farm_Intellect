import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { withOfflineCache, setCache } from "@/lib/offline-cache";

const DEFAULT_MOCK_CROPS = [
  { id: "c1", crop_name: "Wheat", season: "Rabi", sowing_date: "2026-11-15", expected_harvest: "2027-04-15", area_acres: 5, status: "growing", notes: "Sown on time, looking healthy." },
  { id: "c2", crop_name: "Mustard", season: "Rabi", sowing_date: "2026-10-20", expected_harvest: "2027-03-10", area_acres: 2, status: "growing", notes: "Requires light irrigation soon." }
];

const DEFAULT_MOCK_EVENTS = [
  { id: "e1", event_type: "irrigation", event_description: "Watered north field", field_name: "North loam field", event_date: "2026-05-20" },
  { id: "e2", event_type: "fertilizer", event_description: "Applied NPK mixture", field_name: "Mustard field", event_date: "2026-05-18" }
];

const DEFAULT_MOCK_TASKS = [
  { id: "t1", title: "Water Wheat Field", description: "First irrigation cycle for the wheat crops", due_date: "2026-06-01", status: "pending", priority: "high" },
  { id: "t2", title: "Buy Organic Fertilizer", description: "Need 4 bags of vermicompost", due_date: "2026-05-30", status: "pending", priority: "medium" }
];

const DEFAULT_MOCK_SCHEMES = [
  { id: "s1", scheme_name: "PM-KISAN", scheme_type: "Direct Benefit Transfer", eligibility_score: 95, matched_at: "2026-05-24", status: "eligible" },
  { id: "s2", scheme_name: "PM Fasal Bima Yojana", scheme_type: "Crop Insurance", eligibility_score: 90, matched_at: "2026-05-24", status: "matched" }
];

const DEFAULT_MOCK_ACTIVITIES = [
  { id: "a1", action: "Logged in successfully", action_type: "login", created_at: "2026-05-26T17:00:00Z" }
];

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
      if (!hasSupabaseEnv) {
        let stored = localStorage.getItem("mock_dashboard_data");
        if (!stored) {
          const initialData = {
            cropPlans: DEFAULT_MOCK_CROPS,
            fieldEvents: DEFAULT_MOCK_EVENTS,
            tasks: DEFAULT_MOCK_TASKS,
            schemeMatches: DEFAULT_MOCK_SCHEMES,
            activities: DEFAULT_MOCK_ACTIVITIES
          };
          localStorage.setItem("mock_dashboard_data", JSON.stringify(initialData));
          stored = JSON.stringify(initialData);
        }
        const parsed = JSON.parse(stored);
        setCropPlans(parsed.cropPlans || []);
        setFieldEvents(parsed.fieldEvents || []);
        setTasks(parsed.tasks || []);
        setSchemeMatches(parsed.schemeMatches || []);
        setActivities(parsed.activities || []);
        setLoading(false);
        return;
      }

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

// Helper to add activity log
export const logActivity = async (action: string, actionType: string, metadata: Record<string, any> = {}) => {
  if (!hasSupabaseEnv) {
    console.debug("[Mock logActivity]", { action, actionType, metadata });
    const stored = localStorage.getItem("mock_dashboard_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.activities = [
          {
            id: `a-${Date.now()}`,
            action,
            action_type: actionType,
            created_at: new Date().toISOString()
          },
          ...(parsed.activities || [])
        ];
        localStorage.setItem("mock_dashboard_data", JSON.stringify(parsed));
      } catch (e) {
        console.error("Failed to update mock activity logs", e);
      }
    }
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_log").insert({
    user_id: user.id,
    action,
    action_type: actionType,
    metadata,
  });
};

// Helper to add a task
export const addTask = async (title: string, description?: string, dueDate?: Date, priority?: string) => {
  if (!hasSupabaseEnv) {
    console.debug("[Mock addTask]", { title, description, dueDate, priority });
    const stored = localStorage.getItem("mock_dashboard_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const newTask = {
          id: `t-${Date.now()}`,
          title,
          description: description || null,
          due_date: dueDate?.toISOString() || null,
          status: "pending",
          priority: priority || "medium"
        };
        parsed.tasks = [newTask, ...(parsed.tasks || [])];
        localStorage.setItem("mock_dashboard_data", JSON.stringify(parsed));
        return { data: [newTask], error: null } as any;
      } catch (e) {
        console.error("Failed to add mock task", e);
        return { data: null, error: e as Error } as any;
      }
    }
    return { data: null, error: new Error("Mock dashboard not initialized") } as any;
  }

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

// Helper to complete a task
export const completeTask = async (taskId: string) => {
  if (!hasSupabaseEnv) {
    console.debug("[Mock completeTask]", { taskId });
    const stored = localStorage.getItem("mock_dashboard_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.tasks = parsed.tasks.map((t: any) => 
          t.id === taskId ? { ...t, status: "completed" } : t
        );
        localStorage.setItem("mock_dashboard_data", JSON.stringify(parsed));
        return { error: null } as any;
      } catch (e) {
        console.error("Failed to complete mock task", e);
        return { error: e as Error } as any;
      }
    }
    return { error: new Error("Mock dashboard not initialized") } as any;
  }

  return supabase.from("user_tasks").update({
    status: "completed",
    completed_at: new Date().toISOString(),
  }).eq("id", taskId);
};
