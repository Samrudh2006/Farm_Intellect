import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Download, ScanLine, ShieldCheck, Smartphone, Wifi } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePwaStatus } from "@/hooks/usePwaStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";

const roleRoutes: Record<string, string> = {
  farmer: "/farmer/dashboard",
  merchant: "/merchant/dashboard",
  expert: "/expert/dashboard",
  admin: "/admin/dashboard",
};

const AppLauncher = () => {
  const { user, profile, loading } = useAuth();
  const { isOnline, isInstalled, canInstall, installApp } = usePwaStatus();

  const destination = useMemo(() => {
    if (user && profile) {
      return roleRoutes[profile.role] || "/dashboard";
    }

    return "/";
  }, [profile, user]);

  if (!loading && isInstalled) {
    return <Navigate to={destination} replace />;
  }

  const handleInstall = async () => {
    const result = await installApp();
    if (result === "accepted") {
      window.location.assign(destination);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="tricolor-bar h-1.5 fixed top-0 left-0 right-0" />

      <Card className="w-full max-w-md tricolor-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          <div className="flex justify-center">
            <AshokaChakra size={68} />
          </div>

          <div className="space-y-2">
            <Badge className="bg-accent/15 text-accent border-accent/30" variant="outline">
              QR-ready app launch
            </Badge>
            <h1 className="text-3xl font-bold text-gradient-tricolor">Farm Intellect</h1>
            <p className="text-sm text-muted-foreground">
              Scan this link on mobile to install the app and open it like a native application.
            </p>
          </div>

          <div className="grid gap-3 text-left">
            <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-3">
              <ScanLine className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Scan</p>
                <p className="text-xs text-muted-foreground">Open the QR link on your phone.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-3">
              <Download className="mt-0.5 h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Install</p>
                <p className="text-xs text-muted-foreground">Add Farm Intellect to your home screen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-3">
              <Smartphone className="mt-0.5 h-5 w-5 text-navy" />
              <div>
                <p className="font-medium text-sm">Launch</p>
                <p className="text-xs text-muted-foreground">It opens in a standalone app window.</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>{isOnline ? "Online and ready" : "Offline mode available after install"}</span>
            <Wifi className={`h-4 w-4 ${isOnline ? "text-primary" : "text-muted-foreground"}`} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canInstall ? (
              <Button onClick={handleInstall} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Install App
              </Button>
            ) : (
              <Button onClick={() => window.location.assign(destination)} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Open Site
              </Button>
            )}
            <Button variant="outline" asChild className="flex-1 gap-2">
              <Link to="/">
                Continue to site
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {!canInstall && (
            <p className="text-xs text-muted-foreground">
              If your browser hides the install button, use the share/menu option and choose “Add to Home Screen”.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppLauncher;
