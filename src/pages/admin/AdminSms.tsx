import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Search, Send, Users, CheckCircle2, XCircle, Upload, CalendarClock, IndianRupee } from "lucide-react";

type SmsKind = "weather" | "market" | "crop" | "scheme";

interface Subscriber {
  id: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  village: string | null;
  gram_panchayat: string | null;
  crop: string | null;
  language: string;
  source: string;
  active: boolean;
  plan_tier: string;
  plan_status: string;
  monthly_sms_quota: number;
  sms_sent_this_month: number;
  created_at: string;
}

interface LogRow {
  id: string;
  subscriber_id: string | null;
  template_key: string;
  status: string;
  body: string;
  sent_at: string | null;
  error: string | null;
}

interface ScheduleRow {
  id: string;
  name: string;
  kind: SmsKind;
  template_key: string;
  day_of_week: number;
  send_time: string;
  active: boolean;
}

interface TemplateRow {
  id: string;
  key: string;
  language: string;
  body: string;
  dlt_template_id: string | null;
}

interface BillingAccountRow {
  id: string;
  account_name: string;
  account_type: string;
  plan_tier: string;
  billing_status: string;
  monthly_budget_paise: number;
}

interface PaymentRow {
  id: string;
  amount_paise: number;
  status: string;
  payment_provider: string;
  created_at: string;
}

interface OptOutRow {
  id: string;
  phone: string;
  keyword: string;
  source: string;
  created_at: string;
}

const DAYS: Array<{ value: number; label: string }> = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const normalizeIndianPhone = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (raw.startsWith("+91") && digits.length === 12) return `+${digits}`;
  return null;
};

const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  out.push(current.trim());
  return out;
};

