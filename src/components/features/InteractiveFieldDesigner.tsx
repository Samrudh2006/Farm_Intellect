import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Canvas as FabricCanvas, Rect, Circle, Polygon } from "fabric";
import { 
  Palette, 
  Square, 
  Circle as CircleIcon, 
  Triangle, 
  Move, 
  RotateCcw, 
  Download,
  Upload,
  Layers,
  Ruler
} from "lucide-react";
import { toast } from "sonner";

export const InteractiveFieldDesigner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "crop" | "irrigation" | "building" | "polygon">("select");
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [selectedCropType, setSelectedCropType] = useState("wheat");

  const cropColors = {
    wheat: "#F4A460",
    rice: "#90EE90", 
    cotton: "#FFB6C1",
    maize: "#FFD700",
    soybean: "#8FBC8F"
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "#8FBC8F",
    });

    setFabricCanvas(canvas);
    toast("Field Designer Ready! Start planning your farm layout!");

    return () => {
      canvas.dispose();
    };
  }, []);

  const addCropField = () => {
    if (!fabricCanvas) return;
    
    const rect = new Rect({
      left: Math.random() * 600,
      top: Math.random() * 300,
      fill: cropColors[selectedCropType as keyof typeof cropColors],
      width: 100,
      height: 80,
      stroke: "#2D5016",
      strokeWidth: 2,
    });
    
    fabricCanvas.add(rect);
    toast(`${selectedCropType.charAt(0).toUpperCase() + selectedCropType.slice(1)} field added!`);
  };

  const addIrrigation = () => {
    if (!fabricCanvas) return;
    
    const circle = new Circle({
      left: Math.random() * 600,
      top: Math.random() * 300,
      fill: "#4169E1",
      radius: 30,
      stroke: "#191970",
      strokeWidth: 2,
    });
    
    fabricCanvas.add(circle);
    toast("Irrigation system added!");
  };

  const addBuilding = () => {
    if (!fabricCanvas) return;
    
    const points = [
      { x: 0, y: 0 },
      { x: 60, y: 0 },
      { x: 30, y: -40 },
    ];
    
    const triangle = new Polygon(points, {
      left: Math.random() * 600,
      top: Math.random() * 300 + 40,
      fill: "#8B4513",
      stroke: "#654321",
      strokeWidth: 2,
    });
    
    fabricCanvas.add(triangle);
    toast("Building added!");
  };

  const addPolygonPoint = () => {
    const nextPoint = { x: 120 + Math.random() * 400, y: 80 + Math.random() * 250 };
    setPolygonPoints((prev) => [...prev, nextPoint]);
    toast("Polygon point added. Add 3+ points then complete polygon.");
  };

  const completePolygon = () => {
    if (!fabricCanvas || polygonPoints.length < 3) {
      toast("Add at least 3 points to draw a field boundary.");
      return;
    }
    const boundary = new Polygon(polygonPoints, {
      fill: "rgba(34, 197, 94, 0.25)",
      stroke: "#166534",
      strokeWidth: 3,
    });
    fabricCanvas.add(boundary);
    setPolygonPoints([]);
    toast("Field polygon mapped for satellite monitoring.");
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#8FBC8F";
    fabricCanvas.renderAll();
    toast("Field cleared!");
  };

  const exportDesign = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
    const link = document.createElement('a');
    link.download = 'farm-layout.png';
    link.href = dataURL;
    link.click();
    toast("Farm layout exported!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Interactive Field Designer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Design your farm layout with drag-and-drop tools and mobile-friendly polygon mapping
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTool === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("select")}
          >
            <Move className="h-4 w-4 mr-1" />
            Select
          </Button>
          
          <div className="flex gap-1">
            <select 
              className="px-2 py-1 border rounded text-sm"
              value={selectedCropType}
              onChange={(e) => setSelectedCropType(e.target.value)}
            >
              <option value="wheat">Wheat</option>
              <option value="rice">Rice</option>
              <option value="cotton">Cotton</option>
              <option value="maize">Maize</option>
              <option value="soybean">Soybean</option>
            </select>
            <Button size="sm" onClick={addCropField}>
              <Square className="h-4 w-4 mr-1" />
              Add Crop
            </Button>
          </div>

          <Button size="sm" onClick={addIrrigation}>
            <CircleIcon className="h-4 w-4 mr-1" />
            Irrigation
          </Button>

          <Button size="sm" variant={activeTool === "polygon" ? "default" : "outline"} onClick={() => setActiveTool("polygon")}>
            <Ruler className="h-4 w-4 mr-1" />
            Polygon Mode
          </Button>
          <Button size="sm" onClick={addPolygonPoint}>Add Point</Button>
          <Button size="sm" onClick={completePolygon}>Complete Polygon</Button>
          
          <Button size="sm" onClick={addBuilding}>
            <Triangle className="h-4 w-4 mr-1" />
            Building
          </Button>
          
          <Button size="sm" variant="secondary" onClick={clearCanvas}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </Button>
          
          <Button size="sm" variant="secondary" onClick={exportDesign}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>

        {/* Canvas */}
        <div className="border border-border rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          {Object.entries(cropColors).map(([crop, color]) => (
            <div key={crop} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{crop}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border" />
            <span>Irrigation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
