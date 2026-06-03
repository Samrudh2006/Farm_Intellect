import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CropPerformanceRow {
  crop: string;
  area: string;
  yield: string;
  growth: string;
  status: "excellent" | "good" | "average";
}

export interface RegionRow {
  region: string;
  farmers: number;
  area: string;
  performance: number;
}

export interface PlatformAnalytics {
  loading: boolean;
  totalFarmers: number;
  totalAreaHa: number;
  successRate: number;
  pendingTasks: number;
  cropPerformance: CropPerformanceRow[];
  regions: RegionRow[];
}

const ACRE_TO_HA = 0.404686;

function classify(growthPct: number): CropPerformanceRow["status"] {
  if (growthPct >= 10) return "excellent";
  if (growthPct >= 0) return "good";
  return "average";
}

export function usePlatformAnalytics(): PlatformAnalytics {
  const [state, setState] = useState<PlatformAnalytics>({
    loading: true,
    totalFarmers: 0,
    totalAreaHa: 0,
    successRate: 0,
    pendingTasks: 0,
    cropPerformance: [],
    regions: [],
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [{ count: farmerCount }, plansRes, tasksRes, profilesRes] =
        await Promise.all([
          supabase
            .from("user_roles")
            .select("id", { count: "exact", head: true })
            .eq("role", "farmer"),
          supabase.from("crop_plans").select("crop_name,area_acres,status"),
          supabase.from("user_tasks").select("status"),
          supabase.from("profiles").select("user_id,location"),
        ]);

      if (cancelled) return;

      const plans = plansRes.data ?? [];
      const tasks = tasksRes.data ?? [];
      const profiles = profilesRes.data ?? [];

      const totalAreaHa = plans.reduce(
        (sum, p: any) => sum + Number(p.area_acres ?? 0) * ACRE_TO_HA,
        0,
      );

      const completedTasks = tasks.filter(
        (t: any) => t.status === "completed",
      ).length;
      const successRate = tasks.length
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;
      const pendingTasks = tasks.filter((t: any) => t.status !== "completed")
        .length;

      // Aggregate crop performance
      const byCrop = new Map<string, { area: number; harvested: number; planned: number }>();
      for (const p of plans as any[]) {
        const name = (p.crop_name as string)?.trim() || "Other";
        const entry = byCrop.get(name) ?? { area: 0, harvested: 0, planned: 0 };
        entry.area += Number(p.area_acres ?? 0) * ACRE_TO_HA;
        if (p.status === "harvested") entry.harvested += 1;
        entry.planned += 1;
        byCrop.set(name, entry);
      }
      const cropPerformance: CropPerformanceRow[] = Array.from(byCrop.entries())
        .map(([crop, v]) => {
          const growthPct = v.planned > 0 ? (v.harvested / v.planned) * 100 - 50 : 0;
          return {
            crop,
            area: `${v.area.toFixed(1)} ha`,
            yield: v.harvested > 0 ? `${(v.harvested * 22).toFixed(1)} qt/ha` : "—",
            growth: `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(1)}%`,
            status: classify(growthPct),
          };
        })
        .sort((a, b) => parseFloat(b.area) - parseFloat(a.area))
        .slice(0, 8);

      // Aggregate regions from profile location
      const byRegion = new Map<string, { farmers: Set<string>; area: number }>();
      const userArea = new Map<string, number>();
      for (const p of plans as any[]) {
        userArea.set(
          p.user_id,
          (userArea.get(p.user_id) ?? 0) + Number(p.area_acres ?? 0) * ACRE_TO_HA,
        );
      }
      for (const prof of profiles as any[]) {
        const region = (prof.location as string)?.split(",")[0]?.trim() || "Unknown";
        const entry = byRegion.get(region) ?? { farmers: new Set(), area: 0 };
        entry.farmers.add(prof.user_id);
        entry.area += userArea.get(prof.user_id) ?? 0;
        byRegion.set(region, entry);
      }
      const regions: RegionRow[] = Array.from(byRegion.entries())
        .map(([region, v]) => ({
          region,
          farmers: v.farmers.size,
          area: `${v.area.toFixed(0)} ha`,
          performance: Math.min(100, Math.round(50 + v.farmers.size * 2)),
        }))
        .sort((a, b) => b.farmers - a.farmers)
        .slice(0, 8);

      setState({
        loading: false,
        totalFarmers: farmerCount ?? 0,
        totalAreaHa,
        successRate,
        pendingTasks,
        cropPerformance,
        regions,
      });
    })().catch(() => {
      if (!cancelled) setState((s) => ({ ...s, loading: false }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
