import { useState } from "react";
import { ExpertConsultationWorkflow } from "@/components/features/ExpertConsultationWorkflow";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAdvisory } from "@/hooks/useAdvisory";
import { 
  Brain, 
  Calendar, 
  TrendingUp,
  Wheat,
  Droplets,
  Bug,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { cropRecommendationsMetadata } from "@/data/cropRecommendations";
import { pestDataMetadata } from "@/data/pestData";
import { soilHealthMetadata } from "@/data/soilHealth";

const typeIcons = {
  irrigation: Droplets,
  fertilizer: Zap,
  pest: Bug,
  harvest: Wheat,
  planting: Calendar,
};

const typeColors = {
  irrigation: "text-water",
  fertilizer: "text-harvest", 
  pest: "text-destructive",
  harvest: "text-primary",
  planting: "text-earth",
};

const priorityColors = {
  high: "destructive",
  medium: "secondary", 
  low: "outline",
};

const statusColors = {
  pending: "secondary",
  "in-progress": "default",
  completed: "outline",
};

const Advisory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const { user } = useCurrentUser();
  const { articles, loading, error } = useAdvisory();

  const filteredAdvisory = filter === "all" 
    ? articles.map(article => ({
        id: parseInt(article.id),
        title: article.title,
        type: "general",
        priority: "medium",
        crop: article.crop_type || "General",
        field: "Advisory",
        description: article.content.substring(0, 100),
        recommendation: article.content,
        confidence: 85,
        createdDate: article.created_at,
        status: "pending",
        aiGenerated: false
      }))
    : [];

  const advisorySources = [
    { label: "Crop recommendations", meta: cropRecommendationsMetadata },
    { label: "Pest intelligence", meta: pestDataMetadata },
    { label: "Soil health baselines", meta: soilHealthMetadata },
  ];

  const formatUpdatedAt = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: user.name, role: "farmer" }}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={3}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole="farmer"
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Advisory Center</h2>
              <p className="text-muted-foreground">
                AI-powered recommendations, irrigation guidance, and bookable expert support for your crops
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Insights</span>
            </div>
          </div>

          <ExpertConsultationWorkflow />

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "in-progress", label: "In Progress" }, 
              { key: "completed", label: "Completed" }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(tab.key)}
                className="mb-2"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Advisory data freshness</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">Verified sources</Badge>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-3">
              {advisorySources.map(({ label, meta }) => (
                <div key={label} className="rounded-md border border-border bg-background p-3 text-sm">
                  <div className="font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">Updated {formatUpdatedAt(meta.lastUpdated)}</div>
                  <div className="text-xs text-muted-foreground">Version {meta.version}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advisory Cards */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground mt-4">Loading advisory articles...</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
              Error loading articles: {error}
            </div>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredAdvisory.map((advisory) => {
              const TypeIcon = typeIcons[advisory.type as keyof typeof typeIcons];
              
              return (
                <Card key={advisory.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <TypeIcon className={`h-6 w-6 ${typeColors[advisory.type as keyof typeof typeColors]}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{advisory.title}</CardTitle>
                            {advisory.aiGenerated && (
                              <Badge variant="outline" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            {advisory.crop} • {advisory.field}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={priorityColors[advisory.priority as keyof typeof priorityColors] as any}>
                          {advisory.priority} priority
                        </Badge>
                        <Badge variant={statusColors[advisory.status as keyof typeof statusColors] as any}>
                          {advisory.status === "in-progress" ? "In Progress" : advisory.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Analysis</h4>
                      <p className="text-sm text-muted-foreground">{advisory.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recommendation</h4>
                      <p className="text-sm">{advisory.recommendation}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(advisory.createdDate).toLocaleDateString()}
                        </div>
                        {advisory.aiGenerated && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {advisory.confidence}% confidence
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {advisory.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline">
                              <Clock className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Apply
                            </Button>
                          </>
                        )}
                        {advisory.status === "in-progress" && (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>

              {filteredAdvisory.length === 0 && (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No advisory items found</h3>
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? "Advisory recommendations will appear here as they become available"
                    : `No ${filter} advisory items at the moment`
                  }
                </p>
              </div>
              )}
            )}
        </div>
      </main>
    </div>
  );
};

export default Advisory;
