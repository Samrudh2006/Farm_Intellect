import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
  tinted?: boolean;
}

const GlassmorphicCard = React.forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ className, intensity = "medium", tinted = false, ...props }, ref) => {
    const blur = { light: "backdrop-blur-sm", medium: "backdrop-blur-md", heavy: "backdrop-blur-xl" }[intensity];
    const bg = tinted
      ? "bg-primary/5 dark:bg-primary/10"
      : "bg-card/40 dark:bg-card/30";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border/50 shadow-lg",
          blur,
          bg,
          "transition-all duration-300",
          className
        )}
        {...props}
      />
    );
  }
);
GlassmorphicCard.displayName = "GlassmorphicCard";

export { GlassmorphicCard };
