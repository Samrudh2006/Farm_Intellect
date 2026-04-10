import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AIAssistantHub } from "@/components/chat/AIAssistantHub";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLanguage } from "@/contexts/LanguageContext";

const ExpertChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: user.name, role: "expert" }}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={3}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="expert"
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient-tricolor">
              🤖 {t('ai.title')}
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Advanced AI consultation for agricultural expertise
            </p>
          </div>
          
          <AIAssistantHub />
        </div>
      </main>
    </div>
  );
};

export default ExpertChat;
