import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { EnhancedAIChatbot } from "@/components/chat/EnhancedAIChatbot";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const AdminChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "admin" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="admin" />
      <main className="md:ml-64 pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🤖 Farm Intellect Assistant</h1>
          <EnhancedAIChatbot />
        </div>
      </main>
    </div>
  );
};

export default AdminChat;
