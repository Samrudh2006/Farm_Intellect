import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Wifi,
  WifiOff,
  Battery,
  Thermometer,
  Droplets,
  Zap,
  AlertTriangle,
  Settings,
  Plus,
  MapPin,
  Loader2
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const sensorIcons: Record<string, any> = {
  soil_moisture: Droplets,
  temperature: Thermometer,
  ph: Activity,
  npk: Zap,
  pump: Zap,
  moisture: Droplets
};

const sensorColors: Record<string, string> = {
  soil_moisture: "text-blue-500",
  moisture: "text-blue-500",
  temperature: "text-amber-500",
  ph: "text-primary",
  npk: "text-emerald-500",
  pump: "text-purple-500"
};

const Sensors = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "online": return "default";
      case "warning": return "secondary";
      case "offline": return "destructive";
      default: return "outline";
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-primary";
    if (battery > 20) return "text-amber-500";
    return "text-destructive";
  };

  useEffect(() => {
    const fetchSensors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('iot_sensors').select('*');
        if (error) throw error;
        setSensors(data || []);
      } catch (error: any) {
        toast({ title: "Failed to load sensors", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, [toast]);

  const filteredSensors = filterStatus === "all"
    ? sensors
    : sensors.filter(sensor => 
        (filterStatus === "online" && (sensor.status === "online" || sensor.status === "active")) ||
        sensor.status === filterStatus
      );

  const onlineSensors = sensors.filter(s => s.status === "online" || s.status === "active").length;
  const offlineSensors = sensors.filter(s => s.status === "offline").length;
  const warningSensors = sensors.filter(s => s.status === "warning").length;

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Sensor Network</h2>
              <p className="text-muted-foreground">Monitor environmental parameters across your fields</p>
            </div>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Sensor</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sensors</p>
                  <p className="text-2xl font-bold">{sensors.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold text-primary">{onlineSensors}</p>
                </div>
                <Wifi className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Warning</p>
                  <p className="text-2xl font-bold text-amber-500">{warningSensors}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold text-destructive">{offlineSensors}</p>
                </div>
                <WifiOff className="h-8 w-8 text-destructive" />
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 border-b">
            {[
              { key: "all", label: "All Sensors" },
              { key: "online", label: "Online" },
              { key: "warning", label: "Warning" },
              { key: "offline", label: "Offline" }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filterStatus === tab.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterStatus(tab.key)}
                className="mb-2"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  Loading sensor data from database...
                </CardContent>
              </Card>
            ) : filteredSensors.length > 0 ? (
              filteredSensors.map((sensor) => {
                const SensorIcon = sensorIcons[sensor.type] || Activity;
                
                return (
                  <Card key={sensor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SensorIcon className={`h-5 w-5 ${sensorColors[sensor.type] || "text-primary"}`} />
                          <div>
                            <CardTitle className="text-base">{sensor.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Field Deployment
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(sensor.status) as any}>{sensor.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current Reading</span>
                        </div>
                        <div className="text-2xl font-bold">
                          {sensor.value} {sensor.unit}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-1">
                            <Battery className="h-4 w-4" /> Battery
                          </span>
                          <span className={`font-medium ${getBatteryColor(sensor.battery)}`}>
                            {sensor.battery}%
                          </span>
                        </div>
                        <Progress value={sensor.battery} className="h-2" />
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Last reading: {new Date(sensor.last_updated).toLocaleString()}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">View History</Button>
                        <Button variant="outline" size="sm"><Settings className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No sensors found</h3>
                <p className="text-muted-foreground">No sensor data available in the database.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sensors;
