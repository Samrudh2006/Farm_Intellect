import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const AdminNotifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = {
    name: "Admin User",
    role: "admin",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}

      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient-saffron-navy">
              🔔 System Notifications
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Monitor platform alerts and administrative notifications
            </p>
          </div>
          
          <NotificationCenter />
        </div>
      </main>
    </div>
  );
};

export default AdminNotifications;