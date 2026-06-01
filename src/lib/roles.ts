export type AppRole = "farmer" | "merchant" | "admin";

export const roleHomeRoutes: Record<AppRole, string> = {
  farmer: "/farmer/dashboard",
  merchant: "/merchant/dashboard",
  admin: "/admin/dashboard",
};
