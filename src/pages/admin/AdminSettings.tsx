import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Mail, Users, Server, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type SettingsMap = Record<string, any>;

const AdminSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = { name: "Admin User", role: "admin" };

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_settings").select("key, value");
    const map: SettingsMap = {};
    (data || []).forEach((row: any) => { map[row.key] = row.value; });
    setSettings(map);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateSetting = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await supabase
      .from("admin_settings")
      .update({ value: JSON.stringify(value) as any, updated_at: new Date().toISOString(), updated_by: authUser?.id || null })
      .eq("key", key);
  };

  const handleSave = async () => {
    setSaving(true);
    // Bulk update all settings
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from("admin_settings")
        .update({ value: JSON.stringify(value) as any, updated_at: new Date().toISOString(), updated_by: authUser?.id || null })
        .eq("key", key)
    );
    await Promise.all(promises);
    setSaving(false);
    toast({ title: "Settings saved successfully" });
  };

  const handleReset = async () => {
    const defaults: SettingsMap = {
      enableRegistration: true, enableNotifications: true, enableMaintenance: false,
      enableAnalytics: true, autoApproveExperts: false, enableEmailVerification: true,
      sessionTimeout: 30, maxLoginAttempts: 5, minPasswordLength: 8,
      smtpServer: "", smtpPort: 587, fromEmail: "",
    };
    setSettings(defaults);
    const promises = Object.entries(defaults).map(([key, value]) =>
      supabase.from("admin_settings")
        .update({ value: JSON.stringify(value) as any, updated_at: new Date().toISOString(), updated_by: authUser?.id || null })
        .eq("key", key)
    );
    await Promise.all(promises);
    toast({ title: "Settings reset to defaults" });
  };

  const bool = (key: string) => settings[key] === true || settings[key] === "true";
  const num = (key: string, fallback = 0) => Number(settings[key]) || fallback;
  const str = (key: string) => String(settings[key] ?? "").replace(/^"|"$/g, "");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />
        <main className="md:ml-64 p-6 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient-saffron-navy">⚙️ System Configuration</h1>
            <p className="text-muted-foreground text-lg mt-2">Configure platform settings and system preferences</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> User Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "enableRegistration", label: "Enable New Registrations", desc: "Allow new users to register" },
                  { key: "enableEmailVerification", label: "Email Verification Required", desc: "Require email verification for new accounts" },
                  { key: "autoApproveExperts", label: "Auto-approve Experts", desc: "Automatically approve expert applications" },
                ].map((item, i) => (
                  <div key={item.key}>
                    {i > 0 && <Separator className="mb-4" />}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5"><Label>{item.label}</Label><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                      <Switch checked={bool(item.key)} onCheckedChange={v => updateSetting(item.key, v)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> System Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "enableMaintenance", label: "Maintenance Mode", desc: "Enable maintenance mode" },
                  { key: "enableAnalytics", label: "Analytics Tracking", desc: "Enable platform analytics" },
                  { key: "enableNotifications", label: "Push Notifications", desc: "Enable system notifications" },
                ].map((item, i) => (
                  <div key={item.key}>
                    {i > 0 && <Separator className="mb-4" />}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5"><Label>{item.label}</Label><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                      <Switch checked={bool(item.key)} onCheckedChange={v => updateSetting(item.key, v)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" value={num("sessionTimeout", 30)} onChange={e => updateSetting("sessionTimeout", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input type="number" value={num("maxLoginAttempts", 5)} onChange={e => updateSetting("maxLoginAttempts", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input type="number" value={num("minPasswordLength", 8)} onChange={e => updateSetting("minPasswordLength", Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SMTP Server</Label>
                  <Input value={str("smtpServer")} onChange={e => updateSetting("smtpServer", e.target.value)} placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input type="number" value={num("smtpPort", 587)} onChange={e => updateSetting("smtpPort", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input value={str("fromEmail")} onChange={e => updateSetting("fromEmail", e.target.value)} placeholder="noreply@farmplatform.com" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> System Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                  {saving ? "Saving…" : "Save Configuration"}
                </Button>
                <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
