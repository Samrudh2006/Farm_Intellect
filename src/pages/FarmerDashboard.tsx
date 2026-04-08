import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FarmerPhaseOneOverview } from "@/components/dashboard/FarmerPhaseOneOverview";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { FarmerConsultationForm } from "@/components/consultations/FarmerConsultationForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-farming.jpg";

const FarmerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "farmer" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} notificationCount={5} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="farmer" />
      <main className="md:ml-64 p-6">
        {/* Hero background */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-48">
          <img src={heroImage} alt="Farm landscape" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/30" />
          <div className="relative z-10 flex items-center h-full px-8">
            <div>
              <h1 className="text-3xl font-bold text-white">{t('dashboard.welcome')}, {user.name}! 🚜</h1>
              <p className="text-white/80 text-lg mt-1">{t('phase1.description')}</p>
              <div className="tricolor-bar h-0.5 max-w-xs mt-3 rounded-full" />
            </div>
          </div>
        </div>
        <FarmerPhaseOneOverview />
        <div className="mt-6">
          <FarmerConsultationForm />
        </div>
        <RoleDashboard userRole="farmer" />
      </main>
    </div>
  );
};

export default FarmerDashboard;
