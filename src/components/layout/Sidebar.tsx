import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wheat, 
  CloudSun, 
  Users, 
  TrendingUp, 
  Settings,
  BookOpen,
  Activity,
  Map,
  Brain,
  MessageSquare,
  Calendar,
  Bell,
  FileText,
  Bot,
  Gauge,
  Vote,
  Building,
  Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const getNavigationItems = (t: (key: string) => string) => ({
  farmer: [
    { icon: LayoutDashboard, label: t('nav.farm_hub'), href: "/farmer/dashboard" },
    { icon: Wheat, label: t('nav.my_crops'), href: "/farmer/crops" },
    { icon: Brain, label: `📚 ${t('nav.advisory')}`, href: "/farmer/advisory" },
    { icon: CloudSun, label: `🌤 ${t('nav.weather')}`, href: "/farmer/weather" },
    { icon: Gauge, label: `📡 ${t('nav.sensors')}`, href: "/farmer/sensors" },
    { icon: Map, label: `🗺 ${t('nav.fieldmap')}`, href: "/farmer/field-map" },
    { icon: Building, label: `🏪 ${t('nav.merchants')}`, href: "/farmer/merchants" },
    { icon: Vote, label: `🗳 ${t('nav.polls')}`, href: "/farmer/polls" },
    { icon: Landmark, label: `🏛 ${t('nav.schemes')}`, href: "/farmer/schemes" },
    { icon: Activity, label: t('nav.smart_features'), href: "/farmer/features" },
    { icon: Bot, label: t('nav.ai_assistant'), href: "/farmer/chat" },
    { icon: MessageSquare, label: t('nav.forum'), href: "/farmer/forum" },
    { icon: Calendar, label: t('nav.crop_calendar'), href: "/farmer/calendar" },
    { icon: BookOpen, label: "📚 Knowledge Hub", href: "/farmer/knowledge" },
    { icon: FileText, label: t('nav.documents'), href: "/farmer/documents" },
    { icon: Bell, label: t('nav.notifications'), href: "/farmer/notifications" },
  ],
  merchant: [
    { icon: LayoutDashboard, label: `🏢 ${t('sidebar.business_hub')}`, href: "/merchant/dashboard" },
    { icon: Users, label: t('nav.partner_farmers'), href: "/merchant/farmers" },
    { icon: TrendingUp, label: t('nav.market_prices'), href: "/merchant/market-prices" },
    { icon: Building, label: "📦 Orders", href: "/merchant/orders" },
    { icon: Bot, label: t('nav.ai_assistant'), href: "/merchant/chat" },
    { icon: FileText, label: t('nav.documents'), href: "/merchant/documents" },
    { icon: Bell, label: t('nav.notifications'), href: "/merchant/notifications" },
  ],
  expert: [
    { icon: LayoutDashboard, label: `🎓 ${t('sidebar.expert_center')}`, href: "/expert/dashboard" },
    { icon: Activity, label: t('nav.ai_crop_scanner'), href: "/expert/ai-crop-scanner" },
    { icon: Brain, label: t('nav.ai_advisory'), href: "/expert/ai-advisory" },
    { icon: MessageSquare, label: "🔬 Consultations", href: "/expert/consultations" },
    { icon: BookOpen, label: "📚 Knowledge Hub", href: "/expert/knowledge" },
    { icon: Bot, label: t('nav.ai_assistant'), href: "/expert/chat" },
    { icon: Bell, label: t('nav.notifications'), href: "/expert/notifications" },
  ],
  admin: [
    { icon: LayoutDashboard, label: t('sidebar.admin_control'), href: "/admin/dashboard" },
    { icon: Users, label: t('nav.users'), href: "/admin/users" },
    { icon: TrendingUp, label: t('nav.analytics'), href: "/admin/analytics" },
    { icon: Activity, label: "📋 Audit Log", href: "/admin/audit-log" },
    { icon: Bot, label: t('nav.ai_assistant'), href: "/admin/chat" },
    { icon: Settings, label: t('nav.settings'), href: "/admin/settings" },
    { icon: Bell, label: t('nav.notifications'), href: "/admin/notifications" },
  ],
});

export const Sidebar = ({ isOpen, onClose, userRole = "farmer" }: SidebarProps) => {
  const { t } = useLanguage();
  const navigationItems = getNavigationItems(t);
  const items = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.farmer;

  const portalTitle = {
    farmer: t('sidebar.farmer_portal'),
    merchant: t('sidebar.business_hub'),
    expert: t('sidebar.expert_center'),
    admin: t('sidebar.admin_control'),
  }[userRole] || t('sidebar.farmer_portal');

  const portalDesc = {
    farmer: t('sidebar.farmer_desc'),
    merchant: t('sidebar.business_desc'),
    expert: t('sidebar.expert_desc'),
    admin: t('sidebar.admin_desc'),
  }[userRole] || t('sidebar.farmer_desc');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-[calc(1.5rem+4rem)] z-50 h-[calc(100vh-5.5rem)] w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Tricolor left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-1 tricolor-bar-vertical" />
        
        <div className="p-4 overflow-y-auto h-full">
          {/* Role-specific welcome with Chakra */}
          <div className="mb-6 p-3 rounded-lg border border-primary/20 bg-gradient-to-r from-accent/5 via-background to-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <AshokaChakra size={20} />
              <h3 className="font-semibold text-sm text-foreground">
                {portalTitle}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {portalDesc}
            </p>
          </div>
          
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground hover:shadow-sm hover:translate-x-1"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Copyright */}
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              © 2025 Samrudh. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Tricolor bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 tricolor-bar h-1" />
      </aside>
    </>
  );
};
