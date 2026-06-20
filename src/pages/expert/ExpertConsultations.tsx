import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Users } from "lucide-react";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DEFAULT_MOCK_CONSULTATIONS = [
  {
    id: "cons-1",
    farmer_id: "mock-farmer-1",
    expert_id: null,
    title: "Wheat leaf discoloration",
    description: "My wheat crop leaves are turning yellow with brown spots.",
    category: "Disease",
    priority: "high",
    status: "pending",
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "cons-2",
    farmer_id: "mock-farmer-2",
    expert_id: "mock-expert-1",
    title: "Best fertilizer for cotton",
    description: "What NPK ratio should I use for BT cotton at flowering stage?",
    category: "Nutrition",
    priority: "medium",
    status: "assigned",
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const ExpertConsultations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      if (!hasSupabaseEnv) {
        let stored = localStorage.getItem("mock_consultations");
        if (!stored) {
          localStorage.setItem("mock_consultations", JSON.stringify(DEFAULT_MOCK_CONSULTATIONS));
          stored = JSON.stringify(DEFAULT_MOCK_CONSULTATIONS);
        }
        setConsultations(JSON.parse(stored));
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
      setConsultations(data || []);
    } catch (err) {
      console.warn("Failed to fetch consultations, using mock fallback");
      setConsultations(DEFAULT_MOCK_CONSULTATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleAssign = async (id: string) => {
    if (!hasSupabaseEnv) {
      const updated = consultations.map(c => 
        c.id === id ? { ...c, expert_id: authUser?.id || "mock-expert-1", status: "assigned", updated_at: new Date().toISOString() } : c
      );
      localStorage.setItem("mock_consultations", JSON.stringify(updated));
      setConsultations(updated);
      toast({ title: "Consultation assigned to you (Mock)" });
      return;
    }

    if (!authUser?.id) return;
    await supabase.from("consultations").update({ expert_id: authUser.id, status: "assigned", updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Consultation assigned to you" });
    fetch();
  };

  const handleResolve = async () => {
    if (!resolveId || !resolution) return;

    if (!hasSupabaseEnv) {
      const updated = consultations.map(c => 
        c.id === resolveId ? { 
          ...c, 
          status: "resolved", 
          resolution, 
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        } : c
      );
      localStorage.setItem("mock_consultations", JSON.stringify(updated));
      setConsultations(updated);
      toast({ title: "Consultation resolved (Mock)!" });
      setResolveId(null);
      setResolution("");
      return;
    }

    await supabase.from("consultations").update({
      status: "resolved",
      resolution,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", resolveId);
    toast({ title: "Consultation resolved!" });
    setResolveId(null);
    setResolution("");
    fetch();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-accent/10 text-accent",
      assigned: "bg-navy/10 text-navy",
      resolved: "bg-primary/10 text-primary",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-accent/10 text-accent", low: "bg-muted text-muted-foreground" };
    return map[p] || "bg-muted text-muted-foreground";
  };

  const stats = {
    total: consultations.length,
    pending: consultations.filter(c => c.status === "pending").length,
    assigned: consultations.filter(c => c.status === "assigned").length,
    resolved: consultations.filter(c => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "expert" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="expert" />
      <main className="md:ml-64 pt-16 p-6">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gradient-tricolor">🔬 Consultation Queue</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Total", value: stats.total, color: "primary" },
              { icon: Clock, label: "Pending", value: stats.pending, color: "accent" },
              { icon: MessageSquare, label: "Assigned", value: stats.assigned, color: "navy" },
              { icon: CheckCircle, label: "Resolved", value: stats.resolved, color: "primary" },
            ].map((s, i) => (
              <Card key={i} className="tricolor-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-${s.color}/10`}><s.icon className={`h-5 w-5 text-${s.color}`} /></div>
                  <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="tricolor-card">
            <CardHeader><CardTitle>Farmer Consultations</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full mb-3" />)
              ) : consultations.length > 0 ? (
                <div className="divide-y divide-border">
                  {consultations.map(c => (
                    <div key={c.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{c.title}</span>
                          <Badge className={statusBadge(c.status)}>{c.status}</Badge>
                          <Badge className={priorityBadge(c.priority)}>{c.priority}</Badge>
                          {c.category && <Badge variant="outline">{c.category}</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{c.created_at ? format(new Date(c.created_at), "MMM dd, HH:mm") : ""}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                      {c.resolution && <p className="text-sm text-primary bg-primary/5 p-2 rounded">✅ {c.resolution}</p>}
                      <div className="flex gap-2">
                        {c.status === "pending" && (
                          <Button size="sm" onClick={() => handleAssign(c.id)}>Take Case</Button>
                        )}
                        {c.status === "assigned" && c.expert_id === authUser?.id && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setResolveId(c.id)}>Resolve</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Resolve Consultation</DialogTitle></DialogHeader>
                              <div className="space-y-4">
                                <div><Label>Resolution / Advice</Label><Textarea value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Enter your expert advice..." rows={4} /></div>
                                <Button onClick={handleResolve} className="w-full bg-primary text-primary-foreground">Submit Resolution</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No consultations in queue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ExpertConsultations;
