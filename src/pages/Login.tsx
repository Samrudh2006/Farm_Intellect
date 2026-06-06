import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sun, Moon, Shield, Phone, Eye, EyeOff, KeyRound, Fingerprint, ScanFace, AlertTriangle } from "lucide-react";
import {
  isBiometricSupported,
  registerBiometric,
  authenticateBiometric,
  hasRegistered,
  type BiometricKind,
} from "@/lib/biometricAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logSecurityEvent } from "@/lib/securityMonitoring";
import { roleHomeRoutes, type AppRole } from "@/lib/roles";
import farmerImg from "@/assets/roles/farmer-role.jpg";
import merchantImg from "@/assets/roles/merchant-role.jpg";
import adminImg from "@/assets/roles/admin-role.jpg";

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signUpWithAadhaar, signInWithAadhaar } = useAuth();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Biometric (WebAuthn) state
  const [bioSupported, setBioSupported] = useState(false);
  const [bioFingerprintRegistered, setBioFingerprintRegistered] = useState(false);
  const [bioFaceRegistered, setBioFaceRegistered] = useState(false);

  useEffect(() => {
    isBiometricSupported().then(async (ok) => {
      setBioSupported(ok);
      setBioFingerprintRegistered(await hasRegistered("fingerprint"));
      setBioFaceRegistered(await hasRegistered("face"));
    });
  }, []);

  const [formData, setFormData] = useState({
    phone: "",
    aadhaar: "",
    passkey: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    console.log("[v0] Login page auth check:", { user: !!user, profile: !!profile, userRole: profile?.role });
    if (!authLoading && user && profile) {
      const targetRoute = roleHomeRoutes[profile.role as AppRole] || "/farmer/dashboard";
      console.log("[v0] Redirecting to:", targetRoute);
      navigate(targetRoute, { replace: true });
    }
  }, [authLoading, user, profile, navigate]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsLogin(true);
    setFormData({ phone: "", aadhaar: "", passkey: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast({ title: "Too Many Attempts", description: "Please wait before trying again", variant: "destructive" });
      return;
    }

    if (loginAttempts >= 5) {
      setIsBlocked(true);
      toast({ title: "Account Temporarily Locked", description: "Too many failed attempts.", variant: "destructive" });
      return;
    }

    const cleanAadhaar = formData.aadhaar.replace(/\s/g, "");

    if (!formData.phone || formData.phone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    if (!/^\d{12}$/.test(cleanAadhaar)) {
      toast({ title: "Invalid Aadhaar", description: "Please enter a valid 12-digit Aadhaar number", variant: "destructive" });
      return;
    }

    if (!formData.passkey || formData.passkey.length < 4) {
      toast({ title: "Invalid Passkey", description: "Passkey must be at least 4 characters", variant: "destructive" });
      return;
    }

    if (!isLogin) {
      setLoading(true);
      const { error } = await signUpWithAadhaar(cleanAadhaar, formData.passkey, {
        first_name: `User ${cleanAadhaar.slice(-4)}`,
        role: (selectedRole || "farmer") as 'farmer' | 'merchant' | 'admin',
        phone_number: `+91${formData.phone}`,
      });

      if (error) {
        toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created!", description: "You are now logged in" });
      }
      setLoading(false);
    } else {
      setLoading(true);
      const { error } = await signInWithAadhaar(cleanAadhaar, formData.passkey);
      
      if (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        toast({ title: "Login Failed", description: `Invalid credentials.`, variant: "destructive" });
      } else {
        setLoginAttempts(0);
        toast({ title: "Success", description: "Welcome back!" });
      }
      setLoading(false);
    }
  };

  // ── Biometric handlers ──
  const handleBiometricLogin = async (kind: BiometricKind) => {
    if (!bioSupported) return;
    try {
      setLoading(true);
      const creds = await authenticateBiometric(kind);
      const { error } = await signInWithAadhaar(creds.aadhaar, creds.passkey);
      if (error) {
        toast({ title: "Login Failed", description: "Stored credentials invalid.", variant: "destructive" });
      } else {
        toast({ title: "Verified ✓", description: "Welcome back" });
      }
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricRegisterNow = async (kind: BiometricKind) => {
    const cleanAadhaar = formData.aadhaar.replace(/\s/g, "");
    if (cleanAadhaar.length !== 12 || !formData.passkey) {
      toast({ title: "Fill credentials", description: "Enter Aadhaar and Passkey first.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const { error } = await signInWithAadhaar(cleanAadhaar, formData.passkey);
      if (error) {
        toast({ title: "Invalid credentials", description: "Aadhaar/Passkey did not work.", variant: "destructive" });
        return;
      }
      await registerBiometric(kind, { aadhaar: cleanAadhaar, passkey: formData.passkey, label: cleanAadhaar });
      if (kind === "fingerprint") setBioFingerprintRegistered(true);
      else setBioFaceRegistered(true);
      toast({ title: "Registered ✓", description: "Next time, use biometrics to sign in." });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    { role: "farmer", title: t("auth.signin_farmer"), image: farmerImg, description: t("auth.farmer_desc") },
    { role: "merchant", title: t("auth.signin_merchant"), image: merchantImg, description: t("auth.merchant_desc") },
    { role: "admin", title: t("auth.signin_admin"), image: adminImg, description: t("auth.admin_desc") },
  ];

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background">
        <div className="tricolor-bar h-1.5" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => {
              const isDark = document.documentElement.classList.toggle("dark");
              localStorage.setItem("theme", isDark ? "dark" : "light");
            }}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <LanguageSelector />
          </div>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <AshokaChakra size={44} />
            </div>
            <h1 className="text-3xl font-bold text-gradient-tricolor mb-2">Farm Intellect</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("auth.welcome")}</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roleCards.map((card) => (
              <Card key={card.role} className="group cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" onClick={() => handleRoleSelect(card.role)}>
                <div className="relative h-48 overflow-hidden">
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <h3 className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow-lg">{card.title}</h3>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{card.description}</p>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">{t("common.continue")} →</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentRole = roleCards.find((r) => r.role === selectedRole);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-5">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => {
                const isDark = document.documentElement.classList.toggle("dark");
                localStorage.setItem("theme", isDark ? "dark" : "light");
              }}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <LanguageSelector />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <AshokaChakra size={32} />
            <h1 className="text-xl font-bold text-gradient-tricolor">Farm Intellect</h1>
          </div>
          <Card className="tricolor-card overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img src={currentRole?.image} alt={currentRole?.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-lg">{currentRole?.title}</h3>
            </div>
            <CardHeader className="text-center pb-4 pt-4">
              <CardTitle className="text-xl">{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Phone Number
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">+91</span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      className="rounded-l-none"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      required
                    />
                  </div>
                </div>

                {/* Aadhaar Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="aadhaar" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    Aadhaar Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Shield className="h-4 w-4 text-orange-500" />
                    </div>
                    <Input
                      id="aadhaar"
                      type="text"
                      placeholder="XXXX XXXX XXXX"
                      className="pl-10"
                      maxLength={14}
                      value={formData.aadhaar}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                        const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                        setFormData({ ...formData, aadhaar: formatted });
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Passkey */}
                <div className="space-y-1.5">
                  <Label htmlFor="passkey" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    Passkey
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <KeyRound className="h-4 w-4 text-primary" />
                    </div>
                    <Input
                      id="passkey"
                      type={showPasskey ? "text" : "password"}
                      placeholder="Enter your passkey"
                      className="pl-10 pr-10"
                      value={formData.passkey}
                      onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                      required
                      minLength={4}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPasskey(!showPasskey)}>
                      {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || isBlocked}>
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                  {isLogin ? "No account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>

              {/* Or continue with Biometrics */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>

              {bioSupported && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Set up biometric login after entering your credentials
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      className="h-16 py-0 flex-col gap-1 relative"
                      disabled={loading}
                      onClick={() => bioFingerprintRegistered ? handleBiometricLogin("fingerprint") : handleBiometricRegisterNow("fingerprint")}
                    >
                      <Fingerprint className={`h-6 w-6 ${bioFingerprintRegistered ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-xs font-medium">
                        {bioFingerprintRegistered ? "Fingerprint" : "Add Fingerprint"}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="h-16 py-0 flex-col gap-1 relative"
                      disabled={loading}
                      onClick={() => bioFaceRegistered ? handleBiometricLogin("face") : handleBiometricRegisterNow("face")}
                    >
                      <ScanFace className={`h-6 w-6 ${bioFaceRegistered ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-xs font-medium">
                        {bioFaceRegistered ? "Face ID" : "Add Face ID"}
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:block relative">
        <img src={currentRole?.image} alt={currentRole?.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      </div>
    </div>
  );
};

export default Login;
