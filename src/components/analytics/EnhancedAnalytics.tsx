import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, AlertTriangle, BarChart3, Activity, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { nationalCropStats, cropProductionMetadata } from "@/data/cropProduction";
import { mandiPrices, mandiPricesMetadata, getMSPCrops, getHighVolatilityCommodities } from "@/data/mandiPrices";

export const EnhancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, farmers: 0, merchants: 0, experts: 0, admins: 0, totalActivity: 0, totalCropPlans: 0, totalTasks: 0 });
  const [activityByType, setActivityByType] = useState<{ type: string; count: number }[]>([]);

  const formatUpdatedAt = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [profilesRes, rolesRes, activityRes, cropRes, tasksRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("activity_log").select("action_type"),
        supabase.from("crop_plans").select("id", { count: "exact", head: true }),
        supabase.from("user_tasks").select("id", { count: "exact", head: true }),
      ]);

      const roles = rolesRes.data || [];
      const roleCounts = roles.reduce((acc: Record<string, number>, r: any) => {
        acc[r.role] = (acc[r.role] || 0) + 1;
        return acc;
      }, {});

      const activities = activityRes.data || [];
      const typeCounts = activities.reduce((acc: Record<string, number>, a: any) => {
        acc[a.action_type] = (acc[a.action_type] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalUsers: profilesRes.count || 0,
        farmers: roleCounts.farmer || 0,
        merchants: roleCounts.merchant || 0,
        experts: roleCounts.expert || 0,
        admins: roleCounts.admin || 0,
        totalActivity: activities.length,
        totalCropPlans: cropRes.count || 0,
        totalTasks: tasksRes.count || 0,
      });

      setActivityByType(Object.entries(typeCounts).map(([type, count]) => ({ type, count: count as number })));
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Real production data
  const productionChartData = nationalCropStats.slice(0, 8).map(s => ({
    crop: s.crop.split(" ")[0],
    production: s.production,
    yield: Math.round(s.yield / 100) / 10,
  }));

  const mandiPriceChart = mandiPrices.slice(0, 8).map(m => ({
    commodity: m.commodity.split(" ")[0],
    msp: m.mspPrice,
    modal: Math.round(m.marketPrices.reduce((acc, p) => acc + p.modalPrice, 0) / m.marketPrices.length),
  }));

  const volatileCommodities = getHighVolatilityCommodities();
  const mspCrops = getMSPCrops();

  const StatCard = ({ title, value, icon: Icon, subtitle, loading: isLoading }: any) => (
    <Card className="tricolor-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold text-foreground">{value}</p>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-full bg-primary/10"><Icon className="h-6 w-6 text-primary" /></div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient-tricolor">📊 Platform Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Real DB Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} subtitle={`${stats.farmers}F / ${stats.merchants}M / ${stats.experts}E / ${stats.admins}A`} loading={loading} />
        <StatCard title="Activity Events" value={stats.totalActivity} icon={Activity} subtitle="from activity_log" loading={loading} />
        <StatCard title="Crop Plans" value={stats.totalCropPlans} icon={Target} subtitle="active plans in DB" loading={loading} />
        <StatCard title="User Tasks" value={stats.totalTasks} icon={BarChart3} subtitle="across all users" loading={loading} />
      </div>

      {/* Activity by Type */}
      {activityByType.length > 0 && (
        <Card className="tricolor-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Activity by Type (Live DB)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full overflow-x-auto">
              <BarChart width={600} height={240} data={activityByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(145, 63%, 30%)" name="Events" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      )}

      {/* National Crop Production */}
      <Card className="tricolor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Indian Crop Production 2023-24 (Mt)
            <Badge variant="outline" className="ml-auto text-xs">Updated {formatUpdatedAt(cropProductionMetadata.lastUpdated)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full overflow-x-auto">
            <BarChart width={700} height={300} data={productionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="production" fill="hsl(145, 63%, 30%)" name="Production (Mt)" />
              <Bar dataKey="yield" fill="hsl(220, 72%, 25%)" name="Yield (t/ha)" />
            </BarChart>
          </div>
        </CardContent>
      </Card>

      {/* Mandi Price vs MSP */}
      <Card className="tricolor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Mandi vs MSP 2024-25 (₹/quintal)
            <Badge variant="outline" className="ml-auto text-xs">Updated {formatUpdatedAt(mandiPricesMetadata.lastUpdated)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full overflow-x-auto">
            <BarChart width={700} height={300} data={mandiPriceChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="commodity" />
              <YAxis />
              <Tooltip formatter={(v: any) => [`₹${v}`, ""]} />
              <Bar dataKey="msp" fill="hsl(24, 95%, 48%)" name="MSP" />
              <Bar dataKey="modal" fill="hsl(220, 72%, 25%)" name="Mandi Modal" />
            </BarChart>
          </div>
          {volatileCommodities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">High volatility:</span>
              {volatileCommodities.map(c => <Badge key={c.commodity} variant="destructive" className="text-xs">{c.commodity}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MSP Reference */}
      <Card className="tricolor-card">
        <CardHeader><CardTitle>MSP 2024-25 Reference</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mspCrops.map(c => (
              <div key={c.commodity} className="p-3 border border-border rounded-lg text-center">
                <p className="text-sm font-medium text-foreground">{c.commodity.split(" ")[0]}</p>
                <p className="text-lg font-bold text-primary">₹{c.msp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">per quintal</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
