import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Beaker,
  Droplets,
  Leaf,
  Zap,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { SoilHealthCard as SoilHealthCardType } from "@/types/soil";
import { calculateSoilHealthScore } from "@/lib/soilData";
import { format } from "date-fns";

interface Props {
  soilCard: SoilHealthCardType;
  cropName?: string;
  compact?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "deficient":
      return "text-red-600 bg-red-50";
    case "optimum":
      return "text-green-600 bg-green-50";
    case "excessive":
      return "text-orange-600 bg-orange-50";
    case "poor":
      return "text-red-600 bg-red-50";
    case "moderate":
      return "text-yellow-600 bg-yellow-50";
    case "good":
      return "text-green-600 bg-green-50";
    case "excellent":
      return "text-emerald-600 bg-emerald-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

const getProgressColor = (status: string) => {
  switch (status) {
    case "deficient":
    case "poor":
      return "bg-red-500";
    case "excessive":
      return "bg-orange-500";
    case "moderate":
      return "bg-yellow-500";
    case "optimum":
    case "good":
      return "bg-green-500";
    case "excellent":
      return "bg-emerald-500";
    default:
      return "bg-gray-500";
  }
};

export const SoilHealthCardComponent: React.FC<Props> = ({
  soilCard,
  cropName,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const score = calculateSoilHealthScore(soilCard.parameters, cropName);

  const parameters = soilCard.parameters;
  const days = Math.floor(
    (soilCard.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="w-full">
      <CardHeader className="cursor-pointer pb-3" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-green-600" />
              {soilCard.fieldName} - Soil Health
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Tested: {format(soilCard.testDate, "MMM d, yyyy")} | Expires in {days} days
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={getStatusColor(score.organicMatterStatus)}>
              Score: {score.overall}/100
            </Badge>
            <button className="text-gray-500 hover:text-gray-700">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MetricCard
              icon={<Zap className="h-4 w-4 text-blue-600" />}
              label="Nitrogen"
              value={parameters.nitrogen.toFixed(1)}
              unit="kg/ha"
              status={score.nitrogenStatus}
            />
            <MetricCard
              icon={<Droplets className="h-4 w-4 text-cyan-600" />}
              label="Phosphorus"
              value={parameters.phosphorus.toFixed(1)}
              unit="kg/ha"
              status={score.phosphorusStatus}
            />
            <MetricCard
              icon={<Leaf className="h-4 w-4 text-green-600" />}
              label="Potassium"
              value={parameters.potassium.toFixed(1)}
              unit="kg/ha"
              status={score.potassiumStatus}
            />
            <MetricCard
              icon={<Beaker className="h-4 w-4 text-purple-600" />}
              label="pH"
              value={parameters.ph.toFixed(2)}
              unit=""
              status={score.phStatus}
            />
            <MetricCard
              icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
              label="Organic Matter"
              value={parameters.organicMatter.toFixed(2)}
              unit="%"
              status={score.organicMatterStatus}
            />
          </div>

          {/* Detailed Status Bars */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Parameter Details</h4>
            <ParameterBar
              label="Nitrogen"
              value={parameters.nitrogen}
              max={300}
              unit="kg/ha"
              status={score.nitrogenStatus}
            />
            <ParameterBar
              label="Phosphorus"
              value={parameters.phosphorus}
              max={60}
              unit="kg/ha"
              status={score.phosphorusStatus}
            />
            <ParameterBar
              label="Potassium"
              value={parameters.potassium}
              max={300}
              unit="kg/ha"
              status={score.potassiumStatus}
            />
            <ParameterBar
              label="Organic Matter"
              value={parameters.organicMatter}
              max={5}
              unit="%"
              status={score.organicMatterStatus}
            />
            <ParameterBar
              label="pH Level"
              value={parameters.ph}
              max={9}
              unit=""
              status={score.phStatus}
            />
            <ParameterBar
              label="Soil Moisture"
              value={parameters.moisture}
              max={40}
              unit="%"
              status="good"
            />
          </div>

          {/* Recommendations */}
          {score.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {score.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Amendments */}
          {score.amendments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Suggested Amendments</h4>
              <div className="space-y-2">
                {score.amendments.map((amend, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm">
                    <div className="font-medium text-gray-800">{amend.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Rate: {amend.applicationRate} kg/ha | Cost: ₹{amend.cost}/kg
                    </div>
                    <div className="text-xs text-gray-600">Timing: {amend.timing}</div>
                    {amend.benefits.length > 0 && (
                      <div className="text-xs text-green-700 mt-1">
                        Benefits: {amend.benefits.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Source & Validity */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-gray-700">
            <div className="font-medium text-blue-900 mb-1">Data Source</div>
            <p>
              Source: <span className="font-semibold capitalize">{soilCard.source}</span> | 
              Valid until {format(soilCard.expiryDate, "MMM d, yyyy")} |
              Location: {soilCard.district}, {soilCard.state}
            </p>
          </div>

          {cropName && (
            <Button variant="outline" size="sm" className="w-full">
              View Crop-Specific Schedule for {cropName}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  status: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, unit, status }) => (
  <div className={`p-3 rounded-md ${getStatusColor(status)}`}>
    <div className="flex items-center gap-1 mb-1">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className="text-lg font-bold">{value}</div>
    <div className="text-xs opacity-75">{unit}</div>
  </div>
);

interface ParameterBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: string;
}

const ParameterBar: React.FC<ParameterBarProps> = ({ label, value, max, unit, status }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={percentage} className="flex-1" />
        <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </div>
    </div>
  );
};
