import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sun, Moon, Shield, Phone, MessageCircle, Eye, EyeOff, KeyRound, ChevronDown, Fingerprint, ScanFace, AlertTriangle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { indianStates, getCitiesByState } from "@/data/indianLocations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logSecurityEvent } from "@/lib/securityMonitoring";
import farmerImg from "@/assets/roles/farmer-role.jpg";
import merchantImg from "@/assets/roles/merchant-role.jpg";
import expertImg from "@/assets/roles/expert-role.jpg";
import adminImg from "@/assets/roles/admin-role.jpg";

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, signUpWithAadhaar, signInWithAadhaar, signInWithPhoneOTP, verifyPhoneOTP } = useAuth();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"sms" | "whatsapp">("sms");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot passkey state
  const [forgotPasskeyMode, setForgotPasskeyMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<"phone" | "otp" | "new-passkey">("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPasskey, setNewPasskey] = useState("");
  const [confirmNewPasskey, setConfirmNewPasskey] = useState("");

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Biometric (WebAuthn) state
  const [bioSupported, setBioSupported] = useState(false);
  const [bioFingerprintRegistered, setBioFingerprintRegistered] = useState(false);
  const [bioFaceRegistered, setBioFaceRegistered] = useState(false);
  const [bioRegisterOnSignup, setBioRegisterOnSignup] = useState<BiometricKind[]>([]);

  useEffect(() => {
    isBiometricSupported().then(async (ok) => {
      setBioSupported(ok);
      setBioFingerprintRegistered(await hasRegistered("fingerprint"));
      setBioFaceRegistered(await hasRegistered("face"));
    });
  }, []);

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
    setIsLogin(true);
    setOtpSent(false);
    setForgotPasskeyMode(false);
    setForgotStep("phone");
    setFormData({ aadhaar: "", passkey: "", confirmPasskey: "", phone: "", name: "", location: "" });
    setOtp(["", "", "", "", "", ""]);
  };

  // ── Aadhaar + Passkey submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (isBlocked) {
      toast({ 
        title: "Too Many Attempts", 
        description: "Please wait 15 minutes before trying again", 
        variant: "destructive" 
      });
      logSecurityEvent({
        eventType: "LOGIN_BLOCKED_RATE_LIMIT",
        severity: "high",
        description: "User exceeded login attempts"
      });
      return;
    }

    if (loginAttempts >= 5) {
      setIsBlocked(true);
      toast({ 
        title: "Account Temporarily Locked", 
        description: "Too many failed login attempts. Please try again later.", 
        variant: "destructive" 
      });
      logSecurityEvent({
        eventType: "LOGIN_ATTEMPTS_EXCEEDED",
        severity: "high",
        description: "User exceeded 5 login attempts"
      });
      return;
    }

    // TODO: Turnstile verification (once configured)
    // if (!turnstileToken) {
    //   toast({ 
    //     title: "Bot Verification Required", 
    //     description: "Please complete the Cloudflare verification", 
    //     variant: "destructive" 
    //   });
    //   return;
    // }

    const cleanAadhaar = formData.aadhaar.replace(/\s/g, "");

    // Validate Aadhaar format
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      logSecurityEvent({
        eventType: "LOGIN_INVALID_AADHAAR",
        severity: "low",
        description: "Invalid Aadhaar format attempted"
      });
      toast({ title: t("auth.invalid_phone"), description: "Please enter a valid 12-digit Aadhaar number", variant: "destructive" });
      return;
    }

    // Validate passkey strength
    if (!formData.passkey || formData.passkey.length < 4) {
      toast({ title: "Invalid Passkey", description: "Passkey must be at least 4 characters", variant: "destructive" });
      return;
    }

    if (!isLogin) {
      if (formData.passkey !== formData.confirmPasskey) {
        toast({ title: "Passkey Mismatch", description: "Passkeys do not match", variant: "destructive" });
        return;
      }
      if (!formData.name) {
        toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
        return;
      }

      setLoading(true);
      const { error } = await signUpWithAadhaar(cleanAadhaar, formData.passkey, {
        first_name: formData.name,
        role: (selectedRole || "farmer") as 'farmer' | 'merchant' | 'expert' | 'admin',
        phone_number: formData.phone ? `+91${formData.phone}` : undefined,
        state: formData.location || undefined,
      });

      if (error) {
        console.error("[v0] Signup failed:", error.message);
        toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      } else {
        console.log("[v0] Signup successful, waiting for profile load...");
        toast({ title: "🎉 Account Created!", description: "You are now logged in" });
        // Optionally register biometric right after signup
        if (bioRegisterOnSignup.length > 0 && bioSupported) {
          for (const kind of bioRegisterOnSignup) {
            try {
              await registerBiometric(kind, {
                aadhaar: cleanAadhaar,
                passkey: formData.passkey,
                label: formData.name || cleanAadhaar,
              });
              if (kind === "fingerprint") setBioFingerprintRegistered(true);
              else setBioFaceRegistered(true);
            } catch (err: any) {
              toast({
                title: kind === "face" ? "Face registration skipped" : "Fingerprint registration skipped",
                description: err.message,
                variant: "destructive",
              });
            }
          }
          toast({
            title: "Biometric registration completed",
            description: "You can now login with fingerprint or login with face on this device.",
          });
        }
      }
      setLoading(false);
    } else {
      setLoading(true);
      const { error } = await signInWithAadhaar(cleanAadhaar, formData.passkey);
      
      if (error) {
        // Track failed login attempt
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        console.error("[v0] Login failed:", error.message);
        logSecurityEvent({
          eventType: "LOGIN_FAILED",
          severity: "medium",
          description: `Failed login attempt #${newAttempts}`,
          details: { attemptNumber: newAttempts }
        });
        
        toast({ 
          title: "Login Failed", 
          description: `Invalid credentials. ${5 - newAttempts} attempts remaining.`, 
          variant: "destructive" 
        });
      } else {
        // Reset attempts on successful login
        setLoginAttempts(0);
        console.log("[v0] Login successful, waiting for profile load...");
        toast({ title: t("auth.login_success"), description: t("auth.welcome_back") });
        logSecurityEvent({
          eventType: "LOGIN_SUCCESS",
          severity: "low",
          description: "Successful login"
        });
        // Navigation will be handled by the useEffect that watches user/profile
      }
      setLoading(false);
    }
  };

  // ── Biometric handlers ──
  const handleBiometricLogin = async (kind: BiometricKind) => {
    if (!bioSupported) {
      toast({ title: "Not supported", description: "This device/browser does not support biometric login.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const creds = await authenticateBiometric(kind);
      const { error } = await signInWithAadhaar(creds.aadhaar, creds.passkey);
      if (error) {
        toast({ title: "Login Failed", description: "Stored credentials no longer valid. Please re-register.", variant: "destructive" });
      } else {
        toast({ title: kind === "face" ? "Face verified ✓" : "Fingerprint verified ✓", description: t("auth.welcome_back") });
      }
    } catch (err: any) {
      toast({ title: "Biometric login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricRegisterNow = async (kind: BiometricKind) => {
    const cleanAadhaar = formData.aadhaar.replace(/\s/g, "");
    if (cleanAadhaar.length !== 12 || !formData.passkey) {
      toast({ title: "Fill credentials first", description: "Enter your Aadhaar and Passkey above, then tap to register.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      // Verify credentials are valid before storing them locally
      const { error } = await signInWithAadhaar(cleanAadhaar, formData.passkey);
      if (error) {
        toast({ title: "Invalid credentials", description: "Cannot register biometric — Aadhaar/Passkey did not work.", variant: "destructive" });
        return;
      }
      await registerBiometric(kind, {
        aadhaar: cleanAadhaar,
        passkey: formData.passkey,
        label: formData.name || cleanAadhaar,
      });
      if (kind === "fingerprint") setBioFingerprintRegistered(true);
      else setBioFaceRegistered(true);
      toast({
        title: kind === "face" ? "Face ID registered ✓" : "Fingerprint registered ✓",
        description: "Next time, just tap the icon to sign in.",
      });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Used during SIGNUP form — registers biometric locally without requiring an existing account.
  // Credentials are bound to the Aadhaar/Passkey the user is about to sign up with.
  const handleSignupBiometricRegister = async (kind: BiometricKind) => {
    const cleanAadhaar = formData.aadhaar.replace(/\s/g, "");
    if (cleanAadhaar.length !== 12) {
      toast({ title: "Enter Aadhaar first", description: "Fill the 12-digit Aadhaar above before registering.", variant: "destructive" });
      return;
    }
    if (!formData.passkey || formData.passkey.length < 4) {
      toast({ title: "Enter Passkey first", description: "Create a passkey (min 4 chars) above before registering.", variant: "destructive" });
      return;
    }
    if (formData.confirmPasskey && formData.passkey !== formData.confirmPasskey) {
      toast({ title: "Passkey Mismatch", description: "Passkeys do not match", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await registerBiometric(kind, {
        aadhaar: cleanAadhaar,
        passkey: formData.passkey,
        label: formData.name || cleanAadhaar,
      });
      if (kind === "fingerprint") setBioFingerprintRegistered(true);
      else setBioFaceRegistered(true);
      toast({
        title: kind === "face" ? "Face registered ✓" : "Fingerprint registered ✓",
        description: "Now click Sign Up to finish creating your account.",
      });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Real SMS OTP via edge function ──
  const sendRealOTP = async (phone: string, purpose: string) => {
    const fullPhone = `+91${phone.replace(/\D/g, "")}`;
    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { phone: fullPhone, purpose },
    });
    if (error || !data?.success) {
      throw new Error(data?.error || error?.message || "Failed to send OTP");
    }
  };

  // ── Phone / WhatsApp OTP (now uses real SMS) ──
  const sendOTP = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast({ title: t("auth.invalid_phone"), description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await sendRealOTP(formData.phone, "login");

      // Also create the simulated session for Supabase auth
      await signInWithPhoneOTP(formData.phone, selectedRole || "farmer", formData.name || undefined);

      setOtpSent(true);
      setResendTimer(30);
      toast({
        title: loginMethod === "whatsapp" ? "OTP sent via WhatsApp" : t("auth.otp_sent"),
        description: `OTP sent to +91 ${formData.phone}`,
      });
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || "Failed to send OTP", variant: "destructive" });
    }
    setLoading(false);
  };

  const verifyOTPCode = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({ title: t("auth.enter_otp"), description: "Please enter all 6 digits", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Verify against real OTP in database
      const fullPhone = `+91${formData.phone.replace(/\D/g, "")}`;
      const { data, error: verifyError } = await supabase.functions.invoke("verify-otp", {
        body: { phone: fullPhone, code: otpCode, purpose: "login" },
      });

      if (verifyError || !data?.verified) {
        toast({ title: t("auth.error"), description: data?.error || "Invalid OTP. Please try again.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Now sign in via Supabase auth
      const { error } = await verifyPhoneOTP(formData.phone, otp.join(""));
      if (error) {
        // If the simulated OTP doesn't match, try signing in fresh
        const { otp: newCode } = await signInWithPhoneOTP(formData.phone, selectedRole || "farmer");
        if (newCode) {
          await verifyPhoneOTP(formData.phone, newCode);
        }
      }
      toast({ title: t("auth.login_success"), description: t("auth.welcome_back") });
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || "Verification failed", variant: "destructive" });
    }
    setLoading(false);
  };

  // ── Forgot Passkey Flow ──
  const handleForgotSendOTP = async () => {
    if (!forgotPhone || forgotPhone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await sendRealOTP(forgotPhone, "reset-passkey");
      setForgotStep("otp");
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      toast({ title: "OTP Sent", description: `Verification code sent to +91 ${forgotPhone}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send OTP", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleForgotVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({ title: "Enter OTP", description: "Please enter all 6 digits", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${forgotPhone.replace(/\D/g, "")}`;
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone: fullPhone, code: otpCode, purpose: "reset-passkey" },
      });

      if (error || !data?.verified) {
        toast({ title: "Invalid OTP", description: data?.error || "Invalid or expired OTP", variant: "destructive" });
        setLoading(false);
        return;
      }

      setResetToken(data.reset_token);
      setForgotStep("new-passkey");
      toast({ title: "Verified!", description: "Now set your new passkey" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Verification failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleResetPasskey = async () => {
    if (!newPasskey || newPasskey.length < 6) {
      toast({ title: "Invalid Passkey", description: "Passkey must be at least 6 characters with a letter and a digit", variant: "destructive" });
      return;
    }
    if (!/[a-zA-Z]/.test(newPasskey) || !/\d/.test(newPasskey)) {
      toast({ title: "Weak Passkey", description: "Passkey must contain at least one letter and one digit", variant: "destructive" });
      return;
    }
    if (newPasskey !== confirmNewPasskey) {
      toast({ title: "Mismatch", description: "Passkeys do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${forgotPhone.replace(/\D/g, "")}`;
      const { data, error } = await supabase.functions.invoke("reset-passkey", {
        body: { phone: fullPhone, reset_token: resetToken, new_passkey: newPasskey },
      });

      if (error || !data?.success) {
        toast({ title: "Error", description: data?.error || "Failed to reset passkey", variant: "destructive" });
        setLoading(false);
        return;
      }

      toast({ title: "✅ Passkey Reset!", description: "You can now login with your new passkey" });
      setForgotPasskeyMode(false);
      setForgotStep("phone");
      setNewPasskey("");
      setConfirmNewPasskey("");
      setForgotPhone("");
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Reset failed", variant: "destructive" });
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
      if (e.key === "Enter" && otp.join("").length === 6) {
        if (otpSent) verifyOTPCode();
        else if (forgotPasskeyMode && forgotStep === "otp") handleForgotVerifyOTP();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [otp, otpSent, forgotPasskeyMode, forgotStep]);

  const roleCards = [
    { role: "farmer", title: t("auth.signin_farmer"), image: farmerImg, description: t("auth.farmer_desc") },
    { role: "merchant", title: t("auth.signin_merchant"), image: merchantImg, description: t("auth.merchant_desc") },
    { role: "expert", title: t("auth.signin_expert"), image: expertImg, description: t("auth.expert_desc") },
    { role: "admin", title: t("auth.signin_admin"), image: adminImg, description: t("auth.admin_desc") },
  ];

  // ── Role Selection ──
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

  // ── Forgot Passkey Screen ──
  if (forgotPasskeyMode) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md space-y-5">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={() => {
                setForgotPasskeyMode(false);
                setForgotStep("phone");
                setOtp(["", "", "", "", "", ""]);
              }} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> {t("common.back")}
              </Button>
              <LanguageSelector />
            </div>
            <Card className="tricolor-card overflow-hidden">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">
                  {forgotStep === "phone" && "Forgot Passkey"}
                  {forgotStep === "otp" && "Verify OTP"}
                  {forgotStep === "new-passkey" && "Set New Passkey"}
                </CardTitle>
                <CardDescription>
                  {forgotStep === "phone" && "Enter your registered phone number to receive a verification code"}
                  {forgotStep === "otp" && `Enter the 6-digit code sent to +91 ${forgotPhone}`}
                  {forgotStep === "new-passkey" && "Create a new passkey for your account"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {forgotStep === "phone" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="forgot-phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Registered Phone Number
                      </Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">+91</span>
                        <Input
                          id="forgot-phone"
                          type="tel"
                          placeholder="9876543210"
                          className="rounded-l-none"
                          maxLength={10}
                          value={forgotPhone}
                          onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleForgotSendOTP}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={loading || forgotPhone.length < 10}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : "Send OTP to Phone"}
                    </Button>
                  </>
                )}

                {forgotStep === "otp" && (
                  <>
                    <div className="flex justify-center gap-2 mb-4">
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
                    <Button
                      onClick={handleForgotVerifyOTP}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={loading || otp.join("").length !== 6}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : "Verify OTP"}
                    </Button>
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer}s</p>
                      ) : (
                        <button onClick={handleForgotSendOTP} className="text-sm text-primary hover:underline">
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </>
                )}

                {forgotStep === "new-passkey" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="new-passkey" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-primary" />
                        New Passkey
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <KeyRound className="h-4 w-4 text-primary" />
                        </div>
                        <Input
                          id="new-passkey"
                          type={showPasskey ? "text" : "password"}
                          placeholder="Enter new passkey (min 4 chars)"
                          className="pl-10 pr-10"
                          value={newPasskey}
                          onChange={(e) => setNewPasskey(e.target.value)}
                          minLength={4}
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPasskey(!showPasskey)}>
                          {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-new-passkey" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-primary" />
                        Confirm New Passkey
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <KeyRound className="h-4 w-4 text-primary" />
                        </div>
                        <Input
                          id="confirm-new-passkey"
                          type={showPasskey ? "text" : "password"}
                          placeholder="Re-enter new passkey"
                          className="pl-10"
                          value={confirmNewPasskey}
                          onChange={(e) => setConfirmNewPasskey(e.target.value)}
                          minLength={4}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleResetPasskey}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={loading || newPasskey.length < 4}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Resetting...
                        </span>
                      ) : "Reset Passkey"}
                    </Button>
                  </>
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
  }

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
                <CardTitle className="text-xl">Verify OTP</CardTitle>
                <CardDescription>Enter the 6-digit code sent to +91 {formData.phone}</CardDescription>
              </CardHeader>
              <CardContent>
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
                <Button
                  onClick={verifyOTPCode}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading || otp.join("").length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {t("common.loading")}
                    </span>
                  ) : "Verify & Login"}
                </Button>
                <div className="mt-4 text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer}s</p>
                  ) : (
                    <button onClick={sendOTP} className="text-sm text-primary hover:underline">
                      Resend OTP
                    </button>
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
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="gap-2">
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <AshokaChakra size={32} />
            <h1 className="text-xl font-bold text-gradient-tricolor">Smart Crop Advisory</h1>
          </div>
          <Card className="tricolor-card overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img src={currentRole?.image} alt={currentRole?.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-white font-bold text-xl drop-shadow-lg">{currentRole?.title}</h3>
            </div>
            <CardHeader className="text-center pb-4 pt-4">
              <CardTitle className="text-xl">{isLogin ? t("auth.signin") : t("auth.signup")}</CardTitle>
              <CardDescription>{isLogin ? t("auth.signin_desc") : t("auth.signup_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        {t("auth.fullname")}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <Input id="name" placeholder={t("auth.enter_name")} className="pl-10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-destructive" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {t("auth.location")}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={selectedState} onValueChange={(val) => {
                          setSelectedState(val);
                          setSelectedCity("");
                          setFormData(prev => ({ ...prev, location: val }));
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {indianStates.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedCity}
                          onValueChange={(val) => {
                            setSelectedCity(val);
                            setFormData(prev => ({ ...prev, location: `${val}, ${selectedState}` }));
                          }}
                          disabled={!selectedState}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {getCitiesByState(selectedState).map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    {t("auth.phone")}
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
                    {isLogin ? "Passkey" : "Create Passkey"}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <KeyRound className="h-4 w-4 text-primary" />
                    </div>
                    <Input
                      id="passkey"
                      type={showPasskey ? "text" : "password"}
                      placeholder={isLogin ? "Enter your passkey" : "Create a passkey (min 4 chars)"}
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
                  {!isLogin && (
                    <p className="text-[11px] text-muted-foreground">Remember this passkey — you'll use it every time you login</p>
                  )}
                </div>

                {/* Confirm Passkey (signup only) */}
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-passkey" className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-primary" />
                      Confirm Passkey
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <KeyRound className="h-4 w-4 text-primary" />
                      </div>
                      <Input
                        id="confirm-passkey"
                        type={showPasskey ? "text" : "password"}
                        placeholder="Re-enter your passkey"
                        className="pl-10"
                        value={formData.confirmPasskey}
                        onChange={(e) => setFormData({ ...formData, confirmPasskey: e.target.value })}
                        required
                        minLength={4}
                      />
                    </div>
                  </div>
                )}

                {/* Bot Protection - Cloudflare Turnstile (placeholder while configuring) */}
                {isBlocked && (
                  <div className="flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/30 p-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-destructive">
                      <p className="font-medium">Account Temporarily Locked</p>
                      <p className="text-xs mt-1">Too many failed login attempts. Please try again in 15 minutes.</p>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || isBlocked}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {t("common.loading")}
                    </span>
                  ) : isBlocked ? "Account Locked" : isLogin ? t("auth.signin") : t("auth.signup")}
                </Button>
              </form>

              {/* Forgot Passkey link */}
              {isLogin && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasskeyMode(true);
                      setForgotStep("phone");
                      setForgotPhone(formData.phone || "");
                    }}
                    className="text-sm text-destructive hover:underline font-medium"
                  >
                    {t("auth.forgot_passkey")}
                  </button>
                </div>
              )}

              {/* Or continue with */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t("auth.or_continue_with")}
                  </span>
                </div>
              </div>

              {!bioSupported ? (
                <p className="text-xs text-center text-muted-foreground">
                  {t("auth.biometric_not_supported")}
                </p>
              ) : isLogin ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    className="h-14 py-0 flex-col gap-0.5"
                    disabled={loading}
                    onClick={() =>
                      bioFingerprintRegistered
                        ? handleBiometricLogin("fingerprint")
                        : handleBiometricRegisterNow("fingerprint")
                    }
                  >
                    <Fingerprint className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium">

                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="h-14 py-0 flex-col gap-0.5"
                    disabled={loading}
                    onClick={() =>
                      bioFaceRegistered
                        ? handleBiometricLogin("face")
                        : handleBiometricRegisterNow("face")
                    }
                  >
                    <ScanFace className="h-6 w-6 text-secondary-foreground" />
                    <span className="text-xs font-medium">

                    </span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">

                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"

                    >
                      <Fingerprint className="h-6 w-6 text-primary" />
                      <span className="text-xs font-medium">

                      </span>
                    </Button>
                    <Button
                      type="button"

                    >
                      <ScanFace className="h-6 w-6 text-secondary-foreground" />
                      <span className="text-xs font-medium">

                      </span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-5 text-center">
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                  {isLogin ? t("auth.no_account") : t("auth.have_account")}
                </button>
              </div>
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
