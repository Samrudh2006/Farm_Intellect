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

  if (!allowedRoles?.length) {
    return { status: "allowed" };
  }

  if (!profile) {
    return { status: "missing-profile" };
  }

  const role = profile.role as AppRole;
  if (!allowedRoles.includes(role)) {
    return { status: "forbidden", redirectTo: roleHomeRoutes[role] || "/farmer/dashboard" };
  }

  return { status: "allowed" };
};
