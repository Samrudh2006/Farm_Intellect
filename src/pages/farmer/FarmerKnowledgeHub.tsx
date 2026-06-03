import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KnowledgeHub } from "@/components/features/KnowledgeHub";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const FarmerKnowledgeHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{ name: user.name, role: "farmer" }}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}

      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="farmer" />
      <main className="md:ml-64 p-6">
        <KnowledgeHub />
      </main>
    </div>
  );
};

export default FarmerKnowledgeHub;
