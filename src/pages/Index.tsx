import { useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { FloatingAIAssistant } from "@/components/home/FloatingAIAssistant";
import { ScrollReveal, CountUp, ParallaxFloat } from "@/components/home/ScrollReveal";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Wheat, Brain, CloudSun, TrendingUp, Shield, Users,
  ArrowRight, CheckCircle, Sparkles, Zap, BarChart3, Leaf, Play, X
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.12, duration: 0.4, type: "spring", stiffness: 200 },
  }),
};

const Index = () => {
  const { t } = useLanguage();
  const { user, profile, loading } = useAuth();
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-redirect authenticated users to their role dashboard
  if (!loading && user && profile) {
    const roleRoutes: Record<string, string> = {
      farmer: "/farmer/dashboard",
      merchant: "/merchant/dashboard",
      expert: "/expert/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={roleRoutes[profile.role] || "/farmer/dashboard"} replace />;
  }

  const features = [
    { 
      icon: null,
      image: "/icons/ai-recommendations.jpg",
      title: "AI-Powered Recommendations", 
      description: "Get personalised crop advice powered by machine learning algorithms",
      iconBg: "bg-orange-100 dark:bg-orange-900",
      borderColor: "border-orange-400",
      iconColor: "text-orange-600 dark:text-orange-300",
      detailedDesc: "Our advanced ML algorithms analyze your farm data, soil conditions, weather patterns, and historical yields to provide personalized crop recommendations. Get AI-powered insights on optimal planting times, crop varieties, and farming practices tailored to your region and farm type.",
      benefits: ["Personalized recommendations", "Historical data analysis", "Market trend integration", "Multi-crop comparison"]
    },
    { 
      icon: null,
      image: "/icons/weather-integration.jpg",
      title: "Weather Integration", 
      description: "Real-time weather data and forecasts for optimal farming decisions",
      iconBg: "bg-blue-100 dark:bg-blue-900",
      borderColor: "border-blue-400",
      iconColor: "text-blue-600 dark:text-blue-300",
      detailedDesc: "Access real-time weather data with precision forecasts up to 15 days ahead. Receive alerts for extreme weather conditions, optimal irrigation timing, and pest emergence predictions based on weather patterns.",
      benefits: ["Real-time weather updates", "15-day forecasts", "Extreme weather alerts", "Irrigation optimization"]
    },
    { 
      icon: null,
      image: "/icons/yield-optimization.jpg",
      title: "Yield Optimisation", 
      description: "Maximise your crop yields with data-driven insights",
      iconBg: "bg-green-100 dark:bg-green-900",
      borderColor: "border-green-400",
      iconColor: "text-green-600 dark:text-green-300",
      detailedDesc: "Leverage predictive analytics to optimize every aspect of your farming. From fertilizer timing to harvest scheduling, our AI provides data-driven recommendations to maximize your yields while minimizing costs and environmental impact.",
      benefits: ["Yield predictions", "Cost optimization", "Resource management", "Environmental impact tracking"]
    },
    { 
      icon: null,
      image: "/icons/pest-disease-control.jpg",
      title: "Pest & Disease Control", 
      description: "Early detection and prevention of crop threats",
      iconBg: "bg-orange-100 dark:bg-orange-900",
      borderColor: "border-orange-400",
      iconColor: "text-orange-600 dark:text-orange-300",
      detailedDesc: "AI-powered image recognition identifies diseases and pests early, often before visible symptoms appear. Receive timely treatment recommendations and preventive measures to protect your crops from potential threats.",
      benefits: ["Early pest detection", "Disease identification", "Treatment recommendations", "Prevention strategies"]
    },
    { 
      icon: null,
      image: "/icons/smart-irrigation.jpg",
      title: "Smart Irrigation", 
      description: "Optimise water usage with IoT sensor data and AI predictions",
      iconBg: "bg-blue-100 dark:bg-blue-900",
      borderColor: "border-blue-400",
      iconColor: "text-blue-600 dark:text-blue-300",
      detailedDesc: "Connect IoT soil moisture sensors for real-time water status. Our AI algorithms optimize irrigation schedules based on weather forecasts, soil conditions, and crop requirements, reducing water waste while improving yields.",
      benefits: ["Water usage optimization", "IoT sensor integration", "Cost savings", "Environmental conservation"]
    },
    { 
      icon: null,
      image: "/icons/market-analytics.jpg",
      title: "Market Analytics", 
      description: "Live mandi prices and profit predictions for better selling decisions",
      iconBg: "bg-green-100 dark:bg-green-900",
      borderColor: "border-green-400",
      iconColor: "text-green-600 dark:text-green-300",
      detailedDesc: "Track live mandi prices across major markets, analyze price trends, and get AI-powered profit predictions. Make informed decisions on when and where to sell your crops for maximum returns.",
      benefits: ["Live price tracking", "Trend analysis", "Profit predictions", "Market comparisons"]
    },
    { 
      icon: null,
      image: "/icons/organic-farming.jpg",
      title: "Organic Farming Guide", 
      description: "Comprehensive organic farming techniques and certification help",
      iconBg: "bg-orange-100 dark:bg-orange-900",
      borderColor: "border-orange-400",
      iconColor: "text-orange-600 dark:text-orange-300",
      detailedDesc: "Transition to organic farming with our comprehensive guide covering techniques, certifications, and market opportunities. Access expert knowledge on sustainable practices that increase both yield and profitability.",
      benefits: ["Organic techniques", "Certification guidance", "Premium market access", "Sustainability tracking"]
    },
    { 
      icon: null,
      image: "/icons/crop-scanner.jpg",
      title: "AI Crop Scanner", 
      description: "Snap a photo to identify diseases, pests, and nutrient deficiencies",
      iconBg: "bg-purple-100 dark:bg-purple-900",
      borderColor: "border-purple-400",
      iconColor: "text-purple-600 dark:text-purple-300",
      detailedDesc: "Use your smartphone to capture crop images. Our AI instantly identifies diseases, pests, and nutrient deficiencies with treatment recommendations. Instant diagnosis available offline too.",
      benefits: ["Instant diagnosis", "Offline capability", "High accuracy", "Treatment recommendations"]
    },
  ];

  const stats = [
    { icon: Users, value: 10000, suffix: "+", label: "Active Farmers", color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, value: 35, suffix: "%", label: "Average Yield Increase", color: "text-accent", bg: "bg-accent/10" },
    { icon: Shield, value: 98, suffix: "%", label: "Problem Detection Rate", color: "text-navy", bg: "bg-navy/10" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">
      {/* Tricolor top bar */}
      <div className="tricolor-bar h-1.5" />

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AshokaChakra size={36} />
            <h1 className="text-xl font-bold text-foreground font-heading">Smart Crop Advisory</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md glow-saffron">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Background Image */}
      <section className="relative py-20 lg:py-32 overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-farming.jpg"
            alt="Indian farming landscape with golden wheat fields"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Animated Ashoka Chakra */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", stiffness: 100 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <AshokaChakra size={80} className="drop-shadow-lg" />
                <div className="absolute -inset-4 rounded-full border-2 border-dashed border-navy/30 animate-[chakra-spin_20s_linear_infinite_reverse]" />
                <div className="absolute -inset-8 rounded-full border border-accent/20 animate-[chakra-spin_30s_linear_infinite]" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Badge className="mb-4 bg-accent/15 text-accent border-accent/30 text-sm px-4 py-1.5 backdrop-blur-sm" variant="outline">
                🇮🇳 Proudly Indian — Next-Generation Farm Management
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl lg:text-7xl font-extrabold text-foreground leading-tight font-heading drop-shadow-sm"
            >
              {t('hero.title')}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="block text-gradient-tricolor mt-2"
              >
                {t('hero.subtitle')}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto backdrop-blur-sm bg-background/30 rounded-xl px-4 py-2"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg glow-saffron text-base px-8 group font-semibold">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base px-8 backdrop-blur-sm bg-background/50 font-semibold"
                onClick={() => setDemoOpen(true)}
              >
                <Play className="mr-2 h-5 w-5" />
                {t('hero.demo')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SMS-for-feature-phones banner */}
      <section className="py-10 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left md:justify-between">
            <div className="max-w-2xl">
              <Badge className="mb-2">📱 New • Inclusive</Badge>
              <h2 className="text-2xl font-bold sm:text-3xl">No smartphone? Start free SMS and upgrade to paid plans.</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Weather warnings, mandi prices, pest alerts and government scheme updates — delivered straight to any
                ₹500 keypad phone. Built for Bharat's 8 crore feature-phone farmers with free + paid plan support.
              </p>
            </div>
            <Link to="/sms-register">
              <Button size="lg" className="shadow-lg">
                Register for SMS Alerts <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-4">
              <AshokaChakra size={32} animate={false} />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-bold mb-4 text-foreground font-heading">
              {t('features.title')} <span className="text-gradient-tricolor">{t('features.highlight')}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.description')}
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
              >
                <Card className={`${feature.borderColor} border-2 text-center p-6 cursor-pointer h-full group hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <CardContent className="space-y-4 pt-6 flex flex-col items-center">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-center w-32 h-32 mx-auto rounded-full overflow-hidden bg-white shadow-md"
                    >
                      {feature.image ? (
                        <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="h-full w-full object-contain rounded-full p-2"
                        />
                      ) : (
                        <div className={`flex items-center justify-center w-full h-full rounded-full ${feature.iconBg}`}>
                          <feature.icon className={`h-16 w-16 ${feature.iconColor}`} />
                        </div>
                      )}
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFeature(index)}
                      className="mt-2 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Know More →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Details Modal */}
      {selectedFeature !== null && (
        <Dialog open={selectedFeature !== null} onOpenChange={() => setSelectedFeature(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-28 h-28 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-md">
                  {features[selectedFeature].image ? (
                    <img 
                      src={features[selectedFeature].image} 
                      alt={features[selectedFeature].title}
                      className="h-full w-full object-contain rounded-full p-1"
                    />
                  ) : (
                    <div className={`flex items-center justify-center w-full h-full rounded-full ${features[selectedFeature].iconBg}`}>
                      {(() => {
                        const Icon = features[selectedFeature].icon;
                        return <Icon className={`h-12 w-12 ${features[selectedFeature].iconColor}`} />;
                      })()}
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <DialogTitle>{features[selectedFeature].title}</DialogTitle>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold text-base mb-2 text-foreground">Overview</h4>
                <p className="text-muted-foreground leading-relaxed">{features[selectedFeature].detailedDesc}</p>
              </div>
              <div>
                <h4 className="font-semibold text-base mb-3 text-foreground">Key Benefits</h4>
                <div className="grid grid-cols-2 gap-2">
                  {features[selectedFeature].benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <Link to="/login">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats + Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl lg:text-4xl font-bold text-foreground font-heading">
                Join Thousands of <span className="text-gradient-tricolor">Smart Farmers</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-xl text-muted-foreground">
                Our platform has helped farmers increase yields by up to 35% while reducing costs and environmental impact.
              </motion.p>
              <div className="space-y-4">
                {[
                  "AI-powered crop recommendations",
                  "Real-time weather monitoring",
                  "Pest and disease alerts",
                  "Expert consultation network",
                  "Government scheme notifications",
                  "Multi-language support"
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    custom={index + 2}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-lg text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div variants={fadeUp} custom={8}>
                <Link to="/login">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg glow-saffron mt-4 group font-semibold">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <ScrollReveal direction="right">
              <Card className="p-8 border-border shadow-lg tricolor-card">
                <div className="space-y-6">
                  {stats.map((stat, index) => (
                    <ScrollReveal key={index} delay={index * 0.15} direction="right">
                      <div className="flex items-center gap-4">
                        <ParallaxFloat>
                          <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                          </div>
                        </ParallaxFloat>
                        <div>
                          <CountUp
                            target={stat.value}
                            suffix={stat.suffix}
                            className="text-3xl font-bold text-foreground"
                          />
                          <div className="text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <AshokaChakra size={28} animate={false} />
              <span className="text-xl font-bold text-foreground font-heading">Smart Crop Advisory</span>
            </div>
            <p className="text-muted-foreground">
              Empowering farmers with intelligent technology for sustainable agriculture 🇮🇳
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              © 2025 Samrudh. All Rights Reserved.
            </p>
          </motion.div>
        </div>
        <div className="tricolor-bar h-1.5 mt-8" />
      </footer>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />

      {/* Demo Audio Modal */}
      <Dialog open={demoOpen} onOpenChange={(open) => {
        setDemoOpen(open);
        if (!open && audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }}>
        <DialogContent className="max-w-2xl w-[95vw] p-6 bg-card border-border">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Bhoomi Aasha - Demo</h2>
              <p className="text-muted-foreground">Listen to our audio demonstration</p>
            </div>
            <audio
              ref={audioRef}
              src="/audio/Bhoomi_Aasha.mp3"
              controls
              autoPlay
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