const AdminSms = () => {
  const { user } = useCurrentUser();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [q, setQ] = useState("");

  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [billingAccounts, setBillingAccounts] = useState<BillingAccountRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [optOutEvents, setOptOutEvents] = useState<OptOutRow[]>([]);

  const [bulkCsv, setBulkCsv] = useState("");
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    kind: "weather" as SmsKind,
    template_key: "weather_default",
    day_of_week: "1",
    send_time: "06:00",
  });
  const [newTemplate, setNewTemplate] = useState({
    key: "weather_default",
    language: "hi",
    body: "",
    dlt_template_id: "",
  });

  const load = async () => {
    setLoading(true);
    const [
      subsRes,
      logsRes,
      schedulesRes,
      templatesRes,
      billingRes,
      paymentsRes,
      optOutRes,
    ] = await Promise.all([
      supabase.from("sms_subscribers").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("sms_log").select("id, subscriber_id, template_key, status, body, sent_at, error").order("created_at", { ascending: false }).limit(200),
      (supabase as any).from("sms_schedules").select("*").order("day_of_week", { ascending: true }),
      supabase.from("sms_templates").select("*").order("key", { ascending: true }).limit(200),
      (supabase as any).from("billing_accounts").select("*").order("created_at", { ascending: false }).limit(200),
      (supabase as any).from("payment_transactions").select("id, amount_paise, status, payment_provider, created_at").order("created_at", { ascending: false }).limit(200),
      (supabase as any).from("sms_opt_out_events").select("id, phone, keyword, source, created_at").order("created_at", { ascending: false }).limit(200),
    ]);

    setSubs((subsRes.data as unknown as Subscriber[]) ?? []);
    setLogs((logsRes.data as LogRow[]) ?? []);
    setSchedules((schedulesRes.data as unknown as ScheduleRow[]) ?? []);
    setTemplates((templatesRes.data as TemplateRow[]) ?? []);
    setBillingAccounts((billingRes.data as unknown as BillingAccountRow[]) ?? []);
    setPayments((paymentsRes.data as unknown as PaymentRow[]) ?? []);
    setOptOutEvents((optOutRes.data as unknown as OptOutRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load().catch((error: unknown) => {
      toast({
        title: "Could not load admin SMS data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendBatch = async (kind: SmsKind, retryFailed = false) => {
    setSending(true);
    const { data, error } = await supabase.functions.invoke("sms-dispatcher", {
      body: { kind, dryRun: false, limit: 100, retryFailed },
    });
    setSending(false);
    if (error) {
      toast({ title: "Dispatch failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: retryFailed ? "Retry batch complete" : "Batch dispatched",
      description: `Sent ${data?.sent ?? 0} • Failed ${data?.failed ?? 0} • Blocked ${data?.blocked ?? 0} • Skipped ${data?.skipped ?? 0}`,
    });
    void load();
  };

  const filtered = useMemo(
    () =>
      subs.filter((s) =>
        !q ||
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.phone.includes(q) ||
        s.district.toLowerCase().includes(q.toLowerCase()),
      ),
    [subs, q],
  );

  const active = subs.filter((s) => s.active).length;
  const totalBudget = billingAccounts.reduce((sum, row) => sum + row.monthly_budget_paise, 0);
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, row) => sum + row.amount_paise, 0);
  const failedRows = logs.filter((row) => row.status === "failed" || row.status === "retry_pending");

  const handleBulkRegister = async () => {
    if (!bulkCsv.trim()) {
      toast({ title: "Paste CSV rows first", variant: "destructive" });
      return;
    }
    const rows = bulkCsv
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const allowedTiers = new Set(["free", "basic", "pro", "institutional"]);
    const parsedRows: Array<{
      name: string;
      phone: string;
      state: string;
      district: string;
      crop: string | null;
      language: string;
      village: string | null;
      gram_panchayat: string | null;
      plan_tier: string;
    }> = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const columns = parseCsvLine(row).map((x) => x?.trim());
      if (columns.length < 9) {
        validationErrors.push(`Row ${i + 1}: expected 9 columns, got ${columns.length}.`);
        continue;
      }
      const [name, phone, state, district, crop, language, village, gramPanchayat, planTier] = columns;
      const normalizedPhone = normalizeIndianPhone(phone ?? "");
      if (!normalizedPhone) {
        validationErrors.push(`Row ${i + 1}: invalid phone "${phone}".`);
        continue;
      }

      const normalizedTier = (planTier || "free").toLowerCase();
      if (!allowedTiers.has(normalizedTier)) {
        validationErrors.push(`Row ${i + 1}: unsupported plan tier "${planTier}".`);
        continue;
      }

      parsedRows.push({
        name: name || "Farmer",
        phone: normalizedPhone,
        state: state || "Unknown",
        district: district || "Unknown",
        crop: crop || null,
        language: language || "hi",
        village: village || null,
        gram_panchayat: gramPanchayat || null,
        plan_tier: normalizedTier,
      });
    }

    if (validationErrors.length > 0) {
      toast({
        title: "CSV validation failed",
        description: validationErrors.slice(0, 3).join(" | "),
        variant: "destructive",
      });
      return;
    }

    const phones = parsedRows.map((row) => row.phone);
    const { data: existingRows, error: existingError } = await supabase
      .from("sms_subscribers")
      .select("id, phone")
      .in("phone", phones);
    if (existingError) {
      toast({ title: "Bulk register failed", description: existingError.message, variant: "destructive" });
      return;
    }

    const existingByPhone = new Map((existingRows ?? []).map((row) => [row.phone, row.id]));
    const insertRows = parsedRows
      .filter((row) => !existingByPhone.has(row.phone))
      .map((row) => ({
        ...row,
        source: "sevak_bulk",
        farmer_type: "sevak_registered",
        plan_status: "active",
        registered_by: authUser?.id ?? null,
        sevak_id: authUser?.id ?? null,
      }));
    const updateRows = parsedRows.filter((row) => existingByPhone.has(row.phone));

    if (insertRows.length > 0) {
      const { error: insertError } = await supabase.from("sms_subscribers").insert(insertRows);
      if (insertError) {
        toast({ title: "Bulk register failed", description: insertError.message, variant: "destructive" });
        return;
      }
    }

    for (const row of updateRows) {
      const { error: updateError } = await supabase
        .from("sms_subscribers")
        .update({
          name: row.name,
          state: row.state,
          district: row.district,
          crop: row.crop,
          language: row.language,
          village: row.village,
          gram_panchayat: row.gram_panchayat,
          source: "sevak_bulk",
          farmer_type: "sevak_registered",
          registered_by: authUser?.id ?? null,
          sevak_id: authUser?.id ?? null,
        })
        .eq("phone", row.phone);
      if (updateError) {
        toast({ title: "Bulk update failed", description: updateError.message, variant: "destructive" });
        return;
      }
    }

    toast({
      title: "Field operations updated",
      description: `Inserted ${insertRows.length}, updated ${updateRows.length} (total ${parsedRows.length}).`,
    });
    setBulkCsv("");
    void load();
  };

  const addSchedule = async () => {
    const { error } = await (supabase as any).from("sms_schedules").insert({
      name: newSchedule.name,
      kind: newSchedule.kind,
      template_key: newSchedule.template_key,
      day_of_week: Number(newSchedule.day_of_week),
      send_time: newSchedule.send_time,
      created_by: authUser?.id ?? null,
      active: true,
    });
    if (error) {
      toast({ title: "Could not add schedule", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Schedule added" });
    setNewSchedule({ name: "", kind: "weather", template_key: "weather_default", day_of_week: "1", send_time: "06:00" });
    void load();
  };

  const saveTemplate = async () => {
    const { error } = await supabase.from("sms_templates").upsert({
      key: newTemplate.key.trim(),
      language: newTemplate.language.trim(),
      body: newTemplate.body.trim(),
      dlt_template_id: newTemplate.dlt_template_id.trim() || null,
    });
    if (error) {
      toast({ title: "Template save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Template saved" });
    setNewTemplate((prev) => ({ ...prev, body: "", dlt_template_id: "" }));
    void load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: user.role }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} notificationCount={0} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />
      <main className="space-y-6 p-4 sm:p-6 md:ml-64">
        <div className="flex flex-wrap items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">SMS Alerts + Field Operations</h1>
          <Badge variant="outline">Sevak workflows are inside Admin (default)</Badge>
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
            <div><div className="text-2xl font-bold">{subs.length - active}</div><div className="text-xs text-muted-foreground">Inactive / Opted out</div></div>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Dispatch now</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(["weather", "market", "crop", "scheme"] as SmsKind[]).map((kind) => (
              <Button key={kind} disabled={sending} onClick={() => void sendBatch(kind)} variant="outline">
                <Send className="mr-2 h-4 w-4" /> Send {kind}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Tabs defaultValue="subscribers" className="space-y-4">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2">
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Register</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="failures">Failures</TabsTrigger>
            <TabsTrigger value="optout">Opt-outs</TabsTrigger>
          </TabsList>

          <TabsContent value="subscribers">
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
                  <p className="text-sm text-muted-foreground">No subscribers yet. Share <code>/sms-register</code>.</p>
                ) : (
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr><th className="py-2">Name</th><th>Phone</th><th>District</th><th>Village</th><th>Crop</th><th>Plan</th><th>Usage</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} className="border-t border-border">
                          <td className="py-2">{s.name}</td>
                          <td className="font-mono text-xs">{s.phone}</td>
                          <td>{s.district}, {s.state}</td>
                          <td className="text-xs">{s.village ?? "—"}{s.gram_panchayat ? ` (${s.gram_panchayat})` : ""}</td>
                          <td>{s.crop ?? "—"}</td>
                          <td><Badge variant="secondary">{s.plan_tier}</Badge> <span className="text-xs text-muted-foreground">{s.plan_status}</span></td>
                          <td className="text-xs">{s.sms_sent_this_month}/{s.monthly_sms_quota}</td>
                          <td>{s.active ? <Badge>Active</Badge> : <Badge variant="outline">Off</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Admin &gt; Field Operations (Sevak/Sarpanch bulk register)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  CSV format per line: <code>name,phone,state,district,crop,language,village,gramPanchayat,planTier</code>
                </p>
                <Textarea
                  value={bulkCsv}
                  onChange={(e) => setBulkCsv(e.target.value)}
                  className="min-h-48"
                  placeholder={"Ramesh Patil,9876543210,Maharashtra,Nashik,Onion,mr,Devgaon,Devgaon GP,basic\nSita Devi,9123456789,Uttar Pradesh,Varanasi,Wheat,hi,Shivpur,Shivpur GP,free"}
                />
                <Button onClick={() => void handleBulkRegister()}><Upload className="mr-2 h-4 w-4" /> Process bulk rows</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules">
            <Card>
              <CardHeader><CardTitle>Weekly schedule builder</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-5">
                  <div className="space-y-1"><Label>Name</Label><Input value={newSchedule.name} onChange={(e) => setNewSchedule((s) => ({ ...s, name: e.target.value }))} /></div>
                  <div className="space-y-1">
                    <Label>Kind</Label>
                    <Select value={newSchedule.kind} onValueChange={(value) => setNewSchedule((s) => ({ ...s, kind: value as SmsKind }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(["weather", "market", "crop", "scheme"] as SmsKind[]).map((kind) => <SelectItem key={kind} value={kind}>{kind}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Template key</Label><Input value={newSchedule.template_key} onChange={(e) => setNewSchedule((s) => ({ ...s, template_key: e.target.value }))} /></div>
                  <div className="space-y-1">
                    <Label>Day</Label>
                    <Select value={newSchedule.day_of_week} onValueChange={(value) => setNewSchedule((s) => ({ ...s, day_of_week: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DAYS.map((day) => <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Time</Label><Input type="time" value={newSchedule.send_time} onChange={(e) => setNewSchedule((s) => ({ ...s, send_time: e.target.value }))} /></div>
                </div>
                <Button onClick={() => void addSchedule()}><CalendarClock className="mr-2 h-4 w-4" /> Add schedule</Button>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Name</th><th>Kind</th><th>Template</th><th>Day</th><th>Time</th><th>Status</th></tr></thead>
                    <tbody>
                      {schedules.map((s) => (
                        <tr key={s.id} className="border-t border-border">
                          <td className="py-2">{s.name}</td>
                          <td><Badge variant="secondary">{s.kind}</Badge></td>
                          <td className="text-xs">{s.template_key}</td>
                          <td>{DAYS.find((d) => d.value === s.day_of_week)?.label ?? s.day_of_week}</td>
                          <td>{s.send_time}</td>
                          <td>{s.active ? <Badge>Active</Badge> : <Badge variant="outline">Disabled</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader><CardTitle>Template editor (language fallback ready)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1"><Label>Key</Label><Input value={newTemplate.key} onChange={(e) => setNewTemplate((s) => ({ ...s, key: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Language</Label><Input value={newTemplate.language} onChange={(e) => setNewTemplate((s) => ({ ...s, language: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>DLT template ID</Label><Input value={newTemplate.dlt_template_id} onChange={(e) => setNewTemplate((s) => ({ ...s, dlt_template_id: e.target.value }))} /></div>
                  <div className="space-y-1 flex items-end"><Button className="w-full" onClick={() => void saveTemplate()}>Save template</Button></div>
                </div>
                <Textarea value={newTemplate.body} onChange={(e) => setNewTemplate((s) => ({ ...s, body: e.target.value }))} placeholder="Keep under 160 characters" />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Key</th><th>Language</th><th>DLT</th><th>Body</th></tr></thead>
                    <tbody>
                      {templates.map((t) => (
                        <tr key={t.id} className="border-t border-border align-top">
                          <td className="py-2 text-xs">{t.key}</td>
                          <td><Badge variant="secondary">{t.language}</Badge></td>
                          <td className="text-xs">{t.dlt_template_id ?? "—"}</td>
                          <td className="text-xs text-muted-foreground">{t.body}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader><CardTitle>Billing placeholders and plan monitor</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Billing accounts</div><div className="text-2xl font-bold">{billingAccounts.length}</div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Monthly budget</div><div className="text-2xl font-bold">₹{(totalBudget / 100).toLocaleString("en-IN")}</div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Paid collections</div><div className="text-2xl font-bold flex items-center"><IndianRupee className="h-5 w-5" />{(totalPaid / 100).toLocaleString("en-IN")}</div></CardContent></Card>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Account</th><th>Type</th><th>Plan</th><th>Status</th><th>Budget</th></tr></thead>
                    <tbody>
                      {billingAccounts.map((b) => (
                        <tr key={b.id} className="border-t border-border">
                          <td className="py-2">{b.account_name}</td>
                          <td>{b.account_type}</td>
                          <td><Badge>{b.plan_tier}</Badge></td>
                          <td>{b.billing_status}</td>
                          <td>₹{(b.monthly_budget_paise / 100).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="failures">
            <Card>
              <CardHeader><CardTitle>Failed-delivery retry queue</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(["weather", "market", "crop", "scheme"] as SmsKind[]).map((kind) => (
                    <Button key={kind} variant="outline" disabled={sending} onClick={() => void sendBatch(kind, true)}>Retry {kind} failures</Button>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Template</th><th>Status</th><th>Error</th><th>When</th></tr></thead>
                    <tbody>
                      {failedRows.map((row) => (
                        <tr key={row.id} className="border-t border-border">
                          <td className="py-2 text-xs">{row.template_key}</td>
                          <td><Badge variant="destructive">{row.status}</Badge></td>
                          <td className="text-xs text-muted-foreground">{row.error ?? "—"}</td>
                          <td className="text-xs">{row.sent_at ? new Date(row.sent_at).toLocaleString("en-IN") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optout">
            <Card>
              <CardHeader><CardTitle>STOP / opt-out audit</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[660px] text-sm">
                  <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Phone</th><th>Keyword</th><th>Source</th><th>At</th></tr></thead>
                  <tbody>
                    {optOutEvents.map((e) => (
                      <tr key={e.id} className="border-t border-border">
                        <td className="py-2 font-mono text-xs">{e.phone}</td>
                        <td><Badge variant="secondary">{e.keyword}</Badge></td>
                        <td className="text-xs">{e.source}</td>
                        <td className="text-xs">{new Date(e.created_at).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSms;
