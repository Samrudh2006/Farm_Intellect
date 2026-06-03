import { useState, useEffect } from "react";
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
  EyeOff,
  Fingerprint,
  ScanFace,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  isBiometricSupported,
  registerBiometric,
  removeBiometric,
  hasRegistered,
} from "@/lib/biometricAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const { toast } = useToast();

  // Biometric state
  const [bioSupported, setBioSupported] = useState(false);
  const [bioFingerprintRegistered, setBioFingerprintRegistered] = useState(false);
  const [bioFaceRegistered, setBioFaceRegistered] = useState(false);
  const [bioLoading, setBioLoading] = useState<"fingerprint" | "face" | null>(null);
  // Credential prompt for biometric registration
  const [bioPrompt, setBioPrompt] = useState<{ kind: "fingerprint" | "face" } | null>(null);
  const [bioAadhaar, setBioAadhaar] = useState("");
  const [bioPasskey, setBioPasskey] = useState("");
  const [showBioPasskey, setShowBioPasskey] = useState(false);
  const { signInWithAadhaar } = useAuth();

  useEffect(() => {
    isBiometricSupported().then(async (ok) => {
      setBioSupported(ok);
      if (ok) {
        setBioFingerprintRegistered(await hasRegistered("fingerprint"));
        setBioFaceRegistered(await hasRegistered("face"));
      }
    });
  }, []);

  const handleBioRegister = async (kind: "fingerprint" | "face") => {
    // Show credential prompt instead of registering immediately
    setBioAadhaar("");
    setBioPasskey("");
    setBioPrompt({ kind });
  };

  const handleBioRegisterConfirm = async () => {
    if (!bioPrompt) return;
    const kind = bioPrompt.kind;
    const cleanAadhaar = bioAadhaar.replace(/\s/g, "");

    if (!/^\d{12}$/.test(cleanAadhaar)) {
      toast({ title: "Invalid Aadhaar", description: "Please enter your 12-digit Aadhaar number.", variant: "destructive" });
      return;
    }
    if (!bioPasskey || bioPasskey.length < 4) {
      toast({ title: "Invalid Passkey", description: "Please enter your passkey (min 4 characters).", variant: "destructive" });
      return;
    }

    setBioLoading(kind);
    try {
      // Verify credentials first
      const { error } = await signInWithAadhaar(cleanAadhaar, bioPasskey);
      if (error) {
        toast({ title: "Invalid credentials", description: "Aadhaar or passkey is incorrect. Cannot register biometric.", variant: "destructive" });
        setBioLoading(null);
        return;
      }
      // Credentials verified — now register biometric
      await registerBiometric(kind, {
        aadhaar: cleanAadhaar,
        passkey: bioPasskey,
        label: user.name || cleanAadhaar,
      });
      if (kind === "fingerprint") setBioFingerprintRegistered(true);
      else setBioFaceRegistered(true);
      setBioPrompt(null);
      toast({
        title: kind === "face" ? "Face ID registered ✓" : "Fingerprint registered ✓",
        description: "You can now use this biometric to sign in quickly.",
      });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setBioLoading(null);
    }
  };

  const handleBioRemove = async (kind: "fingerprint" | "face") => {
    setBioLoading(kind);
    try {
      await removeBiometric(kind);
      if (kind === "fingerprint") setBioFingerprintRegistered(false);
      else setBioFaceRegistered(false);
      toast({
        title: kind === "face" ? "Face ID removed" : "Fingerprint removed",
        description: "Biometric login disabled for this device.",
      });
    } catch (err: any) {
      toast({ title: "Remove failed", description: err.message, variant: "destructive" });
    } finally {
      setBioLoading(null);
    }
  };

  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Farm Intellect",
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
              {/* Biometric Login Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    Biometric Login
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!bioSupported ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                      <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Not supported on this device</p>
                        <p className="text-xs text-muted-foreground">Biometric login requires a device with a fingerprint sensor, Face ID, or Windows Hello.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Manage biometric credentials stored on this device. Each device stores credentials independently.
                      </p>

                      {/* Credential prompt for registration */}
                      {bioPrompt && (
                        <div className="p-4 border-2 border-primary/30 rounded-lg bg-primary/5 space-y-3">
                          <p className="text-sm font-medium flex items-center gap-2">
                            {bioPrompt.kind === "fingerprint" ? <Fingerprint className="h-4 w-4 text-primary" /> : <ScanFace className="h-4 w-4 text-primary" />}
                            Verify your identity to register {bioPrompt.kind === "fingerprint" ? "fingerprint" : "Face ID"}
                          </p>
                          <p className="text-xs text-muted-foreground">Enter your Aadhaar and Passkey to confirm it's you before enrolling your biometric.</p>
                          <div className="space-y-2">
                            <Label htmlFor="bio-aadhaar" className="text-xs">Aadhaar Number</Label>
                            <Input
                              id="bio-aadhaar"
                              placeholder="XXXX XXXX XXXX"
                              maxLength={14}
                              value={bioAadhaar}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                                setBioAadhaar(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio-passkey" className="text-xs">Passkey</Label>
                            <div className="relative">
                              <Input
                                id="bio-passkey"
                                type={showBioPasskey ? "text" : "password"}
                                placeholder="Enter your passkey"
                                value={bioPasskey}
                                onChange={(e) => setBioPasskey(e.target.value)}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowBioPasskey(!showBioPasskey)}
                              >
                                {showBioPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleBioRegisterConfirm}
                              disabled={bioLoading !== null}
                              className="flex-1"
                            >
                              {bioLoading ? "Verifying..." : `Register ${bioPrompt.kind === "fingerprint" ? "Fingerprint" : "Face ID"}`}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBioPrompt(null)}
                              disabled={bioLoading !== null}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      {/* Fingerprint */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${bioFingerprintRegistered ? "bg-green-100 dark:bg-green-950" : "bg-muted"}`}>
                            <Fingerprint className={`h-5 w-5 ${bioFingerprintRegistered ? "text-green-600" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Fingerprint</p>
                            <p className="text-xs text-muted-foreground">
                              {bioFingerprintRegistered ? "Registered on this device" : "Not registered"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {bioFingerprintRegistered && (
                            <Badge variant="outline" className="text-green-600 border-green-400 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          )}
                          {bioFingerprintRegistered ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBioRemove("fingerprint")}
                              disabled={bioLoading === "fingerprint"}
                            >
                              {bioLoading === "fingerprint" ? "Removing..." : "Remove"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBioRegister("fingerprint")}
                              disabled={bioLoading === "fingerprint"}
                            >
                              {bioLoading === "fingerprint" ? "Registering..." : "Register"}
                            </Button>
                          )}
                        </div>
                      </div>
                      {/* Face ID */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${bioFaceRegistered ? "bg-blue-100 dark:bg-blue-950" : "bg-muted"}`}>
                            <ScanFace className={`h-5 w-5 ${bioFaceRegistered ? "text-blue-600" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Face ID / Face Login</p>
                            <p className="text-xs text-muted-foreground">
                              {bioFaceRegistered ? "Registered on this device" : "Not registered"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {bioFaceRegistered && (
                            <Badge variant="outline" className="text-blue-600 border-blue-400 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          )}
                          {bioFaceRegistered ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBioRemove("face")}
                              disabled={bioLoading === "face"}
                            >
                              {bioLoading === "face" ? "Removing..." : "Remove"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBioRegister("face")}
                              disabled={bioLoading === "face"}
                            >
                              {bioLoading === "face" ? "Registering..." : "Register"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        🔒 Biometric data never leaves your device. Credentials are encrypted using AES-256-GCM and stored in your browser's secure IndexedDB.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
