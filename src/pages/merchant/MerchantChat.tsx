import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AIAssistantHub } from "@/components/chat/AIAssistantHub";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const MerchantChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "merchant" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="merchant" />
      <main className="md:ml-64 pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🤖 Krishi AI Assistant</h1>
          <AIAssistantHub />
        </div>
      </main>
    </div>
  );
};

export default MerchantChat;
