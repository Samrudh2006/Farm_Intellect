import { useCallback, useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { reportError } from "@/lib/error-handling";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface PricePoint {
  date: string;
  modalPrice: number;
  market: string;
}

interface Analysis {
  crop: string;
  currentPrice: number;
  meanPrice: number;
  change: number;
  recommendation: "BUY" | "SELL" | "HOLD";
  optimalSellMarket: string;
  source: string;
}

const CROP_OPTIONS = [
  { value: "Wheat", label: "Wheat" },
  { value: "Rice", label: "Rice" },
  { value: "Cotton", label: "Cotton" },
  { value: "Maize", label: "Maize" },
  { value: "Soybean", label: "Soybean" },
  { value: "Onion", label: "Onion" },
  { value: "Tomato", label: "Tomato" },
];

async function fetchPricesWithRetry(state?: string, attempts = 3): Promise<{ prices: any[]; source: string }> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const { data, error } = await supabase.functions.invoke("market-prices", { body: { state } });
      if (error) throw error;
      return { prices: data?.prices ?? [], source: data?.source ?? "unknown" };
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

export const MarketPricePredictor = () => {
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [allPrices, setAllPrices] = useState<any[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { prices, source } = await fetchPricesWithRetry();
      setAllPrices(prices);
      setSource(source);
    } catch (e) {
      reportError("MarketPricePredictor", e);
      setErrorMsg("Could not reach the market price service. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cropPrices = useMemo<PricePoint[]>(() => {
    return allPrices
      .filter((p: any) =>
        (p.crop || "").toLowerCase().includes(selectedCrop.toLowerCase()),
      )
      .map((p: any) => ({
        date: p.date || new Date().toISOString().split("T")[0],
        modalPrice: Number(p.modalPrice) || 0,
        market: p.market || "—",
      }));
  }, [allPrices, selectedCrop]);

  const analysis: Analysis | null = useMemo(() => {
    if (cropPrices.length === 0) return null;
    const prices = cropPrices.map((p) => p.modalPrice);
    const current = prices[0];
    const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
    const change = ((mean - current) / current) * 100;
    let rec: Analysis["recommendation"] = "HOLD";
    if (change > 5) rec = "SELL";
    else if (change < -5) rec = "BUY";
    const best = cropPrices.reduce((m, p) => (p.modalPrice > m.modalPrice ? p : m));
    return {
      crop: selectedCrop,
      currentPrice: Math.round(current),
      meanPrice: Math.round(mean),
      change: Math.round(change * 100) / 100,
      recommendation: rec,
      optimalSellMarket: best.market,
      source,
    };
  }, [cropPrices, selectedCrop, source]);

  const getRecBadge = (rec: string) => {
    switch (rec) {
      case "BUY": return "bg-green-100 text-green-700 border-green-200";
      case "SELL": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Market Prices — Live
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real mandi prices from data.gov.in (with AI fallback). Source: <span className="font-medium">{source || "—"}</span>
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prices">Prices</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Crop</label>
                <select
                  className="p-2 border rounded bg-background"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <Button onClick={load} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded border border-destructive/30 bg-destructive/5 flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}

            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : cropPrices.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No price data available for {selectedCrop} right now. Try another crop or refresh.
              </div>
            ) : (
              <>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cropPrices}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="market" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="modalPrice"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="₹ / quintal"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {analysis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm text-muted-foreground">Latest Price</p>
                        <p className="text-lg font-bold">₹{analysis.currentPrice.toLocaleString("en-IN")}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-5 w-5 mx-auto mb-2 text-green-500" />
                        <p className="text-sm text-muted-foreground">Mean Price</p>
                        <p className="text-lg font-bold">₹{analysis.meanPrice.toLocaleString("en-IN")}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        {analysis.change >= 0 ? (
                          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 mx-auto mb-2 text-red-500" />
                        )}
                        <p className="text-sm text-muted-foreground">Vs Latest</p>
                        <p className={`text-lg font-bold ${analysis.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {analysis.change >= 0 ? "+" : ""}{analysis.change}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                        <p className="text-sm text-muted-foreground">Recommendation</p>
                        <Badge className={getRecBadge(analysis.recommendation)}>{analysis.recommendation}</Badge>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {!analysis ? (
              <p className="text-sm text-muted-foreground text-center py-8">No analysis available.</p>
            ) : (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{analysis.crop}</h3>
                    <Badge className={getRecBadge(analysis.recommendation)}>{analysis.recommendation}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Latest market price</p>
                      <p className="text-2xl font-bold">₹{analysis.currentPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Best mandi today</p>
                      <p className="text-lg font-semibold">{analysis.optimalSellMarket}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mean across markets</p>
                      <p className="text-lg font-semibold">₹{analysis.meanPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data source</p>
                      <p className="text-lg font-semibold capitalize">{analysis.source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
