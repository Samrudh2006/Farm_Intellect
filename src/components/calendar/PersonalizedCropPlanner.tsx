import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  Leaf,
  MapPin,
  PlusCircle,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
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
import { getCalendarByCrop } from "@/data/cropCalendar";
import { CropInfo, cropsData } from "@/data/cropsData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import {
  PHASE1_STORAGE_EVENT,
  StoredCropEntry,
  StoredCropReminder,
  getCropPlans,
  saveCropPlans,
} from "@/lib/phase1-storage";

const defaultFieldOptions = ["Field A", "Field B", "Field C", "North Plot", "Canal Side Plot"];
const defaultPlantingDate = new Date().toISOString().slice(0, 10);

const getCurrentSeason = (month: number) => {
  if (month >= 5 && month <= 9) return "kharif";
  if (month >= 1 && month <= 4) return "summer";
  return "rabi";
};

const parseDurationToDays = (duration: string) => {
  const values = duration.match(/\d+/g)?.map(Number) ?? [];
  if (values.length === 0) return 120;

  const baseline = values[0];
  return duration.toLowerCase().includes("month") ? baseline * 30 : baseline;
};

const getReminderPriority = (category: string): StoredCropReminder["priority"] => {
  switch (category) {
    case "harvest":
    case "irrigate":
      return "high";
    case "fertilize":
    case "spray":
      return "medium";
    default:
      return "low";
  }
};

const getReminderOffset = (category: string, durationDays: number) => {
  switch (category) {
    case "field_prep":
      return 2;
    case "sowing":
      return 5;
    case "irrigate":
      return 21;
    case "fertilize":
      return 35;
    case "spray":
      return 48;
    case "monitoring":
      return 28;
    case "harvest":
      return durationDays;
    case "storage":
      return durationDays + 5;
    default:
      return 14;
  }
};

const buildPlanReminders = (crop: CropInfo, plantingDate: Date): StoredCropReminder[] => {
  const durationDays = parseDurationToDays(crop.duration);
  const advisory = getCalendarByCrop(crop.name)[0];
  const suggestedActivities =
    advisory?.keyActivities
      .filter((activity) => ["field_prep", "irrigate", "fertilize", "monitoring", "harvest"].includes(activity.category))
      .slice(0, 4) ?? [];

  if (suggestedActivities.length > 0) {
    return suggestedActivities.map((activity, index) => ({
      id: `${crop.id}-reminder-${index}-${Date.now()}`,
      date: addDays(plantingDate, getReminderOffset(activity.category, durationDays)).toISOString(),
      task: activity.activity,
      priority: getReminderPriority(activity.category),
      completed: false,
    }));
  }

  return [
    {
      id: `${crop.id}-prep-${Date.now()}`,
      date: addDays(plantingDate, 3).toISOString(),
      task: "Complete land preparation and seed treatment",
      priority: "medium",
      completed: false,
    },
    {
      id: `${crop.id}-irrigation-${Date.now()}`,
      date: addDays(plantingDate, 21).toISOString(),
      task: "Review irrigation schedule and moisture status",
      priority: "high",
      completed: false,
    },
    {
      id: `${crop.id}-harvest-${Date.now()}`,
      date: addDays(plantingDate, durationDays).toISOString(),
      task: "Prepare harvest logistics and mandi plan",
      priority: "high",
      completed: false,
    },
  ];
};

const createPlanEntry = ({
  crop,
  fieldName,
  plantingDate,
  notes,
}: {
  crop: CropInfo;
  fieldName: string;
  plantingDate: Date;
  notes: string;
}): StoredCropEntry => {
  const durationDays = parseDurationToDays(crop.duration);
  const harvestDate = addDays(plantingDate, durationDays);
  const advisory = getCalendarByCrop(crop.name)[0];

  return {
    id: `${crop.id}-${Date.now()}`,
    cropType: crop.name,
    fieldName,
    plantingDate: plantingDate.toISOString(),
    harvestDate: harvestDate.toISOString(),
    stage: "planning",
    notes,
    targetYield: crop.avgYield,
    irrigationPlan: advisory
      ? `${advisory.irrigationCount} planned irrigation cycles · ${crop.waterRequirement} water requirement`
      : `${crop.waterRequirement} water requirement with weekly field checks`,
    reminders: buildPlanReminders(crop, plantingDate),
  };
};

