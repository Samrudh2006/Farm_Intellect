import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertEnginePanel } from "@/components/features/AlertEnginePanel";
import { ExpertConsultationWorkflow } from "@/components/features/ExpertConsultationWorkflow";
import { GeoPersonalizationPanel } from "@/components/features/GeoPersonalizationPanel";
import { MultiLanguageVoiceAssistant } from "@/components/features/MultiLanguageVoiceAssistant";
import { OfflineFarmerMode } from "@/components/features/OfflineFarmerMode";
import { SmartIrrigationCalculator } from "@/components/features/SmartIrrigationCalculator";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Brain, Cloud, Languages, LocateFixed, MapPinned, ShieldAlert, Stethoscope, Waves } from "lucide-react";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { WeatherMarketAPI } from "@/components/features/WeatherMarketAPI";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const FarmFeatures = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

  const features = [
    {
      id: "launchpad",
      title: "Farmer capability launchpad",
      description: "Open the planner, field history, scanner, and scheme workflow from one place.",
      icon: Brain,
      component: () => (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Personalized crop planning", description: "Seasonal plans with reminders and milestones", action: () => navigate("/farmer/calendar") },
            { title: "Field history timeline", description: "Review past events and log new observations", action: () => navigate("/farmer/field-map") },
            { title: "ML crop scanner", description: "Scan crop images and shortlist probable diseases", action: () => navigate("/farmer/ai-crop-scanner") },
            { title: "Scheme eligibility wizard", description: "Check support, insurance, and subsidy fit", action: () => navigate("/farmer/schemes") },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border p-4 shadow-sm">
              <h3 className="font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              <Button className="mt-4" variant="outline" onClick={card.action}>Open</Button>
            </div>
          ))}
        </div>
      ),
    },
    { id: "offline", title: "Offline farmer mode", description: "PWA-first install and cached farmer workflows", icon: Bell, component: OfflineFarmerMode },
    { id: "multilingual", title: "Multilingual support", description: "Expanded voice-first support for more regional languages", icon: Languages, component: MultiLanguageVoiceAssistant },
    { id: "irrigation", title: "Smart irrigation advisory", description: "Adaptive irrigation scheduling from crop and weather inputs", icon: Waves, component: SmartIrrigationCalculator },
    { id: "geo", title: "Village / mandi personalization", description: "Save village and mandi defaults for local prices and alerts", icon: MapPinned, component: GeoPersonalizationPanel },
    { id: "alerts", title: "Alert engine", description: "Pest, weather, irrigation, market, and booking alerts", icon: ShieldAlert, component: AlertEnginePanel },
    { id: "expert", title: "Expert booking workflow", description: "Request consultations with slot, mode, and issue context", icon: Stethoscope, component: ExpertConsultationWorkflow },
    { id: "weather", title: "Weather & market data", description: "Live weather forecasts and mandi price visibility", icon: Cloud, component: WeatherMarketAPI },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "farmer" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="farmer" />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <AshokaChakra size={40} />
            </div>
            <h1 className="text-4xl font-bold text-gradient-tricolor">Smart Farm Features 🌾</h1>
            <p className="text-muted-foreground text-lg mt-2">Remaining roadmap capabilities are now grouped into one farmer-ready launchpad.</p>
          </div>

          <Tabs defaultValue="launchpad" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              {features.map((feature) => (
                <TabsTrigger key={feature.id} value={feature.id} className="flex flex-col gap-1 h-16">
                  <feature.icon className="h-5 w-5" />
                  <span className="text-xs">{feature.title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id}>
                <Card className="tricolor-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gradient-tricolor">
                      <feature.icon className="h-6 w-6 text-primary" />
                      {feature.title}
                    </CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <feature.component />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* PWA Install Prompt */}
          <Card className="tricolor-card bg-gradient-to-r from-accent/5 via-background to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 glow-green">
                  <LocateFixed className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Farmer capability layer is live</h3>
                  <p className="text-sm text-muted-foreground">
                    Offline mode, geo-personalization, alerts, irrigation guidance, and expert booking are now wired into your farmer journey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FarmFeatures;
