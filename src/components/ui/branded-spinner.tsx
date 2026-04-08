import { cn } from "@/lib/utils";
import { AshokaChakra } from "./ashoka-chakra";

interface BrandedSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const BrandedSpinner = ({ size = "md", text, className }: BrandedSpinnerProps) => {
  const sizeMap = { sm: 28, md: 48, lg: 72 };
  const textSize = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        <AshokaChakra size={sizeMap[size]} animate />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary) / 0.2) 25%, transparent 50%)",
            animation: "chakra-spin 2s linear infinite reverse",
          }}
        />
      </div>
      {text && <p className={cn("text-muted-foreground animate-pulse", textSize[size])}>{text}</p>}
    </div>
  );
};
