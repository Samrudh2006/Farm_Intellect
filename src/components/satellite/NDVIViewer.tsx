import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Satellite, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { ndviService, type NDVIData } from '@/lib/ndviService';

interface NDVIViewerProps {
  fieldId?: number;
  fieldName?: string;
}

export const NDVIViewer = ({ fieldId = 1, fieldName = 'Field A' }: NDVIViewerProps) => {
  const [ndviData, setNdviData] = useState<NDVIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'season'>('month');

  useEffect(() => {
    const loadNDVI = async () => {
      setLoading(true);
      try {
        const data = await ndviService.calculateFieldNDVI(fieldId, fieldName);
        setNdviData(data);
      } catch (error) {
        console.error('Failed to load NDVI data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNDVI();
  }, [fieldId, fieldName]);

  const getHealthBadge = (value: number) => {
    if (value > 0.6) return <Badge className="bg-green-600">Healthy</Badge>;
    if (value > 0.4) return <Badge className="bg-yellow-600">Moderate</Badge>;
    return <Badge className="bg-red-600">Stressed</Badge>;
  };

  const getStressColor = (stress: number) => {
    if (stress < 20) return 'text-green-600';
    if (stress < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Main NDVI Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Satellite Vegetation Index</CardTitle>
                <CardDescription>Real-time field health monitoring via NDVI</CardDescription>
              </div>
            </div>
            {ndviData && getHealthBadge(ndviData.current_ndvi)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full" />
            </div>
          ) : ndviData ? (
            <>
              {/* Current NDVI Display */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Current NDVI</p>
                  <p className="text-3xl font-bold">{ndviData.current_ndvi.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ndviData.current_ndvi > 0.6 ? 'Healthy vegetation' : 'Monitor closely'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Field Stress</p>
                  <p className={`text-3xl font-bold ${getStressColor(ndviData.stress_percentage)}`}>
                    {ndviData.stress_percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ndviData.stress_percentage < 30 ? 'Low stress' : 'Action required'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Heterogeneity</p>
                  <p className="text-3xl font-bold">{ndviData.spatial_heterogeneity.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ndviData.spatial_heterogeneity > 0.3 ? 'Variable' : 'Uniform'}
                  </p>
                </div>
              </div>

              {/* Stress Alert */}
              {ndviData.stress_percentage > 30 && (
                <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-200">Field Stress Detected</p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                        {ndviData.recommendations.includes('irrigation')
                          ? 'Irrigation recommended to address water stress'
                          : 'Check soil nutrients and apply recommended fertilizer'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recommendations</h4>
                <div className="grid gap-2">
                  {ndviData.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm capitalize">{rec.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend */}
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Weekly Trend</p>
                  <p className="text-xs text-muted-foreground">
                    {ndviData.weekly_trend > 0 ? 'Improving' : 'Declining'} vegetation index
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No NDVI data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'season'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
            className="capitalize"
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
  );
};
