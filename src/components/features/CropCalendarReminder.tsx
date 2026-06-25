import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Bell, Plus, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CropReminder {
  id: string;
  crop: string;
  activity: string;
  date: string;
  isActive: boolean;
}

export const CropCalendarReminder = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<CropReminder[]>([]);
  const [newReminder, setNewReminder] = useState({
    crop: "",
    activity: "",
    date: ""
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    // Set min date on client
    setMinDate(new Date().toISOString().split('T')[0]);

    // Load reminders from localStorage
    const savedReminders = localStorage.getItem('cropReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Check for today's reminders
    checkTodayReminders();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive crop activity reminders"
        });
      }
    }
  };

  const checkTodayReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedReminders = localStorage.getItem('cropReminders');
    
    if (savedReminders) {
      const reminderList = JSON.parse(savedReminders);
      const todayReminders = reminderList.filter((reminder: CropReminder) => 
        reminder.date === today && reminder.isActive
      );

      todayReminders.forEach((reminder: CropReminder) => {
        showNotification(reminder);
      });
    }
  };

  const showNotification = (reminder: CropReminder) => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(`Farm Reminder: ${reminder.activity}`, {
        body: `Time for ${reminder.activity} activity for your ${reminder.crop} crop`,
        icon: '/favicon.ico'
      });
    }

    toast({
      title: `Reminder: ${reminder.activity}`,
      description: `Time for ${reminder.activity} activity for your ${reminder.crop} crop`
    });
  };

  const addReminder = () => {
    if (!newReminder.crop || !newReminder.activity || !newReminder.date) {
      toast({
        title: "Missing Information",
        description: "Please fill all reminder details",
        variant: "destructive"
      });
      return;
    }

    const reminder: CropReminder = {
      id: Date.now().toString(),
      ...newReminder,
      isActive: true
    };

    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    localStorage.setItem('cropReminders', JSON.stringify(updatedReminders));

    setNewReminder({ crop: "", activity: "", date: "" });

    toast({
      title: "Reminder Added",
      description: "Your crop activity reminder has been set"
    });
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    localStorage.setItem('cropReminders', JSON.stringify(updatedReminders));
    
    toast({
      title: "Reminder Deleted",
      description: "Crop reminder has been removed"
    });
  };

  const toggleReminder = (id: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, isActive: !reminder.isActive } : reminder
    );
    setReminders(updatedReminders);
    localStorage.setItem('cropReminders', JSON.stringify(updatedReminders));
  };

  // Predefined crop activities
  const cropActivities = {
    wheat: [
      "Land Preparation (भूमि तैयारी)",
      "Sowing (बुआई)",
      "First Irrigation (पहली सिंचाई)",
      "Fertilizer Application (खाद)",
      "Weed Control (खरपतवार नियंत्रण)",
      "Harvesting (कटाई)"
    ],
    rice: [
      "Nursery Preparation (नर्सरी तैयारी)",
      "Transplanting (रोपाई)",
      "Irrigation (सिंचाई)",
      "Fertilizer Application (खाद)",
      "Pest Control (कीट नियंत्रण)",
      "Harvesting (कटाई)"
    ],
    cotton: [
      "Land Preparation (भूमि तैयारी)",
      "Sowing (बुआई)",
      "Thinning (छंटाई)",
      "Irrigation (सिंचाई)",
      "Pest Control (कीट नियंत्रण)",
      "Harvesting (कटाई)"
    ]
  };

  const getUpcomingReminders = () => {
    const today = new Date();
    return reminders
      .filter(reminder => reminder.isActive && new Date(reminder.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Crop Calendar & Reminders
            </div>
            {!notificationsEnabled && (
              <Button onClick={requestNotificationPermission} size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Reminder */}
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-semibold">Add New Reminder</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={newReminder.crop} onValueChange={(value) => setNewReminder(prev => ({ ...prev, crop: value, activity: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wheat">Wheat (गेहूं)</SelectItem>
                  <SelectItem value="rice">Rice (धान)</SelectItem>
                  <SelectItem value="cotton">Cotton (कपास)</SelectItem>
                  <SelectItem value="sugarcane">Sugarcane (गन्ना)</SelectItem>
                  <SelectItem value="mustard">Mustard (सरसों)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={newReminder.activity} onValueChange={(value) => setNewReminder(prev => ({ ...prev, activity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {newReminder.crop && cropActivities[newReminder.crop as keyof typeof cropActivities] ? (
                    cropActivities[newReminder.crop as keyof typeof cropActivities].map((activity) => (
                      <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="general">General Activity</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <input
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder(prev => ({ ...prev, date: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                min={minDate}
              />
            </div>
            <Button onClick={addReminder} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Upcoming Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getUpcomingReminders().length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming reminders. Add some activities!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getUpcomingReminders().map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold">{reminder.activity}</div>
                      <div className="text-sm text-muted-foreground">
                        {reminder.crop} • {new Date(reminder.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReminder(reminder.id)}
                    >
                      {reminder.isActive ? "Active" : "Inactive"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Reminders */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Reminders ({reminders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    reminder.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                  }`}
                >
                  <div>
                    <div className="font-medium">{reminder.activity}</div>
                    <div className="text-sm text-muted-foreground">
                      {reminder.crop} • {new Date(reminder.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReminder(reminder.id)}
                    >
                      {reminder.isActive ? "✓" : "○"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};