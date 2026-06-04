import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { CropStatusWidget } from "@/components/dashboard/CropStatusWidget";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { MarketPricesDebugPanel } from "@/components/admin/MarketPricesDebugPanel";
import { SmartInsights } from "@/components/dashboard/SmartInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSeasonalCrops } from "@/data/cropsData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  Wheat,
  TrendingUp,
  Activity,
  Brain,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Leaf,
  Target,
  Bell,
  Loader2,
} from "lucide-react";

interface FarmAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

interface MarketPrice {
  crop: string;
  modalPrice: number;
  unit: string;
}

const getCurrentSeason = (): "kharif" | "rabi" | "zaid" => {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 10) return "kharif";
  if (m === 11 || m <= 3) return "rabi";
  return "zaid";
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const { cropPlans, tasks, loading: dashLoading } = useDashboardData();

  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user.id) { setAlertsLoading(false); return; }
      const { data } = await supabase
        .from("notifications")
        .select("id,type,title,message,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (active) {
        setAlerts((data as FarmAlert[]) || []);
        setAlertsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user.id]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("market-prices", {
          body: { state: undefined, district: undefined },
        });
        if (active && !error && data?.prices) {
          setMarketPrices(data.prices.slice(0, 6));
        }
      } catch {
        // No mock fallback — leave empty
      } finally {
        if (active) setPricesLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const totalAcres = cropPlans.reduce((sum, c) => sum + (Number(c.area_acres) || 0), 0);
  const pendingTasks = tasks.length;

  const stats = [
    {
      title: "Active Crops",
      value: dashLoading ? "—" : String(cropPlans.length),
      icon: Wheat,
      variant: "primary" as const,
    },
    {
      title: "Total Area",
      value: dashLoading ? "—" : `${totalAcres.toFixed(1)} acres`,
      icon: MapPin,
      variant: "earth" as const,
    },
    {
      title: "Alerts",
      value: alertsLoading ? "—" : String(alerts.length),
      icon: Activity,
      variant: "water" as const,
    },
    {
      title: "Pending Tasks",
      value: dashLoading ? "—" : String(pendingTasks),
      icon: Clock,
      variant: "harvest" as const,
    },
  ];

  const currentSeason = getCurrentSeason();
  const seasonalCrops = getSeasonalCrops(currentSeason);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />


      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back{user.name ? `, ${user.name}` : ""}. Here's what's happening on your farm today.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="crops">Crops</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SmartInsights />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <CropStatusWidget />

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Farm Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {alertsLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                      ) : alerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No alerts yet.</p>
                      ) : (
                        alerts.map((alert) => (
                          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                            {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-harvest mt-0.5" />}
                            {alert.type === "info" && <Bell className="h-4 w-4 text-primary mt-0.5" />}
                            {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{alert.title}</p>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <WeatherWidget />

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/crops"><Wheat className="h-4 w-4 mr-2" />Add New Crop</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/sensors"><Activity className="h-4 w-4 mr-2" />Monitor Sensors</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/ai-advisory"><Brain className="h-4 w-4 mr-2" />AI Advisory</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crops" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Current Season Crops ({currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {seasonalCrops.slice(0, 6).map((crop) => (
                      <div key={crop.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <img src={crop.image} alt={crop.name} className="w-full h-32 object-cover rounded-md mb-3" />
                        <h4 className="font-semibold">{crop.name}</h4>
                        <p className="text-sm text-muted-foreground">{crop.hindi}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{crop.difficulty}</Badge>
                          <span className="text-sm font-medium text-primary">{crop.marketPrice.split("/")[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Your Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending tasks.</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "secondary" : "outline"}>
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Market Prices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricesLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : marketPrices.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Market prices unavailable.</p>
                  ) : (
                    marketPrices.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.crop}</p>
                          <p className="text-lg font-bold text-primary">₹{item.modalPrice.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{item.unit}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <AIRecommendations />
              <MarketPricesDebugPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
