import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Users, Phone, Mail, Calendar } from "lucide-react";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";

interface FarmerProfile {
  user_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
}

const DEFAULT_MOCK_FARMERS: FarmerProfile[] = [
  {
    user_id: "mock-farmer-1",
    display_name: "Rajesh Kumar",
    email: "rajesh@farmapp.local.io",
    phone: "+919876543210",
    location: "Karnal, Haryana",
    avatar_url: null,
    created_at: "2025-06-10T10:00:00Z"
  },
  {
    user_id: "mock-farmer-2",
    display_name: "Sukhwinder Singh",
    email: "sukhwinder@farmapp.local.io",
    phone: "+919876543220",
    location: "Amritsar, Punjab",
    avatar_url: null,
    created_at: "2025-05-18T14:20:00Z"
  },
  {
    user_id: "mock-farmer-3",
    display_name: "Ramesh Patel",
    email: "ramesh@farmapp.local.io",
    phone: "+919876543230",
    location: "Rajkot, Gujarat",
    avatar_url: null,
    created_at: "2025-04-12T09:15:00Z"
  }
];

const MerchantFarmers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const user = { name: "Merchant User", role: "merchant" };

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        if (!hasSupabaseEnv) {
          setFarmers(DEFAULT_MOCK_FARMERS);
          setLoading(false);
          return;
        }

        // Get all user_ids with farmer role, then fetch their profiles
        const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "farmer");
        if (roles && roles.length > 0) {
          const farmerIds = roles.map(r => r.user_id);
          const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", farmerIds);
          if (profiles && profiles.length > 0) {
            setFarmers(profiles);
          } else {
            setFarmers(DEFAULT_MOCK_FARMERS);
          }
        } else {
          setFarmers(DEFAULT_MOCK_FARMERS);
        }
      } catch (err) {
        console.warn("Failed to fetch farmers, using mock fallback:", err);
        setFarmers(DEFAULT_MOCK_FARMERS);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} notificationCount={3} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient-saffron-navy">🤝 Partner Farmers Network</h1>
            <p className="text-muted-foreground text-lg mt-2">Connect with verified farmers and build lasting partnerships</p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-xl" />
              ))}
            </div>
          ) : farmers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No partner farmers registered yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {farmers.map((farmer) => (
                <Card key={farmer.user_id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={farmer.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(farmer.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{farmer.display_name}</CardTitle>
                        {farmer.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {farmer.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {farmer.email && (
                        <div className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{farmer.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Since {new Date(farmer.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {farmer.phone && (
                        <Button size="sm" className="flex-1" asChild>
                          <a href={`tel:${farmer.phone}`}>
                            <Phone className="h-3 w-3 mr-1" /> Call
                          </a>
                        </Button>
                      )}
                      {farmer.email && (
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <a href={`mailto:${farmer.email}`}>
                            <Mail className="h-3 w-3 mr-1" /> Email
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MerchantFarmers;
