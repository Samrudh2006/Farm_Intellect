import { Wheat, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { LottieAnimation, LOTTIE_URLS } from "@/components/ui/lottie-animation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CropStatus {
  name: string;
  stage: string;
  health: number;
  daysToHarvest?: number;
  status: "healthy" | "warning" | "critical";
  area: string;
}

const mockCrops: CropStatus[] = [
  {
    name: "Winter Wheat",
    stage: "Flowering",
    health: 85,
    daysToHarvest: 45,
    status: "healthy",
    area: "Field A - 12 hectares"
  },
  {
    name: "Corn",
    stage: "Vegetative",
    health: 92,
    daysToHarvest: 78,
    status: "healthy",
    area: "Field B - 8 hectares"
  },
  {
    name: "Soybeans",
    stage: "Germination", 
    health: 67,
    status: "warning",
    area: "Field C - 6 hectares"
  }
];

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 -ml-1">
            <LottieAnimation url={LOTTIE_URLS.scanning} />
          </div>
          Crop Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockCrops.map((crop, index) => {
          const StatusIcon = statusIcons[crop.status];
          
          return (
            <div key={index} className="space-y-2 p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{crop.name}</h4>
                  <p className="text-sm text-muted-foreground">{crop.area}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${statusColors[crop.status]}`} />
                  <Badge variant={crop.status === "healthy" ? "default" : crop.status === "warning" ? "secondary" : "destructive"}>
                    {crop.stage}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Health Score</span>
                  <span className="font-medium">{crop.health}%</span>
                </div>
                <Progress value={crop.health} className="h-2" />
              </div>
              
              {crop.daysToHarvest && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{crop.daysToHarvest} days to harvest</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};