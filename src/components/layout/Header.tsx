import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import appLogo from "@/assets/krishi-app-logo.png";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  onMenuClick?: () => void;
  notificationCount?: number;
}

export const Header = ({ user, onMenuClick, notificationCount = 0 }: HeaderProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleProfile = () => {
    const role = user?.role || "farmer";
    navigate(`/${role}/profile`);
  };

  return (
    <>
      <div className="tricolor-bar h-1.5" />
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={appLogo} alt="Krishi AI" className="h-9 w-9 object-contain" />
              <h1 className="text-xl font-bold text-foreground">{t('header.app_title')}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const html = document.documentElement;
                const isDark = html.classList.toggle("dark");
                localStorage.setItem("theme", isDark ? "dark" : "light");
              }}
              aria-label="Toggle dark mode"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate(`/${user?.role || "farmer"}/notifications`)}>
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user.name}</span>
                    <Badge variant="secondary" className="hidden sm:inline bg-primary/10 text-primary border-primary/20">
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    {t('common.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.signout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate("/login")}
              >
                {t("auth.signin")}
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
