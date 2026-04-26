import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Droplets, 
  Thermometer, 
  Cloud, 
  Calendar,
  Calculator,
  TrendingUp,
  Clock,
  Zap,
  Gauge,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  soilMoisture: number;
}

interface IrrigationRecommendation {
  schedule: string;
  amount: number;
  frequency: string;
  nextIrrigation: string;
  efficiency: number;
  costSaving: number;
}

export const SmartIrrigationCalculator = () => {
  const [cropType, setCropType] = useState("wheat");
  const [fieldSize, setFieldSize] = useState("1");
  const [soilType, setSoilType] = useState("loamy");
  const [currentStage, setCurrentStage] = useState("vegetative");
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [weather, setWeatherData] = useState<WeatherData>({
    temperature: 28,
    humidity: 65,
    rainfall: 0,
    windSpeed: 12,
    soilMoisture: 45
  });
  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const cropWaterRequirements = {
    wheat: { base: 400, coefficient: 1.0 },
    rice: { base: 1200, coefficient: 1.5 },
    cotton: { base: 600, coefficient: 1.2 },
    maize: { base: 500, coefficient: 1.1 },
    soybean: { base: 450, coefficient: 0.9 }
  };

  const soilFactors = {
    sandy: 0.8,
    loamy: 1.0,
    clay: 1.2
  };

  const stageFactors = {
    germination: 0.4,
    vegetative: 1.0,
    flowering: 1.3,
    maturity: 0.6
  };

  const calculateIrrigation = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const cropReq = cropWaterRequirements[cropType as keyof typeof cropWaterRequirements];
      const soilFactor = soilFactors[soilType as keyof typeof soilFactors];
      const stageFactor = stageFactors[currentStage as keyof typeof stageFactors];
      
      // Calculate based on weather conditions
      const tempFactor = weather.temperature > 30 ? 1.2 : weather.temperature < 20 ? 0.8 : 1.0;
      const humidityFactor = weather.humidity < 50 ? 1.3 : weather.humidity > 80 ? 0.7 : 1.0;
      const windFactor = weather.windSpeed > 15 ? 1.1 : 1.0;
      
      const dailyRequirement = (cropReq.base * cropReq.coefficient * soilFactor * stageFactor * tempFactor * humidityFactor * windFactor) / 100;
      
      const irrigationAmount = Math.max(0, dailyRequirement * parseFloat(fieldSize) - weather.rainfall);
      
      // Determine frequency based on soil moisture
      let frequency = "Every 3 days";
      let schedule = "Moderate";
      
      if (weather.soilMoisture < 30) {
        frequency = "Daily";
        schedule = "Urgent";
      } else if (weather.soilMoisture < 50) {
        frequency = "Every 2 days";
        schedule = "Moderate";
      } else if (weather.soilMoisture > 70) {
        frequency = "Every 5-7 days";
        schedule = "Light";
      }
      
      const efficiency = Math.min(95, 70 + (100 - weather.humidity) * 0.3);
      const costSaving = Math.round(irrigationAmount * 0.15);
      
      setRecommendation({
        schedule,
        amount: Math.round(irrigationAmount),
        frequency,
        nextIrrigation: schedule === "Urgent" ? "Within 6 hours" : schedule === "Moderate" ? "Tomorrow morning" : "In 2-3 days",
        efficiency: Math.round(efficiency),
        costSaving
      });
      
      setIsCalculating(false);
    }, 2000);
  };

  const updateWeatherData = async () => {
    const location = user?.location || "Chandigarh";
    setWeatherLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weather", { body: { city: location } });
      if (error || !data?.current) {
        throw new Error("Weather service unavailable");
      }

      const current = data.current;
      const rainfall = data.forecast?.list?.[0]?.rain?.["3h"] || 0;
      const humidity = current.main.humidity;
      const temperature = current.main.temp;
      const windSpeed = current.wind.speed * 3.6;
      const soilMoistureEstimate = Math.min(
        90,
        Math.max(15, Math.round(35 + rainfall * 1.5 + humidity * 0.2 - (temperature - 25)))
      );

      setWeatherData({
        temperature: Math.round(temperature),
        humidity,
        rainfall: Math.round(rainfall),
        windSpeed: Math.round(windSpeed),
        soilMoisture: soilMoistureEstimate,
      });
    } catch (error: any) {
      toast({
        title: "Weather update failed",
        description: error?.message || "Using last known values.",
        variant: "destructive",
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    updateWeatherData();
    const interval = setInterval(updateWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.location]);

  const getScheduleColor = (schedule: string) => {
    switch (schedule) {
      case "Urgent": return "destructive";
      case "Moderate": return "secondary";
      case "Light": return "outline";
      default: return "secondary";
    }
  };

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return { status: "Low", color: "text-red-600", icon: AlertCircle };
    if (moisture < 50) return { status: "Moderate", color: "text-yellow-600", icon: Gauge };
    if (moisture < 70) return { status: "Good", color: "text-green-600", icon: Droplets };
    return { status: "High", color: "text-blue-600", icon: Droplets };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Smart Irrigation Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered irrigation optimization based on real-time weather and soil data
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Crop Type</Label>
                <select 
                  id="crop"
                  className="w-full p-2 border rounded"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                >
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                  <option value="maize">Maize</option>
                  <option value="soybean">Soybean</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fieldSize">Field Size (hectares)</Label>
                <Input
                  id="fieldSize"
                  type="number"
                  value={fieldSize}
                  onChange={(e) => setFieldSize(e.target.value)}
                  min="0.1"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="soil">Soil Type</Label>
                <select 
                  id="soil"
                  className="w-full p-2 border rounded"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stage">Growth Stage</Label>
                <select 
                  id="stage"
                  className="w-full p-2 border rounded"
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value)}
                >
                  <option value="germination">Germination</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="maturity">Maturity</option>
                </select>
              </div>
            </div>
            
            <Button 
              onClick={calculateIrrigation}
              disabled={isCalculating}
              className="w-full"
            >
              {isCalculating ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Irrigation
                </>
              )}
            </Button>
            
            {recommendation && (
              <div className="mt-6 p-4 border rounded-lg bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Irrigation Recommendation</h3>
                  <Badge variant={getScheduleColor(recommendation.schedule) as any}>
                    {recommendation.schedule}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Droplets className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">{recommendation.amount}L</p>
                  </div>
                  
                  <div className="text-center">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-green-500" />
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="font-semibold">{recommendation.frequency}</p>
                  </div>
                  
                  <div className="text-center">
                    <Zap className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                    <p className="font-semibold">{recommendation.efficiency}%</p>
                  </div>
                  
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                    <p className="text-sm text-muted-foreground">Cost Saving</p>
                    <p className="font-semibold">₹{recommendation.costSaving}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Next irrigation: <span className="font-medium">{recommendation.nextIrrigation}</span>
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="weather" className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Location: {user?.location || "Chandigarh"}</span>
              <span>{weatherLoading ? "Updating weather..." : "Live weather feed"}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-xl font-bold">{weather.temperature}°C</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-xl font-bold">{weather.humidity}%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Cloud className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                  <p className="text-sm text-muted-foreground">Rainfall</p>
                  <p className="text-xl font-bold">{weather.rainfall}mm</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="h-6 w-6 mx-auto mb-2 text-green-500">🌪️</div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="text-xl font-bold">{weather.windSpeed} km/h</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  {(() => {
                    const { status, color, icon: Icon } = getMoistureStatus(weather.soilMoisture);
                    return (
                      <>
                        <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
                        <p className="text-sm text-muted-foreground">Soil Moisture</p>
                        <p className="text-xl font-bold">{weather.soilMoisture}%</p>
                        <p className={`text-xs ${color}`}>{status}</p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
            
            <Button onClick={updateWeatherData} variant="outline" className="w-full">
              Refresh Weather Data
            </Button>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Upcoming Irrigation Schedule</h3>
              
              {[
                { time: "Tomorrow 6:00 AM", crop: "Wheat Field A", amount: "1,200L", status: "scheduled" },
                { time: "Tomorrow 7:30 AM", crop: "Rice Field B", amount: "2,800L", status: "scheduled" },
                { time: "Day After 6:00 AM", crop: "Cotton Field C", amount: "950L", status: "pending" },
                { time: "In 3 days", crop: "Maize Field D", amount: "1,100L", status: "pending" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.crop}</p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.amount}</p>
                    <Badge variant={item.status === "scheduled" ? "default" : "outline"}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
