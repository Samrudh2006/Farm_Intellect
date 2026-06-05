import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldHistoryTimeline } from "@/components/features/FieldHistoryTimeline";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { 
  Map,
  Layers,
  Satellite,
  Navigation,
  Zap,
  Droplets,
  Thermometer,
  Activity,
  Plus,
  Settings,
} from "lucide-react";
import { ndviClassification, ndwiClassification, cropNDVIProfiles } from "@/data/satelliteData";
import { useToast } from "@/hooks/use-toast";
import { LoadingState, ErrorState, EmptyState } from "@/components/state/UIState";

const sensorIcons: Record<string, any> = {
  soil_moisture: Droplets,
  temperature: Thermometer,
  ph: Activity,
  npk: Zap,
};

const sensorColors: Record<string, string> = {
  soil_moisture: "text-blue-500",
  temperature: "text-amber-500", 
  ph: "text-primary",
  npk: "text-emerald-500",
};

const statusColors: Record<string, any> = {
  optimal: "default",
  warning: "secondary",
  low: "destructive",
  high: "destructive",
};

const vegetationColorClasses: Record<string, string> = {
  "#1565C0": "bg-[#1565C0]",
  "#8D6E63": "bg-[#8D6E63]",
  "#F9A825": "bg-[#F9A825]",
  "#FDD835": "bg-[#FDD835]",
  "#8BC34A": "bg-[#8BC34A]",
  "#4CAF50": "bg-[#4CAF50]",
  "#2E7D32": "bg-[#2E7D32]",
  "#1B5E20": "bg-[#1B5E20]",
  "#BF360C": "bg-[#BF360C]",
  "#F57F17": "bg-[#F57F17]",
  "#66BB6A": "bg-[#66BB6A]",
  "#26A69A": "bg-[#26A69A]",
};

const FieldMap = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [mapView, setMapView] = useState<"satellite" | "terrain">("satellite");
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-primary";
    if (health >= 60) return "text-amber-500";
    return "text-destructive";
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('field_maps').select('*');
      if (error) throw error;
      const transformed = (data || []).map(f => ({
        id: f.id,
        name: f.field_name,
        area: `${f.area} hectares`,
        crop: f.crop,
        coordinates: typeof f.coordinates === 'string' ? JSON.parse(f.coordinates) : f.coordinates,
        sensors: [],
        health: null,
        lastUpdated: f.updated_at || f.created_at || null,
      }));
      setFields(transformed);
      if (transformed.length > 0) setSelectedField(transformed[0].id);
    } catch (e: any) {
      setError(e?.message || "Failed to load fields");
      toast({ title: "Failed to load fields", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
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
        userRole="farmer"
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Field Map</h2>
              <p className="text-muted-foreground">Interactive field mapping with real DB data</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={mapView === "satellite" ? "default" : "outline"} size="sm" onClick={() => setMapView("satellite")}>
                <Satellite className="h-4 w-4 mr-1" /> Satellite
              </Button>
              <Button variant={mapView === "terrain" ? "default" : "outline"} size="sm" onClick={() => setMapView("terrain")}>
                <Layers className="h-4 w-4 mr-1" /> Terrain
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="h-[600px] overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" /> Interactive Field Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative min-h-[480px]">
                  {loading ? (
                    <LoadingState title="Loading field map…" />
                  ) : error ? (
                    <ErrorState title="Field map unavailable" description={error} onRetry={fetchFields} />
                  ) : fields.length > 0 ? (
                    (() => {
                      const activeField = fields.find((f) => f.id === selectedField) || fields[0];
                      const centerLat = activeField?.coordinates?.[0]?.lat ?? 20.5937;
                      const centerLng = activeField?.coordinates?.[0]?.lng ?? 78.9629;

                      return (
                        <div className="w-full h-full min-h-[480px] relative z-10">
                          <iframe
                            srcDoc={`
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                                <style>html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }</style>
                              </head>
                              <body>
                                <div id="map"></div>
                                <script>
                                  const map = L.map('map').setView([${centerLat}, ${centerLng}], 17);
                                  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
                                  const terrain = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png');
                                  
                                  if ('${mapView}' === 'satellite') satellite.addTo(map);
                                  else terrain.addTo(map);

                                  const fields = ${JSON.stringify(fields)};
                                  fields.forEach(f => {
                                    if (!f.coordinates || !f.coordinates.length) return;
                                    const coords = f.coordinates.map(c => [c.lat, c.lng]);
                                    const isSelected = f.id === '${selectedField}';
                                    const poly = L.polygon(coords, {
                                      color: isSelected ? '#ff7800' : '#3388ff',
                                      weight: isSelected ? 4 : 2,
                                      fillColor: isSelected ? '#ff7800' : '#3388ff',
                                      fillOpacity: 0.35
                                    }).addTo(map);
                                    
                                    poly.bindPopup('<b>' + f.name + '</b><br>Crop: ' + f.crop + '<br>Area: ' + f.area);
                                    if (isSelected) poly.openPopup();
                                  });
                                </script>
                              </body>
                              </html>
                            `}
                            className="w-full h-full border-0 absolute inset-0"
                            title="Interactive Field Map Layer"
                          />
                        </div>
                      );
                    })()
                  ) : (
                    <EmptyState title="No fields mapped" description="Add your first field to see it on the map." />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Navigation className="h-5 w-5 text-primary" /> Field Selection</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {fields.map((field) => (
                    <Button
                      key={field.id}
                      variant={selectedField === field.id ? "default" : "outline"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedField(field.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{field.name}</div>
                        <div className="text-sm opacity-70">{field.crop} • {field.area}</div>
                      </div>
                    </Button>
                  ))}
                  <Button variant="outline" className="w-full"><Plus className="h-4 w-4 mr-2" /> Add New Field</Button>
                </CardContent>
              </Card>

              {selectedField && (
                <Card>
                  <CardHeader><CardTitle>{fields.find(f => f.id === selectedField)?.name} Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const field = fields.find(f => f.id === selectedField);
                      if (!field) return null;
                      
                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Crop</span><span className="font-medium">{field.crop}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Area</span><span className="font-medium">{field.area}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Health Score</span><span className={`font-medium ${getHealthColor(field.health)}`}>{field.health}%</span></div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium">Active Sensors</h4>
                            {field.sensors.map((sensor: any, index: number) => {
                              const SensorIcon = sensorIcons[sensor.type] || Activity;
                              return (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <SensorIcon className={`h-4 w-4 ${sensorColors[sensor.type] || "text-primary"}`} />
                                    <span className="text-sm capitalize">{sensor.type.replace('_', ' ')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{sensor.value}</span>
                                    <Badge variant={statusColors[sensor.status] as any || "outline"} className="text-xs">{sensor.status}</Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-xs text-muted-foreground">Last updated: {new Date(field.lastUpdated).toLocaleString()}</div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1">View Details</Button>
                            <Button size="sm" variant="outline"><Settings className="h-4 w-4" /></Button>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FieldMap;
