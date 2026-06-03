import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Documents = () => {
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
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Document Management</h2>
            <p className="text-muted-foreground">
              Upload and manage your agricultural and business documents for verification
            </p>
          </div>
          <DocumentUpload />
        </div>
      </main>
    </div>
  );
};

export default Documents;