import { getSecureItem, setSecureItem } from "@/lib/secure-storage";
import { useAuth } from "@/contexts/AuthContext";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";

export type CurrentUserRole = "farmer" | "merchant" | "expert" | "admin";

export interface CurrentUser {
  name: string;
  role: CurrentUserRole;
  email?: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

export const useCurrentUser = (): {
  user: CurrentUser;
  updateUser: (updates: Partial<CurrentUser>) => Promise<void>;
  logout: () => Promise<void>;
} => {
  const { profile, user: authUser, signOut, refreshProfile } = useAuth();

  const user: CurrentUser = {
    name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : (authUser?.email?.split("@")[0] || "User"),
    role: (profile?.role as CurrentUserRole) || "farmer",
    email: profile?.email || authUser?.email || "",
    phone: profile?.phone_number || "",
    location: profile ? `${profile.district || ""}${profile.district && profile.state ? ", " : ""}${profile.state || ""}` : "",
  };

  const updateUser = async (updates: Partial<CurrentUser>) => {
    const profileUpdates: any = {};
    if (updates.name) {
      const parts = updates.name.split(" ");
      profileUpdates.first_name = parts[0] || "";
      profileUpdates.last_name = parts.slice(1).join(" ") || "";
    }
    if (updates.email) profileUpdates.email = updates.email;
    if (updates.phone) profileUpdates.phone_number = updates.phone;
    if (updates.location) {
      const parts = updates.location.split(",");
      profileUpdates.district = parts[0]?.trim() || "";
      profileUpdates.state = parts[1]?.trim() || "";
    }

    const currentInfo = {
      name: updates.name ?? user.name,
      role: user.role,
      email: updates.email ?? profile?.email ?? authUser.email ?? "",
      phone: updates.phone ?? profile?.phone_number ?? "",
      location: updates.location ?? (profile ? `${profile.district || ""}${profile.district && profile.state ? ", " : ""}${profile.state || ""}` : ""),
    };

    if (!hasSupabaseEnv) {
      const parsed = getSecureItem<any>("mock_user_session", null);
      if (parsed) {
        try {
          const nameParts = (updates.name || "").split(" ");
          const firstName = nameParts[0] || parsed.profile.first_name;
          const lastName = nameParts.slice(1).join(" ") || parsed.profile.last_name;
          
          const newProfile = {
            ...parsed.profile,
            first_name: firstName,
            last_name: lastName,
            email: updates.email || parsed.profile.email,
            phone_number: updates.phone || parsed.profile.phone_number,
            state: updates.location?.split(",")[1]?.trim() || parsed.profile.state,
            district: updates.location?.split(",")[0]?.trim() || parsed.profile.district,
          };
          setSecureItem("mock_user_session", {
            user: parsed.user,
            profile: newProfile,
          });
        } catch (e) {
          console.error("Failed to update mock session", e);
        }
      }
      await refreshProfile();
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("user_id", authUser.id);

    if (error) {
      throw error;
    }

    await refreshProfile();
  };

  const logout = () => {
    return signOut();
  };

  return { user, updateUser, logout };
};
