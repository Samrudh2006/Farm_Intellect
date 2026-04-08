import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FarmerPhaseOneOverview } from "@/components/dashboard/FarmerPhaseOneOverview";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { FarmerConsultationForm } from "@/components/consultations/FarmerConsultationForm";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
      <main className="md:ml-64 p-6 custom-scrollbar">
        <Breadcrumbs customLabels={{ farmer: "🌾 Farmer", dashboard: "Dashboard" }} />

        {/* Hero background — glassmorphic overlay */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-48 group">
          <img
            src={heroImage}
            alt="Farm landscape"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/30 backdrop-blur-[2px]" />
          <div className="relative z-10 flex items-center h-full px-8">
            <div>
              <h1 className="text-fluid-2xl font-bold text-[hsl(0_0%_100%)]">{t('dashboard.welcome')}, {user.name}! 🚜</h1>
              <p className="text-[hsl(0_0%_100%/0.8)] text-fluid-base mt-1">{t('phase1.description')}</p>
              <div className="tricolor-bar h-0.5 max-w-xs mt-3 rounded-full" />
            </div>
          </div>
        </div>

        {/* Phase 1 Overview */}
        <FarmerPhaseOneOverview />

        {/* Consultation Form */}
        <div className="mt-6">
          <FarmerConsultationForm />
        </div>

        {/* Role Dashboard */}
        <RoleDashboard userRole="farmer" />
      </main>
    </div>
  );
};

export default FarmerDashboard;
