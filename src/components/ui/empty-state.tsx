import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Leaf, Search, FileText, type LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState = ({ icon: Icon = Leaf, title, description, action, className }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}
  >
    <div className="relative mb-6">
      <div className="h-20 w-20 rounded-full bg-muted/60 flex items-center justify-center">
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <div className="absolute -inset-2 rounded-full border-2 border-dashed border-muted-foreground/20 animate-[chakra-spin_20s_linear_infinite]" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
    {action && (
      <Button onClick={action.onClick} className="click-ripple">
        {action.label}
      </Button>
    )}
  </motion.div>
);
