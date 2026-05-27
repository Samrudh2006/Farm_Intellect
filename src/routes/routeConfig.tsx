import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { AppRole } from "@/lib/roles";

export type LazyPage = LazyExoticComponent<ComponentType>;

type PublicRouteConfig = { path: string; component: LazyPage };
type ProtectedRouteConfig = { path: string; component: LazyPage; allowedRoles?: AppRole[] };

const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const FarmerDashboard = lazy(() => import("@/pages/FarmerDashboard"));
const MerchantDashboardPage = lazy(() => import("@/pages/MerchantDashboardPage"));
const ExpertDashboardPage = lazy(() => import("@/pages/ExpertDashboardPage"));
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
const Farmers = lazy(() => import("@/pages/Farmers"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Users = lazy(() => import("@/pages/Users"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Forum = lazy(() => import("@/pages/Forum"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Documents = lazy(() => import("@/pages/Documents"));
const Chat = lazy(() => import("@/pages/Chat"));
const FarmFeatures = lazy(() => import("@/pages/FarmFeatures"));
const Profile = lazy(() => import("@/pages/Profile"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const AppLauncher = lazy(() => import("@/pages/AppLauncher"));
const MerchantFarmers = lazy(() => import("@/pages/merchant/MerchantFarmers"));
const MerchantMarketPrices = lazy(() => import("@/pages/merchant/MerchantMarketPrices"));
const MerchantDocuments = lazy(() => import("@/pages/merchant/MerchantDocuments"));
const MerchantNotifications = lazy(() => import("@/pages/merchant/MerchantNotifications"));
const MerchantChat = lazy(() => import("@/pages/merchant/MerchantChat"));
const MerchantOrders = lazy(() => import("@/pages/merchant/MerchantOrders"));
const FarmerKnowledgeHub = lazy(() => import("@/pages/farmer/FarmerKnowledgeHub"));
const ExpertAICropScanner = lazy(() => import("@/pages/expert/ExpertAICropScanner"));
const ExpertAIAdvisory = lazy(() => import("@/pages/expert/ExpertAIAdvisory"));
const ExpertChat = lazy(() => import("@/pages/expert/ExpertChat"));
const ExpertNotifications = lazy(() => import("@/pages/expert/ExpertNotifications"));
const ExpertConsultations = lazy(() => import("@/pages/expert/ExpertConsultations"));
const ExpertKnowledgeHub = lazy(() => import("@/pages/expert/ExpertKnowledgeHub"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminNotifications = lazy(() => import("@/pages/admin/AdminNotifications"));
const AdminChat = lazy(() => import("@/pages/admin/AdminChat"));
const AdminAuditLog = lazy(() => import("@/pages/admin/AdminAuditLog"));
const AdminSms = lazy(() => import("@/pages/admin/AdminSms"));
const SmsRegister = lazy(() => import("@/pages/SmsRegister"));

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
  { path: "/merchant/documents", component: MerchantDocuments, allowedRoles: ["merchant"] },
  { path: "/merchant/notifications", component: MerchantNotifications, allowedRoles: ["merchant"] },
  { path: "/merchant/chat", component: MerchantChat, allowedRoles: ["merchant"] },
  { path: "/merchant/orders", component: MerchantOrders, allowedRoles: ["merchant"] },
  { path: "/merchant/profile", component: Profile, allowedRoles: ["merchant"] },

  { path: "/expert/dashboard", component: ExpertDashboardPage, allowedRoles: ["expert"] },
  { path: "/expert/ai-crop-scanner", component: ExpertAICropScanner, allowedRoles: ["expert"] },
  { path: "/expert/ai-advisory", component: ExpertAIAdvisory, allowedRoles: ["expert"] },
  { path: "/expert/chat", component: ExpertChat, allowedRoles: ["expert"] },
  { path: "/expert/consultations", component: ExpertConsultations, allowedRoles: ["expert"] },
  { path: "/expert/knowledge", component: ExpertKnowledgeHub, allowedRoles: ["expert"] },
  { path: "/expert/notifications", component: ExpertNotifications, allowedRoles: ["expert"] },
  { path: "/expert/profile", component: Profile, allowedRoles: ["expert"] },

  { path: "/admin/dashboard", component: AdminDashboardPage, allowedRoles: ["admin"] },
  { path: "/admin/users", component: AdminUsers, allowedRoles: ["admin"] },
  { path: "/admin/analytics", component: AdminAnalytics, allowedRoles: ["admin"] },
  { path: "/admin/audit-log", component: AdminAuditLog, allowedRoles: ["admin"] },
  { path: "/admin/chat", component: AdminChat, allowedRoles: ["admin"] },
  { path: "/admin/settings", component: AdminSettings, allowedRoles: ["admin"] },
  { path: "/admin/notifications", component: AdminNotifications, allowedRoles: ["admin"] },
  { path: "/admin/sms", component: AdminSms, allowedRoles: ["admin"] },
  { path: "/admin/profile", component: Profile, allowedRoles: ["admin"] },

  { path: "/dashboard", component: Dashboard },
  { path: "/crops", component: Crops },
  { path: "/advisory", component: Advisory },
  { path: "/weather", component: Weather },
  { path: "/sensors", component: Sensors },
  { path: "/field-map", component: FieldMap },
  { path: "/merchants", component: Merchants },
  { path: "/polls", component: Polls },
  { path: "/schemes", component: Schemes },
  { path: "/ai-advisory", component: AIAdvisory },
  { path: "/ai-crop-scanner", component: AICropScanner },
  { path: "/farmers", component: Farmers },
  { path: "/analytics", component: Analytics },
  { path: "/users", component: Users },
  { path: "/settings", component: Settings },
  { path: "/forum", component: Forum },
  { path: "/calendar", component: Calendar },
  { path: "/notifications", component: Notifications },
  { path: "/documents", component: Documents },
  { path: "/chat", component: Chat },
];

export const notFoundComponent = NotFound;
