import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { CropStatusWidget } from "@/components/dashboard/CropStatusWidget";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { SmartInsights } from "@/components/dashboard/SmartInsights";
import { TiltCard } from "@/components/ui/tilt-card";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cropsData, getSeasonalCrops } from "@/data/cropsData";
import { 
  Wheat, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  Calendar,
  Brain,
  MapPin,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Clock,
  Leaf,
  Sun,
  CloudRain,
  Target,
  Zap,
  Bell
} from "lucide-react";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Mock user data - in real app this would come from auth context
  const user = {
    name: "John Farmer",
    role: "farmer",
  };

  const stats = [
    {
      title: "Active Crops",
      value: "12",
      change: { value: "+2 this month", trend: "up" as const },
      icon: Wheat,
      variant: "primary" as const,
    },
    {
      title: "Total Area",
      value: "45.2 ha",
      change: { value: "+5.2 ha added", trend: "up" as const },
      icon: MapPin,
      variant: "earth" as const,
    },
    {
      title: "Active Sensors",
      value: "24",
      change: { value: "All operational", trend: "neutral" as const },
      icon: Activity,
      variant: "water" as const,
    },
    {
      title: "Pending Tasks",
      value: "8",
      change: { value: "Due this week", trend: "neutral" as const },
      icon: Clock,
      variant: "harvest" as const,
    },
  ];

  const currentSeason = 'rabi'; // This would be calculated based on current date
  const seasonalCrops = getSeasonalCrops(currentSeason);
  
  const farmAlerts = [
    { type: 'warning', message: 'Wheat field A needs irrigation in 2 days', time: '2 hours ago' },
    { type: 'info', message: 'Weather forecast: Light rain expected tomorrow', time: '4 hours ago' },
    { type: 'success', message: 'Cotton harvest completed successfully', time: '1 day ago' },
  ];

  const taskList = [
    { id: 1, task: 'Apply fertilizer to Field B', crop: 'Wheat', priority: 'high', due: 'Today' },
    { id: 2, task: 'Pest inspection for cotton', crop: 'Cotton', priority: 'medium', due: 'Tomorrow' },
    { id: 3, task: 'Harvest preparation for Field C', crop: 'Mustard', priority: 'low', due: '3 days' },
  ];

  const marketPrices = [
    { crop: 'Wheat', price: '₹2,200/quintal', change: '+5.2%', trend: 'up' },
    { crop: 'Cotton', price: '₹6,800/quintal', change: '-2.1%', trend: 'down' },
    { crop: 'Mustard', price: '₹4,500/quintal', change: '+8.5%', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={3}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {user.name}. Here's what's happening on your farm today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <TiltCard>
                  <StatCard {...stat} />
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>

          {/* Farmer-Specific Dashboard Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="crops">Crops</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* AI Smart Insights */}
              <SmartInsights />
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <CropStatusWidget />
                  
                  {/* Farm Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Farm Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {farmAlerts.map((alert, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                          {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-harvest mt-0.5" />}
                          {alert.type === 'info' && <Bell className="h-4 w-4 text-primary mt-0.5" />}
                          {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">{alert.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <WeatherWidget />
                  
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/crops">
                          <Wheat className="h-4 w-4 mr-2" />
                          Add New Crop
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/sensors">
                          <Activity className="h-4 w-4 mr-2" />
                          Monitor Sensors
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/ai-advisory">
                          <Brain className="h-4 w-4 mr-2" />
                          AI Advisory
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crops" className="space-y-6">
              <div className="grid gap-6">
                {/* Current Season Crops */}
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
                            <span className="text-sm font-medium text-primary">{crop.marketPrice.split('/')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Today's Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {taskList.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" />
                        <div>
                          <p className="font-medium">{task.task}</p>
                          <p className="text-sm text-muted-foreground">{task.crop}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                          {task.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{task.due}</span>
                      </div>
                    </div>
                  ))}
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
                  {marketPrices.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.crop}</p>
                        <p className="text-lg font-bold text-primary">{item.price}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.trend === 'up' ? 'default' : 'destructive'}>
                          {item.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <AIRecommendations />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;