import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { VideoCallRoom } from "@/components/calls/VideoCallRoom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Video, 
  Phone, 
  Calendar, 
  Clock, 
  Star, 
  Users,
  Stethoscope,
  Leaf,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion } from "framer-motion";

// Available experts for consultation
const experts = [
  {
    id: "1",
    name: "Dr. Kavita Sharma",
    expertise: "Plant Pathology & Crop Disease",
    avatar: undefined,
    rating: 4.9,
    consultations: 1247,
    experience: "15 years",
    languages: ["English", "Hindi", "Punjabi"],
    available: true,
    specializations: ["Wheat diseases", "Rice blast", "Fungal infections"],
  },
  {
    id: "2",
    name: "Dr. Arjun Patel",
    expertise: "Soil Health & Irrigation",
    avatar: undefined,
    rating: 4.8,
    consultations: 892,
    experience: "12 years",
    languages: ["English", "Hindi", "Gujarati"],
    available: true,
    specializations: ["Drip irrigation", "Soil testing", "Water management"],
  },
  {
    id: "3",
    name: "Dr. Meera Singh",
    expertise: "Market Linkage & Government Schemes",
    avatar: undefined,
    rating: 4.7,
    consultations: 654,
    experience: "10 years",
    languages: ["English", "Hindi"],
    available: false,
    specializations: ["MSP updates", "PM-KISAN", "Crop insurance"],
  },
  {
    id: "4",
    name: "Dr. Rajesh Kumar",
    expertise: "Pest Control & Organic Farming",
    avatar: undefined,
    rating: 4.9,
    consultations: 1089,
    experience: "18 years",
    languages: ["English", "Hindi", "Marathi"],
    available: true,
    specializations: ["Integrated pest management", "Organic certification", "Biopesticides"],
  },
];

// Recent/upcoming consultations
const recentConsultations = [
  {
    id: "c1",
    expert: "Dr. Kavita Sharma",
    topic: "Yellow rust on wheat crop",
    date: "2025-01-10",
    time: "10:30 AM",
    status: "completed",
    type: "video",
  },
  {
    id: "c2",
    expert: "Dr. Arjun Patel",
    topic: "Irrigation scheduling for rice",
    date: "2025-01-12",
    time: "2:00 PM",
    status: "scheduled",
    type: "voice",
  },
];

const CallPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    type: "video" | "voice";
    expert: typeof experts[0];
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState("experts");

  // Determine user role for navigation
  const userRole = user.role || "farmer";

  // Check if we're starting a call from URL params
  const callType = searchParams.get("type") as "video" | "voice" | null;
  const expertId = searchParams.get("expert");

  const handleStartCall = (expert: typeof experts[0], type: "video" | "voice") => {
    setActiveCall({ type, expert });
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  // If there's an active call, show the call room
  if (activeCall) {
    return (
      <VideoCallRoom
        callType={activeCall.type}
        expertName={activeCall.expert.name}
        expertAvatar={activeCall.expert.avatar}
        topic={`Consultation with ${activeCall.expert.expertise}`}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: user.name, role: userRole }} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={userRole} 
      />

      <main className="md:ml-64 pt-16 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gradient-tricolor">
              Expert Video & Voice Consultations
            </h1>
            <p className="text-muted-foreground">
              Connect with agricultural experts instantly via video or voice call for personalized guidance
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Experts Online", value: "12", color: "primary" },
              { icon: Video, label: "Video Calls Today", value: "48", color: "accent" },
              { icon: Phone, label: "Voice Calls Today", value: "127", color: "navy" },
              { icon: Star, label: "Avg Rating", value: "4.8", color: "harvest" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="tricolor-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-${stat.color}/10`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experts">Available Experts</TabsTrigger>
              <TabsTrigger value="scheduled">My Consultations</TabsTrigger>
              <TabsTrigger value="quick">Quick Call</TabsTrigger>
            </TabsList>

            {/* Available Experts */}
            <TabsContent value="experts" className="space-y-4 mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {experts.map((expert, index) => (
                  <motion.div
                    key={expert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="tricolor-card hover-lift">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Expert Avatar */}
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                              <AvatarImage src={expert.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                {expert.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            {expert.available && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Expert Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{expert.name}</h3>
                              <Badge variant={expert.available ? "default" : "secondary"}>
                                {expert.available ? "Online" : "Offline"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {expert.expertise}
                            </p>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{expert.rating}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{expert.consultations} consultations</span>
                              </div>
                            </div>

                            {/* Specializations */}
                            <div className="flex flex-wrap gap-1 mt-3">
                              {expert.specializations.slice(0, 2).map((spec) => (
                                <Badge key={spec} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {expert.specializations.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{expert.specializations.length - 2}
                                </Badge>
                              )}
                            </div>

                            {/* Languages */}
                            <p className="text-xs text-muted-foreground mt-2">
                              Languages: {expert.languages.join(", ")}
                            </p>
                          </div>
                        </div>

                        {/* Call Buttons */}
                        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                          <Button
                            className="flex-1 gap-2"
                            disabled={!expert.available}
                            onClick={() => handleStartCall(expert, "video")}
                          >
                            <Video className="h-4 w-4" />
                            Video Call
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            disabled={!expert.available}
                            onClick={() => handleStartCall(expert, "voice")}
                          >
                            <Phone className="h-4 w-4" />
                            Voice Call
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Scheduled Consultations */}
            <TabsContent value="scheduled" className="space-y-4 mt-6">
              <Card className="tricolor-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    My Consultations
                  </CardTitle>
                  <CardDescription>
                    View your upcoming and past consultation sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentConsultations.length > 0 ? (
                    <div className="space-y-4">
                      {recentConsultations.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${
                              consultation.type === "video" 
                                ? "bg-primary/10" 
                                : "bg-accent/10"
                            }`}>
                              {consultation.type === "video" ? (
                                <Video className={`h-5 w-5 text-primary`} />
                              ) : (
                                <Phone className={`h-5 w-5 text-accent`} />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{consultation.topic}</h4>
                              <p className="text-sm text-muted-foreground">
                                with {consultation.expert}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {consultation.date}
                                <Clock className="h-3 w-3 ml-2" />
                                {consultation.time}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                consultation.status === "completed"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {consultation.status}
                            </Badge>
                            {consultation.status === "scheduled" && (
                              <Button size="sm" className="gap-1">
                                Join
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                      <p className="text-muted-foreground">
                        No consultations scheduled yet
                      </p>
                      <Button className="mt-4" onClick={() => setSelectedTab("experts")}>
                        Browse Experts
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Call */}
            <TabsContent value="quick" className="space-y-4 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Video Call Card */}
                <Card className="tricolor-card hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Video className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Video Call</h3>
                    <p className="text-muted-foreground mb-6">
                      Face-to-face consultation with real-time animated avatars for better communication
                    </p>
                    <ul className="text-sm text-left space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        HD video quality
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Screen sharing supported
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Show crop images live
                      </li>
                    </ul>
                    <Button 
                      size="lg" 
                      className="w-full gap-2"
                      onClick={() => handleStartCall(experts[0], "video")}
                    >
                      <Video className="h-5 w-5" />
                      Start Video Call
                    </Button>
                  </CardContent>
                </Card>

                {/* Voice Call Card */}
                <Card className="tricolor-card hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                      <Phone className="h-12 w-12 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Voice Call</h3>
                    <p className="text-muted-foreground mb-6">
                      Quick audio consultation - perfect for quick questions and low bandwidth areas
                    </p>
                    <ul className="text-sm text-left space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        Crystal clear audio
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        Works on slow connections
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        Multi-language support
                      </li>
                    </ul>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleStartCall(experts[0], "voice")}
                    >
                      <Phone className="h-5 w-5" />
                      Start Voice Call
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Benefits Section */}
              <Card className="tricolor-card">
                <CardHeader>
                  <CardTitle>Why Choose Expert Consultations?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      {
                        icon: Stethoscope,
                        title: "Expert Diagnosis",
                        description: "Get accurate crop disease identification",
                      },
                      {
                        icon: Leaf,
                        title: "Personalized Advice",
                        description: "Solutions tailored to your farm",
                      },
                      {
                        icon: TrendingUp,
                        title: "Yield Improvement",
                        description: "Optimize your farming practices",
                      },
                      {
                        icon: Shield,
                        title: "Risk Prevention",
                        description: "Early warning and prevention tips",
                      },
                    ].map((benefit, i) => (
                      <div key={i} className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                          <benefit.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-medium mb-1">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CallPage;
