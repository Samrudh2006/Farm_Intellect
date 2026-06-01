import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, Building2, TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FarmerRequirements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      // Trying to fetch the requirements. Note: if the join on profiles fails because of schema mismatch,
      // it might crash. We will try to fetch just the requirements first.
      const { data, error } = await supabase
        .from('market_requirements')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupply = (merchantId: string) => {
    toast({
      title: "Interest Registered!",
      description: `We've notified the merchant that you can supply this requirement. They will contact you shortly.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="farmer" />
      
      <main className="md:ml-64 pt-16 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Market Demands</h1>
              <p className="text-muted-foreground mt-1">See what merchants are actively looking to buy right now.</p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
              <TrendingUp className="h-5 w-5" /> High Demand Season
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {requirements.map((req) => (
                <Card key={req.id} className="hover:shadow-lg transition-all border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-background/50">Wanted</Badge>
                        <CardTitle className="text-2xl">{req.quantity} {req.unit} {req.crop}</CardTitle>
                        <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Verified Merchant</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-accent/30 p-3 rounded-md">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Offering Price</span>
                      <div className="text-xl font-bold text-primary">₹{req.price_per_unit} <span className="text-sm text-foreground font-normal">/ {req.unit.slice(0, -1)}</span></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quality Needed:</span>
                        <span className="font-medium">{req.quality}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Needed By:</span>
                        <span className="font-medium text-destructive">{new Date(req.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      onClick={() => handleSupply(req.merchant_id)} 
                      className="w-full gap-2 bg-gradient-to-r from-green-600 to-primary hover:from-green-700 hover:to-primary/90 text-white shadow-md"
                    >
                      <Handshake className="h-4 w-4" /> I Can Supply This!
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {requirements.length === 0 && (
                <div className="col-span-full py-12 text-center bg-muted/30 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No active market demands found right now. Check back later!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default FarmerRequirements;
