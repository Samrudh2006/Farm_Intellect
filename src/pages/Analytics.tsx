import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Users,
  Wheat,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  MapPin,
  DollarSign
} from "lucide-react";

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const user = {
    name: "Expert User",
    role: "expert",
  };

  const stats = [
    {
      title: "Total Farmers",
      value: "2,847",
      change: { value: "+12.3% this month", trend: "up" as const },
      icon: Users,
      variant: "primary" as const,
    },
    {
      title: "Active Crops",
      value: "45,280 ha",
      change: { value: "+8.5% from last season", trend: "up" as const },
      icon: Wheat,
      variant: "earth" as const,
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: { value: "+2.1% improvement", trend: "up" as const },
      icon: Target,
      variant: "water" as const,
    },
    {
      title: "Revenue",
      value: "₹1.2Cr",
      change: { value: "+15.7% this quarter", trend: "up" as const },
      icon: DollarSign,
      variant: "harvest" as const,
    },
  ];

  const cropPerformance = [
    { crop: "Wheat", area: "15,420 ha", yield: "42.3 qt/ha", growth: "+8.2%", status: "excellent" },
    { crop: "Rice", area: "12,850 ha", yield: "38.7 qt/ha", growth: "+5.1%", status: "good" },
    { crop: "Cotton", area: "8,960 ha", yield: "22.4 qt/ha", growth: "-2.3%", status: "average" },
    { crop: "Mustard", area: "6,740 ha", yield: "18.9 qt/ha", growth: "+12.5%", status: "excellent" },
  ];

  const regionData = [
    { region: "Punjab", farmers: 1240, area: "28,450 ha", performance: 92 },
    { region: "Haryana", farmers: 890, area: "19,670 ha", performance: 88 },
    { region: "Uttar Pradesh", farmers: 567, area: "12,340 ha", performance: 85 },
    { region: "Rajasthan", farmers: 150, area: "4,780 ha", performance: 79 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-blue-500";
      case "average": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "excellent": return "default";
      case "good": return "secondary";
      case "average": return "outline";
      default: return "outline";
    }
  };

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
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
              <p className="text-muted-foreground">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="crops">Crop Performance</TabsTrigger>
              <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Monthly Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Farmer Registrations</span>
                        <span className="text-sm font-medium">+12.3%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Crop Area Expansion</span>
                        <span className="text-sm font-medium">+8.5%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Revenue Growth</span>
                        <span className="text-sm font-medium">+15.7%</span>
                      </div>
                      <Progress value={85} className="h-2" />
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
                    <div className="space-y-3">
                      {cropPerformance.map((crop) => (
                        <div key={crop.crop} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(crop.status)}`}></div>
                            <span className="text-sm font-medium">{crop.crop}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{crop.area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="crops" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wheat className="h-5 w-5 text-primary" />
                    Crop Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cropPerformance.map((crop) => (
                      <div key={crop.crop} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-semibold">{crop.crop}</h4>
                            <p className="text-sm text-muted-foreground">Area: {crop.area}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{crop.yield}</p>
                            <p className="text-sm text-muted-foreground">Avg Yield</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={crop.growth.startsWith('+') ? 'default' : 'destructive'}>
                              {crop.growth}
                            </Badge>
                          </div>
                          <Badge variant={getStatusVariant(crop.status) as any}>
                            {crop.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-4">
                    {regionData.map((region) => (
                      <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Market Trends & Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Key Trends</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">Organic farming adoption</span>
                          <Badge>+45%</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">Smart irrigation usage</span>
                          <Badge>+32%</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">AI advisory adoption</span>
                          <Badge>+67%</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Seasonal Predictions</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium">Next Rabi Season</p>
                          <p className="text-sm text-muted-foreground">
                            Expected 15% increase in wheat production
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium">Kharif Outlook</p>
                          <p className="text-sm text-muted-foreground">
                            Rice prices predicted to stabilize
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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