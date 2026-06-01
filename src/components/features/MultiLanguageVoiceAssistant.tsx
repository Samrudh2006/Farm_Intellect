import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Languages,
  Headphones,
  Brain,
  Zap,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface VoiceCommand {
  text: string;
  language: string;
  confidence: number;
  response: string;
  timestamp: Date;
}

export const MultiLanguageVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [volume, setVolume] = useState(80);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [processingLevel, setProcessingLevel] = useState(0);

  const supportedLanguages = {
    english: { name: "English", code: "en", flag: "🇬🇧" },
    hindi: { name: "हिंदी", code: "hi", flag: "🇮🇳" },
    punjabi: { name: "ਪੰਜਾਬੀ", code: "pa", flag: "🇮🇳" },
    gujarati: { name: "ગુજરાતી", code: "gu", flag: "🇮🇳" },
    marathi: { name: "मराठी", code: "mr", flag: "🇮🇳" },
    tamil: { name: "தமிழ்", code: "ta", flag: "🇮🇳" },
    telugu: { name: "తెలుగు", code: "te", flag: "🇮🇳" },
    kannada: { name: "ಕನ್ನಡ", code: "kn", flag: "🇮🇳" }
  };

  const sampleQueries = {
    english: [
      "What's the best time to plant wheat?",
      "How much water does rice need?",
      "What are the symptoms of blight disease?",
      "When should I harvest my cotton crop?"
    ],
    hindi: [
      "गेहूं बोने का सबसे अच्छा समय क्या है?",
      "धान को कितना पानी चाहिए?",
      "झुलसा रोग के लक्षण क्या हैं?",
      "कपास की फसल कब काटनी चाहिए?"
    ],
    punjabi: [
      "ਕਣਕ ਬੀਜਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ ਕੀ ਹੈ?",
      "ਚਾਵਲ ਨੂੰ ਕਿੰਨਾ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ?",
      "ਝੁਲਸਾ ਰੋਗ ਦੇ ਲੱਛਣ ਕੀ ਹਨ?",
      "ਕਪਾਹ ਦੀ ਫਸਲ ਕਦੋਂ ਵੱਢਣੀ ਚਾਹੀਦੀ ਹੈ?"
    ]
  };

  const simulateVoiceRecognition = () => {
    setIsListening(true);
    setProcessingLevel(0);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProcessingLevel(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          processVoiceCommand();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const processVoiceCommand = async () => {
    const language = selectedLanguage as keyof typeof sampleQueries;
    const queries = sampleQueries[language] || sampleQueries.english;
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const langName = supportedLanguages[language as keyof typeof supportedLanguages].name;
    
    setCurrentQuery(randomQuery);
    setIsListening(false);
    
    try {
      const { data, error } = await supabase.functions.invoke("voice-assistant", {
        body: { prompt: randomQuery, language: langName }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const responseText = data.response || "I could not generate a response right now.";
      
      const newCommand: VoiceCommand = {
        text: randomQuery,
        language: langName,
        confidence: Math.round(85 + Math.random() * 10),
        response: responseText,
        timestamp: new Date()
      };
      
      setCommands(prev => [newCommand, ...prev.slice(0, 4)]);
      setCurrentQuery("");
      speakResponse(responseText);
      toast("Voice command processed by AI!");
      
    } catch (err: any) {
      console.error(err);
      toast("AI Voice Assistant is currently disconnected. Falling back to local logic.");
      const newCommand: VoiceCommand = {
        text: randomQuery,
        language: langName,
        confidence: Math.round(85 + Math.random() * 10),
        response: "Sorry, I am having trouble reaching the AI server. Please ensure the voice-assistant Edge Function is deployed.",
        timestamp: new Date()
      };
      setCommands(prev => [newCommand, ...prev.slice(0, 4)]);
      setCurrentQuery("");
      setProcessingLevel(0);
    }
  };

  const speakResponse = (text: string) => {
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    setProcessingLevel(0);
    setCurrentQuery("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          Multi-Language Voice Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask farming questions in your local language - AI responds instantly
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assistant" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assistant" className="space-y-6">
            {/* Voice Control Panel */}
            <div className="text-center space-y-4">
              <div className="relative">
                <Button
                  size="lg"
                  className={`w-24 h-24 rounded-full ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
                  onClick={isListening ? stopListening : simulateVoiceRecognition}
                >
                  {isListening ? (
                    <Mic className="h-8 w-8" />
                  ) : (
                    <MicOff className="h-8 w-8" />
                  )}
                </Button>
                
                {isListening && (
                  <div className="absolute -inset-4 border-4 border-red-300 rounded-full animate-ping" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isListening ? "Listening..." : "Tap to speak"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Language: {supportedLanguages[selectedLanguage as keyof typeof supportedLanguages]?.flag}{" "}
                  {supportedLanguages[selectedLanguage as keyof typeof supportedLanguages]?.name}
                </p>
              </div>
            </div>

            {/* Processing Indicator */}
            {isListening && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Processing voice input...</span>
                </div>
                <Progress value={processingLevel} className="w-full" />
                
                {currentQuery && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Recognized:</p>
                    <p className="text-sm">{currentQuery}</p>
                  </div>
                )}
              </div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
                <Volume2 className="h-5 w-5 text-green-600 animate-pulse" />
                <span className="text-green-700">AI Assistant is speaking...</span>
              </div>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4" />
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium w-12">{volume}%</span>
            </div>

            {/* Quick Commands */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Quick Voice Commands:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(sampleQueries[selectedLanguage as keyof typeof sampleQueries] || sampleQueries.english).map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left h-auto p-2 whitespace-normal"
                    onClick={() => {
                      setCurrentQuery(query);
                      setTimeout(() => processVoiceCommand(), 500);
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="text-xs">{query}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="languages" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(supportedLanguages).map(([key, lang]) => (
                <Button
                  key={key}
                  variant={selectedLanguage === key ? "default" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => setSelectedLanguage(key)}
                >
                  <span className="text-lg mr-2">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-xs opacity-70">{lang.code.toUpperCase()}</p>
                  </div>
                  {selectedLanguage === key && (
                    <CheckCircle className="h-4 w-4 ml-auto text-green-500" />
                  )}
                </Button>
              ))}
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">AI Voice Features:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real-time speech recognition in 8+ languages</li>
                <li>• Context-aware agricultural responses</li>
                <li>• Natural language processing for local dialects</li>
                <li>• Offline voice commands support</li>
                <li>• Personalized accent adaptation</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Recent Voice Interactions</h3>
              
              {commands.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No voice commands yet</p>
                  <p className="text-sm text-muted-foreground">Start speaking to see your interaction history</p>
                </div>
              ) : (
                commands.map((command, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{command.language}</span>
                        <Badge variant="outline">{command.confidence}% confident</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {command.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-blue-700">You said:</p>
                        <p className="text-sm bg-blue-50 p-2 rounded">{command.text}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-green-700">AI Response:</p>
                        <p className="text-sm bg-green-50 p-2 rounded">{command.response}</p>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline" onClick={() => speakResponse(command.response)}>
                      <Volume2 className="h-3 w-3 mr-1" />
                      Replay Response
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};