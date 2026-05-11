import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  role: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  profile: UserProfile | null;
  loading: boolean;
  signUpWithAadhaar: (aadhaar: string, passkey: string, metadata: { display_name: string; role: string; phone?: string; location?: string }) => Promise<{ error: Error | null }>;
  signInWithAadhaar: (aadhaar: string, passkey: string) => Promise<{ error: Error | null }>;
  signInWithPhoneOTP: (phone: string, role: string, name?: string) => Promise<{ otp: string; error: Error | null }>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Store pending OTPs in memory (simulation)
const pendingOTPs = new Map<string, { otp: string; password: string; expiresAt: number }>();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const aadhaarToEmail = (aadhaar: string) => `aadhaar_${aadhaar.replace(/\s/g, "")}@farmapp.local`;
const phoneToEmail = (phone: string) => `phone_${phone.replace(/\D/g, "")}@farmapp.local`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (profileData) {
        const nextProfile: UserProfile = {
          id: profileData.id,
          display_name: profileData.display_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          avatar_url: profileData.avatar_url || "",
          role: roleData?.role || "farmer",
        };
        setProfile(nextProfile);
        return nextProfile;
      }
      setProfile(null);
      return null;
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setLoading(true);
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithAadhaar = async (
    aadhaar: string,
    passkey: string,
    metadata: { display_name: string; role: string; phone?: string; location?: string }
  ) => {
    if (!hasSupabaseEnv) {
      return { error: new Error("Backend not configured") };
    }

    const email = aadhaarToEmail(aadhaar);

    const { error } = await supabase.auth.signUp({
      email,
      password: passkey,
      options: {
        data: { ...metadata, aadhaar: aadhaar.replace(/\s/g, "") },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) return { error: error as Error };

    return { error: null };
  };

  const signInWithAadhaar = async (aadhaar: string, passkey: string) => {
    if (!hasSupabaseEnv) {
      return { error: new Error("Backend not configured") };
    }

    const email = aadhaarToEmail(aadhaar);
    const { error } = await supabase.auth.signInWithPassword({ email, password: passkey });
    return { error: error ? (error as Error) : null };
  };

  const signInWithPhoneOTP = async (phone: string, role: string, name?: string) => {
    if (!hasSupabaseEnv) {
      return { otp: "", error: new Error("Backend not configured") };
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const email = phoneToEmail(cleanPhone);
    const otpArray = new Uint32Array(1);
    crypto.getRandomValues(otpArray);
    const generatedOTP = String(100000 + (otpArray[0] % 900000));
    const tempPassword = `otp_${generatedOTP}_${Date.now()}`;

    // Try to sign up first (new user)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: { display_name: name || cleanPhone, role, phone: `+91${cleanPhone}` },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError && !signUpError.message?.includes("already registered")) {
      // If already registered, we'll handle via password update after OTP verify
    }

    pendingOTPs.set(cleanPhone, {
      otp: generatedOTP,
      password: tempPassword,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return { otp: generatedOTP, error: null };
  };

  const verifyPhoneOTP = async (phone: string, otp: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const pending = pendingOTPs.get(cleanPhone);

    if (!pending || pending.otp !== otp) {
      return { error: new Error("Invalid OTP. Please try again.") };
    }

    if (Date.now() > pending.expiresAt) {
      pendingOTPs.delete(cleanPhone);
      return { error: new Error("OTP expired. Please request a new one.") };
    }

    const email = phoneToEmail(cleanPhone);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pending.password,
    });

    pendingOTPs.delete(cleanPhone);

    if (error) {
      return { error: error as Error };
    }

    return { error: null };
  };

  const signOut = async () => {
    if (hasSupabaseEnv) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem("farmer_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUpWithAadhaar,
      signInWithAadhaar,
      signInWithPhoneOTP,
      verifyPhoneOTP,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
