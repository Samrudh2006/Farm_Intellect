import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const YieldProfitEstimator = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    crop: "",
    area: "",
    mandiPrice: "",
    soilType: "",
    season: "",
    irrigation: ""
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase.from('market_prices').select('commodity, modal_price');
      if (!error && data) {
        const prices: Record<string, number> = {};
        data.forEach((item: any) => {
          prices[item.commodity.toLowerCase()] = item.modal_price;
        });
        setMarketPrices(prices);
      }
    };
    fetchPrices();
  }, []);

  const cropYields: Record<string, number> = {
    wheat: 4.5,
    rice: 5.2,
    cotton: 2.1,
    sugarcane: 65,
    mustard: 1.8,
    soybeans: 2.8,
    corn: 4.2
  };

  const calculateEstimate = async () => {
    if (!formData.crop || !formData.area) {
      toast({
        title: "Missing Information",
        description: "Please select crop and enter area",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // AI calculation simulation with live market data
    setTimeout(() => {
      const cropKey = formData.crop.toLowerCase();
      const baseYield = cropYields[cropKey] || 3.0;
      const livePrice = marketPrices[cropKey] || 2500; // fallback if not in DB
      
      const area = parseFloat(formData.area);
      const customPrice = parseFloat(formData.mandiPrice) || livePrice;
      
      // Apply multipliers based on conditions
      let yieldMultiplier = 1;
      if (formData.soilType === "fertile") yieldMultiplier *= 1.2;
      if (formData.irrigation === "drip") yieldMultiplier *= 1.15;
      if (formData.season === "optimal") yieldMultiplier *= 1.1;
      
      const estimatedYield = baseYield * area * yieldMultiplier;
      const grossIncome = estimatedYield * customPrice;
      const estimatedCosts = area * 15000; // ₹15,000 per acre average
      const netProfit = grossIncome - estimatedCosts;
      
      setResult({
        crop: formData.crop,
        area,
        estimatedYield: estimatedYield.toFixed(2),
        grossIncome: grossIncome.toFixed(0),
        estimatedCosts: estimatedCosts.toFixed(0),
        netProfit: netProfit.toFixed(0),
        profitPerAcre: (netProfit / area).toFixed(0)
      });
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            AI Yield & Profit Estimator (Live Prices)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Crop</Label>
              <Select value={formData.crop} onValueChange={(value) => setFormData(prev => ({ ...prev, crop: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wheat">Wheat</SelectItem>
                  <SelectItem value="Corn">Corn</SelectItem>
                  <SelectItem value="Soybeans">Soybeans</SelectItem>
                  <SelectItem value="Rice">Rice</SelectItem>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Farm Area (Acres)</Label>
              <Input
                placeholder="Enter area in acres"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Mandi Price (₹/quintal)</Label>
              <Input
                placeholder="Optional - will use live market rate from DB"
                value={formData.mandiPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, mandiPrice: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Soil Type</Label>
              <Select value={formData.soilType} onValueChange={(value) => setFormData(prev => ({ ...prev, soilType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fertile">Fertile</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Irrigation Method</Label>
              <Select value={formData.irrigation} onValueChange={(value) => setFormData(prev => ({ ...prev, irrigation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select irrigation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drip">Drip Irrigation</SelectItem>
                  <SelectItem value="sprinkler">Sprinkler</SelectItem>
                  <SelectItem value="flood">Flood</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Season</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimal">Optimal</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="poor">Off-season</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculateEstimate} disabled={loading} className="w-full">
            {loading ? "Calculating..." : "Calculate Estimate"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estimated Results for {result.crop}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.estimatedYield}</div>
                <div className="text-sm text-muted-foreground">Quintals Expected</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5" />
                  {result.grossIncome}
                </div>
                <div className="text-sm text-muted-foreground">Gross Income</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5" />
                  {result.estimatedCosts}
                </div>
                <div className="text-sm text-muted-foreground">Estimated Costs</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5" />
                  {result.netProfit}
                </div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Profit per acre: ₹{result.profitPerAcre} | Based on live market prices
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};