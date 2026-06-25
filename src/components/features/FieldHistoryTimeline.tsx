import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { format, parseISO } from "date-fns";
import {
  Activity,
  CalendarClock,
  CloudRain,
  Droplets,
  FilePlus2,
  FlaskConical,
  History,
  Leaf,
  ShieldAlert,
  ThermometerSun,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import {
  FieldHistoryEntry,
  PHASE1_STORAGE_EVENT,
  appendFieldHistoryEntry,
  getFieldHistoryEntries,
} from "@/lib/phase1-storage";

interface FieldHistoryTimelineProps {
  fields: Array<{
    id: number;
    name: string;
    crop: string;
    area: string;
    health: number;
  }>;
  selectedField: number | null;
}

type HistoryType = FieldHistoryEntry["type"] | "all";

const typeMeta: Record<FieldHistoryEntry["type"], { icon: typeof Activity; label: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
  observation: { icon: Leaf, label: "Observation", badge: "secondary" },
  irrigation: { icon: Droplets, label: "Irrigation", badge: "default" },
  fertilizer: { icon: FlaskConical, label: "Fertilizer", badge: "outline" },
  weather: { icon: CloudRain, label: "Weather", badge: "destructive" },
  harvest: { icon: CalendarClock, label: "Harvest", badge: "default" },
  soil: { icon: ThermometerSun, label: "Soil", badge: "outline" },
};

const defaultEventDate = new Date().toISOString().slice(0, 16);

const fieldHistorySubscribe = (onStoreChange: () => void) => {
  window.addEventListener(PHASE1_STORAGE_EVENT, onStoreChange);
  window.addEventListener("focus", onStoreChange);
  return () => {
    window.removeEventListener(PHASE1_STORAGE_EVENT, onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
};

export const FieldHistoryTimeline = ({ fields, selectedField }: FieldHistoryTimelineProps) => {
  const { toast } = useToast();
  const entries = useSyncExternalStore(fieldHistorySubscribe, getFieldHistoryEntries);
  const [activeFieldFilter, setActiveFieldFilter] = useState<string>(selectedField ? String(selectedField) : "all");
  const [activeTypeFilter, setActiveTypeFilter] = useState<HistoryType>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formState, setFormState] = useState({
    fieldId: selectedField ? String(selectedField) : String(fields[0]?.id ?? 1),
    type: "observation" as FieldHistoryEntry["type"],
    date: defaultEventDate,
    title: "",
    detail: "",
    health: String(fields.find((field) => field.id === selectedField)?.health ?? fields[0]?.health ?? 80),
    source: "Farmer log",
  });

  useEffect(() => {
    if (selectedField) {
      setActiveFieldFilter(String(selectedField));
      const field = fields.find((item) => item.id === selectedField);
      setFormState((current) => ({
        ...current,
        fieldId: String(selectedField),
        health: String(field?.health ?? current.health),
      }));
    }
  }, [fields, selectedField]);

  const filteredEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => activeFieldFilter === "all" || String(entry.fieldId) === activeFieldFilter)
      .filter((entry) => activeTypeFilter === "all" || entry.type === activeTypeFilter)
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  }, [activeFieldFilter, activeTypeFilter, entries]);

  const summary = useMemo(() => {
    const criticalEvents = filteredEntries.filter((entry) => entry.health < 70).length;
    const latest = filteredEntries[0];
    const averageHealth = filteredEntries.length
      ? Math.round(filteredEntries.reduce((sum, entry) => sum + entry.health, 0) / filteredEntries.length)
      : 0;

    return {
      total: filteredEntries.length,
      criticalEvents,
      averageHealth,
      latestDate: latest ? format(parseISO(latest.date), "dd MMM yyyy") : "No events yet",
    };
  }, [filteredEntries]);

  const handleCreateEntry = () => {
    if (!formState.title.trim() || !formState.detail.trim()) {
      toast({
        title: "Add event details",
        description: "A timeline event needs a title and a short description.",
        variant: "destructive",
      });
      return;
    }

    const entry: FieldHistoryEntry = {
      id: `history-${Date.now()}`,
      fieldId: Number(formState.fieldId),
      type: formState.type,
      date: new Date(formState.date).toISOString(),
      title: formState.title.trim(),
      detail: formState.detail.trim(),
      health: Number(formState.health),
      source: formState.source.trim() || "Farmer log",
    };

    appendFieldHistoryEntry(entry);
    setEntries((currentEntries) => [entry, ...currentEntries]);
    setShowCreateForm(false);
    setFormState((current) => ({
      ...current,
      title: "",
      detail: "",
      date: defaultEventDate,
      source: "Farmer log",
    }));

    toast({
      title: "Timeline updated",
      description: "The new field event has been saved for future review.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-sky-500/5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <History className="h-6 w-6 text-primary" />
                Field History Timeline
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm md:text-base">
                Review how each field has changed over time and capture new observations, irrigation actions, weather events, and harvest milestones in one running timeline.
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm((current) => !current)}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              {showCreateForm ? "Close form" : "Log new event"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border bg-background/80 p-4">
              <p className="text-sm font-medium text-muted-foreground">Visible events</p>
              <p className="mt-3 text-3xl font-bold">{summary.total}</p>
            </div>
            <div className="rounded-xl border bg-background/80 p-4">
              <p className="text-sm font-medium text-muted-foreground">Average health</p>
              <p className="mt-3 text-3xl font-bold">{summary.averageHealth}%</p>
            </div>
            <div className="rounded-xl border bg-background/80 p-4">
              <p className="text-sm font-medium text-muted-foreground">Critical watch items</p>
              <p className="mt-3 text-3xl font-bold">{summary.criticalEvents}</p>
            </div>
            <div className="rounded-xl border bg-background/80 p-4">
              <p className="text-sm font-medium text-muted-foreground">Latest update</p>
              <p className="mt-3 text-lg font-bold">{summary.latestDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review by field or event type</CardTitle>
          <CardDescription>
            The selected field on the map automatically becomes the active filter, but you can switch context anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="history-field-filter">Field</Label>
            <Select value={activeFieldFilter} onValueChange={setActiveFieldFilter}>
              <SelectTrigger id="history-field-filter">
                <SelectValue placeholder="All fields" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fields</SelectItem>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={String(field.id)}>
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="history-type-filter">Event type</Label>
            <Select value={activeTypeFilter} onValueChange={(value) => setActiveTypeFilter(value as HistoryType)}>
              <SelectTrigger id="history-type-filter">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {Object.entries(typeMeta).map(([type, meta]) => (
                  <SelectItem key={type} value={type}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border px-4 py-3 lg:col-span-2">
            <p className="text-sm font-medium">Smart tip</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fields with repeated weather or irrigation events usually need tighter moisture tracking and a short follow-up note within 48 hours.
            </p>
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create timeline entry</CardTitle>
            <CardDescription>
              Save a notable field event so it stays visible in the timeline and dashboard summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="history-field">Field</Label>
                <Select value={formState.fieldId} onValueChange={(value) => setFormState((current) => ({ ...current, fieldId: value }))}>
                  <SelectTrigger id="history-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={String(field.id)}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="history-type">Type</Label>
                <Select value={formState.type} onValueChange={(value) => setFormState((current) => ({ ...current, type: value as FieldHistoryEntry["type"] }))}>
                  <SelectTrigger id="history-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeMeta).map(([type, meta]) => (
                      <SelectItem key={type} value={type}>
                        {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="history-date">Date & time</Label>
                <Input
                  id="history-date"
                  type="datetime-local"
                  value={formState.date}
                  onChange={(event) => setFormState((current) => ({ ...current, date: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="history-health">Field health (%)</Label>
                <Input
                  id="history-health"
                  type="number"
                  min="0"
                  max="100"
                  value={formState.health}
                  onChange={(event) => setFormState((current) => ({ ...current, health: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="history-title">Title</Label>
                <Input
                  id="history-title"
                  value={formState.title}
                  onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                  placeholder="e.g. Protective irrigation completed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="history-source">Source</Label>
                <Input
                  id="history-source"
                  value={formState.source}
                  onChange={(event) => setFormState((current) => ({ ...current, source: event.target.value }))}
                  placeholder="Farmer log, expert advisory, sensor alert..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="history-detail">What happened?</Label>
              <Textarea
                id="history-detail"
                value={formState.detail}
                onChange={(event) => setFormState((current) => ({ ...current, detail: event.target.value }))}
                rows={4}
                placeholder="Capture the observation, action taken, and next follow-up."
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateEntry}>Save event</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Chronological field record</CardTitle>
          <CardDescription>
            Each event becomes a durable field memory you can revisit before the next sowing cycle or expert consultation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No timeline entries match these filters</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Log a field event to start building a season-by-season operational history.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => {
                const meta = typeMeta[entry.type];
                const Icon = meta.icon;
                const field = fields.find((item) => item.id === entry.fieldId);
                const isLast = index === filteredEntries.length - 1;

                return (
                  <div key={entry.id} className="relative pl-10">
                    {!isLast && <div className="absolute left-[18px] top-10 h-[calc(100%-1.25rem)] w-px bg-border" />}
                    <div className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border bg-background">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-xl border p-4 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold">{entry.title}</h3>
                            <Badge variant={meta.badge}>{meta.label}</Badge>
                            {field && <Badge variant="outline">{field.name}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.detail}</p>
                        </div>
                        <div className="text-sm text-muted-foreground md:text-right">
                          <div>{format(parseISO(entry.date), "dd MMM yyyy · hh:mm a")}</div>
                          <div className="mt-1 font-medium text-foreground">Health {entry.health}%</div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">Source: {entry.source}</Badge>
                        {field && <Badge variant="outline">{field.crop} · {field.area}</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
