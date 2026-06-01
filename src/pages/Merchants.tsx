import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchLiveMandiPrices, LiveMarketPrice } from "@/data/mandiPrices";
import {
  DollarSign,
  MapPin,
  Phone,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wheat,
  Mail,
  Calendar
} from "lucide-react";

interface MerchantProfile {
  user_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
}

const Merchants = () => {
  const { t } = useLanguage();
  const { user } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<LiveMarketPrice[]>([]);

  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "merchant");
      if (roles && roles.length > 0) {
        const merchantIds = roles.map(r => r.user_id);
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", merchantIds);
        setMerchants(profiles || []);
      }
      setLoading(false);
    };
    fetchMerchants();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      const state = user.location?.split(",")[1]?.trim() || "Punjab";
      const { prices: livePrices } = await fetchLiveMandiPrices(state);
      setPrices(livePrices || []);
    };
    fetchPrices();
  }, [user.location]);

  const filteredMerchants = merchants.filter(merchant =>
    merchant.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (merchant.location && merchant.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: user.name, role: user.role }}
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
          <div>
            <h2 className="text-3xl font-bold text-foreground">Merchants & Market</h2>
            <p className="text-muted-foreground">
              Connect with verified merchants and find the best live prices for your crops
            </p>
          </div>

          <Tabs defaultValue="merchants" className="space-y-6">
            <TabsList>
              <TabsTrigger value="merchants">Nearby Merchants</TabsTrigger>
              <TabsTrigger value="prices">Market Prices</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="merchants" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Input
                    placeholder="Search merchants by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </CardContent>
              </Card>

              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : filteredMerchants.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Store className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No merchants found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMerchants.map((merchant) => (
                    <Card key={merchant.user_id} className="hover:shadow-lg transition-shadow tricolor-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Store className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{merchant.display_name}</CardTitle>
                              <CardDescription>Verified Merchant</CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Verified</Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {merchant.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{merchant.location}</span>
                            </div>
                          )}
                          {merchant.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{merchant.phone}</span>
                            </div>
                          )}
                          {merchant.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{merchant.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Since {new Date(merchant.created_at).getFullYear()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          {merchant.phone ? (
                            <Button className="flex-1" size="sm" asChild>
                              <a href={`tel:${merchant.phone}`}>Contact</a>
                            </Button>
                          ) : (
                            <Button className="flex-1" size="sm" disabled>No Phone Provided</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prices" className="space-y-6">
              {prices.length === 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {prices.slice(0, 9).map((price, index) => (
                    <Card key={index} className="tricolor-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wheat className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{price.crop}</CardTitle>
                          </div>
                          <Badge variant="outline">{price.market.split(",")[0]}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-primary">
                            ₹{price.modalPrice}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {price.unit}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                            Min: ₹{price.minPrice} | Max: ₹{price.maxPrice}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    AI Market Recommendations (Beta)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {prices.length > 0 ? prices.slice(0, 3).map((p, i) => (
                      <div key={i} className="p-4 rounded-lg border border-green-200 bg-green-50">
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">Best Selling Opportunity: {p.crop}</h4>
                            <p className="text-sm text-green-700">
                              Based on live market data, the price for {p.crop} in {p.market} is currently strong at ₹{p.modalPrice}/{p.unit.replace("per ", "")}. 
                              Consider selling soon to maximize profit.
                            </p>
                            <Button size="sm" className="mt-3">View Market Trend</Button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground text-center py-6">
                        Loading AI recommendations based on live market data...
                      </div>
                    )}

                    <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-purple-800">Cooperative Selling</h4>
                          <p className="text-sm text-purple-700">
                            Our AI detected {merchants.length} active verified merchants in your broader region. Connect with other farmers in the community forum to consolidate transport!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Merchants;