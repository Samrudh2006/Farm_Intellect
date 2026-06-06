import { useAuth } from "@/contexts/AuthContext";
import { roleHomeRoutes, type AppRole } from "@/lib/roles";

type RoleGuardResult =
  | { status: "loading" }
  | { status: "unauthenticated"; redirectTo: string }
  | { status: "missing-profile" }
  | { status: "forbidden"; redirectTo: string }
  | { status: "allowed" };

export const useRoleGuard = (allowedRoles?: AppRole[]): RoleGuardResult => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return { status: "loading" };
  }

  if (!user) {
    return { status: "unauthenticated", redirectTo: "/login" };
  }

  // User is authenticated but profile hasn't resolved yet — treat as loading
  // to avoid a flash of "missing-profile" error screen between signIn and profile fetch.
  if (!profile) {
    return { status: "loading" };
  }

  if (!allowedRoles?.length) {
    return { status: "allowed" };
  }

  const role = profile.role as AppRole;
  if (!allowedRoles.includes(role)) {
    return { status: "forbidden", redirectTo: roleHomeRoutes[role] ?? "/login" };
  }

  return { status: "allowed" };
};
