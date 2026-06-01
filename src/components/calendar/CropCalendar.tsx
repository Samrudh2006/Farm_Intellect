import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarDays, 
  Plus, 
  Bell, 
  Sprout, 
  Clock, 
  CheckCircle,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  BookOpen,
  CloudRain,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { getCalendarByCrop, cropCalendarData } from "@/data/cropCalendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
}

export const CropCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const [selectedAdvisoryCrop, setSelectedAdvisoryCrop] = useState<string>("");
  const { toast } = useToast();
  
  const advisoryCalendar = selectedAdvisoryCrop ? getCalendarByCrop(selectedAdvisoryCrop) : [];
  const availableCrops = [...new Set(cropCalendarData.map(c => c.crop))];
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    type: "",
    description: "",
  });

  const eventTypes = [
    { value: "harvest", label: "Harvesting" },
    { value: "task", label: "General Task" },
    { value: "irrigation", label: "Irrigation" },
    { value: "fertilizer", label: "Fertilizer Application" }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      toast({ title: "Failed to fetch calendar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!newEvent.title || !newEvent.type) return;

    try {
      const { error } = await supabase.from('calendar_events').insert({
        title: newEvent.title,
        date: newEvent.date.toISOString(),
        type: newEvent.type,
        description: newEvent.description
      });

      if (error) throw error;
      toast({ title: "Event added to calendar!" });
      setShowCreateEntry(false);
      setNewEvent({ title: "", date: new Date(), type: "", description: "" });
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Error creating event", description: err.message, variant: "destructive" });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Event deleted" });
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Error deleting event", description: err.message, variant: "destructive" });
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'harvest': 'bg-amber-100 text-amber-800',
      'task': 'bg-blue-100 text-blue-800',
      'irrigation': 'bg-cyan-100 text-cyan-800',
      'fertilizer': 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Crop Calendar</h2>
          <p className="text-muted-foreground">Live Calendar Events from Supabase</p>
        </div>
        <Button onClick={() => setShowCreateEntry(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      {showCreateEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Calendar Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. Wheat Harvesting" />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={newEvent.type} onValueChange={(val) => setNewEvent({ ...newEvent, type: val })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newEvent.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={newEvent.date} onSelect={(d) => d && setNewEvent({ ...newEvent, date: d })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateEntry}>Create Event</Button>
              <Button variant="outline" onClick={() => setShowCreateEntry(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
         <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No calendar events</h3>
            <p className="text-muted-foreground mb-4">Start tracking your crops by adding your first event</p>
            <Button onClick={() => setShowCreateEntry(true)}><Plus className="h-4 w-4 mr-2" />Add Event</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Sprout className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Date:</span> {format(new Date(event.date), "MMM dd, yyyy")}
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AICRPAM Crop Advisory Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-600" /> ICAR-CRIDA Crop Advisory Calendar</CardTitle>
          <CardDescription>District-level weather-based crop schedules from AICRPAM bulletin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Crop for Advisory</Label>
            <Select value={selectedAdvisoryCrop} onValueChange={setSelectedAdvisoryCrop}>
              <SelectTrigger><SelectValue placeholder="Choose a crop..." /></SelectTrigger>
              <SelectContent>
                {availableCrops.map(crop => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {advisoryCalendar.map(cal => (
            <div key={cal.id} className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{cal.crop}</h3>
                  <p className="text-sm text-muted-foreground">{cal.zone}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cal.keyActivities.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 border rounded text-sm">
                    <Badge variant="outline" className="shrink-0 text-xs">{act.month}</Badge>
                    <div className="flex-1">
                      <p className="font-medium">{act.activity}</p>
                      <p className="text-muted-foreground text-xs">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};