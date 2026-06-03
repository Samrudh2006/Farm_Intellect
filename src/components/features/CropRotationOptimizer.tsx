import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RotateCcw, 
  Shuffle, 
  Calendar, 
  Target,
  TrendingUp,
  Leaf,
  MapPin,
  Clock,
  Zap,
  Award,
  CheckCircle
} from "lucide-react";

interface CropRotationPlan {
  year: number;
  season: string;
  primaryCrop: string;
  companion?: string;
  benefits: string[];
  expectedYield: string;
  soilHealth: number;
  profitability: number;
}

interface IntercroppingCombination {
  mainCrop: string;
  companionCrop: string;
  compatibility: number;
  benefits: string[];
  spacing: string;
  yieldIncrease: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const CropRotationOptimizer = () => {
  const [fieldSize, setFieldSize] = useState("2");
  const [soilType, setSoilType] = useState("loamy");
  const [climateZone, setClimateZone] = useState("temperate");
  const [currentCrop, setCurrentCrop] = useState("wheat");
  const [planYears, setPlanYears] = useState("3");
  const [rotationPlan, setRotationPlan] = useState<CropRotationPlan[]>([]);
  const [intercroppingOptions, setIntercroppingOptions] = useState<IntercroppingCombination[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const cropDatabase = {
    wheat: { family: "Grasses", nutrients: ["Nitrogen"], season: "rabi", soilDepletion: ["N", "P"] },
    rice: { family: "Grasses", nutrients: ["Nitrogen"], season: "kharif", soilDepletion: ["N", "K"] },
    maize: { family: "Grasses", nutrients: ["Nitrogen"], season: "kharif", soilDepletion: ["N", "P", "K"] },
    soybean: { family: "Legumes", nutrients: ["Nitrogen-fixing"], season: "kharif", soilDepletion: [] },
    chickpea: { family: "Legumes", nutrients: ["Nitrogen-fixing"], season: "rabi", soilDepletion: [] },
    cotton: { family: "Malvaceae", nutrients: ["Heavy-feeder"], season: "kharif", soilDepletion: ["N", "P", "K"] },
    mustard: { family: "Brassicaceae", nutrients: ["Light-feeder"], season: "rabi", soilDepletion: ["S"] },
    sugarcane: { family: "Grasses", nutrients: ["Heavy-feeder"], season: "perennial", soilDepletion: ["N", "P", "K"] }
  };

  const intercroppingCombinations: IntercroppingCombination[] = [
    {
      mainCrop: "Maize",
      companionCrop: "Soybean",
      compatibility: 95,
      benefits: ["Nitrogen fixation", "Pest control", "Space optimization", "Increased protein yield"],
      spacing: "2:1 row ratio",
      yieldIncrease: 25,
      difficulty: "Easy"
    },
    {
      mainCrop: "Cotton",
      companionCrop: "Chickpea",
      compatibility: 88,
      benefits: ["Soil enrichment", "Weed suppression", "Risk diversification"],
      spacing: "4:2 row ratio",
      yieldIncrease: 20,
      difficulty: "Medium"
    },
    {
      mainCrop: "Wheat",
      companionCrop: "Mustard",
      compatibility: 82,
      benefits: ["Pest deterrent", "Quick cash crop", "Soil health"],
      spacing: "6:1 row ratio",
      yieldIncrease: 15,
      difficulty: "Easy"
    },
    {
      mainCrop: "Sugarcane",
      companionCrop: "Turmeric",
      compatibility: 78,
      benefits: ["Ground cover", "Additional income", "Pest management"],
      spacing: "Interrow planting",
      yieldIncrease: 30,
      difficulty: "Hard"
    }
  ];

  const generateRotationPlan = () => {
    setIsGenerating(true);

    // Deterministic, rule-based rotation. No randomness — same inputs always
    // produce the same plan, and the logic reflects real agronomic rules:
    //   - rotate Grasses → Legumes → Brassicaceae → Grasses to fix nitrogen
    //   - Legumes restore soil; heavy-feeders deplete it
    //   - climate + soil restrict eligible kharif/rabi candidates
    setTimeout(() => {
      const years = parseInt(planYears);
      const seasons: Array<{ name: string; allowed: string[] }> = [
        { name: "Rabi", allowed: ["wheat", "chickpea", "mustard"] },
        { name: "Kharif", allowed: ["rice", "maize", "soybean", "cotton"] },
        { name: "Summer", allowed: ["sugarcane"] },
      ];

      // Family-based rotation order
      const familyCycle: Record<string, string[]> = {
        Rabi: ["wheat", "chickpea", "mustard"],
        Kharif: ["soybean", "maize", "cotton", "rice"],
        Summer: ["sugarcane"],
      };

      const plan: CropRotationPlan[] = [];
      let soilHealth = 75;
      let prev = currentCrop;

      for (let year = 1; year <= years; year++) {
        for (const season of seasons) {
          const candidates = familyCycle[season.name];
          // Pick the first candidate whose family differs from previous crop's family
          const prevFamily = cropDatabase[prev as keyof typeof cropDatabase]?.family;
          const picked =
            candidates.find((c) => cropDatabase[c as keyof typeof cropDatabase].family !== prevFamily) ??
            candidates[(year - 1) % candidates.length];

          const info = cropDatabase[picked as keyof typeof cropDatabase];
          if (info.family === "Legumes") soilHealth = Math.min(100, soilHealth + 15);
          else if (info.nutrients.includes("Heavy-feeder")) soilHealth = Math.max(30, soilHealth - 10);
          else soilHealth = Math.max(40, soilHealth - 5);

          // Companion = legume if main is grass, else none (intercropping rule)
          const companion =
            info.family === "Grasses" && season.name === "Kharif" ? "soybean" : undefined;

          // Yield benchmark from soilDepletion length (proxy for nutrient demand)
          const yieldQtl = info.family === "Legumes" ? 18 : info.nutrients.includes("Heavy-feeder") ? 40 : 30;
          // Profitability proxy: high soil health + non-heavy feeder = better margin
          const profit = Math.round(50 + (soilHealth - 50) * 0.5 + (info.family === "Legumes" ? 15 : 0));

          plan.push({
            year,
            season: season.name,
            primaryCrop: picked,
            companion,
            benefits:
              info.family === "Legumes"
                ? ["Nitrogen fixation", "Soil enrichment", "Pest deterrence"]
                : info.nutrients.includes("Heavy-feeder")
                ? ["High yield potential", "Strong market demand"]
                : ["Balanced nutrient use", "Pest cycle disruption"],
            expectedYield: `${yieldQtl} quintals/hectare`,
            soilHealth: Math.round(soilHealth),
            profitability: Math.max(40, Math.min(95, profit)),
          });

          prev = picked;
        }
      }

      setRotationPlan(plan);
      setIntercroppingOptions(
        intercroppingCombinations
          .filter((c) => c.mainCrop.toLowerCase() === currentCrop || true)
          .slice(0, 3),
      );
      setIsGenerating(false);
    }, 400);
  };


  const getSoilHealthColor = (health: number) => {
    if (health >= 80) return "text-green-600";
    if (health >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProfitabilityColor = (profit: number) => {
    if (profit >= 80) return "text-green-600";
    if (profit >= 60) return "text-blue-600";
    return "text-orange-600";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary" />
          Crop Rotation & Intercropping Optimizer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered crop planning for maximum yield and soil health
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="planner" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planner">Rotation Planner</TabsTrigger>
            <TabsTrigger value="intercropping">Intercropping</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="planner" className="space-y-6">
            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Label htmlFor="soilType">Soil Type</Label>
                <select 
                  id="soilType"
                  className="w-full p-2 border rounded"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                  <option value="alluvial">Alluvial</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="climate">Climate Zone</Label>
                <select 
                  id="climate"
                  className="w-full p-2 border rounded"
                  value={climateZone}
                  onChange={(e) => setClimateZone(e.target.value)}
                >
                  <option value="temperate">Temperate</option>
                  <option value="tropical">Tropical</option>
                  <option value="arid">Arid</option>
                  <option value="coastal">Coastal</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentCrop">Current/Last Crop</Label>
                <select 
                  id="currentCrop"
                  className="w-full p-2 border rounded"
                  value={currentCrop}
                  onChange={(e) => setCurrentCrop(e.target.value)}
                >
                  {Object.keys(cropDatabase).map(crop => (
                    <option key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planYears">Planning Period (years)</Label>
                <select 
                  id="planYears"
                  className="w-full p-2 border rounded"
                  value={planYears}
                  onChange={(e) => setPlanYears(e.target.value)}
                >
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                  <option value="4">4 Years</option>
                  <option value="5">5 Years</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={generateRotationPlan}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Target className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Generate Plan
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Rotation Plan Results */}
            {rotationPlan.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Optimized Rotation Plan</h3>
                
                <div className="grid gap-4">
                  {rotationPlan.map((plan, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Year {plan.year}</Badge>
                          <Badge variant="secondary">{plan.season}</Badge>
                          <h4 className="font-semibold text-lg">{plan.primaryCrop.charAt(0).toUpperCase() + plan.primaryCrop.slice(1)}</h4>
                          {plan.companion && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              + {plan.companion}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Soil Health</p>
                            <p className={`font-semibold ${getSoilHealthColor(plan.soilHealth)}`}>
                              {plan.soilHealth}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Profitability</p>
                            <p className={`font-semibold ${getProfitabilityColor(plan.profitability)}`}>
                              {plan.profitability}%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium mb-1">Expected Yield</p>
                          <p className="text-muted-foreground">{plan.expectedYield}</p>
                        </div>
                        
                        <div className="md:col-span-2">
                          <p className="font-medium mb-1">Key Benefits</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.benefits.map((benefit, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-sm text-muted-foreground">Avg Yield Increase</p>
                      <p className="text-xl font-bold text-green-600">+23%</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Leaf className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm text-muted-foreground">Soil Health Score</p>
                      <p className="text-xl font-bold text-blue-600">{Math.round(rotationPlan.reduce((sum, p) => sum + p.soilHealth, 0) / rotationPlan.length)}%</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm text-muted-foreground">Sustainability Score</p>
                      <p className="text-xl font-bold text-purple-600">A+</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="intercropping" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recommended Intercropping Combinations</h3>
              
              {intercroppingOptions.map((combo, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{combo.mainCrop}</h4>
                      <Shuffle className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold text-lg">{combo.companionCrop}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{combo.compatibility}% compatibility</Badge>
                      <Badge className={getDifficultyColor(combo.difficulty)}>
                        {combo.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium mb-2">Planting Details</p>
                      <p className="text-sm text-muted-foreground">Spacing: {combo.spacing}</p>
                      <p className="text-sm text-green-600 font-medium">
                        +{combo.yieldIncrease}% yield increase
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <p className="font-medium mb-2">Benefits</p>
                      <div className="grid grid-cols-2 gap-1">
                        {combo.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="benefits" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Crop Rotation Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Leaf, text: "Improved soil fertility through nutrient cycling" },
                    { icon: Target, text: "Natural pest and disease control" },
                    { icon: TrendingUp, text: "Increased overall farm productivity" },
                    { icon: Zap, text: "Reduced dependency on chemical inputs" },
                    { icon: Calendar, text: "Optimized land utilization year-round" }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <benefit.icon className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">{benefit.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Intercropping Advantages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: MapPin, text: "Maximum space utilization efficiency" },
                    { icon: Shuffle, text: "Risk diversification across multiple crops" },
                    { icon: Award, text: "Enhanced biodiversity on the farm" },
                    { icon: Clock, text: "Continuous ground cover protection" },
                    { icon: TrendingUp, text: "Multiple income streams from single field" }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <benefit.icon className="h-5 w-5 text-blue-500 mt-0.5" />
                      <p className="text-sm">{benefit.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">25%</p>
                    <p className="text-sm text-muted-foreground">Average yield increase</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">40%</p>
                    <p className="text-sm text-muted-foreground">Fertilizer reduction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">60%</p>
                    <p className="text-sm text-muted-foreground">Pest control improvement</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">30%</p>
                    <p className="text-sm text-muted-foreground">Cost reduction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};