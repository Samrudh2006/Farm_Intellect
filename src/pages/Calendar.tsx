import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CropCalendar } from "@/components/calendar/CropCalendar";
import { PersonalizedCropPlanner } from "@/components/calendar/PersonalizedCropPlanner";
import { SoilHealthPage } from "@/components/soil/SoilHealthPage";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Calendar as CalendarIcon } from "lucide-react";

const Calendar = () => {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

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
        userRole="farmer"
      />

      <main className="md:ml-64 p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("calendar.title") || "Crop Calendar"}</h1>
          <p className="mt-1 text-muted-foreground">
            Personalized seasonal planning for {user.name}, with soil health monitoring and calendar tracking in one place.
          </p>
        </div>
        
        <Tabs defaultValue="planner" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Planner</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              <span className="hidden sm:inline">Soil Health</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="planner" className="space-y-6">
            <PersonalizedCropPlanner />
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <CropCalendar />
          </TabsContent>
          
          <TabsContent value="soil" className="space-y-6">
            <SoilHealthPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Calendar;
