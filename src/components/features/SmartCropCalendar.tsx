import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Leaf, Satellite } from "lucide-react";

const fields = [
  { id: "north", name: "North Plot", ndvi: 0.51, soc: 0.62, ph: 7.4 },
  { id: "river", name: "River Edge", ndvi: 0.37, soc: 0.49, ph: 6.8 },
  { id: "red", name: "Red Soil Block", ndvi: 0.69, soc: 0.74, ph: 6.4 },
];

const crops = [
  { name: "Paddy", days: 6 },
  { name: "Maize", days: 4 },
  { name: "Millets", days: 3 },
];

export const SmartCropCalendar = () => {
  const [fieldId, setFieldId] = useState(fields[0].id);
  const field = fields.find((f) => f.id === fieldId) ?? fields[0];

  const plans = useMemo(() => {
    const stressDelay = field.ndvi < 0.4 ? 4 : field.ndvi < 0.55 ? 2 : 0;
    return crops.map((crop) => {
      const date = new Date();
      date.setDate(date.getDate() + crop.days + stressDelay);
      return {
        ...crop,
        date: date.toISOString().split("T")[0],
      };
    });
  }, [field]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Smart Crop Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={fieldId} onValueChange={setFieldId}>
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="rounded-lg border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Satellite NDVI</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Satellite className="h-3 w-3" />
              {field.ndvi.toFixed(2)}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">SOC {field.soc}% · pH {field.ph}</p>
        </div>
        <div className="space-y-2">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-medium">
                  <Leaf className="h-4 w-4 text-green-600" />
                  {plan.name}
                </p>
                <Badge>{plan.date}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
