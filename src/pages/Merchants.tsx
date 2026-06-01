import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMerchants } from "@/hooks/useMerchants";
import {
  DollarSign,
  MapPin,
  Phone,
  Star,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wheat
} from "lucide-react";

const Merchants = () => {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { merchants, loading, error } = useMerchants();

  const user = {
    name: "John Farmer",
    role: "farmer",
  };

  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-foreground">Merchants & Market</h2>
            <p className="text-muted-foreground">
              Connect with merchants and find the best prices for your crops
            </p>
          </div>

          <Tabs defaultValue="merchants" className="space-y-6">
            <TabsList>
              <TabsTrigger value="merchants">Nearby Merchants</TabsTrigger>
              <TabsTrigger value="prices">Market Prices</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="merchants" className="space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="p-6">
                  <Input
                    placeholder="Search merchants by name or crop specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                  <p className="text-muted-foreground mt-4">Loading merchants...</p>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
                  Error loading merchants: {error}
                </div>
              )}

              {/* Merchants List */}
              {!loading && !error && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMerchants.map((merchant) => (
                    <Card key={merchant.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Store className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{merchant.name}</CardTitle>
                              <CardDescription>{merchant.category}</CardDescription>
                            </div>
                          </div>
                          {merchant.verified && (
                            <Badge className="bg-green-100 text-green-700">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{merchant.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{merchant.rating} Rating ({merchant.reviews_count} reviews)</span>
                          </div>

                          {merchant.contact_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{merchant.contact_phone}</span>
                            </div>
                          )}
                        </div>

                        {merchant.description && (
                          <div>
                            <p className="text-sm text-muted-foreground">{merchant.description}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1" size="sm">
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            </TabsContent>

            <TabsContent value="prices" className="space-y-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Market prices data coming soon</p>
              </div>
              {/* Removed: mockCropDemands was undefined. Use useMarketPrices hook instead
              <div className="grid gap-6 md:grid-cols-2">
                {/* Data removed */}
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wheat className="h-6 w-6 text-primary" />
                          <div>
                            <CardTitle>{demand.crop}</CardTitle>
                            <CardDescription>{demand.merchants} merchants interested</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            ₹{demand.avgPrice}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <span>{trendIcons[demand.trend]}</span>
                            <span>{demand.trend}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{demand.recommendation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    AI Market Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800">Best Selling Opportunity</h4>
                          <p className="text-sm text-green-700">
                            Sell your wheat to <strong>Raj Agro Trading</strong> within 5km. 
                            They're offering ₹2,150/quintal (8% above market rate) and need 50 quintals.
                          </p>
                          <Button size="sm" className="mt-2">Get Connected</Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Transport Savings</h4>
                          <p className="text-sm text-blue-700">
                            Combine shipment with 3 nearby farmers to Green Valley Foods. 
                            Save ₹200/quintal in transportation costs.
                          </p>
                          <Button size="sm" variant="outline" className="mt-2">Join Group</Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-purple-800">Bulk Opportunity</h4>
                          <p className="text-sm text-purple-700">
                            Form a cooperative with 5 other cotton farmers. 
                            Maharashtra Cotton Corp is offering bulk purchase bonus of ₹300/quintal.
                          </p>
                          <Button size="sm" variant="outline" className="mt-2">Create Group</Button>
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
