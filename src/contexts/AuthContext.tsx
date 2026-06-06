import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const aadhaarToEmail = (aadhaar: string) => `aadhaar_${aadhaar.replace(/\s/g, "")}@farmapp.local.io`;
const appRoles = ["farmer", "merchant", "expert", "admin"] as const;

const normalizeRole = (value: unknown): UserProfile["role"] => {
  return appRoles.includes(value as UserProfile["role"]) ? (value as UserProfile["role"]) : "farmer";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: SupabaseUser) => {
    try {
      const metadata = authUser.user_metadata || {};
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", authUser.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", authUser.id).maybeSingle(),
      ]);

      let { data: profileData, error: profileError } = profileResult;
      let { data: roleData, error: roleError } = roleResult;

      // If missing profile, try the RPC to repair/create it
      if (profileError || roleError || !profileData || !roleData) {
        const displayName = metadata.display_name || metadata.name || metadata.first_name || authUser.email?.split("@")[0] || "User";
        const requestedRole = normalizeRole(metadata.role);
        
        const { data: repairedRole, error: repairError } = await supabase.rpc("ensure_current_user_profile", {
          _display_name: displayName,
          _phone: metadata.phone_number || metadata.phone || null,
          _location: [metadata.district, metadata.state].filter(Boolean).join(", ") || metadata.location || metadata.state || null,
          _requested_role: requestedRole,
        });

        if (!repairError) {
          const retryProfile = await supabase.from("profiles").select("*").eq("user_id", authUser.id).maybeSingle();
          profileData = retryProfile.data;
          profileError = retryProfile.error;
          roleData = { role: repairedRole || requestedRole };
          roleError = null;
        } else {
          // FIX: If the RPC fails (e.g. migrations not pushed), gracefully fallback to using metadata 
          // so the user is not stuck on the login screen.
          console.warn("RPC ensure_current_user_profile failed or missing. Falling back to metadata-based profile.", repairError);
          profileData = {
            user_id: authUser.id,
            display_name: displayName,
            phone: metadata.phone_number || metadata.phone,
            location: metadata.state || null
          };
          profileError = null;
          roleData = { role: requestedRole };
          roleError = null;
        }
      }

      if (!profileError && !roleError && profileData) {
        const locationParts = profileData.location?.split(",") || [];
        const city = locationParts[0]?.trim();
        const state = locationParts[1]?.trim();

        const nextProfile: UserProfile = {
          id: profileData.user_id || authUser.id,
          first_name: profileData.display_name?.split(" ")[0] || undefined,
          last_name: profileData.display_name?.split(" ").slice(1).join(" ") || undefined,
          email: profileData.email || undefined,
          phone_number: profileData.phone || undefined,
          state: state || undefined,
          district: city || undefined,
          profile_picture_url: profileData.avatar_url || undefined,
          language_preference: "en",
          role: normalizeRole(roleData?.role),
        };
        setProfile(nextProfile);
        return nextProfile;
      }
      
      console.error("Profile loading failed completely:", { profileError, roleError });
      setProfile(null);
      return null;
    } catch (err) {
      console.error("Profile loading failed:", err);
      setProfile(null);
      return null;
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user);
          import("@/lib/firstLoginSeed").then((m) =>
            m.ensureFirstLoginSeed(session.user.id).catch(() => {}),
          );
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
        setLoading(true);
        try {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user);
            import("@/lib/firstLoginSeed").then((m) =>
              m.ensureFirstLoginSeed(session.user.id).catch(() => {}),
            );
          } else {
            setProfile(null);
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

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
