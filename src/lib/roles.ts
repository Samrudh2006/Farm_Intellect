export type AppRole = "farmer" | "merchant" | "expert" | "admin";

export const roleHomeRoutes: Record<AppRole, string> = {
  farmer: "/farmer/dashboard",
  merchant: "/merchant/dashboard",
  expert: "/dashboard",
  admin: "/admin/dashboard",
};
