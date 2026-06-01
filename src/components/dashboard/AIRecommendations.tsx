import { useState, useEffect } from "react";
import { Brain, Droplets, Bug, Zap, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
}

const typeIcons: Record<string, any> = {
  irrigation: Droplets,
  fertilizer: Zap,
  pest: Bug,
  planting: Calendar,
  alert: Droplets,
  warning: Bug
};

const typeColors: Record<string, string> = {
  irrigation: "text-blue-500",
  fertilizer: "text-amber-500",
  pest: "text-red-500",
  planting: "text-green-500",
  alert: "text-blue-500",
  warning: "text-orange-500"
};

const priorityColors: Record<string, any> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ai_recommendations')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No AI recommendations currently available.</p>
        ) : (
          recommendations.map((rec) => {
            const TypeIcon = typeIcons[rec.type] || Brain;
            const iconColor = typeColors[rec.type] || "text-primary";
            const badgeVariant = priorityColors[rec.priority] || "outline";
            
            return (
              <div key={rec.id} className="space-y-3 p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <TypeIcon className={`h-5 w-5 ${iconColor}`} />
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={badgeVariant as any}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button size="sm" variant={rec.priority === "high" ? "default" : "outline"} className="ml-auto">
                    Acknowledge
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};