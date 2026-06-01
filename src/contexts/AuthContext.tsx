import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  state?: string;
  district?: string;
  village?: string;
  profile_picture_url?: string;
  bio?: string;
  language_preference?: string;
  role: 'farmer' | 'merchant' | 'expert' | 'admin';
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  profile: UserProfile | null;
  loading: boolean;
  signUpWithAadhaar: (aadhaar: string, passkey: string, metadata: { first_name: string; role: 'farmer' | 'merchant' | 'expert' | 'admin'; phone_number?: string; state?: string; district?: string; village?: string }) => Promise<{ error: Error | null }>;
  signInWithAadhaar: (aadhaar: string, passkey: string) => Promise<{ error: Error | null }>;
  signInWithPhoneOTP: (phone: string, role: string, name?: string) => Promise<{ otp: string; error: Error | null }>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Store pending OTPs in memory for simulated OTP
const pendingOTPs = new Map<string, { otp: string; password: string; expiresAt: number }>();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const aadhaarToEmail = (aadhaar: string) => `aadhaar_${aadhaar.replace(/\\s/g, "")}@farmapp.local.io`;
const phoneToEmail = (phone: string) => `phone_${phone.replace(/\\D/g, "")}@farmapp.local.io`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId).single(),
      ]);

      const { data: profileData, error: profileError } = profileResult;
      const { data: roleData } = roleResult;

      if (profileError) {
        setProfile(null);
        return null;
      }

      if (profileData) {
        const locationParts = profileData.location?.split(",").map((s: string) => s.trim()) || [];
        const city = locationParts[0];
        const state = locationParts[1];

        const nextProfile: UserProfile = {
          id: profileData.user_id,
          first_name: profileData.display_name?.split(" ")[0] || undefined,
          last_name: profileData.display_name?.split(" ").slice(1).join(" ") || undefined,
          email: profileData.email || undefined,
          phone_number: profileData.phone || undefined,
          state: state || undefined,
          district: city || undefined,
          profile_picture_url: profileData.avatar_url || undefined,
          language_preference: "en",
          role: (roleData?.role || "farmer") as 'farmer' | 'merchant' | 'expert' | 'admin',
        };
        setProfile(nextProfile);
        return nextProfile;
      }
      setProfile(null);
      return null;
    } catch (err) {
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
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Auth setup error:", err);
      } finally {
        setLoading(false);
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithAadhaar = async (
    aadhaar: string,
    passkey: string,
    metadata: { first_name: string; role: 'farmer' | 'merchant' | 'expert' | 'admin'; phone_number?: string; state?: string; district?: string; village?: string }
  ) => {
    const email = aadhaarToEmail(aadhaar);

    const { error } = await supabase.auth.signUp({
      email,
      password: passkey,
      options: {
        data: {
          ...metadata,
          display_name: metadata.first_name,
          name: metadata.first_name,
          role: metadata.role,
          phone_number: metadata.phone_number,
          state: metadata.state
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      const enhancedError = new Error(error.message);
      if (error.message?.includes("rate_limit")) {
        enhancedError.message = "Too many signup attempts. Please wait a few minutes and try again.";
      }
      return { error: enhancedError };
    }

    return { error: null };
  };

  const signInWithAadhaar = async (aadhaar: string, passkey: string) => {
    const email = aadhaarToEmail(aadhaar);
    const { error } = await supabase.auth.signInWithPassword({ email, password: passkey });
    return { error: error ? (error as Error) : null };
  };

  // Keep simulated OTP for Phone numbers since Twilio is not enabled in this project
  const signInWithPhoneOTP = async (phone: string, role: 'farmer' | 'merchant' | 'expert' | 'admin', name?: string) => {
    const cleanPhone = phone.replace(/\\D/g, "");
    const email = phoneToEmail(cleanPhone);
    const otpArray = new Uint32Array(1);
    crypto.getRandomValues(otpArray);
    const generatedOTP = String(100000 + (otpArray[0] % 900000));
    const tempPassword = `otp_${generatedOTP}_${Date.now()}`;

    // Try to sign up first
    await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          first_name: name || cleanPhone,
          display_name: name || cleanPhone,
          name: name || cleanPhone,
          role,
          phone_number: `+91${cleanPhone}`
        },
        emailRedirectTo: window.location.origin,
      },
    });

    pendingOTPs.set(cleanPhone, {
      otp: generatedOTP,
      password: tempPassword,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return { otp: generatedOTP, error: null };
  };

  const verifyPhoneOTP = async (phone: string, otpCode: string) => {
    const cleanPhone = phone.replace(/\\D/g, "");
    const pending = pendingOTPs.get(cleanPhone);

    if (!pending || pending.otp !== otpCode) {
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
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
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

export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  return context;
};
