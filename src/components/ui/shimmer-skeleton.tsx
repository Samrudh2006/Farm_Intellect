import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "avatar" | "chart";
}

export const ShimmerSkeleton = ({ className, variant = "text" }: ShimmerSkeletonProps) => {
  const base = "relative overflow-hidden bg-muted/60 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-background/40 before:to-transparent before:animate-shimmer before:bg-[length:200%_100%]";

  if (variant === "card") {
    return (
      <div className={cn("rounded-xl p-6 space-y-4", base, className)}>
        <div className={cn("h-4 w-2/3 rounded-md", base)} />
        <div className={cn("h-3 w-full rounded-md", base)} />
        <div className={cn("h-3 w-4/5 rounded-md", base)} />
        <div className={cn("h-8 w-1/3 rounded-md mt-4", base)} />
      </div>
    );
  }

  if (variant === "avatar") {
    return <div className={cn("h-10 w-10 rounded-full", base, className)} />;
  }

  if (variant === "chart") {
    return (
      <div className={cn("rounded-xl p-6 space-y-3", base, className)}>
        <div className="flex items-end gap-2 h-32">
          {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <div key={i} className={cn("flex-1 rounded-t-md", base)} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return <div className={cn("h-4 rounded-md", base, className)} />;
};

export const SkeletonDashboard = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ShimmerSkeleton key={i} variant="card" className="h-36" />
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <ShimmerSkeleton variant="chart" className="h-64" />
      <ShimmerSkeleton variant="chart" className="h-64" />
    </div>
  </div>
);
