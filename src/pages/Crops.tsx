import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SeasonalCropGuide } from "@/components/crops/SeasonalCropGuide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wheat, 
  Plus, 
  Search,
  Calendar,
  MapPin,
  TrendingUp,
  Droplets,
  AlertTriangle,
  Loader2
} from "lucide-react";

const Crops = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { user } = useCurrentUser();

  useEffect(() => {
    fetchCrops();
  }, [user]);

  const fetchCrops = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('crop_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCrops(data || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrops = crops.filter(crop => {
    const nameMatch = (crop.crop_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const notesMatch = (crop.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || notesMatch;
    
    // Normalize status for filtering
    const cropStatus = crop.status ? crop.status.toLowerCase() : "healthy";
    const matchesStatus = filterStatus === "all" || cropStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const s = status ? status.toLowerCase() : "healthy";
    switch (s) {
      case "healthy": return "text-primary";
      case "warning": return "text-harvest";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : "healthy";
    switch (s) {
      case "healthy": return "default";
      case "warning": return "secondary";
      case "critical": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={3}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6 animate-fade-in">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">{t('crops.title')}</h2>
              <p className="text-muted-foreground">
                {t('crops.subtitle')}
              </p>
            </div>
            <Button className="tricolor-shimmer hover:animate-shimmer" onClick={() => {
              // Add simple insert for testing
              if (user) {
                const newCrop = {
                  user_id: user.id,
                  crop_name: "New Field Crop",
                  season: "Kharif",
                  area_acres: 5,
                  status: "healthy",
                  sowing_date: new Date().toISOString()
                };
                supabase.from('crop_plans').insert(newCrop).then(() => fetchCrops());
              }
            }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('crops.add_new')}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('crops.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('crops.filter_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('crops.all_status')}</SelectItem>
                <SelectItem value="healthy">{t('crops.healthy')}</SelectItem>
                <SelectItem value="warning">{t('crops.warning')}</SelectItem>
                <SelectItem value="critical">{t('crops.critical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Crops Section with Tabs */}
          <Tabs defaultValue="my-crops" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-crops">{t('crops.my_crops_tab')}</TabsTrigger>
              <TabsTrigger value="crop-guide">{t('crops.crop_guide_tab')}</TabsTrigger>
            </TabsList>

            <TabsContent value="my-crops" className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCrops.map((crop, index) => (
                      <Card 
                        key={crop.id} 
                        className="cursor-pointer tricolor-card transition-all duration-300 hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wheat className="h-5 w-5 text-primary" />
                              <CardTitle className="text-lg">{crop.crop_name}</CardTitle>
                            </div>
                            <Badge variant={getStatusBadge(crop.status) as any}>
                              {crop.season}
                            </Badge>
                          </div>
                          <CardDescription>{crop.notes || "No notes added"}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{crop.area_acres} Acres</span>
                            </div>
                            {crop.sowing_date && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{t('crops.planted')}: {new Date(crop.sowing_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {crop.expected_harvest && (
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span>{t('crops.harvest')}: {new Date(crop.expected_harvest).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1 hover:bg-primary/10">
                              {t('common.view_details')}
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-primary/10" onClick={(e) => {
                                e.stopPropagation();
                                supabase.from('crop_plans').delete().eq('id', crop.id).then(() => fetchCrops());
                            }}>
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredCrops.length === 0 && (
                    <div className="text-center py-12 animate-fade-in">
                      <Wheat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">{t('crops.no_crops')}</h3>
                      <p className="text-muted-foreground">{t('crops.adjust_filters')}</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="crop-guide">
              <SeasonalCropGuide />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Crops;
