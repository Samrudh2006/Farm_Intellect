import { Suspense, lazy, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/layout/PageTransition";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";
import { AmbientMusic } from "@/components/ui/ambient-music";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

type AppRole = "farmer" | "merchant" | "expert" | "admin";

const roleHomeRoutes: Record<AppRole, string> = {
  farmer: "/farmer/dashboard",
  merchant: "/merchant/dashboard",
  expert: "/expert/dashboard",
  admin: "/admin/dashboard",
};

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FarmerDashboard = lazy(() => import("./pages/FarmerDashboard"));
const MerchantDashboardPage = lazy(() => import("./pages/MerchantDashboardPage"));
const ExpertDashboardPage = lazy(() => import("./pages/ExpertDashboardPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const Login = lazy(() => import("./pages/Login"));
const Crops = lazy(() => import("./pages/Crops"));
const Advisory = lazy(() => import("./pages/Advisory"));
const Weather = lazy(() => import("./pages/Weather"));
const Sensors = lazy(() => import("./pages/Sensors"));
const FieldMap = lazy(() => import("./pages/FieldMap"));
const Merchants = lazy(() => import("./pages/Merchants"));
const Polls = lazy(() => import("./pages/Polls"));
const Schemes = lazy(() => import("./pages/Schemes"));
const AIAdvisory = lazy(() => import("./pages/AIAdvisory"));
const AICropScanner = lazy(() => import("./pages/AICropScanner"));
const Farmers = lazy(() => import("./pages/Farmers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Users = lazy(() => import("./pages/Users"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Forum = lazy(() => import("./pages/Forum"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Documents = lazy(() => import("./pages/Documents"));
const Chat = lazy(() => import("./pages/Chat"));
const FarmFeatures = lazy(() => import("./pages/FarmFeatures"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const MerchantFarmers = lazy(() => import("./pages/merchant/MerchantFarmers"));
const MerchantMarketPrices = lazy(() => import("./pages/merchant/MerchantMarketPrices"));
const MerchantDocuments = lazy(() => import("./pages/merchant/MerchantDocuments"));
const MerchantNotifications = lazy(() => import("./pages/merchant/MerchantNotifications"));
const MerchantChat = lazy(() => import("./pages/merchant/MerchantChat"));
const MerchantOrders = lazy(() => import("./pages/merchant/MerchantOrders"));

const FarmerKnowledgeHub = lazy(() => import("./pages/farmer/FarmerKnowledgeHub"));
const ExpertAICropScanner = lazy(() => import("./pages/expert/ExpertAICropScanner"));
const ExpertAIAdvisory = lazy(() => import("./pages/expert/ExpertAIAdvisory"));
const ExpertChat = lazy(() => import("./pages/expert/ExpertChat"));
const ExpertNotifications = lazy(() => import("./pages/expert/ExpertNotifications"));
const ExpertConsultations = lazy(() => import("./pages/expert/ExpertConsultations"));
const ExpertKnowledgeHub = lazy(() => import("./pages/expert/ExpertKnowledgeHub"));

const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminChat = lazy(() => import("./pages/admin/AdminChat"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <span className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: AppRole[] }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles) {
    if (!profile) {
      return <div className="min-h-screen flex items-center justify-center"><span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
    }

    const role = profile.role as AppRole;
    if (!allowedRoles.includes(role)) {
      return <Navigate to={roleHomeRoutes[role] || "/farmer/dashboard"} replace />;
    }
  }
  return <>{children}</>;
};

const renderPage = (Component: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<RouteLoader />}>
    <PageTransition>
      <Component />
    </PageTransition>
  </Suspense>
);

const renderProtectedPage = (Component: LazyExoticComponent<ComponentType>, allowedRoles?: AppRole[]) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{renderPage(Component)}</ProtectedRoute>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={renderPage(Index)} />
        <Route path="/login" element={renderPage(Login)} />
        <Route path="/reset-password" element={renderPage(ResetPassword)} />
        
        {/* Farmer Routes */}
        <Route path="/farmer/dashboard" element={renderProtectedPage(FarmerDashboard, ["farmer"])} />
        <Route path="/farmer/crops" element={renderProtectedPage(Crops, ["farmer"])} />
        <Route path="/farmer/advisory" element={renderProtectedPage(Advisory, ["farmer"])} />
        <Route path="/farmer/weather" element={renderProtectedPage(Weather, ["farmer"])} />
        <Route path="/farmer/sensors" element={renderProtectedPage(Sensors, ["farmer"])} />
        <Route path="/farmer/field-map" element={renderProtectedPage(FieldMap, ["farmer"])} />
        <Route path="/farmer/merchants" element={renderProtectedPage(Merchants, ["farmer"])} />
        <Route path="/farmer/polls" element={renderProtectedPage(Polls, ["farmer"])} />
        <Route path="/farmer/schemes" element={renderProtectedPage(Schemes, ["farmer"])} />
        <Route path="/farmer/ai-advisory" element={renderProtectedPage(AIAdvisory, ["farmer"])} />
        <Route path="/farmer/ai-crop-scanner" element={renderProtectedPage(AICropScanner, ["farmer"])} />
        <Route path="/farmer/chat" element={renderProtectedPage(Chat, ["farmer"])} />
        <Route path="/farmer/forum" element={renderProtectedPage(Forum, ["farmer"])} />
        <Route path="/farmer/calendar" element={renderProtectedPage(Calendar, ["farmer"])} />
        <Route path="/farmer/documents" element={renderProtectedPage(Documents, ["farmer"])} />
        <Route path="/farmer/notifications" element={renderProtectedPage(Notifications, ["farmer"])} />
        <Route path="/farmer/features" element={renderProtectedPage(FarmFeatures, ["farmer"])} />
        <Route path="/farmer/knowledge" element={renderProtectedPage(FarmerKnowledgeHub, ["farmer"])} />
        <Route path="/farmer/profile" element={renderProtectedPage(Profile, ["farmer"])} />
        
        {/* Merchant Routes */}
        <Route path="/merchant/dashboard" element={renderProtectedPage(MerchantDashboardPage, ["merchant"])} />
        <Route path="/merchant/farmers" element={renderProtectedPage(MerchantFarmers, ["merchant"])} />
        <Route path="/merchant/market-prices" element={renderProtectedPage(MerchantMarketPrices, ["merchant"])} />
        <Route path="/merchant/documents" element={renderProtectedPage(MerchantDocuments, ["merchant"])} />
        <Route path="/merchant/notifications" element={renderProtectedPage(MerchantNotifications, ["merchant"])} />
        <Route path="/merchant/chat" element={renderProtectedPage(MerchantChat, ["merchant"])} />
        <Route path="/merchant/orders" element={renderProtectedPage(MerchantOrders, ["merchant"])} />
        <Route path="/merchant/profile" element={renderProtectedPage(Profile, ["merchant"])} />
        
        {/* Expert Routes */}
        <Route path="/expert/dashboard" element={renderProtectedPage(ExpertDashboardPage, ["expert"])} />
        <Route path="/expert/ai-crop-scanner" element={renderProtectedPage(ExpertAICropScanner, ["expert"])} />
        <Route path="/expert/ai-advisory" element={renderProtectedPage(ExpertAIAdvisory, ["expert"])} />
        <Route path="/expert/chat" element={renderProtectedPage(ExpertChat, ["expert"])} />
        <Route path="/expert/consultations" element={renderProtectedPage(ExpertConsultations, ["expert"])} />
        <Route path="/expert/knowledge" element={renderProtectedPage(ExpertKnowledgeHub, ["expert"])} />
        <Route path="/expert/notifications" element={renderProtectedPage(ExpertNotifications, ["expert"])} />
        <Route path="/expert/profile" element={renderProtectedPage(Profile, ["expert"])} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={renderProtectedPage(AdminDashboardPage, ["admin"])} />
        <Route path="/admin/users" element={renderProtectedPage(AdminUsers, ["admin"])} />
        <Route path="/admin/analytics" element={renderProtectedPage(AdminAnalytics, ["admin"])} />
        <Route path="/admin/audit-log" element={renderProtectedPage(AdminAuditLog, ["admin"])} />
        <Route path="/admin/chat" element={renderProtectedPage(AdminChat, ["admin"])} />
        <Route path="/admin/settings" element={renderProtectedPage(AdminSettings, ["admin"])} />
        <Route path="/admin/notifications" element={renderProtectedPage(AdminNotifications, ["admin"])} />
        <Route path="/admin/profile" element={renderProtectedPage(Profile, ["admin"])} />
        
        {/* Legacy Routes */}
        <Route path="/dashboard" element={renderProtectedPage(Dashboard)} />
        <Route path="/crops" element={renderProtectedPage(Crops)} />
        <Route path="/advisory" element={renderProtectedPage(Advisory)} />
        <Route path="/weather" element={renderProtectedPage(Weather)} />
        <Route path="/sensors" element={renderProtectedPage(Sensors)} />
        <Route path="/field-map" element={renderProtectedPage(FieldMap)} />
        <Route path="/merchants" element={renderProtectedPage(Merchants)} />
        <Route path="/polls" element={renderProtectedPage(Polls)} />
        <Route path="/schemes" element={renderProtectedPage(Schemes)} />
        <Route path="/ai-advisory" element={renderProtectedPage(AIAdvisory)} />
        <Route path="/ai-crop-scanner" element={renderProtectedPage(AICropScanner)} />
        <Route path="/farmers" element={renderProtectedPage(Farmers)} />
        <Route path="/analytics" element={renderProtectedPage(Analytics)} />
        <Route path="/users" element={renderProtectedPage(Users)} />
        <Route path="/settings" element={renderProtectedPage(Settings)} />
        <Route path="/forum" element={renderProtectedPage(Forum)} />
        <Route path="/calendar" element={renderProtectedPage(Calendar)} />
        <Route path="/notifications" element={renderProtectedPage(Notifications)} />
        <Route path="/documents" element={renderProtectedPage(Documents)} />
        <Route path="/chat" element={renderProtectedPage(Chat)} />
        <Route path="*" element={renderPage(NotFound)} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
              <AmbientMusic />
              <InstallPrompt />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  </QueryClientProvider>
);

export default App;
