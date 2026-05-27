import { Suspense, type ReactNode } from "react";
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
import { SeoHead } from "@/components/system/SeoHead";
import { AmbientMusic } from "@/components/ui/ambient-music";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PushNotificationProvider } from "@/components/system/PushNotificationProvider";
import { CookieConsentBanner } from "@/components/system/CookieConsentBanner";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { type AppRole } from "@/lib/roles";
import { publicRoutes, protectedRoutes, notFoundComponent, type LazyPage } from "@/routes/routeConfig";

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
  const guard = useRoleGuard(allowedRoles);

  if (guard.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (guard.status === "unauthenticated" || guard.status === "forbidden") {
    return <Navigate to={guard.redirectTo} replace />;
  }

  if (guard.status === "missing-profile") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Profile Loading Failed</h2>
          <p className="text-muted-foreground">Unable to load your profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const renderPage = (Component: LazyPage) => (
  <Suspense fallback={<RouteLoader />}>
    <PageTransition>
      <Component />
    </PageTransition>
  </Suspense>
);

const renderProtectedPage = (Component: LazyPage, allowedRoles?: AppRole[]) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{renderPage(Component)}</ProtectedRoute>
);

const RoutesWrapper = () => {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={renderPage(route.component)} />
        ))}
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={renderProtectedPage(route.component, route.allowedRoles)}
          />
        ))}
        <Route path="*" element={renderPage(notFoundComponent)} />
      </Routes>
    </AnimatePresence>
  );
};

const AnimatedRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <RoutesWrapper />
    </Suspense>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <SeoHead schema="website" />
                <PushNotificationProvider />
                <AnimatedRoutes />
                <AmbientMusic />
                <InstallPrompt />
                <CookieConsentBanner />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
