import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CloudRain,
  Thermometer,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const YieldPredictor = () => {
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [farmSize, setFarmSize] = useState("5");
  const [prediction, setPrediction] = useState<any | null>(null);
  const [forecast, setForecast] = useState<Array<{ month: string; price: number }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const { prediction: result } = await apiFetch<{ prediction: any }>("/api/ai/predict-yield", {
        method: "POST",
        body: JSON.stringify({
          cropType: selectedCrop,
          farmSize,
          soilQuality: "good",
          irrigation: "adequate",
          irrigationMethod: "tube-well",
          fertilizer: "optimal",
          fertilizerTiming: "correct",
          weather: { temperature: 28, humidity: 65, rainfall: 800 },
          pestPressure: "low",
        }),
      });
      setPrediction(result);
      const { forecast: forecastResult } = await apiFetch<{ forecast: { forecasts: Array<{ month: string; price: number }> } }>("/api/ai/forecast-price", {
        method: "POST",
        body: JSON.stringify({ commodity: selectedCrop, months: 6 }),
      });
      setForecast(forecastResult?.forecasts?.map((item) => ({ month: item.month, price: item.price })) || []);
    } catch (error) {
      console.error("Yield prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [selectedCrop, farmSize]);

  const yieldPerHectare = prediction?.yieldPerHectare ? prediction.yieldPerHectare / 100 : 0;
  const yieldProgression = useMemo(() => {
    const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    return months.map((month, index) => ({
      month,
      expected: Math.round(yieldPerHectare * (0.6 + index * 0.08)),
      actual: 0,
      weather: prediction?.factors?.weather?.score ? Math.round(prediction.factors.weather.score) : 80,
    }));
  }, [yieldPerHectare, prediction]);

  const historicalYield = useMemo(() => {
    const base = yieldPerHectare || 45;
    const multipliers = [0.85, 0.92, 0.96, 1.0, 1.04];
    return ["2020", "2021", "2022", "2023", "2024"].map((year, index) => ({
      year,
      wheat: Math.round(base * multipliers[index]),
      rice: Math.round(base * 1.4 * multipliers[index]),
      cotton: Math.round(base * 0.45 * multipliers[index]),
      mustard: Math.round(base * 0.4 * multipliers[index]),
    }));
  }, [yieldPerHectare]);

  const pricePerKg = forecast.length > 0
    ? Math.round(forecast.reduce((sum, item) => sum + item.price, 0) / forecast.length) / 100
    : 22;

  const profitAnalysis = useMemo(() => {
    const revenue = Math.round((prediction?.yieldPerHectare || 4000) * pricePerKg);
    const cost = Math.round(revenue * 0.55);
    return [
      { crop: selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1), cost, revenue, profit: revenue - cost },
      { crop: "Rice", cost: Math.round(cost * 1.2), revenue: Math.round(revenue * 1.15), profit: Math.round(revenue * 1.15) - Math.round(cost * 1.2) },
      { crop: "Cotton", cost: Math.round(cost * 1.05), revenue: Math.round(revenue * 1.4), profit: Math.round(revenue * 1.4) - Math.round(cost * 1.05) },
      { crop: "Mustard", cost: Math.round(cost * 0.7), revenue: Math.round(revenue * 0.9), profit: Math.round(revenue * 0.9) - Math.round(cost * 0.7) },
    ];
  }, [prediction, pricePerKg, selectedCrop]);

  const riskFactors = useMemo(() => {
    const weatherRisk = prediction?.factors?.weather?.score ? 100 - prediction.factors.weather.score : 25;
    const pestRisk = prediction?.factors?.pestManagement?.score ? 100 - prediction.factors.pestManagement.score : 20;
    const soilRisk = prediction?.factors?.soilQuality?.score ? 100 - prediction.factors.soilQuality.score : 20;
    const marketRisk = forecast.length === 0 ? 35 : Math.max(10, Math.round((forecast[forecast.length - 1]?.price || 0) / 100));
    return [
      { name: "Weather Risk", value: Math.round(weatherRisk), color: "#ef4444" },
      { name: "Market Risk", value: Math.round(marketRisk), color: "#f59e0b" },
      { name: "Disease Risk", value: Math.round(pestRisk), color: "#8b5cf6" },
      { name: "Resource Risk", value: Math.round(soilRisk), color: "#06b6d4" },
    ];
  }, [prediction, forecast]);

  const riskColor = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50'
  };

  return (
    <div className="space-y-6">
      {/* Yield Prediction Overview */}
       <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Yield</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {prediction ? `${yieldPerHectare.toFixed(1)} q/ha` : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              {prediction?.confidence ?? "--"}% confidence level
            </p>
            <Progress value={prediction?.confidence || 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
            {prediction?.riskLevel === 'low' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${riskColor[prediction?.riskLevel || 'medium']}`}>
              {prediction?.riskLevel || 'medium'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall production risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{profitAnalysis[0]?.profit?.toLocaleString("en-IN") || "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Net profit per hectare
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">
                {prediction?.comparisonToNational ? `${prediction.comparisonToNational} vs national avg` : "Benchmarking..."}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-4 md:grid-cols-3 py-4">
          <div className="space-y-2">
            <Label>Crop</Label>
            <select
              className="w-full p-2 border rounded"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="wheat">Wheat</option>
              <option value="rice">Rice</option>
              <option value="cotton">Cotton</option>
              <option value="maize">Maize</option>
              <option value="mustard">Mustard</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Farm Size (acres)</Label>
            <Input value={farmSize} onChange={(e) => setFarmSize(e.target.value)} type="number" min="1" />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchPrediction} disabled={loading} className="w-full">
              {loading ? "Updating..." : "Refresh Prediction"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prediction" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prediction">Yield Prediction</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="risks">Risk Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Yield Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Yield Contributing Factors</CardTitle>
                <CardDescription>
                  AI analysis of factors affecting your crop yield
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weather Conditions</span>
                    <span className="text-sm">{prediction?.factors?.weather?.score ?? 0}%</span>
                  </div>
                  <Progress value={prediction?.factors?.weather?.score || 0} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Soil Health</span>
                    <span className="text-sm">{prediction?.factors?.soilQuality?.score ?? 0}%</span>
                  </div>
                  <Progress value={prediction?.factors?.soilQuality?.score || 0} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Management Practices</span>
                    <span className="text-sm">{prediction?.factors?.irrigation?.score ?? 0}%</span>
                  </div>
                  <Progress value={prediction?.factors?.irrigation?.score || 0} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Seed Genetics</span>
                    <span className="text-sm">{prediction?.factors?.fertilizer?.score ?? 0}%</span>
                  </div>
                  <Progress value={prediction?.factors?.fertilizer?.score || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Progression */}
            <Card>
              <CardHeader>
                <CardTitle>Yield Progression Forecast</CardTitle>
                <CardDescription>
                  Expected yield development over crop season
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={yieldProgression}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="expected" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Actionable insights to maximize your yield potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(prediction?.recommendations || []).map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge className="mt-0.5">{index + 1}</Badge>
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Yield Trends</CardTitle>
              <CardDescription>
                5-year yield performance comparison across major crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalYield}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="wheat" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="rice" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="cotton" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="mustard" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crop Profitability Analysis</CardTitle>
              <CardDescription>
                Compare costs, revenue, and profit across different crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={profitAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="crop" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, '']} />
                  <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                  <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {profitAnalysis.map((crop, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{crop.crop}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Production Cost:</span>
                    <span className="font-medium text-red-600">₹{crop.cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Revenue:</span>
                    <span className="font-medium text-green-600">₹{crop.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Profit:</span>
                    <span className="text-primary">₹{crop.profit.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ROI: {((crop.profit / crop.cost) * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Analysis of various risk factors affecting crop production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskFactors}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {riskFactors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Strategies</CardTitle>
                <CardDescription>
                  Recommended actions to minimize production risks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-l-red-500 bg-red-50">
                    <h4 className="font-medium text-red-800">Weather Risk</h4>
                    <p className="text-sm text-red-700">Use crop insurance and weather-based advisories</p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-l-yellow-500 bg-yellow-50">
                    <h4 className="font-medium text-yellow-800">Market Risk</h4>
                    <p className="text-sm text-yellow-700">Contract farming and price forecasting</p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50">
                    <h4 className="font-medium text-purple-800">Disease Risk</h4>
                    <p className="text-sm text-purple-700">Regular monitoring and integrated pest management</p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-800">Resource Risk</h4>
                    <p className="text-sm text-blue-700">Efficient resource planning and backup arrangements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default YieldPredictor;
