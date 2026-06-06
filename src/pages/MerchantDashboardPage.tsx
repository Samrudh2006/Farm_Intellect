import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLanguage } from "@/contexts/LanguageContext";
const heroImage = "https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1200";

const MerchantDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "merchant" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="merchant" />
      <main className="md:ml-64 p-6">
        <div className="relative rounded-2xl overflow-hidden mb-6 h-48">
          <img src={heroImage} alt="Farm landscape" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/30" />
          <div className="relative z-10 flex items-center h-full px-8">
            <div>
              <h1 className="text-3xl font-bold text-white">{t('dashboard.welcome')}, {user.name}! 🤝</h1>
              <p className="text-white/80 text-lg mt-1">Your marketplace awaits — let's grow together!</p>
              <div className="tricolor-bar h-0.5 max-w-xs mt-3 rounded-full" />
            </div>
          </div>
        </div>
        <RoleDashboard userRole="merchant" />
      </main>
    </div>
  );
};

export default MerchantDashboardPage;
