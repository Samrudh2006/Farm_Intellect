import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
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
  signUpWithAadhaar: (aadhaar: string, passkey: string, metadata: { display_name: string; role: string; phone?: string; location?: string }) => Promise<{ error: Error | null }>;
  signInWithAadhaar: (aadhaar: string, passkey: string) => Promise<{ error: Error | null }>;
  signInWithPhoneOTP: (phone: string, role: string, name?: string) => Promise<{ otp: string; error: Error | null }>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Store pending OTPs in memory (simulation)
const pendingOTPs = new Map<string, { otp: string; password: string; expiresAt: number }>();
const BACKEND_NOT_CONFIGURED_ERROR =
  "Backend not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in .env.";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const aadhaarToEmail = (aadhaar: string) => `aadhaar_${aadhaar.replace(/\s/g, "")}@farmapp.local.io`;
const phoneToEmail = (phone: string) => `phone_${phone.replace(/\D/g, "")}@farmapp.local.io`;

const MOCK_PROFILES: Record<string, { role: 'farmer' | 'merchant' | 'expert' | 'admin'; first_name: string; last_name: string; email: string; phone: string; location: string }> = {
  "123412341234": { role: "farmer", first_name: "Rajesh", last_name: "Kumar", email: "rajesh@farmapp.local.io", phone: "+919876543210", location: "Karnal, Haryana" },
  "222222222222": { role: "expert", first_name: "Dr. Kavita", last_name: "Sharma", email: "kavita@farmapp.local.io", phone: "+919876543211", location: "IARI, New Delhi" },
  "333333333333": { role: "merchant", first_name: "Anil", last_name: "Gupta", email: "anil@farmapp.local.io", phone: "+919876543212", location: "Mandi, Punjab" },
  "444444444444": { role: "admin", first_name: "System", last_name: "Administrator", email: "admin@farmapp.local.io", phone: "+919876543213", location: "New Delhi, Delhi" },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.debug("[v0] Fetching profile");
      if (!hasSupabaseEnv) {
        // Mock mode: retrieve from saved session or mock profiles
        const savedSession = localStorage.getItem("mock_user_session");
        if (savedSession) {
          try {
            const { profile: savedProfile } = JSON.parse(savedSession);
            if (savedProfile && savedProfile.id === userId) {
              setProfile(savedProfile);
              return savedProfile;
            }
          } catch (e) {
            console.error("Failed to parse mock session in fetchProfile", e);
          }
        }
        // Check registered mock users
        const mockUsers = JSON.parse(localStorage.getItem("mock_registered_users") || "{}");
        const matchedUser = Object.values(mockUsers).find((u: any) => u.profile?.id === userId) as any;
        if (matchedUser) {
          setProfile(matchedUser.profile);
          return matchedUser.profile;
        }
        // Check default profiles
        const cleanAadhaar = userId.replace("mock-user-", "");
        if (MOCK_PROFILES[cleanAadhaar]) {
          const demo = MOCK_PROFILES[cleanAadhaar];
          const nextProfile: UserProfile = {
            id: userId,
            first_name: demo.first_name,
            last_name: demo.last_name,
            email: demo.email,
            phone_number: demo.phone,
            state: demo.location.split(",")[1]?.trim(),
            district: demo.location.split(",")[0]?.trim(),
            role: demo.role,
          };
          setProfile(nextProfile);
          return nextProfile;
        }
        return null;
      }

      // Parallel fetch: get profile and role simultaneously
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId).single(),
      ]);

      const { data: profileData, error: profileError } = profileResult;
      const { data: roleData, error: roleError } = roleResult;

      if (profileError) {
        console.error("[v0] Error fetching profile:", profileError);
        setProfile(null);
        return null;
      }

      // Handle missing role data - log error instead of silently defaulting
      if (roleError) {
        console.warn("[v0] Warning: Role lookup failed, defaulting to farmer");
      }

      if (profileData) {
        console.debug("[v0] Profile loaded successfully");
        
        // Parse location: format is "city, state"
        const locationParts = profileData.location?.split(",").map(s => s.trim()) || [];
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
          village: undefined,
          profile_picture_url: profileData.avatar_url || undefined,
          bio: undefined,
          language_preference: "en",
          role: (roleData?.role || "farmer") as 'farmer' | 'merchant' | 'expert' | 'admin',
        };
        setProfile(nextProfile);
        return nextProfile;
      }
      console.warn("[v0] No profile data found");
      setProfile(null);
      return null;
    } catch (err) {
      console.error("[v0] Error fetching profile:", err);
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
      const savedSession = localStorage.getItem("mock_user_session");
      if (savedSession) {
        try {
          const { user: savedUser, profile: savedProfile } = JSON.parse(savedSession);
          setUser(savedUser);
          setProfile(savedProfile);
          setSession({
            access_token: "mock-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh-token",
            user: savedUser,
          } as any);
        } catch (e) {
          console.error("Failed to parse mock session", e);
        }
      }
      setLoading(false);
      return;
    }

    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("[v0] Auth setup error:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.debug("[v0] Auth state changed:", { event: _event, hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.debug("[v0] Fetching profile");
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
    if (!hasSupabaseEnv) {
      const cleanAadhaar = aadhaar.replace(/\s/g, "");
      const mockUsers = JSON.parse(localStorage.getItem("mock_registered_users") || "{}");
      
      if (MOCK_PROFILES[cleanAadhaar] || mockUsers[cleanAadhaar]) {
        return { error: new Error("This Aadhaar is already registered. Please sign in instead.") };
      }

      const mockUser = {
        id: `mock-user-${cleanAadhaar}`,
        email: `${cleanAadhaar}@farmapp.local.io`,
        phone: metadata.phone_number || "",
        user_metadata: metadata,
      } as any;

      const mockProfile: UserProfile = {
        id: mockUser.id,
        first_name: metadata.first_name,
        email: mockUser.email,
        phone_number: metadata.phone_number,
        state: metadata.state,
        district: metadata.district,
        village: metadata.village,
        role: metadata.role,
      };

      // Save user registry
      mockUsers[cleanAadhaar] = { passkey, user: mockUser, profile: mockProfile };
      localStorage.setItem("mock_registered_users", JSON.stringify(mockUsers));

      // Sign in automatically
      setUser(mockUser);
      setProfile(mockProfile);
      const mockSession = {
        access_token: "mock-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: mockUser,
      } as any;
      setSession(mockSession);
      localStorage.setItem("mock_user_session", JSON.stringify({ user: mockUser, profile: mockProfile }));

      return { error: null };
    }

    const email = aadhaarToEmail(aadhaar);

    const { error, data } = await supabase.auth.signUp({
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
      // Enhance error message for better UX
      const enhancedError = new Error(error.message);
      if (error.message?.includes("rate_limit")) {
        enhancedError.message = "Too many signup attempts. Please wait a few minutes and try again.";
      }
      return { error: enhancedError };
    }

    // Profile is auto-created via database trigger
    return { error: null };
  };

  const signInWithAadhaar = async (aadhaar: string, passkey: string) => {
    const cleanAadhaar = aadhaar.replace(/\s/g, "");

    if (!hasSupabaseEnv) {
      if (MOCK_PROFILES[cleanAadhaar]) {
        const demo = MOCK_PROFILES[cleanAadhaar];
        const defaultPasskey = cleanAadhaar.slice(-4);
        if (passkey !== defaultPasskey) {
          return { error: new Error("Invalid passkey. For demo users, the passkey is the last 4 digits of the Aadhaar.") };
        }

        const mockUser = {
          id: `mock-user-${cleanAadhaar}`,
          email: demo.email,
          phone: demo.phone,
          user_metadata: { first_name: demo.first_name, role: demo.role },
        } as any;

        const mockProfile: UserProfile = {
          id: mockUser.id,
          first_name: demo.first_name,
          last_name: demo.last_name,
          email: demo.email,
          phone_number: demo.phone,
          state: demo.location.split(",")[1]?.trim(),
          district: demo.location.split(",")[0]?.trim(),
          role: demo.role,
        };

        setUser(mockUser);
        setProfile(mockProfile);
        const mockSession = {
          access_token: "mock-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: mockUser,
        } as any;
        setSession(mockSession);
        localStorage.setItem("mock_user_session", JSON.stringify({ user: mockUser, profile: mockProfile }));

        return { error: null };
      }

      const mockUsers = JSON.parse(localStorage.getItem("mock_registered_users") || "{}");
      if (mockUsers[cleanAadhaar]) {
        const record = mockUsers[cleanAadhaar];
        if (record.passkey !== passkey) {
          return { error: new Error("Invalid passkey. Please try again.") };
        }

        setUser(record.user);
        setProfile(record.profile);
        const mockSession = {
          access_token: "mock-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: record.user,
        } as any;
        setSession(mockSession);
        localStorage.setItem("mock_user_session", JSON.stringify({ user: record.user, profile: record.profile }));

        return { error: null };
      }

      return { error: new Error("Aadhaar number not registered. Please sign up first.") };
    }

    const email = aadhaarToEmail(aadhaar);
    const { error } = await supabase.auth.signInWithPassword({ email, password: passkey });
    return { error: error ? (error as Error) : null };
  };

  const signInWithPhoneOTP = async (phone: string, role: 'farmer' | 'merchant' | 'expert' | 'admin', name?: string) => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!hasSupabaseEnv) {
      const generatedOTP = "123456";
      const tempPassword = `mock_otp_${generatedOTP}_${Date.now()}`;
      
      pendingOTPs.set(cleanPhone, {
        otp: generatedOTP,
        password: tempPassword,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      return { otp: generatedOTP, error: null };
    }

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

  const verifyPhoneOTP = async (phone: string, otpCode: string) => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!hasSupabaseEnv) {
      const pending = pendingOTPs.get(cleanPhone);
      if (!pending || pending.otp !== otpCode) {
        return { error: new Error("Invalid OTP. Please enter 123456.") };
      }

      if (Date.now() > pending.expiresAt) {
        pendingOTPs.delete(cleanPhone);
        return { error: new Error("OTP expired. Please request a new one.") };
      }

      pendingOTPs.delete(cleanPhone);

      const mockUser = {
        id: `mock-user-phone-${cleanPhone}`,
        email: `${cleanPhone}@farmapp.local.io`,
        phone: `+91${cleanPhone}`,
        user_metadata: { first_name: `User ${cleanPhone}`, role: "farmer" },
      } as any;

      const mockProfile: UserProfile = {
        id: mockUser.id,
        first_name: `User`,
        last_name: cleanPhone,
        email: mockUser.email,
        phone_number: mockUser.phone,
        role: "farmer",
      };

      const mockUsers = JSON.parse(localStorage.getItem("mock_registered_users") || "{}");
      const existingUser = Object.values(mockUsers).find((u: any) => u.profile?.phone_number === `+91${cleanPhone}`) as any;
      
      const finalProfile = existingUser ? existingUser.profile : mockProfile;
      const finalUser = existingUser ? existingUser.user : mockUser;

      setUser(finalUser);
      setProfile(finalProfile);
      const mockSession = {
        access_token: "mock-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh-token",
        user: finalUser,
      } as any;
      setSession(mockSession);
      localStorage.setItem("mock_user_session", JSON.stringify({ user: finalUser, profile: finalProfile }));

      return { error: null };
    }

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
    if (hasSupabaseEnv) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem("mock_user_session");
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

export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  return context;
};
