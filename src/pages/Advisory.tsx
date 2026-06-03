import { useState, useEffect } from "react";
import { ExpertConsultationWorkflow } from "@/components/features/ExpertConsultationWorkflow";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Calendar, 
  TrendingUp,
  Wheat,
  Droplets,
  Bug,
  Zap,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { cropRecommendationsMetadata } from "@/data/cropRecommendations";
import { pestDataMetadata } from "@/data/pestData";
import { soilHealthMetadata } from "@/data/soilHealth";

interface AdvisoryItem {
  id: string;
  title: string;
  type: string;
  priority: string;
  description: string;
  created_at: string;
}

const typeIcons: Record<string, any> = {
  irrigation: Droplets,
  fertilizer: Zap,
  pest: Bug,
  harvest: Wheat,
  planting: Calendar,
  alert: AlertTriangle,
  warning: Bug
};

import { AlertTriangle } from "lucide-react";

const typeColors: Record<string, string> = {
  irrigation: "text-blue-500",
  fertilizer: "text-amber-500", 
  pest: "text-red-500",
  harvest: "text-green-500",
  planting: "text-emerald-500",
  alert: "text-red-500",
  warning: "text-orange-500"
};

const priorityColors: Record<string, any> = {
  high: "destructive",
  medium: "secondary", 
  low: "outline",
};

const Advisory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const { user } = useCurrentUser();
  const [advisoryItems, setAdvisoryItems] = useState<AdvisoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisory();
  }, []);

  const fetchAdvisory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAdvisoryItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const advisorySources = [
    { label: "Crop recommendations", meta: cropRecommendationsMetadata },
    { label: "Pest intelligence", meta: pestDataMetadata },
    { label: "Soil health baselines", meta: soilHealthMetadata },
  ];

  const formatUpdatedAt = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: user.name, role: "farmer" }}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}

      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="farmer"
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Advisory Center</h2>
              <p className="text-muted-foreground">
                Live AI-powered recommendations from Supabase
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Insights</span>
            </div>
          </div>

          <ExpertConsultationWorkflow />

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Advisory data freshness</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">Verified sources</Badge>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-3">
              {advisorySources.map(({ label, meta }) => (
                <div key={label} className="rounded-md border border-border bg-background p-3 text-sm">
                  <div className="font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">Updated {formatUpdatedAt(meta.lastUpdated)}</div>
                  <div className="text-xs text-muted-foreground">Version {meta.version}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : advisoryItems.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No advisory items found</h3>
                <p className="text-muted-foreground">Recommendations will appear here.</p>
              </div>
            ) : (
              advisoryItems.map((advisory) => {
                const TypeIcon = typeIcons[advisory.type] || Brain;
                const iconColor = typeColors[advisory.type] || "text-primary";
                
                return (
                  <Card key={advisory.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <TypeIcon className={`h-6 w-6 ${iconColor}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{advisory.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" /> AI
                              </Badge>
                            </div>
                            <CardDescription>Generated Recommendation</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={priorityColors[advisory.priority] as any || "outline"}>
                            {advisory.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Analysis & Recommendation</h4>
                        <p className="text-sm text-muted-foreground">{advisory.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(advisory.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            95% confidence
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Clock className="h-4 w-4 mr-1" /> Schedule
                          </Button>
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" /> Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Advisory;
