import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Wheat,
  Target,
  Download,
  Filter,
  RefreshCw,
  MapPin,
  Clock,
} from "lucide-react";

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const a = usePlatformAnalytics();

  const stats = [
    {
      title: "Total Farmers",
      value: a.loading ? "—" : a.totalFarmers.toLocaleString("en-IN"),
      icon: Users,
      variant: "primary" as const,
    },
    {
      title: "Active Crops",
      value: a.loading ? "—" : `${a.totalAreaHa.toFixed(1)} ha`,
      icon: Wheat,
      variant: "earth" as const,
    },
    {
      title: "Task Completion",
      value: a.loading ? "—" : `${a.successRate}%`,
      icon: Target,
      variant: "water" as const,
    },
    {
      title: "Pending Tasks",
      value: a.loading ? "—" : a.pendingTasks.toLocaleString("en-IN"),
      icon: Clock,
      variant: "harvest" as const,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "average":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Live insights across the platform</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="crops">Crop Performance</TabsTrigger>
              <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Platform Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Task completion rate</span>
                        <span className="text-sm font-medium">{a.successRate}%</span>
                      </div>
                      <Progress value={a.successRate} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active farmers</span>
                        <span className="text-sm font-medium">{a.totalFarmers}</span>
                      </div>
                      <Progress value={Math.min(100, a.totalFarmers)} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cultivated area</span>
                        <span className="text-sm font-medium">{a.totalAreaHa.toFixed(1)} ha</span>
                      </div>
                      <Progress value={Math.min(100, a.totalAreaHa)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Crop Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {a.loading ? (
                      <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : a.cropPerformance.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No crops registered yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {a.cropPerformance.map((crop) => (
                          <div key={crop.crop} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(crop.status)}`} />
                              <span className="text-sm font-medium">{crop.crop}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{crop.area}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="crops" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wheat className="h-5 w-5 text-primary" />
                    Crop Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {a.loading ? (
                    <Skeleton className="h-40 w-full" />
                  ) : a.cropPerformance.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No crop data yet. Add a crop in the Crops page to start tracking.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {a.cropPerformance.map((crop) => (
                        <div
                          key={crop.crop}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-semibold">{crop.crop}</h4>
                            <p className="text-sm text-muted-foreground">Area: {crop.area}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{crop.yield}</p>
                              <p className="text-sm text-muted-foreground">Avg Yield</p>
                            </div>
                            <Badge variant={crop.growth.startsWith("+") ? "default" : "destructive"}>
                              {crop.growth}
                            </Badge>
                            <Badge variant={getStatusVariant(crop.status) as any}>{crop.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Regional Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {a.loading ? (
                    <Skeleton className="h-40 w-full" />
                  ) : a.regions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No regional data yet — farmer profiles need a location.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {a.regions.map((region) => (
                        <div
                          key={region.region}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-semibold">{region.region}</h4>
                            <p className="text-sm text-muted-foreground">
                              {region.farmers} farmers • {region.area}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{region.performance}%</p>
                              <p className="text-sm text-muted-foreground">Performance</p>
                            </div>
                            <Progress value={region.performance} className="w-20 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
