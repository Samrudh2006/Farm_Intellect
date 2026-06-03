import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users as UsersIcon, 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Shield,
  User,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";

const Users = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = {
    name: "Admin User",
    role: "admin",
  };

  const users = [
    {
      id: "U001",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 98765 43210",
      role: "farmer",
      status: "active",
      location: "Ludhiana, Punjab",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago",
      avatar: null
    },
    {
      id: "U002",
      name: "Priya Merchants",
      email: "priya@merchant.com",
      phone: "+91 98765 43211",
      role: "merchant",
      status: "active",
      location: "Delhi",
      joinDate: "2024-02-20",
      lastActive: "1 day ago",
      avatar: null
    },
    {
      id: "U003",
      name: "Dr. Suresh Agro",
      email: "suresh@expert.com",
      phone: "+91 98765 43212",
      role: "expert",
      status: "active",
      location: "Chandigarh",
      joinDate: "2024-01-10",
      lastActive: "30 minutes ago",
      avatar: null
    },
    {
      id: "U004",
      name: "Harpreet Singh",
      email: "harpreet@farmer.com",
      phone: "+91 98765 43213",
      role: "farmer",
      status: "inactive",
      location: "Amritsar, Punjab",
      joinDate: "2023-12-05",
      lastActive: "1 week ago",
      avatar: null
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Shield;
      case "expert": return UserCheck;
      case "merchant": return User;
      case "farmer": return User;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "expert": return "default";
      case "merchant": return "secondary";
      case "farmer": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userStats = {
    total: users.length,
    farmers: users.filter(u => u.role === "farmer").length,
    merchants: users.filter(u => u.role === "merchant").length,
    experts: users.filter(u => u.role === "expert").length,
    admins: users.filter(u => u.role === "admin").length,
    active: users.filter(u => u.status === "active").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}

      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">User Management</h2>
              <p className="text-muted-foreground">
                Manage users, roles, and permissions across the platform
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* User Stats */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{userStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{userStats.farmers}</p>
                <p className="text-sm text-muted-foreground">Farmers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{userStats.merchants}</p>
                <p className="text-sm text-muted-foreground">Merchants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{userStats.experts}</p>
                <p className="text-sm text-muted-foreground">Experts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{userStats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, role, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Users ({userStats.total})</TabsTrigger>
              <TabsTrigger value="farmers">Farmers ({userStats.farmers})</TabsTrigger>
              <TabsTrigger value="merchants">Merchants ({userStats.merchants})</TabsTrigger>
              <TabsTrigger value="experts">Experts ({userStats.experts})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4">
                {filteredUsers.map((userData) => {
                  const RoleIcon = getRoleIcon(userData.role);
                  return (
                    <Card key={userData.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={`https://avatar.vercel.sh/${userData.name}`} />
                              <AvatarFallback>
                                {userData.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{userData.name}</h3>
                                <Badge variant={getStatusColor(userData.status) as any}>
                                  {userData.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {userData.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {userData.phone}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {userData.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-4 w-4" />
                                <Badge variant={getRoleColor(userData.role) as any}>
                                  {userData.role}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Joined {userData.joinDate}
                                </span>
                                <span>Last active: {userData.lastActive}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="farmers">
              <div className="grid gap-4">
                {filteredUsers.filter(u => u.role === "farmer").map((userData) => (
                  <Card key={userData.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://avatar.vercel.sh/${userData.name}`} />
                            <AvatarFallback>
                              {userData.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{userData.name}</h3>
                            <p className="text-sm text-muted-foreground">{userData.location}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(userData.status) as any}>
                          {userData.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="merchants">
              <div className="grid gap-4">
                {filteredUsers.filter(u => u.role === "merchant").map((userData) => (
                  <Card key={userData.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://avatar.vercel.sh/${userData.name}`} />
                            <AvatarFallback>
                              {userData.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{userData.name}</h3>
                            <p className="text-sm text-muted-foreground">{userData.location}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(userData.status) as any}>
                          {userData.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="experts">
              <div className="grid gap-4">
                {filteredUsers.filter(u => u.role === "expert").map((userData) => (
                  <Card key={userData.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://avatar.vercel.sh/${userData.name}`} />
                            <AvatarFallback>
                              {userData.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{userData.name}</h3>
                            <p className="text-sm text-muted-foreground">{userData.location}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(userData.status) as any}>
                          {userData.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Users;