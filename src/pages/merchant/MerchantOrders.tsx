import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Package, Truck, CheckCircle, Clock, IndianRupee } from "lucide-react";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DEFAULT_MOCK_ORDERS = [
  {
    id: "ord-1",
    crop_name: "Premium Basmati Rice",
    quantity_kg: 5000,
    price_per_kg: 75,
    total_amount: 375000,
    status: "in_transit",
    delivery_date: "2026-06-25",
    notes: "Requires dry transport. High quality grade A.",
    created_at: "2026-06-15T10:00:00Z"
  },
  {
    id: "ord-2",
    crop_name: "Sharbati Wheat",
    quantity_kg: 10000,
    price_per_kg: 28,
    total_amount: 280000,
    status: "pending",
    delivery_date: "2026-06-30",
    notes: "Direct procurement from Karnal farmers.",
    created_at: "2026-06-18T14:30:00Z"
  },
  {
    id: "ord-3",
    crop_name: "Organic Mustard Seeds",
    quantity_kg: 2500,
    price_per_kg: 60,
    total_amount: 150000,
    status: "delivered",
    delivery_date: "2026-06-10",
    notes: "Delivered in full, payment processed.",
    created_at: "2026-06-05T09:15:00Z"
  }
];

const MerchantOrders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ crop_name: "", quantity_kg: "", price_per_kg: "", delivery_date: "", notes: "" });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (!hasSupabaseEnv) {
        let stored = localStorage.getItem("mock_orders");
        if (!stored) {
          localStorage.setItem("mock_orders", JSON.stringify(DEFAULT_MOCK_ORDERS));
          stored = JSON.stringify(DEFAULT_MOCK_ORDERS);
        }
        setOrders(JSON.parse(stored));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.warn("Failed to fetch orders, using mock fallback:", err);
      setOrders(DEFAULT_MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCreate = async () => {
    if (!form.crop_name || !form.quantity_kg || !form.price_per_kg) return;
    
    const quantity = parseFloat(form.quantity_kg);
    const price = parseFloat(form.price_per_kg);
    
    if (!hasSupabaseEnv) {
      const newOrder = {
        id: `ord-${Date.now()}`,
        crop_name: form.crop_name,
        quantity_kg: quantity,
        price_per_kg: price,
        total_amount: quantity * price,
        status: "pending",
        delivery_date: form.delivery_date || null,
        notes: form.notes || null,
        created_at: new Date().toISOString()
      };
      const current = [...orders];
      const updated = [newOrder, ...current];
      localStorage.setItem("mock_orders", JSON.stringify(updated));
      setOrders(updated);
      toast({ title: "Order created (Mock)!" });
      setForm({ crop_name: "", quantity_kg: "", price_per_kg: "", delivery_date: "", notes: "" });
      setDialogOpen(false);
      return;
    }

    if (!authUser?.id) return;
    const { error } = await supabase.from("orders").insert({
      merchant_id: authUser.id,
      crop_name: form.crop_name,
      quantity_kg: quantity,
      price_per_kg: price,
      delivery_date: form.delivery_date || null,
      notes: form.notes || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Order created!" });
    setForm({ crop_name: "", quantity_kg: "", price_per_kg: "", delivery_date: "", notes: "" });
    setDialogOpen(false);
    fetchOrders();
  };

  const updateStatus = async (id: string, status: string) => {
    if (!hasSupabaseEnv) {
      const updated = orders.map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o);
      localStorage.setItem("mock_orders", JSON.stringify(updated));
      setOrders(updated);
      toast({ title: `Order status updated to ${status}!` });
      return;
    }

    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    fetchOrders();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-accent/10 text-accent",
      accepted: "bg-primary/10 text-primary",
      in_transit: "bg-navy/10 text-navy",
      delivered: "bg-primary/20 text-primary",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    active: orders.filter(o => ["accepted", "in_transit"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "merchant" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="merchant" />
      <main className="md:ml-64 pt-16 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient-tricolor">📦 Orders & Purchases</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New Order</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Crop Name</Label><Input value={form.crop_name} onChange={e => setForm(f => ({ ...f, crop_name: e.target.value }))} placeholder="e.g. Wheat" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Quantity (kg)</Label><Input type="number" value={form.quantity_kg} onChange={e => setForm(f => ({ ...f, quantity_kg: e.target.value }))} /></div>
                    <div><Label>Price (₹/kg)</Label><Input type="number" value={form.price_per_kg} onChange={e => setForm(f => ({ ...f, price_per_kg: e.target.value }))} /></div>
                  </div>
                  <div><Label>Delivery Date</Label><Input type="date" value={form.delivery_date} onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))} /></div>
                  <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
                  <Button onClick={handleCreate} className="w-full bg-primary text-primary-foreground">Create Order</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: "Total Orders", value: stats.total, color: "primary" },
              { icon: Clock, label: "Pending", value: stats.pending, color: "accent" },
              { icon: Truck, label: "Active", value: stats.active, color: "navy" },
              { icon: CheckCircle, label: "Delivered", value: stats.delivered, color: "primary" },
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
            <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full mb-3" />)
              ) : orders.length > 0 ? (
                <div className="divide-y divide-border">
                  {orders.map(order => (
                    <div key={order.id} className="flex items-center justify-between py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{order.crop_name}</span>
                          <Badge className={statusBadge(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity_kg}kg × ₹{order.price_per_kg}/kg = <span className="font-medium text-foreground">₹{order.total_amount?.toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{order.created_at ? format(new Date(order.created_at), "MMM dd, yyyy") : ""}</p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, "accepted")}>Accept</Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(order.id, "cancelled")}>Cancel</Button>
                          </>
                        )}
                        {order.status === "accepted" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, "in_transit")}>Ship</Button>
                        )}
                        {order.status === "in_transit" && (
                          <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => updateStatus(order.id, "delivered")}>Mark Delivered</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No orders yet. Create your first purchase order!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MerchantOrders;
