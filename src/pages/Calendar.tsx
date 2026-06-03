import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CropCalendar } from "@/components/calendar/CropCalendar";
import { PersonalizedCropPlanner } from "@/components/calendar/PersonalizedCropPlanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Calendar = () => {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}

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
            Personalized seasonal planning for {user.name}, with saved reminders and calendar tracking in one place.
          </p>
        </div>
        <PersonalizedCropPlanner />
        <CropCalendar />
      </main>
    </div>
  );
};

export default Calendar;