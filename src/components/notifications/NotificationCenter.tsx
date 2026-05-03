import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, CheckCircle, AlertTriangle, Info, Calendar, Trash2, BellRing, Clock, Loader2, CloudSun, TrendingUp, Sprout } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface Prefs {
  crop_enabled: boolean;
  weather_enabled: boolean;
  market_enabled: boolean;
  push_enabled: boolean;
}

const DEFAULT_PREFS: Prefs = { crop_enabled: true, weather_enabled: true, market_enabled: true, push_enabled: true };

export const NotificationCenter = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { permission, requestPermission } = usePushNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) toast({ title: "Failed to load notifications", variant: "destructive" });
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }, [user?.id, toast]);

  const loadPrefs = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("notification_preferences")
      .select("crop_enabled, weather_enabled, market_enabled, push_enabled")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setPrefs(data as Prefs);
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
    loadPrefs();
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as Notification;
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? n : x)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        const id = (payload.old as { id: string }).id;
        setNotifications((prev) => prev.filter((x) => x.id !== id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, loadNotifications, loadPrefs]);

  const updatePref = async (patch: Partial<Prefs>) => {
    if (!user?.id) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (error) {
      toast({ title: "Could not save preference", variant: "destructive" });
      setPrefs(prefs);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      info: <Info className="h-5 w-5 text-navy" />,
      warning: <AlertTriangle className="h-5 w-5 text-accent" />,
      error: <AlertTriangle className="h-5 w-5 text-destructive" />,
      success: <CheckCircle className="h-5 w-5 text-primary" />,
      reminder: <Calendar className="h-5 w-5 text-navy" />,
      weather: <CloudSun className="h-5 w-5 text-navy" />,
      market: <TrendingUp className="h-5 w-5 text-primary" />,
      crop: <Sprout className="h-5 w-5 text-primary" />,
    };
    return icons[type] || icons.info;
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };
  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
  };
  const markAllAsRead = async () => {
    if (!user?.id) return;
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filtered = useMemo(() => {
    switch (selectedTab) {
      case "unread": return notifications.filter((n) => !n.is_read);
      case "read": return notifications.filter((n) => n.is_read);
      case "reminders": return notifications.filter((n) => n.type === "reminder");
      case "alerts": return notifications.filter((n) => n.type === "warning" || n.type === "error");
      default: return notifications;
    }
  }, [notifications, selectedTab]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-tricolor truncate">Notifications</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Stay updated with important alerts and reminders</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {permission !== "granted" ? (
            <Button variant="outline" size="sm" onClick={async () => {
              const r = await requestPermission();
              toast({
                title: r === "granted" ? "Push notifications enabled" : "Push notifications blocked",
                description: r === "granted" ? "You'll receive crop, weather, and market alerts." : "Enable them in your browser settings.",
                variant: r === "granted" ? "default" : "destructive",
              });
            }}>
              <BellRing className="h-4 w-4 mr-2" /> Enable Push
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled className="text-primary">
              <CheckCircle className="h-4 w-4 mr-2" /> Push On
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Card className="tricolor-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Alert preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: "crop_enabled" as const, label: "Crop tasks", icon: Sprout },
            { key: "weather_enabled" as const, label: "Weather alerts", icon: CloudSun },
            { key: "market_enabled" as const, label: "Market prices", icon: TrendingUp },
            { key: "push_enabled" as const, label: "Browser push", icon: BellRing },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <Label htmlFor={key} className="text-sm truncate">{label}</Label>
              </div>
              <Switch id={key} checked={prefs[key]} onCheckedChange={(v) => updatePref({ [key]: v } as Partial<Prefs>)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: BellRing, label: "Total", value: notifications.length, color: "primary" },
          { icon: Bell, label: "Unread", value: unreadCount, color: "accent" },
          { icon: Calendar, label: "Reminders", value: notifications.filter((n) => n.type === "reminder").length, color: "navy" },
          { icon: AlertTriangle, label: "Alerts", value: notifications.filter((n) => ["warning", "error"].includes(n.type)).length, color: "accent" },
        ].map((s, i) => (
          <Card key={i} className="tricolor-card">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${s.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold leading-tight">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="tricolor-card">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="flex w-full flex-wrap gap-1 h-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread {unreadCount > 0 && <Badge className="ml-1 bg-accent text-accent-foreground">{unreadCount}</Badge>}</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
                </div>
              ) : filtered.length > 0 ? (
                <div className="space-y-3">
                  {filtered.map((n) => (
                    <div key={n.id} className={`flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg transition-colors ${!n.is_read ? "bg-primary/5 border-primary/20" : "bg-card"}`}>
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 space-y-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-foreground break-words">{n.title}</h4>
                          <Badge variant="outline" className="text-xs">{n.type}</Badge>
                          {!n.is_read && <div className="w-2 h-2 bg-accent rounded-full" />}
                        </div>
                        <p className="text-sm text-muted-foreground break-words">{n.message}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(n.created_at)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{format(new Date(n.created_at), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 self-end sm:self-start">
                        {!n.is_read && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => markAsRead(n.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteNotification(n.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
