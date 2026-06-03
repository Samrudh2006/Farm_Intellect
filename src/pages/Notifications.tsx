import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AlertEnginePanel } from "@/components/features/AlertEnginePanel";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Notifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: user.name, role: user.role }}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}

      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="space-y-6 p-6 md:ml-64">
        <AlertEnginePanel />
        <NotificationCenter />
      </main>
    </div>
  );
};

export default Notifications;