import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, AlertTriangle, Info, Calendar, Trash2, Settings, BellRing, Clock, Loader2, BellOff } from "lucide-react";
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

export const NotificationCenter = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { permission, requestPermission } = usePushNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: "Failed to load notifications", variant: "destructive" });
    }
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();

    // Realtime subscription
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const newNotif = payload.new as any;
        if (newNotif.user_id === user?.id) {
          setNotifications(prev => [newNotif as Notification, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      info: <Info className="h-5 w-5 text-navy" />,
      warning: <AlertTriangle className="h-5 w-5 text-accent" />,
      error: <AlertTriangle className="h-5 w-5 text-destructive" />,
      success: <CheckCircle className="h-5 w-5 text-primary" />,
      reminder: <Calendar className="h-5 w-5 text-navy" />,
    };
    return icons[type] || icons.info;
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filterNotifications = (filter: string) => {
    switch (filter) {
      case "unread": return notifications.filter(n => !n.is_read);
      case "read": return notifications.filter(n => n.is_read);
      case "reminders": return notifications.filter(n => n.type === "reminder");
      case "alerts": return notifications.filter(n => n.type === "warning" || n.type === "error");
      default: return notifications;
    }
  };

  const filtered = useMemo(() => filterNotifications(selectedTab), [notifications, selectedTab]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold text-gradient-tricolor">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with important alerts and reminders</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {permission !== "granted" && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const r = await requestPermission();
                if (r === "granted") {
                  toast({ title: "Push notifications enabled", description: "You'll receive crop, weather, and market alerts." });
                } else {
                  toast({ title: "Push notifications blocked", description: "Enable them in your browser settings.", variant: "destructive" });
                }
              }}
            >
              <BellRing className="h-4 w-4 mr-2" /> Enable Push Alerts
            </Button>
          )}
          {permission === "granted" && (
            <Button variant="ghost" size="sm" disabled className="text-primary">
              <CheckCircle className="h-4 w-4 mr-2" /> Push Alerts On
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" /> Mark All Read
            </Button>
          )}
        </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BellRing, label: "Total", value: notifications.length, color: "primary" },
          { icon: Bell, label: "Unread", value: unreadCount, color: "accent" },
          { icon: Calendar, label: "Reminders", value: notifications.filter(n => n.type === "reminder").length, color: "navy" },
          { icon: AlertTriangle, label: "Alerts", value: notifications.filter(n => ["warning", "error"].includes(n.type)).length, color: "accent" },
        ].map((s, i) => (
          <Card key={i} className="tricolor-card">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-6 w-6 text-${s.color}`} />
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
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
            <TabsList className="grid w-full grid-cols-5">
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
                  {filtered.map(n => (
                    <div key={n.id} className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${!n.is_read ? "bg-primary/5 border-primary/20" : "bg-card"}`}>
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{n.title}</h4>
                          <Badge variant="outline" className="text-xs">{n.type}</Badge>
                          {!n.is_read && <div className="w-2 h-2 bg-accent rounded-full" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(n.created_at)}</span>
                          <span>•</span>
                          <span>{format(new Date(n.created_at), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
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
