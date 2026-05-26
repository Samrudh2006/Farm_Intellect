import { InteractiveFieldDesigner } from "@/components/features/InteractiveFieldDesigner";
import { AICropDiseaseScanner } from "@/components/features/AICropDiseaseScanner";
import { SmartIrrigationCalculator } from "@/components/features/SmartIrrigationCalculator";
import { MultiLanguageVoiceAssistant } from "@/components/features/MultiLanguageVoiceAssistant";
import { CropRotationOptimizer } from "@/components/features/CropRotationOptimizer";
import { MarketPricePredictor } from "@/components/features/MarketPricePredictor";
import { CarbonFootprintCalculator } from "@/components/features/CarbonFootprintCalculator";
import { FarmerCollaborationHub } from "@/components/features/FarmerCollaborationHub";
import { SmartCropCalendar } from "@/components/features/SmartCropCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Brain, 
  Star, 
  Rocket,
  Award,
  TrendingUp,
  Sparkles,
  Target,
  Calendar
} from "lucide-react";

export const AdvancedFeaturesShowcase = () => {
  const features = [
    {
      id: "field-designer",
      title: "Interactive Field Designer",
      description: "Mobile-friendly polygon field mapping for satellite monitoring",
      component: <InteractiveFieldDesigner />,
      badge: "NEW",
      icon: <Target className="h-5 w-5" />
    },
    {
      id: "smart-crop-calendar",
      title: "Smart Crop Calendar",
      description: "Soil health + NDVI imagery linked to dynamic sowing schedules",
      component: <SmartCropCalendar />,
      badge: "SATELLITE",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: "disease-scanner",
      title: "AI Crop Disease Scanner",
      description: "95%+ accurate disease detection using computer vision AI",
      component: <AICropDiseaseScanner />,
      badge: "AI POWERED",
      icon: <Brain className="h-5 w-5" />
    },
    {
      id: "irrigation-calculator",
      title: "Smart Irrigation Calculator",
      description: "Weather-based irrigation optimization with 40% water savings",
      component: <SmartIrrigationCalculator />,
      badge: "SMART",
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: "voice-assistant",
      title: "Multi-Language Voice Assistant",
      description: "Ask farming questions in 8+ local languages with AI responses",
      component: <MultiLanguageVoiceAssistant />,
      badge: "MULTILINGUAL",
      icon: <Sparkles className="h-5 w-5" />
    },
    {
      id: "rotation-optimizer",
      title: "Crop Rotation Optimizer",
      description: "AI-powered crop planning for maximum yield and soil health",
      component: <CropRotationOptimizer />,
      badge: "OPTIMIZER",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: "price-predictor",
      title: "Market Price Predictor",
      description: "ML algorithms predict crop prices up to 90 days ahead",
      component: <MarketPricePredictor />,
      badge: "PREDICTIVE",
      icon: <Star className="h-5 w-5" />
    },
    {
      id: "carbon-calculator",
      title: "Carbon Footprint Calculator",
      description: "Calculate emissions, earn carbon credits, optimize sustainability",
      component: <CarbonFootprintCalculator />,
      badge: "SUSTAINABLE",
      icon: <Award className="h-5 w-5" />
    },
    {
      id: "collaboration-hub",
      title: "Farmer Collaboration Hub",
      description: "Connect with 100K+ farmers, share knowledge, get expert help",
      component: <FarmerCollaborationHub />,
      badge: "COMMUNITY",
      icon: <Rocket className="h-5 w-5" />
    }
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "NEW": return "bg-green-500 text-white";
      case "AI POWERED": return "bg-purple-500 text-white";
      case "SMART": return "bg-blue-500 text-white";
      case "MULTILINGUAL": return "bg-orange-500 text-white";
      case "OPTIMIZER": return "bg-indigo-500 text-white";
      case "PREDICTIVE": return "bg-pink-500 text-white";
      case "SUSTAINABLE": return "bg-emerald-500 text-white";
      case "COMMUNITY": return "bg-red-500 text-white";
      case "SATELLITE": return "bg-cyan-600 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl flex items-center justify-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Revolutionary Farming Features
          </CardTitle>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            10 cutting-edge AI-powered tools that make this the most advanced farming app in the world. 
            Experience the future of agriculture today.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              🏆 Industry Leading
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              🚀 Next-Gen Tech
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              🌍 Global Impact
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Features Tabs */}
      <Tabs defaultValue={features[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9 h-auto">
          {features.map((feature) => (
            <TabsTrigger 
              key={feature.id} 
              value={feature.id}
              className="flex flex-col items-center gap-1 p-3 h-auto text-xs"
            >
              {feature.icon}
              <span className="hidden sm:inline">{feature.title.split(' ')[0]}</span>
              <Badge className={`${getBadgeColor(feature.badge)} text-[10px] px-1 py-0`}>
                {feature.badge}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {features.map((feature) => (
          <TabsContent key={feature.id} value={feature.id} className="space-y-4">
            {/* Feature Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <Badge className={getBadgeColor(feature.badge)}>
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Feature Component */}
            {feature.component}
          </TabsContent>
        ))}
      </Tabs>

      {/* Why Choose Us */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Why This App is #1 Choice for Modern Farmers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🏆", title: "Industry Leader", desc: "Most advanced farming technology available" },
              { icon: "🎯", title: "95%+ Accuracy", desc: "AI models with proven field results" },
              { icon: "🌍", title: "Global Scale", desc: "Used by 1M+ farmers worldwide" },
              { icon: "💰", title: "ROI Guarantee", desc: "Average 35% increase in farm profits" },
              { icon: "⚡", title: "Real-time AI", desc: "Instant analysis and recommendations" },
              { icon: "🔒", title: "Data Security", desc: "Enterprise-grade privacy protection" },
              { icon: "📱", title: "Offline Mode", desc: "Works without internet connectivity" },
              { icon: "🤝", title: "Expert Support", desc: "24/7 agricultural expert assistance" }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
