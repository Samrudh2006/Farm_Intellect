import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MerchantRequirements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchRequirements();
  }, [user]);

  const fetchRequirements = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('market_requirements')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = async () => {
    if (!user) return;
    const newReq = {
      merchant_id: user.id,
      crop: "Wheat",
      quantity: 50,
      unit: "tons",
      price_per_unit: 2200,
      quality: "Organic, Grade A",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
      status: "open"
    };

    const { error } = await supabase.from('market_requirements').insert(newReq);
    if (!error) {
      toast({ title: "Requirement Posted", description: "Farmers can now see your request." });
      fetchRequirements();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="merchant" />
      
      <main className="md:ml-64 pt-16 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Buying Requirements</h1>
              <p className="text-muted-foreground mt-1">Post what crops you need to buy and let farmers come to you.</p>
            </div>
            <Button onClick={handleCreateRequirement} className="gap-2">
              <Plus className="h-4 w-4" /> Post New Requirement
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requirements.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{req.quantity} {req.unit} {req.crop}</CardTitle>
                        <CardDescription className="mt-1 font-medium text-primary">₹{req.price_per_unit} / {req.unit.slice(0, -1)}</CardDescription>
                      </div>
                      <Badge variant={req.status === "open" ? "default" : "secondary"} className="capitalize">
                        {req.status === "open" ? <Clock className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {req.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground block">Required Quality:</span>
                      <span className="font-medium">{req.quality}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground block">Deadline:</span>
                      <span className="font-medium">{new Date(req.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="pt-3 border-t flex gap-2">
                      <Button variant="outline" className="flex-1" disabled={req.status !== "open"}>
                        {req.status === "open" ? "View Interested Farmers" : "Requirement Met"}
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => {
                        supabase.from('market_requirements').delete().eq('id', req.id).then(() => fetchRequirements());
                      }}>
                        X
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {requirements.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  You haven't posted any requirements yet. Click the button above to create one.
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default MerchantRequirements;
