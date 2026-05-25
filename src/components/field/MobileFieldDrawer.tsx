import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Trash2,
  RotateCcw,
  Download,
  Map,
  Plus,
  Check,
  MapPin,
} from "lucide-react";
import {
  FieldPoint,
  FieldPolygon,
  calculatePolygonArea,
  calculatePolygonCentroid,
  validateFieldPolygon,
  createFieldTemplate,
} from "@/lib/fieldGeometry";
import { saveFieldToDB, saveFieldLocally } from "@/lib/fieldStorage";
import { useToast } from "@/hooks/use-toast";

interface Props {
  farmerId: string;
  onFieldSaved?: (field: FieldPolygon) => void;
}

export const MobileFieldDrawer: React.FC<Props> = ({ farmerId, onFieldSaved }) => {
  const [fieldName, setFieldName] = useState("Field A");
  const [points, setPoints] = useState<FieldPoint[]>([]);
  const [previewPoints, setPreviewPoints] = useState<FieldPoint[]>([]);
  const [mode, setMode] = useState<"draw" | "template" | "view">("draw");
  const [useTemplate, setUseTemplate] = useState<"rectangle" | "triangle" | "circle" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Mock location (in real app, use device GPS)
  const centerPoint: FieldPoint = {
    lat: 19.8968,
    lng: 75.3433, // Nashik, India
  };

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to fill container
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Clear canvas
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw polygon
    if (points.length > 0) {
      ctx.fillStyle = "rgba(76, 175, 80, 0.2)";
      ctx.strokeStyle = "#4CAF50";
      ctx.lineWidth = 2;

      ctx.beginPath();
      const firstPoint = pointToPixels(points[0], canvas);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < points.length; i++) {
        const pixel = pointToPixels(points[i], canvas);
        ctx.lineTo(pixel.x, pixel.y);
      }

      // Close polygon
      if (points.length > 2) {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw vertices
      ctx.fillStyle = "#2196F3";
      points.forEach((point) => {
        const pixel = pointToPixels(point, canvas);
        ctx.beginPath();
        ctx.arc(pixel.x, pixel.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw preview line
    if (previewPoints.length > 0) {
      ctx.strokeStyle = "#FF9800";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      const lastPoint = points[points.length - 1];
      const lastPixel = pointToPixels(lastPoint, canvas);
      const previewPixel = pointToPixels(previewPoints[0], canvas);

      ctx.moveTo(lastPixel.x, lastPixel.y);
      ctx.lineTo(previewPixel.x, previewPixel.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [points, previewPoints]);

  const pointToPixels = (
    point: FieldPoint,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const scale = 100000; // Scale factor
    const x = ((point.lng - centerPoint.lng) * scale + canvas.width / 2);
    const y = ((centerPoint.lat - point.lat) * scale + canvas.height / 2);
    return { x, y };
  };

  const pixelsToPoint = (
    x: number,
    y: number,
    canvas: HTMLCanvasElement
  ): FieldPoint => {
    const scale = 100000;
    const lng = (x - canvas.width / 2) / scale + centerPoint.lng;
    const lat = centerPoint.lat - (y - canvas.height / 2) / scale;
    return { lat, lng };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || mode !== "draw") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoint = pixelsToPoint(x, y, canvasRef.current);
    setPoints([...points, newPoint]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || points.length === 0) {
      setPreviewPoints([]);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const previewPoint = pixelsToPoint(x, y, canvasRef.current);
    setPreviewPoints([previewPoint]);
  };

  const handleTemplateCreate = (shape: "rectangle" | "triangle" | "circle") => {
    const templatePoints = createFieldTemplate(shape, centerPoint, 0.2); // ~200m field
    setPoints(templatePoints);
    setUseTemplate(shape);
    setMode("view");
    toast({ description: `${shape} field template created` });
  };

  const handleSaveField = async () => {
    const validation = validateFieldPolygon(points);

    if (!validation.isValid) {
      toast({
        title: "Invalid field",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    if (!fieldName.trim()) {
      toast({ title: "Error", description: "Please enter a field name" });
      return;
    }

    setIsSaving(true);
    try {
      const area = calculatePolygonArea(points);
      const center = calculatePolygonCentroid(points);

      const field: FieldPolygon = {
        id: `field-${Date.now()}`,
        name: fieldName.trim(),
        points,
        areaHectares: area.hectares,
        areaAcres: area.acres,
        centerLat: center.lat,
        centerLng: center.lng,
        createdAt: new Date(),
      };

      // Save to both storage layers
      saveFieldLocally(farmerId, field);
      await saveFieldToDB(farmerId, field, "pending");

      toast({
        title: "Success",
        description: `Field "${field.name}" saved (${field.areaHectares} ha)`,
      });

      onFieldSaved?.(field);

      // Reset form
      setFieldName("Field A");
      setPoints([]);
      setMode("draw");
      setUseTemplate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save field",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setPoints([]);
    setPreviewPoints([]);
    setMode("draw");
    setUseTemplate(null);
  };

  const area = points.length >= 3 ? calculatePolygonArea(points) : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Field Drawing Tool
          </CardTitle>
          <CardDescription>
            Draw or create field boundaries for satellite monitoring
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Canvas */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setPreviewPoints([])}
              style={{ display: "block", width: "100%", height: "400px", cursor: mode === "draw" ? "crosshair" : "grab" }}
              className="touch-none"
            />
          </div>

          {/* Mode Selection */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={mode === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("draw");
                setUseTemplate(null);
              }}
            >
              Draw
            </Button>
            <Button
              variant={mode === "template" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("template")}
            >
              Use Template
            </Button>
          </div>

          {/* Template Buttons */}
          {mode === "template" && (
            <div className="flex gap-2 flex-wrap p-3 bg-blue-50 rounded-lg">
              <Button size="sm" variant="outline" onClick={() => handleTemplateCreate("rectangle")}>
                Rectangle
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleTemplateCreate("triangle")}>
                Triangle
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleTemplateCreate("circle")}>
                Circle
              </Button>
            </div>
          )}

          {/* Info */}
          {points.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>Vertices: <span className="font-semibold">{points.length}</span></p>
                  {area && (
                    <>
                      <p>Area: <span className="font-semibold">{area.hectares} ha / {area.acres} acres</span></p>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Field Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              placeholder="e.g., Field A, North Plot"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSaveField}
              disabled={points.length < 3 || isSaving}
              className="flex-1 gap-2"
            >
              <Check className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Field"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={points.length === 0}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">How to use:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Click on the canvas to add vertices (minimum 3 for a valid field)</li>
              <li>Use templates for quick field creation</li>
              <li>Fields are saved offline and synced when online</li>
              <li>Polygon coordinates are approximate for mobile drawing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
