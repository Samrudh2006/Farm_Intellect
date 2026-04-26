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
  MapPin
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const mockSensors = [
  {
    id: 1,
    name: "Soil Moisture Sensor A1",
    type: "soil_moisture",
    location: "Field A - Section 1",
    status: "online",
    battery: 85,
    lastReading: "2024-09-18T14:30:00Z",
    value: 42,
    unit: "%",
    optimal: { min: 35, max: 65 },
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 2,
    name: "Temperature Sensor A2", 
    type: "temperature",
    location: "Field A - Section 2",
    status: "online",
    battery: 92,
    lastReading: "2024-09-18T14:28:00Z",
    value: 24.5,
    unit: "°C",
    optimal: { min: 18, max: 28 },
    coordinates: { lat: 40.7130, lng: -74.0058 }
  },
  {
    id: 3,
    name: "pH Sensor B1",
    type: "ph",
    location: "Field B - Section 1", 
    status: "warning",
    battery: 23,
    lastReading: "2024-09-18T13:15:00Z",
    value: 6.8,
    unit: "pH",
    optimal: { min: 6.0, max: 7.5 },
    coordinates: { lat: 40.7125, lng: -74.0065 }
  },
  {
    id: 4,
    name: "Soil Moisture Sensor B2",
    type: "soil_moisture", 
    location: "Field B - Section 2",
    status: "offline",
    battery: 0,
    lastReading: "2024-09-17T09:22:00Z",
    value: 28,
    unit: "%",
    optimal: { min: 35, max: 65 },
    coordinates: { lat: 40.7122, lng: -74.0070 }
  },
  {
    id: 5,
    name: "NPK Sensor C1",
    type: "npk",
    location: "Field C - Section 1",
    status: "online",
    battery: 67,
    lastReading: "2024-09-18T14:25:00Z", 
    value: 185,
    unit: "ppm",
    optimal: { min: 150, max: 300 },
    coordinates: { lat: 40.7135, lng: -74.0055 }
  }
];

const sensorIcons = {
  soil_moisture: Droplets,
  temperature: Thermometer,
  ph: Activity,
  npk: Zap,
};

const sensorColors = {
  soil_moisture: "text-water",
  temperature: "text-harvest",
  ph: "text-primary",
  npk: "text-earth",
};

const Sensors = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [sensors, setSensors] = useState<typeof mockSensors>([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-primary";
      case "warning": return "text-harvest";
      case "offline": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online": return "default";
      case "warning": return "secondary";
      case "offline": return "destructive";
      default: return "outline";
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-primary";
    if (battery > 20) return "text-harvest";
    return "text-destructive";
  };

  const isValueOptimal = (value: number, optimal: { min: number; max: number }) => {
    return value >= optimal.min && value <= optimal.max;
  };

  const getValueStatus = (value: number, optimal: { min: number; max: number }) => {
    if (value < optimal.min) return "Low";
    if (value > optimal.max) return "High";
    return "Optimal";
  };

  useEffect(() => {
    const fetchSensors = async () => {
      setLoading(true);
      try {
        const { sensors: apiSensors } = await apiFetch<{ sensors: typeof mockSensors }>("/api/farm/sensors");
        setSensors(apiSensors || []);
      } catch (error: any) {
        toast({
          title: "Failed to load sensors",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, [toast]);

  const filteredSensors = filterStatus === "all"
    ? sensors
    : sensors.filter(sensor => sensor.status === filterStatus);

  const onlineSensors = sensors.filter(s => s.status === "online").length;
  const offlineSensors = sensors.filter(s => s.status === "offline").length;
  const warningSensors = sensors.filter(s => s.status === "warning").length;

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Sensor Network</h2>
              <p className="text-muted-foreground">
                Monitor soil conditions and environmental parameters across your fields
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sensor
            </Button>
          </div>

          {/* Status Overview */}
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
                  <p className="text-2xl font-bold text-harvest">{warningSensors}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-harvest" />
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

          {/* Filter Tabs */}
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

          {/* Sensors Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Loading sensor data...
                </CardContent>
              </Card>
            ) : filteredSensors.map((sensor) => {
              const SensorIcon = sensorIcons[sensor.type as keyof typeof sensorIcons];
              const isOptimal = isValueOptimal(sensor.value, sensor.optimal);
              const valueStatus = getValueStatus(sensor.value, sensor.optimal);
              
              return (
                <Card key={sensor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SensorIcon className={`h-5 w-5 ${sensorColors[sensor.type as keyof typeof sensorColors]}`} />
                        <div>
                          <CardTitle className="text-base">{sensor.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {sensor.location}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(sensor.status) as any}>
                        {sensor.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Reading */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Reading</span>
                        <Badge variant={isOptimal ? "default" : "destructive"}>
                          {valueStatus}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">
                        {sensor.value} {sensor.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Optimal: {sensor.optimal.min} - {sensor.optimal.max} {sensor.unit}
                      </div>
                    </div>

                    {/* Battery Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1">
                          <Battery className="h-4 w-4" />
                          Battery
                        </span>
                        <span className={`font-medium ${getBatteryColor(sensor.battery)}`}>
                          {sensor.battery}%
                        </span>
                      </div>
                      <Progress value={sensor.battery} className="h-2" />
                    </div>

                    {/* Last Reading */}
                    <div className="text-xs text-muted-foreground">
                      Last reading: {new Date(sensor.lastReading).toLocaleString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View History
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredSensors.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No sensors found</h3>
              <p className="text-muted-foreground">
                {filterStatus === "all" 
                  ? "No sensors are currently deployed"
                  : `No sensors with ${filterStatus} status`
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Sensors;
