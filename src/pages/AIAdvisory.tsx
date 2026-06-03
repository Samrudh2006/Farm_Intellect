import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SmartIrrigationCalculator } from "@/components/features/SmartIrrigationCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CropRecommendationEngine from "@/components/ai/CropRecommendationEngine";
import YieldPredictor from "@/components/analytics/YieldPredictor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const AIAdvisory = () => {
  const { user } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: user.name, role: "farmer" }}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}

      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="farmer"
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-foreground">AI-Powered Advisory</h2>
            <p className="text-muted-foreground">
              Get intelligent crop recommendations and yield predictions powered by advanced AI
            </p>
          </div>

          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[560px]">
              <TabsTrigger value="recommendations">Crop Recommendations</TabsTrigger>
              <TabsTrigger value="predictions">Yield Predictions</TabsTrigger>
              <TabsTrigger value="irrigation">Irrigation Advisory</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations">
              <CropRecommendationEngine />
            </TabsContent>

            <TabsContent value="predictions">
              <YieldPredictor />
            </TabsContent>

            <TabsContent value="irrigation">
              <SmartIrrigationCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AIAdvisory;