import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Search,
  Filter,
  Plus,
  Wheat,
  TrendingUp
} from "lucide-react";

const Farmers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = {
    name: "Merchant User",
    role: "merchant",
  };

  const farmers = [
    {
      id: "F001",
      name: "Rajesh Kumar",
      location: "Ludhiana, Punjab",
      phone: "+91 98765 43210",
      email: "rajesh.farmer@email.com",
      totalArea: "12.5 ha",
      cropsForSale: [
        { crop: "Wheat", quantity: "25 tons", price: "₹2,100/quintal" },
        { crop: "Rice", quantity: "18 tons", price: "₹1,850/quintal" }
      ],
      documentsVerified: true,
      partnershipStatus: "verified",
      rating: 4.8,
      status: "active"
    },
    {
      id: "F002", 
      name: "Suresh Singh",
      location: "Amritsar, Punjab",
      phone: "+91 98765 43211",
      email: "suresh.farmer@email.com",
      totalArea: "8.2 ha",
      cropsForSale: [
        { crop: "Mustard", quantity: "12 tons", price: "₹4,200/quintal" },
        { crop: "Wheat", quantity: "15 tons", price: "₹2,050/quintal" }
      ],
      documentsVerified: false,
      partnershipStatus: "pending",
      rating: 4.6,
      status: "active"
    },
    {
      id: "F003",
      name: "Harpreet Kaur",
      location: "Jalandhar, Punjab", 
      phone: "+91 98765 43212",
      email: "harpreet.farmer@email.com",
      totalArea: "15.8 ha",
      cropsForSale: [
        { crop: "Rice", quantity: "35 tons", price: "₹1,900/quintal" },
        { crop: "Sugarcane", quantity: "45 tons", price: "₹350/quintal" },
        { crop: "Vegetables", quantity: "8 tons", price: "₹2,500/quintal" }
      ],
      documentsVerified: true,
      partnershipStatus: "verified",
      rating: 4.9,
      status: "active"
    },
    {
      id: "F004",
      name: "Mohan Patel",
      location: "Patiala, Punjab", 
      phone: "+91 98765 43213",
      email: "mohan.farmer@email.com",
      totalArea: "10.3 ha",
      cropsForSale: [
        { crop: "Cotton", quantity: "20 tons", price: "₹5,800/quintal" },
        { crop: "Maize", quantity: "22 tons", price: "₹1,750/quintal" }
      ],
      documentsVerified: true,
      partnershipStatus: "verified",
      rating: 4.7,
      status: "active"
    },
    {
      id: "F005",
      name: "Priya Singh",
      location: "Bathinda, Punjab", 
      phone: "+91 98765 43214",
      email: "priya.farmer@email.com",
      totalArea: "6.8 ha",
      cropsForSale: [
        { crop: "Wheat", quantity: "14 tons", price: "₹2,000/quintal" },
        { crop: "Peas", quantity: "8 tons", price: "₹3,200/quintal" }
      ],
      documentsVerified: false,
      partnershipStatus: "review",
      rating: 4.4,
      status: "active"
    }
  ];

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.cropsForSale.some(item => item.crop.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <h2 className="text-3xl font-bold text-foreground">Partner Farmers</h2>
              <p className="text-muted-foreground">
                Manage farmer partnerships and crop sourcing relationships
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Partnership
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, location, crops, or verification status..."
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

          {/* Farmers Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFarmers.map((farmer) => (
              <Card key={farmer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${farmer.name}`} />
                        <AvatarFallback>{farmer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{farmer.name}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {farmer.location}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        farmer.partnershipStatus === 'verified' ? 'default' : 
                        farmer.partnershipStatus === 'pending' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {farmer.partnershipStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Area</p>
                      <p className="font-medium">{farmer.totalArea}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Documents</p>
                      <p className={`font-medium ${farmer.documentsVerified ? 'text-green-600' : 'text-orange-600'}`}>
                        {farmer.documentsVerified ? 'Verified' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-medium">★ {farmer.rating}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ID</p>
                      <p className="font-medium">{farmer.id}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Crops Available</p>
                    <div className="space-y-1">
                      {farmer.cropsForSale.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium">{item.crop}</span>
                            <span className="text-muted-foreground ml-1">({item.quantity})</span>
                          </div>
                          <span className="text-green-600 font-medium">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {farmer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {farmer.email}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Wheat className="h-3 w-3 mr-1" />
                      Place Order
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Farmers;