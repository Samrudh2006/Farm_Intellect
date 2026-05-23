import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Palette,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const user = {
    name: "Admin User",
    role: "admin",
  };

  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Smart Crop Advisory",
    siteDescription: "AI-powered farming assistance platform",
    timezone: "Asia/Kolkata",
    language: "en",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    
    // System
    maintenance: false,
    debugMode: false,
    cacheEnabled: true,
    apiRateLimit: "1000",
    
    // AI Settings
    aiEnabled: true,
    aiModel: "gpt-4",
    confidenceThreshold: "85",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={3}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">System Settings</h2>
              <p className="text-muted-foreground">
                Configure platform settings and preferences
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="ai">AI & ML</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Site Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => handleSettingChange('siteName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Default Language</Label>
                      <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="pa">Punjabi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <Switch id="darkMode" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compactView">Compact View</Label>
                        <Switch id="compactView" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="animations">Enable Animations</Label>
                        <Switch id="animations" defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch 
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch 
                        id="smsNotifications"
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch 
                        id="pushNotifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weeklyReports">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Receive weekly analytics reports</p>
                      </div>
                      <Switch 
                        id="weeklyReports"
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
                      </div>
                      <Switch 
                        id="twoFactorAuth"
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => handleSettingChange('passwordExpiry', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">AI Provider Key</Label>
                      <p className="text-sm text-muted-foreground">
                        AI provider keys are stored only in backend environment variables and never exposed to browser code.
                        To change them, update backend/.env and redeploy the backend service.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="••••••••••••••••••••"
                          disabled
                          value=""
                        />
                        <Button
                          variant="outline"
                          disabled
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Put site in maintenance mode</p>
                      </div>
                      <Switch 
                        id="maintenance"
                        checked={settings.maintenance}
                        onCheckedChange={(checked) => handleSettingChange('maintenance', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="debugMode">Debug Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable debug logging</p>
                      </div>
                      <Switch 
                        id="debugMode"
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="cacheEnabled">Cache Enabled</Label>
                        <p className="text-sm text-muted-foreground">Enable application caching</p>
                      </div>
                      <Switch 
                        id="cacheEnabled"
                        checked={settings.cacheEnabled}
                        onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiRateLimit">API Rate Limit (per hour)</Label>
                      <Input
                        id="apiRateLimit"
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                    AI & Machine Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="aiEnabled">AI Features Enabled</Label>
                        <p className="text-sm text-muted-foreground">Enable AI-powered recommendations</p>
                      </div>
                      <Switch 
                        id="aiEnabled"
                        checked={settings.aiEnabled}
                        onCheckedChange={(checked) => handleSettingChange('aiEnabled', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aiModel">AI Model</Label>
                      <Select value={settings.aiModel} onValueChange={(value) => handleSettingChange('aiModel', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude">Claude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confidenceThreshold">Confidence Threshold (%)</Label>
                      <Input
                        id="confidenceThreshold"
                        type="number"
                        min="0"
                        max="100"
                        value={settings.confidenceThreshold}
                        onChange={(e) => handleSettingChange('confidenceThreshold', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Data Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Download a complete backup of your system data
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Backup
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download User Data Only
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last backup: 2024-01-15 10:30 AM
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Data Restore
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Restore system data from a backup file
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Select Backup File
                      </Button>
                      <Badge variant="destructive" className="w-full justify-center">
                        ⚠️ This will overwrite existing data
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border-2 border-destructive/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-destructive">Reset System Settings</h4>
                        <p className="text-sm text-muted-foreground">Reset all settings to default values</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Reset Settings
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border-2 border-destructive/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-destructive">Clear All Data</h4>
                        <p className="text-sm text-muted-foreground">Permanently delete all system data</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Clear Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
