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
  signUpWithAadhaar: (aadhaar: string, passkey: string, metadata: { first_name: string; role: 'farmer' | 'merchant' | 'expert' | 'admin'; phone_number?: string; state?: string; district?: string; village?: string }) => Promise<{ error: Error | null; profile: UserProfile | null }>;
  signInWithAadhaar: (aadhaar: string, passkey: string) => Promise<{ error: Error | null; profile: UserProfile | null }>;
  signInWithPhoneOTP: (phone: string, role: string, name?: string) => Promise<{ otp: string; error: Error | null }>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Store pending OTPs in memory for simulated OTP
const pendingOTPs = new Map<string, { otp: string; password: string; expiresAt: number }>();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const aadhaarToEmail = (aadhaar: string) => `aadhaar_${aadhaar.replace(/\s/g, "")}@farmapp.local.io`;
const phoneToEmail = (phone: string) => `phone_${phone.replace(/\D/g, "")}@farmapp.local.io`;
const appRoles = ["farmer", "merchant", "expert", "admin"] as const;
const selfSelectableRoles = ["farmer", "merchant", "expert"] as const;
const rolePriority: Record<UserProfile["role"], number> = { admin: 0, expert: 1, merchant: 2, farmer: 3 };

const normalizeRole = (value: unknown): UserProfile["role"] => {
  return appRoles.includes(value as UserProfile["role"]) ? (value as UserProfile["role"]) : "farmer";
};

const normalizeRequestedRole = (value: unknown): UserProfile["role"] => {
  return selfSelectableRoles.includes(value as typeof selfSelectableRoles[number])
    ? (value as UserProfile["role"])
    : "farmer";
};

const selectHighestRole = (roles: Array<{ role: unknown }> | null | undefined): UserProfile["role"] | null => {
  const normalized = (roles || []).map((row) => normalizeRole(row.role));
  return normalized.sort((a, b) => rolePriority[a] - rolePriority[b])[0] || null;
};

