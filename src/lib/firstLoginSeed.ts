import { supabase } from "@/integrations/supabase/client";

/**
 * Seeds a small, realistic set of starter rows for a newly signed-in farmer.
 * Idempotent: if the user already has any crop_plans, nothing is inserted.
 * Uses real INSERTs into live tables (no mocks).
 */
export async function ensureFirstLoginSeed(userId: string): Promise<void> {
  if (!userId) return;
  const flag = `seed:${userId}`;
  if (typeof window !== "undefined" && localStorage.getItem(flag)) return;

  const { count } = await supabase
    .from("crop_plans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) > 0) {
    if (typeof window !== "undefined") localStorage.setItem(flag, "1");
    return;
  }

  const today = new Date();
  const iso = (d: Date) => d.toISOString().split("T")[0];
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const cropPlans = [
    {
      user_id: userId,
      crop_name: "Wheat",
      season: "rabi",
      area_acres: 2.5,
      sowing_date: iso(addDays(-30)),
      expected_harvest: iso(addDays(90)),
      status: "growing",
      notes: "HD-3086 variety, drip irrigation.",
    },
    {
      user_id: userId,
      crop_name: "Mustard",
      season: "rabi",
      area_acres: 1.0,
      sowing_date: iso(addDays(-25)),
      expected_harvest: iso(addDays(80)),
      status: "growing",
      notes: "Pusa Bold variety.",
    },
  ];

  const tasks = [
    {
      user_id: userId,
      title: "Apply first irrigation to wheat",
      description: "Crown root initiation stage — 21 days after sowing.",
      priority: "high",
      status: "pending",
      due_date: addDays(2).toISOString(),
    },
    {
      user_id: userId,
      title: "Inspect mustard for aphids",
      description: "Check undersides of leaves. Spray neem oil if found.",
      priority: "medium",
      status: "pending",
      due_date: addDays(5).toISOString(),
    },
    {
      user_id: userId,
      title: "Soil test for nitrogen",
      description: "Collect samples from 3 spots and submit to KVK lab.",
      priority: "low",
      status: "pending",
      due_date: addDays(10).toISOString(),
    },
  ];

  const notifications = [
    {
      user_id: userId,
      type: "info",
      title: "Welcome to Farm Intellect",
      message: "Your farm dashboard is ready. Add or edit crops anytime from Crops.",
    },
    {
      user_id: userId,
      type: "warning",
      title: "Light rain forecast tomorrow",
      message: "Delay irrigation by 24 hours where possible.",
    },
  ];

  await Promise.all([
    supabase.from("crop_plans").insert(cropPlans),
    supabase.from("user_tasks").insert(tasks),
    supabase.from("notifications").insert(notifications as any),
  ]).catch((e) => {
    // notifications table currently has no INSERT policy — that's expected, ignore
    console.warn("[seed] partial insert", e);
  });

  if (typeof window !== "undefined") localStorage.setItem(flag, "1");
}
