import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import { FirebaseAuth } from "@/integrations/firebase/client";
import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";
import type { User as FirebaseUser } from "firebase/auth";

const LOCAL_AUTH_SESSION_KEY = "local_auth_session_v1";

interface LocalUser {
  id: string;
  email?: string;
  phone?: string;
}

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
  user: SupabaseUser | FirebaseUser | LocalUser | null;
  session: SupabaseSession | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { display_name: string; role: string; phone?: string; location?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ confirmationResult: any; error: Error | null }>;
  verifyOTP: (otp: string, confirmationResult: any) => Promise<{ user: FirebaseUser; error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isFirebaseUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | FirebaseUser | LocalUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseUser, setIsFirebaseUser] = useState(false);

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
        const nextProfile = {
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
      if (isFirebaseUser) {
        const firebaseUser = user as FirebaseUser;
        setProfile({
          id: firebaseUser.uid,
          display_name: firebaseUser.phoneNumber || "User",
          email: "",
          phone: firebaseUser.phoneNumber || "",
          location: "",
          avatar_url: "",
          role: "farmer",
        });
      } else if ((user as LocalUser).id?.startsWith("local-")) {
        const localAuthRaw = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
        if (localAuthRaw) {
          const localAuth = JSON.parse(localAuthRaw);
          setProfile({
            id: localAuth.id,
            display_name: localAuth.displayName || "User",
            email: localAuth.email || "",
            phone: localAuth.phone || "",
            location: localAuth.location || "",
            avatar_url: "",
            role: localAuth.role || "farmer",
          });
        }
      } else {
        await fetchProfile((user as SupabaseUser).id);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = FirebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsFirebaseUser(true);
        setProfile({
          id: firebaseUser.uid,
          display_name: firebaseUser.phoneNumber || "User",
          email: "",
          phone: firebaseUser.phoneNumber || "",
          location: "",
          avatar_url: "",
          role: "farmer",
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const hydrateLocalAuth = () => {
      const localAuthRaw = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
      if (!localAuthRaw) return;

      try {
        const localAuth = JSON.parse(localAuthRaw);
        setUser({
          id: localAuth.id,
          email: localAuth.email || "",
          phone: localAuth.phone || "",
        });
        setSession(null);
        setIsFirebaseUser(false);
        setProfile({
          id: localAuth.id,
          display_name: localAuth.displayName || "User",
          email: localAuth.email || "",
          phone: localAuth.phone || "",
          location: localAuth.location || "",
          avatar_url: "",
          role: localAuth.role || "farmer",
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to parse local auth session:", error);
      }
    };

    hydrateLocalAuth();
    window.addEventListener("local-auth-changed", hydrateLocalAuth);
    return () => window.removeEventListener("local-auth-changed", hydrateLocalAuth);
  }, []);

  useEffect(() => {
    if (isFirebaseUser) return;
    if (!hasSupabaseEnv) {
      const localAuthRaw = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
      if (localAuthRaw) {
        setLoading(false);
        return;
      }
      setLoading(false);
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsFirebaseUser(false);
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
      setIsFirebaseUser(false);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isFirebaseUser]);

  const signUp = async (
    email: string,
    password: string,
    metadata: { display_name: string; role: string; phone?: string; location?: string }
  ) => {
    if (!hasSupabaseEnv) {
      return {
        error: new Error("Supabase environment variables are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."),
      };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseEnv) {
      return {
        error: new Error("Supabase environment variables are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."),
      };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const result = await FirebaseAuth.sendOTP(phone, "recaptcha-container");
      return { confirmationResult: result, error: null };
    } catch (error: any) {
      return { confirmationResult: null, error: error as Error | null };
    }
  };

  const verifyOTP = async (otp: string, confirmationResult: any) => {
    try {
      const user = await FirebaseAuth.verifyOTP(otp);
      return { user, error: null };
    } catch (error: any) {
      return { user: null as any, error: error as Error | null };
    }
  };

  const signOut = async () => {
    if (isFirebaseUser) {
      await FirebaseAuth.signOut();
      setUser(null);
      setProfile(null);
      setIsFirebaseUser(false);
    } else if (hasSupabaseEnv) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } else {
      localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
      setSession(null);
      setUser(null);
      setProfile(null);
    }
    localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      signUp, 
      signIn, 
      signInWithPhone,
      verifyOTP,
      signOut, 
      refreshProfile,
      isFirebaseUser 
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
