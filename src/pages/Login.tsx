import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { useToast } from "@/hooks/use-toast";
import { FirebaseAuth } from "@/integrations/firebase/client";
import heroImage from "@/assets/hero-farming.jpg";
import farmerImg from "@/assets/roles/farmer-role.jpg";
import merchantImg from "@/assets/roles/merchant-role.jpg";
import expertImg from "@/assets/roles/expert-role.jpg";
import adminImg from "@/assets/roles/admin-role.jpg";

const LOCAL_AUTH_SESSION_KEY = "local_auth_session_v1";
const PASSKEY_STORE_KEY = "passkey_credentials_v1";

interface StoredPasskeyCredential {
  aadhaar: string;
  credentialId: string;
  role: string;
  phone: string;
  displayName: string;
  location: string;
}

const toBase64Url = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const randomChallenge = (length = 32) => {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge;
};

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [loginMethod, setLoginMethod] = useState<"sms" | "whatsapp">("sms");
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    location: "",
    aadhaar: "",
  });
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setFormData({ phone: "", name: "", location: "", aadhaar: "" });
    setOtp(["", "", "", "", "", ""]);
  };

  const aadhaarDigits = formData.aadhaar.replace(/\D/g, "");

  const getStoredCredentials = (): StoredPasskeyCredential[] => {
    const raw = localStorage.getItem(PASSKEY_STORE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveStoredCredentials = (credentials: StoredPasskeyCredential[]) => {
    localStorage.setItem(PASSKEY_STORE_KEY, JSON.stringify(credentials));
  };

  const completeLocalLogin = (method: "passkey" | "sms-otp", roleOverride?: string) => {
    const activeRole = roleOverride || selectedRole || "farmer";
    const session = {
      id: `local-${aadhaarDigits || formData.phone}`,
      role: activeRole,
      displayName: formData.name || `Farmer ${formData.phone.slice(-4)}`,
      phone: formData.phone ? `+91${formData.phone}` : "",
      location: formData.location || "",
      aadhaar: aadhaarDigits,
      authMethod: method,
    };

    localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("local-auth-changed"));

    const routes: Record<string, string> = {
      farmer: "/farmer/dashboard",
      merchant: "/merchant/dashboard",
      expert: "/expert/dashboard",
      admin: "/admin/dashboard",
    };

    navigate(routes[activeRole] || "/farmer/dashboard");
  };

  const createPasskey = async () => {
    if (!("credentials" in navigator) || !window.PublicKeyCredential) {
      toast({
        title: "Passkeys not supported",
        description: "This browser or device does not support passkeys yet.",
        variant: "destructive",
      });
      return;
    }

    if (aadhaarDigits.length !== 12) {
      toast({
        title: "Aadhaar required",
        description: "Please enter a valid 12-digit Aadhaar number before creating passkey.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole || !formData.phone || !formData.name || !formData.location) {
      toast({
        title: "Missing details",
        description: "Name, location, phone, and role are required to create your passkey.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const challenge = randomChallenge();
      const userId = new TextEncoder().encode(`aadhaar:${aadhaarDigits}`);
      const credential = await navigator.credentials.create({
        publicKey: {
          rp: { name: "Smart Crop Advisory" },
          user: {
            id: userId,
            name: `${aadhaarDigits}@farmer.local`,
            displayName: formData.name,
          },
          challenge,
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      });

      if (!credential || !(credential instanceof PublicKeyCredential)) {
        throw new Error("Passkey creation was cancelled.");
      }

      const nextCredential: StoredPasskeyCredential = {
        aadhaar: aadhaarDigits,
        credentialId: toBase64Url(credential.rawId),
        role: selectedRole,
        phone: formData.phone,
        displayName: formData.name,
        location: formData.location,
      };

      const existing = getStoredCredentials().filter((item) => item.aadhaar !== aadhaarDigits);
      saveStoredCredentials([...existing, nextCredential]);
      toast({ title: "Passkey created", description: "You can now login securely with Aadhaar + passkey." });
      completeLocalLogin("passkey");
    } catch (error: any) {
      toast({
        title: "Could not create passkey",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithPasskey = async () => {
    if (!("credentials" in navigator) || !window.PublicKeyCredential) {
      toast({
        title: "Passkeys not supported",
        description: "This browser or device does not support passkeys yet.",
        variant: "destructive",
      });
      return;
    }

    if (aadhaarDigits.length !== 12) {
      toast({
        title: "Aadhaar required",
        description: "Enter your 12-digit Aadhaar to find your passkey.",
        variant: "destructive",
      });
      return;
    }

    const credential = getStoredCredentials().find((item) => item.aadhaar === aadhaarDigits);
    if (!credential) {
      toast({
        title: "No passkey found",
        description: "Create a passkey first using Sign up mode for this Aadhaar number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: randomChallenge(),
          allowCredentials: [{ id: new Uint8Array(fromBase64Url(credential.credentialId)), type: "public-key" }],
          userVerification: "preferred",
          timeout: 60000,
        },
      });

      setFormData((prev) => ({
        ...prev,
        phone: prev.phone || credential.phone,
        name: prev.name || credential.displayName,
        location: prev.location || credential.location,
      }));
      setSelectedRole(credential.role);
      toast({ title: "Passkey verified", description: "Welcome back!" });
      completeLocalLogin("passkey", credential.role);
    } catch (error: any) {
      toast({
        title: "Passkey login failed",
        description: error?.message || "Please try again or use OTP fallback.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast({ title: t("auth.invalid_phone"), description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    const phoneNumber = `+91${formData.phone}`;
    setLoading(true);

    try {
      await FirebaseAuth.sendOTP(phoneNumber, "recaptcha-container");
      setOtpSent(true);
      setResendTimer(30);
      toast({ 
        title: t("auth.otp_sent"), 
        description: loginMethod === "whatsapp" ? "OTP requested via WhatsApp fallback (currently delivered through phone OTP provider)." : "OTP sent via SMS" 
      });
    } catch (error: any) {
      console.error("OTP Error:", error);
      let errorMessage = "Failed to send OTP";
      
      if (error.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === "auth/quota-exceeded") {
        errorMessage = "SMS quota exceeded. Please try again later.";
      }
      
      toast({ title: t("auth.error"), description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({ title: t("auth.enter_otp"), description: "Please enter all 6 digits", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const user = await FirebaseAuth.verifyOTP(otpCode);
      
      if (user) {
        completeLocalLogin("sms-otp");
        toast({ title: t("auth.login_success"), description: t("auth.welcome_back") });
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      let errorMessage = "Invalid OTP";
      
      if (error.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid OTP code. Please try again.";
      } else if (error.code === "auth/code-expired") {
        errorMessage = "OTP has expired. Please request a new one.";
      }
      
      toast({ title: t("auth.error"), description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6 - index).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, "");
      setOtp(newOtp);
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || formData.phone.length < 10) {
      toast({ title: t("auth.invalid_phone"), description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    if (!isLogin && (!formData.name || !formData.location)) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    await sendOTP();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && otp.join("").length === 6 && otpSent) {
        verifyOTP();
      }
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

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background">
        <div className="tricolor-bar h-1.5" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end gap-2 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const isDark = document.documentElement.classList.toggle("dark");
                localStorage.setItem("theme", isDark ? "dark" : "light");
              }}
              aria-label="Toggle dark mode"
            >
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
                  onClick={verifyOTP}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading || otp.join("").length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-5">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" onClick={() => setSelectedRole(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const isDark = document.documentElement.classList.toggle("dark");
                  localStorage.setItem("theme", isDark ? "dark" : "light");
                }}
                aria-label="Toggle dark mode"
              >
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
                        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        {t("auth.fullname")}
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <Input id="name" placeholder={t("auth.enter_name")} className="pl-10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {t("auth.location")}
                      </Label>
                      <Input 
                        id="location" 
                        placeholder="Search your village/city..." 
                        value={formData.location} 
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                        required 
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                      <path d="M12.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                      <path d="M8.5 7h-1c-.28 0-.5.22-.5.5v7c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5v-7c0-.28-.22-.5-.5-.5zm7 0h-1c-.28 0-.5.22-.5.5v7c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5v-7c0-.28-.22-.5-.5-.5z"/>
                    </svg>
                    {t("auth.phone")}
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">+91</span>
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                          <path d="M12.5 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                          <path d="M8.5 7h-1c-.28 0-.5.22-.5.5v7c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5v-7c0-.28-.22-.5-.5-.5zm7 0h-1c-.28 0-.5.22-.5.5v7c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5v-7c0-.28-.22-.5-.5-.5z"/>
                        </svg>
                      </div>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="9876543210" 
                        className="pl-10 rounded-l-none" 
                        maxLength={10}
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} 
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aadhaar" className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
                      <circle cx="7.5" cy="9.5" r="1.5"/>
                      <path d="M7.5 13h2v4h-2zm4-6h7v2h-7zm0 4h7v2h-7zm4-2h3v2h-3z"/>
                      <rect x="5" y="15" width="14" height="2"/>
                    </svg>
                    Aadhaar Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
                        <circle cx="7.5" cy="9.5" r="1.5"/>
                        <path d="M7.5 13h2v4h-2zm4-6h7v2h-7zm0 4h7v2h-7zm4-2h3v2h-3z"/>
                        <rect x="5" y="15" width="14" height="2"/>
                      </svg>
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
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {t("common.loading")}
                    </span>
                  ) : isLogin ? "Continue with OTP" : "Send OTP for verification"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={loading}
                  onClick={isLogin ? loginWithPasskey : createPasskey}
                >
                  {isLogin ? "Login with Passkey + Aadhaar" : "Create Passkey + Save Login"}
                </Button>
              </form>

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

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" className="h-14 py-0" onClick={() => { setLoginMethod("sms"); sendOTP(); }}>
                  <svg className="h-7 w-7 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
                  </svg>
                  <span className="ml-2">SMS OTP</span>
                </Button>
                <Button variant="outline" type="button" className="h-14 py-0" onClick={() => { setLoginMethod("whatsapp"); sendOTP(); }}>
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="ml-2">WhatsApp</span>
                </Button>
              </div>

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
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
