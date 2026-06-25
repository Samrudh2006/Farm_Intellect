import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, Shield, GraduationCap, Store, Search, RefreshCw } from "lucide-react";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

interface UserWithRole {
  user_id: string;
  display_name: string;
  email: string | null;
  location: string | null;
  created_at: string;
  role: string;
}

const DEFAULT_MOCK_USERS: UserWithRole[] = [
  {
    user_id: "mock-user-123412341234",
    display_name: "Rajesh Kumar",
    email: "rajesh@farmapp.local.io",
    location: "Karnal, Haryana",
    created_at: "2025-06-10T10:00:00Z",
    role: "farmer"
  },
  {
    user_id: "mock-user-222222222222",
    display_name: "Dr. Kavita Sharma",
    email: "kavita@farmapp.local.io",
    location: "IARI, New Delhi",
    created_at: "2025-05-15T14:20:00Z",
    role: "expert"
  },
  {
    user_id: "mock-user-333333333333",
    display_name: "Anil Gupta",
    email: "anil@farmapp.local.io",
    location: "Mandi, Punjab",
    created_at: "2025-04-12T09:15:00Z",
    role: "merchant"
  },
  {
    user_id: "mock-user-444444444444",
    display_name: "System Administrator",
    email: "admin@farmapp.local.io",
    location: "New Delhi, Delhi",
    created_at: "2025-01-01T00:00:00Z",
    role: "admin"
  }
];

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!hasSupabaseEnv) {
        let stored = localStorage.getItem("mock_users");
        if (!stored) {
          localStorage.setItem("mock_users", JSON.stringify(DEFAULT_MOCK_USERS));
          stored = JSON.stringify(DEFAULT_MOCK_USERS);
        }
        setUsers(JSON.parse(stored));
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, email, location, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      const merged: UserWithRole[] = (profiles || []).map((p) => ({
        ...p,
        role: roleMap.get(p.user_id) || "farmer",
      }));

      setUsers(merged);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
      // Fallback
      setUsers(DEFAULT_MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setChangingRole(targetUserId);
    if (!hasSupabaseEnv) {
      const updated = users.map((u) => (u.user_id === targetUserId ? { ...u, role: newRole } : u));
      localStorage.setItem("mock_users", JSON.stringify(updated));
      setUsers(updated);
      toast.success(`Role updated to ${newRole} (Mock)`);
      setChangingRole(null);
      return;
    }

    try {
      const { error } = await supabase.rpc("admin_assign_role", {
        _target_user_id: targetUserId,
        _new_role: newRole as "farmer" | "merchant" | "expert" | "admin",
      });
      if (error) throw error;

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.user_id === targetUserId ? { ...u, role: newRole } : u))
      );
      toast.success(`Role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to change role");
    } finally {
      setChangingRole(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    total: users.length,
    farmer: users.filter((u) => u.role === "farmer").length,
    merchant: users.filter((u) => u.role === "merchant").length,
    expert: users.filter((u) => u.role === "expert").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      farmer: "bg-primary/15 text-primary border-primary/30",
      merchant: "bg-accent/15 text-accent border-accent/30",
      expert: "bg-navy/15 text-navy border-navy/30",
      admin: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return styles[role] || "bg-muted text-muted-foreground";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "farmer": return <UserCheck className="h-4 w-4" />;
      case "merchant": return <Store className="h-4 w-4" />;
      case "expert": return <GraduationCap className="h-4 w-4" />;
      case "admin": return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "admin" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="admin" />

      <main className="md:ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient-saffron-navy">👥 User Management</h1>
            <p className="text-muted-foreground mt-1">Manage all platform users and roles</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total", count: roleCounts.total, icon: Users, color: "text-foreground" },
              { label: "Farmers", count: roleCounts.farmer, icon: UserCheck, color: "text-primary" },
              { label: "Merchants", count: roleCounts.merchant, icon: Store, color: "text-accent" },
              { label: "Experts", count: roleCounts.expert, icon: GraduationCap, color: "text-navy" },
              { label: "Admins", count: roleCounts.admin, icon: Shield, color: "text-destructive" },
            ].map((s) => (
              <Card key={s.label} className="tricolor-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{s.count}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="farmer">Farmers</SelectItem>
                    <SelectItem value="merchant">Merchants</SelectItem>
                    <SelectItem value="expert">Experts</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Click a role badge to change user's role</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.user_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {u.display_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.display_name}</p>
                          <p className="text-sm text-muted-foreground">{u.email || "No email"}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.location || "Unknown"} • Joined{" "}
                            {new Date(u.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getRoleBadge(u.role)} border`}>
                          {getRoleIcon(u.role)}
                          <span className="ml-1 capitalize">{u.role}</span>
                        </Badge>
                        <Select
                          value={u.role}
                          onValueChange={(val) => handleRoleChange(u.user_id, val)}
                          disabled={changingRole === u.user_id}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="farmer">🌾 Farmer</SelectItem>
                            <SelectItem value="merchant">🏢 Merchant</SelectItem>
                            <SelectItem value="expert">🎓 Expert</SelectItem>
                            <SelectItem value="admin">🛡️ Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
