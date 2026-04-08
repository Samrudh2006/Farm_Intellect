import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  className?: string;
  customLabels?: Record<string, string>;
}

export const Breadcrumbs = ({ className, customLabels = {} }: BreadcrumbsProps) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) return null;

  const crumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = customLabels[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === pathSegments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav className={cn("flex items-center gap-1.5 text-sm text-muted-foreground mb-4", className)}>
      <Link to="/" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors capitalize">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};
