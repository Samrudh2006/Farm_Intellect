import * as React from "react";
import { cn } from "@/lib/utils";

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "pressed" | "convex";
}

const NeumorphicCard = React.forwardRef<HTMLDivElement, NeumorphicCardProps>(
  ({ className, variant = "flat", ...props }, ref) => {
    const variantClass = {
      flat: "shadow-[6px_6px_12px_hsl(var(--muted)/0.4),-6px_-6px_12px_hsl(var(--background)/0.8)] dark:shadow-[6px_6px_12px_hsl(200_15%_3%/0.5),-6px_-6px_12px_hsl(200_12%_12%/0.4)]",
      pressed: "shadow-[inset_4px_4px_8px_hsl(var(--muted)/0.5),inset_-4px_-4px_8px_hsl(var(--background)/0.8)] dark:shadow-[inset_4px_4px_8px_hsl(200_15%_3%/0.5),inset_-4px_-4px_8px_hsl(200_12%_12%/0.3)]",
      convex: "shadow-[6px_6px_12px_hsl(var(--muted)/0.4),-6px_-6px_12px_hsl(var(--background)/0.8)] bg-gradient-to-br from-background via-card to-muted/30 dark:shadow-[6px_6px_12px_hsl(200_15%_3%/0.5),-6px_-6px_12px_hsl(200_12%_12%/0.4)]",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl bg-card border-0 p-6 transition-all duration-300",
          variantClass,
          "hover:shadow-[8px_8px_16px_hsl(var(--muted)/0.5),-8px_-8px_16px_hsl(var(--background)/0.9)]",
          className
        )}
        {...props}
      />
    );
  }
);
NeumorphicCard.displayName = "NeumorphicCard";

export { NeumorphicCard };
