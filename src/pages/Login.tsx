import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sun, Moon, Shield, Phone, MessageCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-farming.jpg";
import farmerImg from "@/assets/roles/farmer-role.jpg";
import merchantImg from "@/assets/roles/merchant-role.jpg";
import expertImg from "@/assets/roles/expert-role.jpg";
import adminImg from "@/assets/roles/admin-role.jpg";

type LoginMethodType = "aadhaar" | "phone" | "whatsapp";

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, signUpWithAadhaar, signInWithAadhaar, signInWithPhoneOTP, verifyPhoneOTP, signOut } = useAuth();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(false); // Start with signup
  const [loginMethod, setLoginMethod] = useState<LoginMethodType>("aadhaar");
  const [loading, setLoading] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    aadhaar: "",
    passkey: "",
    confirmPasskey: "",
    phone: "",
    name: "",
    location: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      const routes: Record<string, string> = {
        farmer: "/farmer/dashboard",
        merchant: "/merchant/dashboard",
        expert: "/expert/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(routes[profile.role] || "/farmer/dashboard");
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsLogin(false);
    setOtpSent(false);
    setLoginMethod("aadhaar");
    setFormData({ aadhaar: "", passkey: "", confirmPasskey: "", phone: "", name: "", location: "" });
    setOtp(["", "", "", "", "", ""]);
  };

  const resetForm = () => {
    setFormData({ aadhaar: "", passkey: "", confirmPasskey: "", phone: "", name: "", location: "" });
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setGeneratedOtp("");
  };

  // ── Aadhaar + Passkey ──
  const handleAadhaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = formData.aadhaar.replace(/\s/g, "");

    if (cleanAadhaar.length !== 12) {
      toast({ title: "Invalid Aadhaar", description: "Please enter a valid 12-digit Aadhaar number", variant: "destructive" });
      return;
    }

    if (!formData.passkey || formData.passkey.length < 4) {
      toast({ title: "Invalid Passkey", description: "Passkey must be at least 4 characters", variant: "destructive" });
      return;
    }

    if (!isLogin) {
      // Signup
      if (formData.passkey !== formData.confirmPasskey) {
        toast({ title: "Passkey Mismatch", description: "Passkeys do not match", variant: "destructive" });
        return;
      }
      if (!formData.name) {
        toast({ title: "Name Required", description: "Please enter your full name", variant: "destructive" });
        return;
      }

      setLoading(true);
      const { error } = await signUpWithAadhaar(cleanAadhaar, formData.passkey, {
        display_name: formData.name,
        role: selectedRole || "farmer",
        phone: formData.phone ? `+91${formData.phone}` : undefined,
        location: formData.location || undefined,
      });

      if (error) {
        toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "🎉 Account Created!", description: "You are now logged in" });
      }
      setLoading(false);
    } else {
      // Login
      setLoading(true);
      const { error } = await signInWithAadhaar(cleanAadhaar, formData.passkey);
      if (error) {
        toast({ title: "Login Failed", description: "Invalid Aadhaar or Passkey. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "✅ Welcome Back!", description: "Login successful" });
      }
      setLoading(false);
    }
  };

  // ── Phone / WhatsApp OTP ──
  const sendPhoneOTP = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { otp: code, error } = await signInWithPhoneOTP(
      formData.phone,
      selectedRole || "farmer",
      formData.name || undefined
    );

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOtpSent(true);
      setResendTimer(30);
      setGeneratedOtp(code);
      toast({
        title: loginMethod === "whatsapp" ? "📱 WhatsApp OTP Sent" : "📲 SMS OTP Sent",
        description: `Your OTP is: ${code} (Demo mode)`,
        duration: 15000,
      });
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({ title: "Enter OTP", description: "Please enter all 6 digits", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await verifyPhoneOTP(formData.phone, otpCode);
    if (error) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Verified!", description: "Login successful" });
    }
    setLoading(false);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6 - index).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, "");
      setOtp(newOtp);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && otp.join("").length === 6 && otpSent) handleVerifyOTP();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [otp, otpSent]);

  const roleCards = [
    { role: "farmer", title: t("auth.signin_farmer"), image: farmerImg, description: t("auth.farmer_desc") },
    { role: "merchant", title: t("auth.signin_merchant"), image: merchantImg, description: t("auth.merchant_desc") },
    { role: "expert", title: t("auth.signin_expert"), image: expertImg, description: t("auth.expert_desc") },
    { role: "admin", title: t("auth.signin_admin"), image: adminImg, description: t("auth.admin_desc") },
  ];

  // ── Role Selection Screen ──
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background">
        <div className="tricolor-bar h-1.5" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => {
              const isDark = document.documentElement.classList.toggle("dark");
              localStorage.setItem("theme", isDark ? "dark" : "light");
            }} aria-label="Toggle dark mode">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <LanguageSelector />
          </div>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <AshokaChakra size={44} />
            </div>
            <h1 className="text-3xl font-bold text-gradient-tricolor mb-2">Smart Crop Advisory</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("auth.welcome")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
        <div className="tricolor-bar h-1.5 mt-12" />
      </div>
    );
  }

  const currentRole = roleCards.find((r) => r.role === selectedRole);

  // ── OTP Verification Screen ──
  if (otpSent) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md space-y-5">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); }} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> {t("common.back")}
              </Button>
              <LanguageSelector />
            </div>
            <Card className="tricolor-card overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {loginMethod === "whatsapp" ? (
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Phone className="h-8 w-8 text-primary" />
                  )}
                </div>
                <CardTitle className="text-xl">Verify OTP</CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to +91 {formData.phone}
                  {loginMethod === "whatsapp" && " via WhatsApp"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedOtp && (
                  <div className="bg-accent/50 border border-accent rounded-lg p-3 mb-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Demo Mode — Your OTP</p>
                    <p className="text-2xl font-mono font-bold tracking-widest text-primary">{generatedOtp}</p>
                  </div>
                )}
                <div className="flex justify-center gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-14 text-center text-xl font-bold"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    />
                  ))}
                </div>
                <Button onClick={handleVerifyOTP} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || otp.join("").length !== 6}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : "Verify & Login"}
                </Button>
                <div className="mt-4 text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer}s</p>
                  ) : (
                    <button onClick={sendPhoneOTP} className="text-sm text-primary hover:underline">Resend OTP</button>
                  )}
                </div>
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
  }

  // ── Main Login/Signup Form ──
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-5">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" onClick={() => { setSelectedRole(null); resetForm(); }} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => {
                const isDark = document.documentElement.classList.toggle("dark");
                localStorage.setItem("theme", isDark ? "dark" : "light");
              }} aria-label="Toggle dark mode">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <LanguageSelector />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <AshokaChakra size={32} />
            <h1 className="text-xl font-bold text-gradient-tricolor">Smart Crop Advisory</h1>
          </div>

          {/* Login Method Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={loginMethod === "aadhaar" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2.5"
              onClick={() => { setLoginMethod("aadhaar"); resetForm(); }}
            >
              <Shield className="h-4 w-4" />
              <span className="text-xs">Aadhaar</span>
            </Button>
            <Button
              variant={loginMethod === "phone" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2.5"
              onClick={() => { setLoginMethod("phone"); resetForm(); }}
            >
              <Phone className="h-4 w-4" />
              <span className="text-xs">Phone OTP</span>
            </Button>
            <Button
              variant={loginMethod === "whatsapp" ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2.5"
              onClick={() => { setLoginMethod("whatsapp"); resetForm(); }}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>

          <Card className="tricolor-card overflow-hidden">
            <div className="relative h-32 overflow-hidden">
              <img src={currentRole?.image} alt={currentRole?.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-lg">{currentRole?.title}</h3>
            </div>
            <CardHeader className="text-center pb-3 pt-4">
              <CardTitle className="text-lg">
                {loginMethod === "aadhaar" ? (
                  isLogin ? "Login with Aadhaar + Passkey" : "Create Account with Aadhaar"
                ) : loginMethod === "phone" ? (
                  "Login with Phone OTP"
                ) : (
                  "Login with WhatsApp OTP"
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {loginMethod === "aadhaar"
                  ? isLogin
                    ? "Enter your Aadhaar number and passkey to login"
                    : "Create your account — your passkey will be used for future logins"
                  : `OTP will be sent to your ${loginMethod === "whatsapp" ? "WhatsApp" : "phone"} number`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ── Aadhaar + Passkey Form ── */}
              {loginMethod === "aadhaar" && (
                <form onSubmit={handleAadhaarSubmit} className="space-y-3.5">
                  {!isLogin && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm">Full Name *</Label>
                        <Input id="name" placeholder="Enter your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location" className="text-sm">Village / City</Label>
                        <Input id="location" placeholder="Your village or city name" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-phone" className="text-sm">Phone Number</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">+91</span>
                          <Input id="signup-phone" type="tel" placeholder="9876543210" className="rounded-l-none" maxLength={10} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="aadhaar" className="text-sm flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-orange-500" />
                      Aadhaar Number *
                    </Label>
                    <Input
                      id="aadhaar"
                      type="text"
                      placeholder="XXXX XXXX XXXX"
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

                  <div className="space-y-1.5">
                    <Label htmlFor="passkey" className="text-sm flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-primary" />
                      {isLogin ? "Passkey *" : "Create Passkey *"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="passkey"
                        type={showPasskey ? "text" : "password"}
                        placeholder={isLogin ? "Enter your passkey" : "Create a passkey (min 4 chars)"}
                        value={formData.passkey}
                        onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                        required
                        minLength={4}
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPasskey(!showPasskey)}>
                        {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {!isLogin && (
                      <p className="text-[11px] text-muted-foreground">Remember this passkey — you'll use it every time you login</p>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-passkey" className="text-sm">Confirm Passkey *</Label>
                      <Input
                        id="confirm-passkey"
                        type={showPasskey ? "text" : "password"}
                        placeholder="Re-enter your passkey"
                        value={formData.confirmPasskey}
                        onChange={(e) => setFormData({ ...formData, confirmPasskey: e.target.value })}
                        required
                        minLength={4}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {t("common.loading")}
                      </span>
                    ) : isLogin ? "Login with Aadhaar" : "Create Account"}
                  </Button>
                </form>
              )}

              {/* ── Phone / WhatsApp OTP Form ── */}
              {(loginMethod === "phone" || loginMethod === "whatsapp") && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-phone" className="text-sm flex items-center gap-2">
                      {loginMethod === "whatsapp" ? (
                        <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Phone className="h-3.5 w-3.5 text-primary" />
                      )}
                      Phone Number *
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">+91</span>
                      <Input
                        id="otp-phone"
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
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-name" className="text-sm">Your Name (optional for first login)</Label>
                    <Input id="otp-name" placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <Button onClick={sendPhoneOTP} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        {loginMethod === "whatsapp" ? <MessageCircle className="h-4 w-4 mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
                        Send OTP via {loginMethod === "whatsapp" ? "WhatsApp" : "SMS"}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Toggle login/signup for Aadhaar method */}
              {loginMethod === "aadhaar" && (
                <div className="mt-5 text-center">
                  <button type="button" onClick={() => { setIsLogin(!isLogin); setFormData({ ...formData, passkey: "", confirmPasskey: "" }); }} className="text-sm text-primary hover:underline">
                    {isLogin ? "New here? Create an Account" : "Already have an account? Login"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden lg:block relative">
        <img src={currentRole?.image} alt={currentRole?.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-3 mb-3">
            <AshokaChakra size={32} animate={false} className="drop-shadow-lg [&_circle]:fill-white [&_line]:stroke-white" />
            <h2 className="text-3xl font-bold text-white">{currentRole?.title}</h2>
          </div>
          <p className="text-lg text-white/90">{currentRole?.description}</p>
          <div className="tricolor-bar h-1 mt-4 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Login;
