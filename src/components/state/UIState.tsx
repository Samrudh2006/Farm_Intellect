import { Loader2, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shared, deterministic state components used across widgets so every
 * widget renders a known UI for loading / error / empty conditions.
 */

export interface UIStateProps {
  className?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const LoadingState = ({ className, title = "Loading…", description, compact }: UIStateProps) => (
  <div
    role="status"
    aria-live="polite"
    data-ui-state="loading"
    className={cn(
      "flex flex-col items-center justify-center gap-2 text-muted-foreground",
      compact ? "py-4" : "py-10",
      className,
    )}
  >
    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
    <p className="text-sm font-medium">{title}</p>
    {description && <p className="text-xs">{description}</p>}
  </div>
);

export const ErrorState = ({
  className,
  title = "Something went wrong",
  description = "We could not load this section. Please try again.",
  onRetry,
  compact,
}: UIStateProps) => (
  <div
    role="alert"
    data-ui-state="error"
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 text-center",
      compact ? "p-4" : "p-8",
      className,
    )}
  >
    <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
    <div>
      <p className="text-sm font-semibold text-destructive">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
    {onRetry && (
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
      </Button>
    )}
  </div>
);

export const EmptyState = ({
  className,
  title = "Nothing to show yet",
  description = "Data will appear here once available.",
  onRetry,
  compact,
}: UIStateProps) => (
  <div
    data-ui-state="empty"
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center",
      compact ? "p-4" : "p-8",
      className,
    )}
  >
    <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
    {onRetry && (
      <Button size="sm" variant="ghost" onClick={onRetry}>
        Refresh
      </Button>
    )}
  </div>
);

export const SkeletonRows = ({ rows = 3, className }: { rows?: number; className?: string }) => (
  <div data-ui-state="loading-skeleton" className={cn("space-y-2", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);
