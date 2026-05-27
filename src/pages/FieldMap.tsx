import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldHistoryTimeline } from "@/components/features/FieldHistoryTimeline";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
  Settings
} from "lucide-react";
import { ndviClassification, ndwiClassification, cropNDVIProfiles } from "@/data/satelliteData";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const mockFields = [
  {
    id: 1,
    name: "Field A",
    area: "12.5 hectares",
    crop: "Winter Wheat",
    coordinates: [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 40.7130, lng: -74.0058 },
      { lat: 40.7135, lng: -74.0055 },
      { lat: 40.7133, lng: -74.0062 }
    ],
    sensors: [
      { type: "soil_moisture", value: 42, status: "optimal" },
      { type: "temperature", value: 24.5, status: "optimal" }
    ],
    health: 85,
    lastUpdated: "2024-09-18T14:30:00Z"
  },
  {
    id: 2,
    name: "Field B", 
    area: "8.2 hectares",
    crop: "Corn",
    coordinates: [
      { lat: 40.7125, lng: -74.0065 },
      { lat: 40.7127, lng: -74.0063 },
      { lat: 40.7130, lng: -74.0068 },
      { lat: 40.7128, lng: -74.0070 }
    ],
    sensors: [
      { type: "ph", value: 6.8, status: "warning" },
      { type: "soil_moisture", value: 28, status: "low" }
    ],
    health: 67,
    lastUpdated: "2024-09-18T13:15:00Z"
  },
  {
    id: 3,
    name: "Field C",
    area: "6.8 hectares", 
    crop: "Soybeans",
    coordinates: [
      { lat: 40.7135, lng: -74.0055 },
      { lat: 40.7137, lng: -74.0052 },
      { lat: 40.7140, lng: -74.0058 },
      { lat: 40.7138, lng: -74.0060 }
    ],
    sensors: [
      { type: "npk", value: 185, status: "optimal" }
    ],
    health: 92,
    lastUpdated: "2024-09-18T14:25:00Z"
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

const statusColors = {
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
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [mapView, setMapView] = useState<"satellite" | "terrain">("satellite");
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [fields, setFields] = useState<typeof mockFields>([]);
  const [loading, setLoading] = useState(true);

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-primary";
    if (health >= 60) return "text-harvest";
    return "text-destructive";
  };

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      try {
        const { fields: apiFields } = await apiFetch<{ fields: typeof mockFields }>("/api/farm/fields");
        setFields(apiFields || mockFields);
        if (!selectedField && (apiFields?.length || mockFields.length)) {
          setSelectedField(1);
        }
      } catch (error: any) {
        console.warn("Using offline mock fields fallback:", error);
        setFields(mockFields);
        if (!selectedField) {
          setSelectedField(1);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, [toast, selectedField]);

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
        userRole="farmer"
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Field Map</h2>
              <p className="text-muted-foreground">
                Interactive field mapping and sensor data visualization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={mapView === "satellite" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapView("satellite")}
              >
                <Satellite className="h-4 w-4 mr-1" />
                Satellite
              </Button>
              <Button 
                variant={mapView === "terrain" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapView("terrain")}
              >
                <Layers className="h-4 w-4 mr-1" />
                Terrain
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Map and Field Details */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Interactive Map */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Interactive Field Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative min-h-[480px]">
                  {(() => {
                    const activeField = fields.find((f) => f.id === selectedField) || fields[0];
                    const centerLat = activeField?.coordinates[0]?.lat ?? 20.5937;
                    const centerLng = activeField?.coordinates[0]?.lng ?? 78.9629;

                    return (
                      <div className="w-full h-full min-h-[480px] relative z-10">
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                              <style>
                                html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
                              </style>
                            </head>
                            <body>
                              <div id="map"></div>
                              <script>
                                const map = L.map('map').setView([${centerLat}, ${centerLng}], 17);
                                
                                const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                                  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                });
                                
                                const terrain = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.html' === '' ? '' : 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
                                  attribution: '&copy; OpenStreetMap contributors'
                                });

                                if ('${mapView}' === 'satellite') {
                                  satellite.addTo(map);
                                } else {
                                  terrain.addTo(map);
                                }

                                const fields = ${JSON.stringify(fields)};
                                fields.forEach(f => {
                                  const coords = f.coordinates.map(c => [c.lat, c.lng]);
                                  const poly = L.polygon(coords, {
                                    color: f.id === ${selectedField} ? '#ff7800' : '#3388ff',
                                    weight: f.id === ${selectedField} ? 4 : 2,
                                    fillColor: f.id === ${selectedField} ? '#ff7800' : '#3388ff',
                                    fillOpacity: 0.35
                                  }).addTo(map);
                                  
                                  poly.bindPopup('<b>' + f.name + '</b><br>Crop: ' + f.crop + '<br>Area: ' + f.area);
                                  
                                  if (f.id === ${selectedField}) {
                                    poly.openPopup();
                                  }
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
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Field Details Sidebar */}
            <div className="space-y-6">
              {/* Field Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Field Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockFields.map((field) => (
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
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Field
                  </Button>
                </CardContent>
              </Card>

              {/* Selected Field Details */}
              {selectedField && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {mockFields.find(f => f.id === selectedField)?.name} Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const field = mockFields.find(f => f.id === selectedField);
                      if (!field) return null;
                      
                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Crop</span>
                              <span className="font-medium">{field.crop}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Area</span>
                              <span className="font-medium">{field.area}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Health Score</span>
                              <span className={`font-medium ${getHealthColor(field.health)}`}>
                                {field.health}%
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium">Active Sensors</h4>
                            {field.sensors.map((sensor, index) => {
                              const SensorIcon = sensorIcons[sensor.type as keyof typeof sensorIcons];
                              return (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <SensorIcon className={`h-4 w-4 ${sensorColors[sensor.type as keyof typeof sensorColors]}`} />
                                    <span className="text-sm capitalize">
                                      {sensor.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{sensor.value}</span>
                                    <Badge variant={statusColors[sensor.status as keyof typeof statusColors] as any} className="text-xs">
                                      {sensor.status}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Last updated: {new Date(field.lastUpdated).toLocaleString()}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sensor
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Layers className="h-4 w-4 mr-2" />
                    Field Boundaries
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Navigation className="h-4 w-4 mr-2" />
                    GPS Tracking
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Satellite Vegetation Index Panel */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* NDVI Classification Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-primary" />
                  NDVI Classification Reference
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Normalized Difference Vegetation Index — ISRO/Bhuvan · Sentinel-2 · MODIS standards
                </p>
              </CardHeader>
              <CardContent className="space-y-1">
                {ndviClassification.map((range, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <div
                      className={`h-3 w-3 flex-shrink-0 rounded-sm ${vegetationColorClasses[range.color] ?? "bg-muted"}`}
                    />
                    <span className="text-xs font-mono w-24 shrink-0">
                      {range.min.toFixed(2)} – {range.max.toFixed(2)}
                    </span>
                    <span className="text-xs font-medium w-36 shrink-0">{range.category}</span>
                    <span className="text-xs text-muted-foreground truncate">{range.cropCondition}</span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">NDWI Water Stress Levels:</p>
                  {ndwiClassification.map((range, i) => (
                    <div key={i} className="flex items-center gap-3 py-0.5">
                      <div
                        className={`h-3 w-3 flex-shrink-0 rounded-sm ${vegetationColorClasses[range.color] ?? "bg-muted"}`}
                      />
                      <span className="text-xs font-mono w-24 shrink-0">
                        {range.min.toFixed(2)} – {range.max.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{range.cropCondition}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crop NDVI Stage Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Crop NDVI Stage Profile
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedField
                    ? `${mockFields.find(f => f.id === selectedField)?.crop} — expected NDVI range per growth stage`
                    : "Select a field above to view crop-specific NDVI thresholds"}
                </p>
              </CardHeader>
              <CardContent>
                {selectedField ? (() => {
                  const field = mockFields.find(f => f.id === selectedField);
                  const lastWord = field?.crop.split(" ").pop() ?? "";
                  const firstWord = field?.crop.split(" ")[0] ?? "";
                  const profile = cropNDVIProfiles.find(p =>
                    p.crop.toLowerCase().includes(lastWord.toLowerCase()) ||
                    p.crop.toLowerCase().includes(firstWord.toLowerCase())
                  );
                  if (!profile) return (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No NDVI profile for &ldquo;{field?.crop}&rdquo;.<br />
                      Available: Rice, Wheat, Cotton, Maize, Soybean, Sugarcane, Potato.
                    </p>
                  );
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1.5 font-semibold">Stage</th>
                            <th className="text-left py-1.5 font-semibold">DAS</th>
                            <th className="text-center py-1.5 font-semibold">Min</th>
                            <th className="text-center py-1.5 font-semibold text-green-700">Optimal</th>
                            <th className="text-center py-1.5 font-semibold">Max</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profile.stages.map((stage, i) => (
                            <tr key={i} className="border-b border-muted/50 hover:bg-muted/30">
                              <td className="py-1.5 font-medium pr-2">{stage.name.split("(")[0].trim()}</td>
                              <td className="py-1.5 text-muted-foreground">{stage.das}</td>
                              <td className="py-1.5 text-center">{stage.ndvi.min.toFixed(2)}</td>
                              <td className="py-1.5 text-center font-bold text-green-700">{stage.ndvi.optimal.toFixed(2)}</td>
                              <td className="py-1.5 text-center">{stage.ndvi.max.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-xs text-muted-foreground mt-3">
                        Source: NRSC Bhuvan crop monitoring · FAO ASIS · ICAR remote sensing studies
                      </p>
                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Satellite className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">Select a field to view NDVI profile</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <FieldHistoryTimeline
            fields={mockFields.map((field) => ({
              id: field.id,
              name: field.name,
              crop: field.crop,
              area: field.area,
              health: field.health,
            }))}
            selectedField={selectedField}
          />
        </div>
      </main>
    </div>
  );
};

export default FieldMap;
