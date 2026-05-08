import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Search, Send, Users, CheckCircle2, XCircle } from "lucide-react";

interface Subscriber {
  id: string; name: string; phone: string; state: string; district: string;
  crop: string | null; language: string; source: string; active: boolean; created_at: string;
}
interface LogRow {
  id: string; template_key: string; status: string; body: string; sent_at: string | null; error: string | null;
}

const AdminSms = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: l }] = await Promise.all([
      supabase.from("sms_subscribers").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("sms_log").select("id, template_key, status, body, sent_at, error").order("created_at", { ascending: false }).limit(50),
    ]);
    setSubs((s as Subscriber[]) || []);
    setLogs((l as LogRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const sendTest = async (kind: "weather" | "market" | "crop") => {
    setSending(true);
    const { data, error } = await supabase.functions.invoke("sms-dispatcher", { body: { kind, dryRun: false, limit: 50 } });
    setSending(false);
    if (error) { toast({ title: "Dispatch failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Dispatched", description: `Sent ${data?.sent ?? 0} • Skipped ${data?.skipped ?? 0} • Failed ${data?.failed ?? 0}` });
    load();
  };

  const filtered = subs.filter((s) =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.phone.includes(q) || s.district.toLowerCase().includes(q.toLowerCase())
  );

  const active = subs.filter((s) => s.active).length;

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: user.role }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} notificationCount={0} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />
      <main className="space-y-6 p-4 sm:p-6 md:ml-64">
        <div className="flex flex-wrap items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">SMS Alerts Console</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-primary" />
            <div><div className="text-2xl font-bold">{subs.length}</div><div className="text-xs text-muted-foreground">Total subscribers</div></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div><div className="text-2xl font-bold">{active}</div><div className="text-xs text-muted-foreground">Active</div></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-8 w-8 text-destructive" />
            <div><div className="text-2xl font-bold">{subs.length - active}</div><div className="text-xs text-muted-foreground">Opted out</div></div>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Dispatch alerts now</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(["weather", "market", "crop"] as const).map((k) => (
              <Button key={k} disabled={sending} onClick={() => sendTest(k)} variant="outline">
                <Send className="mr-2 h-4 w-4" /> Send {k} batch
              </Button>
            ))}
            <p className="w-full pt-2 text-xs text-muted-foreground">
              MSG91 must be configured (MSG91_AUTH_KEY, MSG91_SENDER_ID secrets). Without it the dispatcher logs as <code>queued</code> for review and does not bill.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Subscribers</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Name, phone, district…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscribers yet. Share <code>/sms-register</code> with farmers.</p>
            ) : (
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr><th className="py-2">Name</th><th>Phone</th><th>District</th><th>Crop</th><th>Lang</th><th>Source</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2">{s.name}</td>
                      <td className="font-mono text-xs">{s.phone}</td>
                      <td>{s.district}, {s.state}</td>
                      <td>{s.crop ?? "—"}</td>
                      <td><Badge variant="secondary">{s.language}</Badge></td>
                      <td className="text-xs">{s.source}</td>
                      <td>{s.active ? <Badge>Active</Badge> : <Badge variant="outline">Opted out</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent SMS log</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {logs.length === 0 ? <p className="text-sm text-muted-foreground">No SMS sent yet.</p> : (
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr><th className="py-2">When</th><th>Template</th><th>Status</th><th>Body</th></tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t border-border align-top">
                      <td className="py-2 text-xs">{l.sent_at ? new Date(l.sent_at).toLocaleString("en-IN") : "—"}</td>
                      <td className="text-xs">{l.template_key}</td>
                      <td><Badge variant={l.status === "sent" || l.status === "delivered" ? "default" : l.status === "failed" ? "destructive" : "secondary"}>{l.status}</Badge></td>
                      <td className="max-w-md truncate text-xs text-muted-foreground" title={l.body}>{l.body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSms;
