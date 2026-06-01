import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface MandiPrice {
  id: string;
  crop: string;
  market: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date?: string;
}

const MerchantMarketPrices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      // Direct database call instead of edge function
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const formattedPrices = data.map(row => ({
          id: row.id,
          crop: row.commodity,
          market: row.market,
          state: row.state,
          minPrice: row.min_price,
          maxPrice: row.max_price,
          modalPrice: row.modal_price,
          unit: "Quintal",
          date: row.date
        }));
        setPrices(formattedPrices);
      }
    } catch (e: any) {
      toast({ title: "Could not fetch prices", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} notificationCount={3} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user?.role || "merchant"} />

      <main className="md:ml-64 p-4 sm:p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-saffron-navy">📈 Market Price Analytics</h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1 sm:mt-2">Live mandi prices from the cloud database</p>
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-md border bg-primary/10 text-primary border-primary/30">
                Live Supabase Data
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPrices} disabled={loading} className="self-start sm:self-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Prices
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : prices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground space-y-3">
                <p>No market prices found in the database. Did you run the seed script?</p>
                <Button variant="outline" size="sm" onClick={fetchPrices}>Try again</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {prices.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.crop}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.market}, {item.state}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        ₹{item.modalPrice.toLocaleString("en-IN")}
                      </div>
                      <p className="text-xs text-muted-foreground">per {item.unit}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Min: ₹{item.minPrice.toLocaleString("en-IN")}</span>
                      <span className="text-muted-foreground">Max: ₹{item.maxPrice.toLocaleString("en-IN")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Market Insights */}
          <Card>
            <CardHeader><CardTitle>Market Insights</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <h4 className="font-medium text-primary mb-2">📈 Rising Trends</h4>
                  <p className="text-muted-foreground">
                    Onion prices showing strong upward momentum due to reduced supply from key growing regions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MerchantMarketPrices;