const cropPlansSubscribe = (onStoreChange: () => void) => {
  window.addEventListener(PHASE1_STORAGE_EVENT, onStoreChange);
  window.addEventListener("focus", onStoreChange);
  return () => {
    window.removeEventListener(PHASE1_STORAGE_EVENT, onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
};

export const PersonalizedCropPlanner = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const plans = useSyncExternalStore(cropPlansSubscribe, getCropPlans);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [fieldName, setFieldName] = useState(defaultFieldOptions[0]);
  const [plantingDate, setPlantingDate] = useState(defaultPlantingDate);
  const [notes, setNotes] = useState("");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const locationHint = user.location?.split(",")[0]?.trim() || "Punjab";
  const currentSeason = getCurrentSeason(currentDate ? currentDate.getMonth() : 5);

  const recommendedCrops = useMemo(() => {
    const locationLower = locationHint.toLowerCase();

    return [...cropsData]
      .map((crop) => {
        const locationMatch = crop.region.some((region) => {
          const regionLower = region.toLowerCase();
          return locationLower.includes(regionLower) || regionLower.includes(locationLower);
        });
        const seasonMatch = crop.season === currentSeason;
        const profitabilityScore = crop.profitability === "High" ? 2 : crop.profitability === "Medium" ? 1 : 0;
        const waterBonus = crop.waterRequirement === "Low" ? 1 : 0;

        return {
          crop,
          score: (locationMatch ? 4 : 0) + (seasonMatch ? 3 : 0) + profitabilityScore + waterBonus,
          locationMatch,
          seasonMatch,
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);
  }, [currentSeason, locationHint]);

  const plannerSummary = useMemo(() => {
    const reminders = plans.flatMap((plan) => plan.reminders);
    return {
      totalPlans: plans.length,
      openReminders: reminders.filter((reminder) => !reminder.completed).length,
      dueThisWeek: reminders.filter((reminder) => {
        if (reminder.completed) return false;
        const daysAway = differenceInCalendarDays(parseISO(reminder.date), new Date());
        return daysAway >= 0 && daysAway <= 7;
      }).length,
    };
  }, [plans]);

  const handleCreatePlan = (cropName?: string) => {
    const crop = cropsData.find((item) => item.name === (cropName || selectedCrop));

    if (!crop) {
      toast({
        title: "Choose a crop first",
        description: "Select one recommended crop or pick a crop from the planner form.",
        variant: "destructive",
      });
      return;
    }

    if (!fieldName.trim()) {
      toast({
        title: "Field name required",
        description: "Add the field or plot name to personalize the plan.",
        variant: "destructive",
      });
      return;
    }

    const plan = createPlanEntry({
      crop,
      fieldName,
      plantingDate: new Date(`${plantingDate}T08:00:00`),
      notes: notes.trim() || `${crop.name} plan tailored for ${locationHint} conditions.`,
    });

    saveCropPlans([plan, ...plans]);
    setSelectedCrop("");
    setNotes("");

    toast({
      title: `${crop.name} plan created`,
      description: `Saved a personalized crop plan for ${fieldName} with milestone reminders.`,
    });
  };

  const toggleReminder = (planId: string, reminderId: string) => {
    const updatedPlans = plans.map((plan) => {
      if (plan.id !== planId) return plan;

      return {
        ...plan,
        reminders: plan.reminders.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, completed: !reminder.completed } : reminder,
        ),
      };
    });

    setPlans(updatedPlans);
    saveCropPlans(updatedPlans);
  };

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter((plan) => plan.id !== planId);
    setPlans(updatedPlans);
    saveCropPlans(updatedPlans);

    toast({
      title: "Plan removed",
      description: "The crop planner has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Personalized Crop Planner
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm md:text-base">
                Build crop plans tuned to your season, location, and field goals. The planner saves reminder milestones so your dashboard stays in sync even offline.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {locationHint}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {currentSeason} season
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {plannerSummary.totalPlans} saved plans
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-background/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Leaf className="h-4 w-4 text-primary" />
                Active plans
              </div>
              <div className="mt-3 text-3xl font-bold">{plannerSummary.totalPlans}</div>
              <p className="mt-1 text-sm text-muted-foreground">Planned crops across your fields</p>
            </div>
            <div className="rounded-xl border bg-background/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock3 className="h-4 w-4 text-harvest" />
                Open reminders
              </div>
              <div className="mt-3 text-3xl font-bold">{plannerSummary.openReminders}</div>
              <p className="mt-1 text-sm text-muted-foreground">Upcoming irrigation, nutrient, and harvest tasks</p>
            </div>
            <div className="rounded-xl border bg-background/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Target className="h-4 w-4 text-earth" />
                Due this week
              </div>
              <div className="mt-3 text-3xl font-bold">{plannerSummary.dueThisWeek}</div>
              <p className="mt-1 text-sm text-muted-foreground">Planner tasks that need attention in the next 7 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recommended crops for your next cycle
            </CardTitle>
            <CardDescription>
              Recommendations prioritize {locationHint}, the current {currentSeason} window, profitability, and water efficiency.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {recommendedCrops.map(({ crop, locationMatch, seasonMatch }) => (
              <div key={crop.id} className="rounded-xl border p-4 shadow-sm transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{crop.name}</h3>
                    <p className="text-sm text-muted-foreground">{crop.description}</p>
                  </div>
                  <Badge variant={crop.profitability === "High" ? "default" : "secondary"}>
                    {crop.profitability} return
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {locationMatch && <Badge variant="secondary">Matches your region</Badge>}
                  {seasonMatch && <Badge variant="outline">Best in this season</Badge>}
                  <Badge variant="outline">{crop.waterRequirement} water</Badge>
                  <Badge variant="outline">{crop.duration}</Badge>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>Planting window</span>
                    <span className="font-medium text-foreground">{crop.plantingTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Expected yield</span>
                    <span className="font-medium text-foreground">{crop.avgYield}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Irrigation profile</span>
                    <span className="font-medium text-foreground">{crop.waterRequirement}</span>
                  </div>
                </div>

                <Button className="mt-4 w-full" variant="outline" onClick={() => {
                  setSelectedCrop(crop.name);
                  handleCreatePlan(crop.name);
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add plan for {crop.name}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Create a custom field plan
            </CardTitle>
            <CardDescription>
              Use your own crop-field combination and the planner will generate reminders automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planner-crop">Crop</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger id="planner-crop">
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  {cropsData.map((crop) => (
                    <SelectItem key={crop.id} value={crop.name}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planner-field">Field / plot</Label>
                <Input
                  id="planner-field"
                  list="planner-field-options"
                  value={fieldName}
                  onChange={(event) => setFieldName(event.target.value)}
                  placeholder="Enter field name"
                />
                <datalist id="planner-field-options">
                  {defaultFieldOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planner-date">Planting date</Label>
                <Input
                  id="planner-date"
                  type="date"
                  value={plantingDate}
                  onChange={(event) => setPlantingDate(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planner-notes">Notes</Label>
              <Textarea
                id="planner-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Mention variety, soil prep, irrigation source, or target market."
                rows={4}
              />
            </div>

            <Button className="w-full" onClick={() => handleCreatePlan()}>
              Save personalized plan
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Saved crop plans
          </CardTitle>
          <CardDescription>
            Review your saved plans, irrigation goals, and milestone reminders. Updates here instantly refresh the farmer dashboard summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No crop plans yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first personalized plan to start tracking reminders and yield goals.
              </p>
            </div>
          ) : (
            plans.map((plan) => {
              const completedReminders = plan.reminders.filter((reminder) => reminder.completed).length;
              const crop = cropsData.find((item) => item.name === plan.cropType);

              return (
                <div key={plan.id} className="rounded-xl border p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{plan.cropType}</h3>
                        <Badge variant="secondary">{plan.fieldName}</Badge>
                        <Badge variant="outline" className="capitalize">{plan.stage}</Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                        <div>
                          <span className="font-medium text-foreground">Planting:</span>{" "}
                          {format(parseISO(plan.plantingDate), "dd MMM yyyy")}
                        </div>
                        {plan.harvestDate && (
                          <div>
                            <span className="font-medium text-foreground">Harvest target:</span>{" "}
                            {format(parseISO(plan.harvestDate), "dd MMM yyyy")}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-foreground">Yield goal:</span> {plan.targetYield}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className="gap-1">
                          <Droplets className="h-3 w-3" />
                          {plan.irrigationPlan}
                        </Badge>
                        {crop && <Badge variant="outline">{crop.marketPrice}</Badge>}
                      </div>

                      <p className="text-sm text-muted-foreground">{plan.notes}</p>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)} aria-label={`Delete ${plan.cropType} plan`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {plan.reminders.map((reminder) => {
                      const daysAway = currentDate ? differenceInCalendarDays(parseISO(reminder.date), currentDate) : 0;

                      return (
                        <button
                          type="button"
                          key={reminder.id}
                          onClick={() => toggleReminder(plan.id, reminder.id)}
                          className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40"
                        >
                          <CheckCircle2 className={`mt-0.5 h-4 w-4 ${reminder.completed ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{reminder.task}</p>
                              <Badge variant={reminder.priority === "high" ? "destructive" : reminder.priority === "medium" ? "default" : "secondary"}>
                                {reminder.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(reminder.date), "dd MMM yyyy")} · {daysAway >= 0 ? `${daysAway} days away` : `${Math.abs(daysAway)} days ago`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    {completedReminders} of {plan.reminders.length} milestones completed
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