const decodeJwtPayload = (token?: string | null) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return {
      sub: payload.sub,
      aud: payload.aud,
      role: payload.role,
      aal: payload.aal,
      amr: payload.amr,
      exp: payload.exp,
      iat: payload.iat,
      email_domain: typeof payload.email === "string" ? payload.email.split("@")[1] : undefined,
    };
  } catch (error) {
    console.warn("[auth-debug] Unable to decode JWT payload", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: SupabaseUser) => {
    try {
      const metadata = authUser.user_metadata || {};
      const displayName = metadata.display_name || metadata.name || metadata.first_name || authUser.email?.split("@")[0] || "User";
      const requestedRole = normalizeRequestedRole(metadata.role);
      const location = metadata.location || metadata.state || null;
      const phone = metadata.phone_number || metadata.phone || null;
      const { data: sessionData } = await supabase.auth.getSession();
      const jwtPayload = decodeJwtPayload(sessionData.session?.access_token);

      console.info("[auth-debug] frontend profile load started", {
        user_id: authUser.id,
        email_domain: authUser.email?.split("@")[1],
        requested_role: requestedRole,
        jwt: jwtPayload,
      });

      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", authUser.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", authUser.id),
      ]);

      let profileData = profileResult.data;
      let resolvedRole = selectHighestRole(roleResult.data as Array<{ role: unknown }> | null);

      console.info("[auth-debug] frontend profile query completed", {
        user_id: authUser.id,
        profile_exists: Boolean(profileData),
        role_exists: Boolean(resolvedRole),
        role: resolvedRole,
        profile_error: profileResult.error?.message,
        role_error: roleResult.error?.message,
      });

      if (!profileData || !resolvedRole || profileResult.error || roleResult.error) {
        console.warn("[auth-debug] backend profile repair required", {
          user_id: authUser.id,
          profile_exists: Boolean(profileData),
          role_exists: Boolean(resolvedRole),
          requested_role: requestedRole,
        });

        const { data: repairedRole, error: repairError } = await supabase.rpc("ensure_current_user_profile", {
          _display_name: displayName,
          _phone: phone,
          _location: location,
          _requested_role: requestedRole,
        });

        console.info("[auth-debug] backend profile repair completed", {
          user_id: authUser.id,
          repaired_role: repairedRole,
          repair_error: repairError?.message,
        });

        if (!repairError) {
          const [repairedProfileResult, repairedRoleResult] = await Promise.all([
            supabase.from("profiles").select("*").eq("user_id", authUser.id).maybeSingle(),
            supabase.from("user_roles").select("role").eq("user_id", authUser.id),
          ]);
          profileData = repairedProfileResult.data || profileData;
          resolvedRole = normalizeRole(repairedRole || selectHighestRole(repairedRoleResult.data as Array<{ role: unknown }> | null) || requestedRole);
        }
      }

      profileData = profileData || {
        user_id: authUser.id,
        display_name: displayName,
        email: authUser.email,
        phone,
        location,
        avatar_url: null,
      };

      resolvedRole = resolvedRole || requestedRole;

      const locationParts = profileData.location ? String(profileData.location).split(",") : [];
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
        role: normalizeRole(resolvedRole),
      };

      console.info("[auth-debug] frontend profile resolved", {
        user_id: authUser.id,
        role: nextProfile.role,
        profile_exists: Boolean(profileData),
        target_ready: true,
      });
      
      setProfile(nextProfile);
      return nextProfile;
    } catch (err) {
      console.error("Profile loading failed:", err);
      // Even on catastrophic error, return a minimal profile to unblock login
      const fallbackProfile: UserProfile = {
        id: authUser.id,
        first_name: "User",
        role: "farmer"
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.info("[auth-debug] auth initialization", {
          has_session: Boolean(session),
          user_id: session?.user?.id,
          jwt: decodeJwtPayload(session?.access_token),
        });
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user);
            import("@/lib/firstLoginSeed").then((m) =>
              m.ensureFirstLoginSeed(session.user.id).catch(() => {})
            );
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // We handle the initial session with getSession above to avoid race conditions
        if (event === 'INITIAL_SESSION') return;

        if (!mounted) return;

        console.info("[auth-debug] auth state changed", {
          event,
          has_session: Boolean(session),
          user_id: session?.user?.id,
          jwt: decodeJwtPayload(session?.access_token),
        });

        setLoading(true);
        try {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user);
            import("@/lib/firstLoginSeed").then((m) =>
              m.ensureFirstLoginSeed(session.user.id).catch(() => {})
            );
          } else {
            setProfile(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUpWithAadhaar = async (
    aadhaar: string,
    passkey: string,
    metadata: { first_name: string; role: 'farmer' | 'merchant' | 'expert' | 'admin'; phone_number?: string; state?: string; district?: string; village?: string }
  ) => {
    const email = aadhaarToEmail(aadhaar);
    const safeRole = normalizeRequestedRole(metadata.role);

    console.info("[auth-debug] aadhaar signup started", {
      email_domain: email.split("@")[1],
      requested_role: safeRole,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password: passkey,
      options: {
        data: {
          ...metadata,
          display_name: metadata.first_name,
          name: metadata.first_name,
          role: safeRole,
          phone_number: metadata.phone_number,
          state: metadata.state
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("[auth-debug] aadhaar signup failed", { message: error.message, email_domain: email.split("@")[1] });
      const enhancedError = new Error(error.message);
      if (error.message?.includes("rate_limit")) {
        enhancedError.message = "Too many signup attempts. Please wait a few minutes and try again.";
      }
      return { error: enhancedError, profile: null };
    }

    if (data.user && !data.session) {
      console.warn("[auth-debug] signup returned user without session; attempting immediate sign-in", { user_id: data.user.id });
      const signInResult = await supabase.auth.signInWithPassword({ email, password: passkey });
      if (signInResult.error || !signInResult.data.session || !signInResult.data.user) {
        return { error: new Error("Account was created, but the session did not open. Email auto-confirm is now enabled; please sign in once with the same Aadhaar and passkey."), profile: null };
      }
      setSession(signInResult.data.session);
      setUser(signInResult.data.user);
      const repairedProfile = await fetchProfile(signInResult.data.user);
      return { error: null, profile: repairedProfile };
    }

    // Force profile fetch immediately so the frontend has it
    if (data.user) {
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
      const newProfile = await fetchProfile(data.user);
      console.info("[auth-debug] aadhaar signup completed", { user_id: data.user.id, role: newProfile.role });
      return { error: null, profile: newProfile };
    }

    return { error: null, profile: null };
  };

  const signInWithAadhaar = async (aadhaar: string, passkey: string) => {
    const email = aadhaarToEmail(aadhaar);
    console.info("[auth-debug] aadhaar signin started", { email_domain: email.split("@")[1] });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: passkey });
    
    if (error) {
      console.error("[auth-debug] aadhaar signin failed", { message: error.message, email_domain: email.split("@")[1] });
      return { error: error as Error, profile: null };
    }

    if (data.user && !data.session) {
      return {
        error: new Error(
          "Login blocked: the backend returned no active session. Email auto-confirm is enabled now; please retry once."
        ),
        profile: null,
      };
    }

    if (data.user && data.session) {
      setSession(data.session);
      setUser(data.user);
      const newProfile = await fetchProfile(data.user);
      console.info("[auth-debug] aadhaar signin completed", { user_id: data.user.id, role: newProfile.role });
      return { error: null, profile: newProfile };
    }

    return { error: null, profile: null };
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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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

    if (signUpError && !signUpError.message?.toLowerCase().includes("already")) {
      return { otp: "", error: signUpError as Error };
    }

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
