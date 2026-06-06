import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { AppRole } from "@/lib/roles";

export type LazyPage = LazyExoticComponent<ComponentType>;

type PublicRouteConfig = { path: string; component: LazyPage };
type ProtectedRouteConfig = { path: string; component: LazyPage; allowedRoles?: AppRole[] };

const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const FarmerDashboard = lazy(() => import("@/pages/FarmerDashboard"));
const MerchantDashboardPage = lazy(() => import("@/pages/MerchantDashboardPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const Login = lazy(() => import("@/pages/Login"));
const Crops = lazy(() => import("@/pages/Crops"));
const Advisory = lazy(() => import("@/pages/Advisory"));
const Weather = lazy(() => import("@/pages/Weather"));
const Sensors = lazy(() => import("@/pages/Sensors"));
const FieldMap = lazy(() => import("@/pages/FieldMap"));
const Merchants = lazy(() => import("@/pages/Merchants"));
const Polls = lazy(() => import("@/pages/Polls"));
const Schemes = lazy(() => import("@/pages/Schemes"));
const AIAdvisory = lazy(() => import("@/pages/AIAdvisory"));
const AICropScanner = lazy(() => import("@/pages/AICropScanner"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const MerchantFarmers = lazy(() => import("@/pages/merchant/MerchantFarmers"));
const MerchantMarketPrices = lazy(() => import("@/pages/merchant/MerchantMarketPrices"));
const MerchantRequirements = lazy(() => import("@/pages/merchant/MerchantRequirements"));
const MerchantNotifications = lazy(() => import("@/pages/merchant/MerchantNotifications"));
const MerchantOrders = lazy(() => import("@/pages/merchant/MerchantOrders"));
const FarmerKnowledgeHub = lazy(() => import("@/pages/farmer/FarmerKnowledgeHub"));
const FarmerRequirements = lazy(() => import("@/pages/farmer/FarmerRequirements"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminNotifications = lazy(() => import("@/pages/admin/AdminNotifications"));
const AdminChat = lazy(() => import("@/pages/admin/AdminChat"));
const AdminAuditLog = lazy(() => import("@/pages/admin/AdminAuditLog"));
const AdminSms = lazy(() => import("@/pages/admin/AdminSms"));

export const publicRoutes: PublicRouteConfig[] = [
  { path: "/", component: Index },
  { path: "/login", component: Login },
  { path: "/app", component: AppLauncher },
  { path: "/launch", component: AppLauncher },
  { path: "/reset-password", component: ResetPassword },
  { path: "/sms-register", component: SmsRegister },
];

export const protectedRoutes: ProtectedRouteConfig[] = [
  { path: "/farmer/dashboard", component: FarmerDashboard, allowedRoles: ["farmer"] },
  { path: "/farmer/crops", component: Crops, allowedRoles: ["farmer"] },
  { path: "/farmer/advisory", component: Advisory, allowedRoles: ["farmer"] },
  { path: "/farmer/weather", component: Weather, allowedRoles: ["farmer"] },
  { path: "/farmer/sensors", component: Sensors, allowedRoles: ["farmer"] },
  { path: "/farmer/field-map", component: FieldMap, allowedRoles: ["farmer"] },
  { path: "/farmer/merchants", component: Merchants, allowedRoles: ["farmer"] },
  { path: "/farmer/requirements", component: FarmerRequirements, allowedRoles: ["farmer"] },
  { path: "/farmer/polls", component: Polls, allowedRoles: ["farmer"] },
  { path: "/farmer/schemes", component: Schemes, allowedRoles: ["farmer"] },
  { path: "/farmer/ai-advisory", component: AIAdvisory, allowedRoles: ["farmer"] },
  { path: "/farmer/ai-crop-scanner", component: AICropScanner, allowedRoles: ["farmer"] },
  { path: "/farmer/chat", component: Chat, allowedRoles: ["farmer"] },
  { path: "/farmer/forum", component: Forum, allowedRoles: ["farmer"] },
  { path: "/farmer/calendar", component: Calendar, allowedRoles: ["farmer"] },
  { path: "/farmer/documents", component: Documents, allowedRoles: ["farmer"] },
  { path: "/farmer/notifications", component: Notifications, allowedRoles: ["farmer"] },
  { path: "/farmer/features", component: FarmFeatures, allowedRoles: ["farmer"] },
  { path: "/farmer/knowledge", component: FarmerKnowledgeHub, allowedRoles: ["farmer"] },
  { path: "/farmer/profile", component: Profile, allowedRoles: ["farmer"] },

  { path: "/merchant/dashboard", component: MerchantDashboardPage, allowedRoles: ["merchant"] },
  { path: "/merchant/farmers", component: MerchantFarmers, allowedRoles: ["merchant"] },
  { path: "/merchant/market-prices", component: MerchantMarketPrices, allowedRoles: ["merchant"] },
  { path: "/merchant/requirements", component: MerchantRequirements, allowedRoles: ["merchant"] },
  { path: "/merchant/notifications", component: MerchantNotifications, allowedRoles: ["merchant"] },
  { path: "/merchant/orders", component: MerchantOrders, allowedRoles: ["merchant"] },
  { path: "/merchant/profile", component: Profile, allowedRoles: ["merchant"] },

  { path: "/admin/dashboard", component: AdminDashboardPage, allowedRoles: ["admin"] },
  { path: "/admin/users", component: AdminUsers, allowedRoles: ["admin"] },
  { path: "/admin/analytics", component: AdminAnalytics, allowedRoles: ["admin"] },
  { path: "/admin/audit-log", component: AdminAuditLog, allowedRoles: ["admin"] },
  { path: "/admin/chat", component: AdminChat, allowedRoles: ["admin"] },
  { path: "/admin/settings", component: AdminSettings, allowedRoles: ["admin"] },
  { path: "/admin/notifications", component: AdminNotifications, allowedRoles: ["admin"] },
  { path: "/admin/sms", component: AdminSms, allowedRoles: ["admin"] },
  { path: "/admin/profile", component: Profile, allowedRoles: ["admin"] },
];

export const notFoundComponent = NotFound;
