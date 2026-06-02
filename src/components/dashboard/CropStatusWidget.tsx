import { useState, useEffect } from "react";
import { Wheat, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface CropStatus {
  name: string;
  stage: string;
  health: number;
  daysToHarvest?: number;
  status: "healthy" | "warning" | "critical";
  area: string;
}

const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

const statusColors = {
  healthy: "text-primary",
  warning: "text-harvest",
  critical: "text-destructive",
};

export const CropStatusWidget = () => {
  const [crops, setCrops] = useState<CropStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('crop_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: CropStatus[] = data.map((plan: any) => {
          const harvestDate = plan.expected_harvest ? new Date(plan.expected_harvest) : null;
          const days = harvestDate
            ? Math.max(0, Math.round((harvestDate.getTime() - Date.now()) / 86400000))
            : undefined;
          const statusLabel = (plan.status || 'planned') as string;
          const uiStatus: CropStatus['status'] =
            statusLabel === 'harvested' || statusLabel === 'active' || statusLabel === 'planned'
              ? 'healthy'
              : statusLabel === 'at_risk'
                ? 'warning'
                : 'healthy';
          return {
            name: plan.crop_name,
            stage: statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1),
            health: 0,
            daysToHarvest: days,
            status: uiStatus,
            area: plan.area_acres ? `${plan.area_acres} acres` : plan.season,
          };
        });
        setCrops(mapped);
      }
      setLoading(false);
    };

    fetchCrops();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wheat className="h-5 w-5 text-primary" />
          Crop Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : crops.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground text-sm">No crops mapped yet. Add fields in the Field Map tab.</div>
        ) : (
          crops.map((crop, index) => {
            const StatusIcon = statusIcons[crop.status] || CheckCircle;
            
            return (
              <div key={index} className="space-y-2 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{crop.name}</h4>
                    <p className="text-sm text-muted-foreground">{crop.area}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusColors[crop.status] || "text-primary"}`} />
                    <Badge variant={crop.status === "healthy" ? "default" : crop.status === "warning" ? "secondary" : "destructive"}>
                      {crop.stage}
                    </Badge>
                  </div>
                </div>
                


                
                {crop.daysToHarvest && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{crop.daysToHarvest} days to harvest</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};