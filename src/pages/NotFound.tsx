import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";

const NotFound = () => {
  const currentLocation = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", currentLocation.pathname);
  }, [currentLocation.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="tricolor-bar h-1.5 fixed top-0 left-0 right-0" />
      <Card className="max-w-md w-full tricolor-card">
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <AshokaChakra size={64} />
            </div>
            <h1 className="text-8xl font-bold text-gradient-tricolor mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Path attempted: {currentLocation.pathname}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
