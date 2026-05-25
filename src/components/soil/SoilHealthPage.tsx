import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  Beaker,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  TrendingUp,
  Download,
} from "lucide-react";
import { SoilHealthCard as SoilHealthCardType, SoilParameters } from "@/types/soil";
import { SoilHealthCardComponent } from "./SoilHealthCard";
import {
  getSoilData,
  saveFarmerSoilData,
  generateMockSoilData,
  getDataSourcesStatus,
} from "@/lib/soilData";
import { generatePlantingSchedule } from "@/lib/cropScheduling";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface FarmerSoilEntry {
  fieldName: string;
  soilCard: SoilHealthCardType;
}

export const SoilHealthPage: React.FC = () => {
  const [farmerId] = useState("farmer-demo-01");
  const [fieldName, setFieldName] = useState("Field A");
  const [soilEntries, setSoilEntries] = useState<FarmerSoilEntry[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dataSources, setDataSources] = useState(getDataSourcesStatus());
  const { toast } = useToast();

  // Soil parameters for manual input
  const [manualSoil, setManualSoil] = useState<SoilParameters>({
    nitrogen: 250,
    phosphorus: 25,
    potassium: 180,
    ph: 6.5,
    organicMatter: 2.5,
    ec: 0.3,
    texture: "loam",
    moisture: 20,
  });

  const crops = [
    "Rice",
    "Wheat",
    "Cotton",
    "Sugarcane",
    "Maize",
    "Soybean",
    "Potato",
    "Onion",
    "Tomato",
  ];

  // Load initial data
  useEffect(() => {
    const loadSoilData = async () => {
      setIsLoading(true);
      try {
        // Load existing mock data or fetch from API
        const data = await getSoilData(farmerId, "Nashik", { useMock: true });
        setSoilEntries([{ fieldName: data.fieldName, soilCard: data }]);
      } catch (error) {
        console.error("[SoilHealthPage] Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load soil data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSoilData();
  }, [farmerId, toast]);

  const handleAddSoilEntry = () => {
    if (!fieldName.trim()) {
      toast({ title: "Error", description: "Please enter a field name" });
      return;
    }

    const newCard: SoilHealthCardType = {
      id: `soil-${Date.now()}`,
      farmerId,
      fieldId: `field-${Date.now()}`,
      fieldName: fieldName.trim(),
      state: "Maharashtra",
      district: "Nashik",
      testDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      parameters: manualSoil,
      recommendations: [],
      source: "farmer-input",
      lastUpdated: new Date(),
    };

    // Save to localStorage
    saveFarmerSoilData(farmerId, newCard);

    setSoilEntries([...soilEntries, { fieldName: fieldName.trim(), soilCard: newCard }]);
    setShowAddForm(false);
    setFieldName("Field A");
    setManualSoil({
      nitrogen: 250,
      phosphorus: 25,
      potassium: 180,
      ph: 6.5,
      organicMatter: 2.5,
      ec: 0.3,
      texture: "loam",
      moisture: 20,
    });

    toast({
      title: "Success",
      description: `Soil data saved for ${fieldName}`,
    });
  };

  const handleDeleteEntry = (index: number) => {
    setSoilEntries(soilEntries.filter((_, i) => i !== index));
    toast({ title: "Deleted", description: "Soil entry removed" });
  };

  const handleExportSchedule = (soilCard: SoilHealthCardType) => {
    const schedule = generatePlantingSchedule(selectedCrop, soilCard);
    const csv = [
      ["Farm Intellect - Planting Schedule"],
      ["Crop", schedule.cropName],
      ["Field", schedule.fieldName],
      ["Season", schedule.season],
      ["Soil Readiness Score", schedule.soilReadiness],
      ["Planting Date", format(schedule.recommendedPlantingDate, "MMM d, yyyy")],
      ["Harvest Date", format(schedule.harvestDate, "MMM d, yyyy")],
      ["Expected Yield", schedule.expectedYield],
      [],
      ["Pre-Planting Amendments"],
      ...schedule.preAmendments.map((a) => [a.name, a.timing, a.rate]),
      [],
      ["Risk Factors"],
      ...schedule.riskFactors.map((r) => [r]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-${selectedCrop}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Beaker className="h-12 w-12 text-green-600 mx-auto animate-pulse" />
          <p className="text-lg font-medium">Loading soil data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Beaker className="h-8 w-8 text-green-600" />
          Soil Health Management
        </h1>
        <p className="text-gray-600">
          Monitor and optimize your soil health for better crop productivity
        </p>
      </div>

      {/* Data Source Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data Sources Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataSources.map((source) => (
              <div key={source.id} className="p-3 bg-gray-50 rounded-md flex items-start gap-3">
                <div className={`mt-0.5 ${source.available ? "text-green-600" : "text-gray-400"}`}>
                  {source.available ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{source.name}</div>
                  <div className="text-xs text-gray-600">
                    {source.available ? "Available" : "Not configured"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Soil Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Fields</h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Soil Data
          </Button>
        </div>

        {soilEntries.length > 0 ? (
          <div className="space-y-4">
            {soilEntries.map((entry, idx) => (
              <div key={idx} className="space-y-3">
                <SoilHealthCardComponent
                  soilCard={entry.soilCard}
                  cropName={selectedCrop}
                  compact={false}
                />

                {/* Crop-Specific Schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {selectedCrop} Planting Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const schedule = generatePlantingSchedule(selectedCrop, entry.soilCard);
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">Planting Window</Label>
                              <div className="text-sm font-semibold">
                                {format(schedule.optimalWindow.start, "MMM d")} -{" "}
                                {format(schedule.optimalWindow.end, "MMM d")}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">Expected Harvest</Label>
                              <div className="text-sm font-semibold">
                                {format(schedule.harvestDate, "MMM d, yyyy")}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">Soil Readiness</Label>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold">{schedule.soilReadiness}%</div>
                                <Badge
                                  variant="outline"
                                  className={
                                    schedule.soilReadiness >= 80
                                      ? "bg-green-50 text-green-700"
                                      : schedule.soilReadiness >= 60
                                        ? "bg-yellow-50 text-yellow-700"
                                        : "bg-red-50 text-red-700"
                                  }
                                >
                                  {schedule.soilReadiness >= 80 ? "Ready" : "Needs prep"}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">Expected Yield</Label>
                              <div className="text-sm font-semibold">{schedule.expectedYield}</div>
                            </div>
                          </div>

                          {/* Risk Factors */}
                          {schedule.riskFactors.length > 0 && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Risk Factors</AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  {schedule.riskFactors.map((risk, i) => (
                                    <li key={i} className="text-sm">
                                      {risk}
                                    </li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Pre-Amendments */}
                          {schedule.preAmendments.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-md">
                              <h4 className="font-medium text-sm text-blue-900 mb-2">
                                Pre-Planting Amendments
                              </h4>
                              <ul className="space-y-1 text-sm text-blue-800">
                                {schedule.preAmendments.map((amend, i) => (
                                  <li key={i}>
                                    • {amend.name} ({amend.rate}) - {amend.timing}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportSchedule(entry.soilCard)}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Export Schedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEntry(idx)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Beaker className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center">No soil data yet. Add your first field entry.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Soil Data Form */}
      {showAddForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg">Add Soil Health Data</CardTitle>
            <CardDescription>
              Enter soil parameters from your soil health card or testing results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldName">Field Name</Label>
                <Input
                  id="fieldName"
                  placeholder="e.g., Field A, North Plot"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nitrogen">Nitrogen (kg/ha)</Label>
                <Input
                  id="nitrogen"
                  type="number"
                  value={manualSoil.nitrogen}
                  onChange={(e) =>
                    setManualSoil({ ...manualSoil, nitrogen: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phosphorus">Phosphorus (kg/ha)</Label>
                <Input
                  id="phosphorus"
                  type="number"
                  value={manualSoil.phosphorus}
                  onChange={(e) =>
                    setManualSoil({ ...manualSoil, phosphorus: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="potassium">Potassium (kg/ha)</Label>
                <Input
                  id="potassium"
                  type="number"
                  value={manualSoil.potassium}
                  onChange={(e) =>
                    setManualSoil({ ...manualSoil, potassium: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">pH Value</Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  min="4.5"
                  max="8.5"
                  value={manualSoil.ph}
                  onChange={(e) =>
                    setManualSoil({ ...manualSoil, ph: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organicMatter">Organic Matter (%)</Label>
                <Input
                  id="organicMatter"
                  type="number"
                  step="0.1"
                  value={manualSoil.organicMatter}
                  onChange={(e) =>
                    setManualSoil({ ...manualSoil, organicMatter: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moisture">Soil Moisture (%)</Label>
                <Input
                  id="moisture"
                  type="number"
                  value={manualSoil.moisture}
                  onChange={(e) =>
                    setManualSoil({ ...manualSoil, moisture: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="texture">Soil Texture</Label>
                <Select value={manualSoil.texture} onValueChange={(value) =>
                  setManualSoil({ ...manualSoil, texture: value as any })
                }>
                  <SelectTrigger id="texture">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="loam">Loam</SelectItem>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="silt">Silt</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSoilEntry} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Save Soil Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crop Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Crop for Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop} value={crop.toLowerCase()}>
                  {crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};
