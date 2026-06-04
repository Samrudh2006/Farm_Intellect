import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useMarketPrices, type MarketPriceSource } from "@/hooks/useMarketPrices";

const SOURCE_LABEL: Record<MarketPriceSource, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  live: { label: "Fresh (live API)", variant: "default" },
  cache: { label: "Fresh (cache)", variant: "secondary" },
  "cache-stale": { label: "Stale cache", variant: "outline" },
  "ai-fallback": { label: "AI fallback", variant: "outline" },
  unavailable: { label: "Unavailable", variant: "destructive" },
};

/**
 * Admin-only debug panel showing the current market-prices data source,
 * last fetch time, and a manual refresh control. Renders nothing for
 * non-admin users so it is safe to mount anywhere.
 */
export const MarketPricesDebugPanel = ({ state = "Punjab", district = "" }: { state?: string; district?: string }) => {
  const { isAdmin } = useAuth();
  const { prices, source, lastFetched, loading, error, staleAgeMs, refresh } = useMarketPrices(state, district);

  if (!isAdmin) return null;

  const meta = SOURCE_LABEL[source];

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Market-prices debug (admin)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {staleAgeMs !== undefined && (
            <Badge variant="outline">stale age: {Math.round(staleAgeMs / 1000)}s</Badge>
          )}
          <Badge variant="outline">{prices.length} rows</Badge>
        </div>
        <div className="text-muted-foreground text-xs">
          Last fetch: {lastFetched ? new Date(lastFetched).toLocaleTimeString() : "—"}
          {" · "}Region: {state}{district ? ` / ${district}` : ""}
        </div>
        {error && <p className="text-xs text-destructive">Error: {error}</p>}
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
};

export default MarketPricesDebugPanel;
