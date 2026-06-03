import { useEffect, useRef, useState } from "react";
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
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { reportError } from "@/lib/error-handling";

interface VoiceCommand {
  text: string;
  language: string;
  confidence: number;
  response: string;
  timestamp: Date;
}

const SUPPORTED = {
  english: { name: "English", code: "en-US", flag: "🇬🇧" },
  hindi: { name: "हिंदी", code: "hi-IN", flag: "🇮🇳" },
  punjabi: { name: "ਪੰਜਾਬੀ", code: "pa-IN", flag: "🇮🇳" },
  gujarati: { name: "ગુજરાતી", code: "gu-IN", flag: "🇮🇳" },
  marathi: { name: "मराठी", code: "mr-IN", flag: "🇮🇳" },
  tamil: { name: "தமிழ்", code: "ta-IN", flag: "🇮🇳" },
  telugu: { name: "తెలుగు", code: "te-IN", flag: "🇮🇳" },
  kannada: { name: "ಕನ್ನಡ", code: "kn-IN", flag: "🇮🇳" },
} as const;

const QUICK_QUERIES: Record<string, string[]> = {
  english: [
    "What is the best time to plant wheat?",
    "How much water does rice need?",
    "What are the symptoms of blight disease?",
    "When should I harvest my cotton crop?",
  ],
  hindi: [
    "गेहूं बोने का सबसे अच्छा समय क्या है?",
    "धान को कितना पानी चाहिए?",
    "झुलसा रोग के लक्षण क्या हैं?",
    "कपास की फसल कब काटनी चाहिए?",
  ],
};

export const MultiLanguageVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof SUPPORTED>("english");
  const [volume, setVolume] = useState(80);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [processingLevel, setProcessingLevel] = useState(0);
  const [sttSupported, setSttSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR: any =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      setSttSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = SUPPORTED[selectedLanguage].code;
    recognitionRef.current = rec;
  }, [selectedLanguage]);

  const handleResult = async (transcript: string, confidence: number) => {
    setCurrentQuery(transcript);
    setIsListening(false);
    setProcessingLevel(50);
    const langName = SUPPORTED[selectedLanguage].name;
    try {
      const { data, error } = await supabase.functions.invoke("voice-assistant", {
        body: { prompt: transcript, language: langName },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const responseText = data.response || "I could not generate a response right now.";
      const entry: VoiceCommand = {
        text: transcript,
        language: langName,
        confidence: Math.round(confidence * 100),
        response: responseText,
        timestamp: new Date(),
      };
      setCommands((prev) => [entry, ...prev.slice(0, 4)]);
      setCurrentQuery("");
      setProcessingLevel(100);
      speakResponse(responseText);
      toast("Voice command processed");
    } catch (err: any) {
      reportError("VoiceAssistant", err);
      toast.error("Voice assistant unavailable. Please try again.");
      setProcessingLevel(0);
    }
  };

  const startListening = () => {
    if (!sttSupported || !recognitionRef.current) {
      toast.error("Speech recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const rec = recognitionRef.current;
    rec.lang = SUPPORTED[selectedLanguage].code;
    setIsListening(true);
    setProcessingLevel(10);
    setCurrentQuery("");

    rec.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        handleResult(last[0].transcript, last[0].confidence || 0.9);
      } else {
        setCurrentQuery(last[0].transcript);
        setProcessingLevel((p) => Math.min(80, p + 10));
      }
    };
    rec.onerror = (e: any) => {
      setIsListening(false);
      setProcessingLevel(0);
      if (e.error !== "aborted") toast.error(`Mic error: ${e.error}`);
    };
    rec.onend = () => {
      setIsListening(false);
    };
    try {
      rec.start();
    } catch {
      /* already started */
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setProcessingLevel(0);
  };

  const speakResponse = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SUPPORTED[selectedLanguage].code;
    u.volume = volume / 100;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const runQuickQuery = (text: string) =>
    handleResult(text, 1);

  const lang = SUPPORTED[selectedLanguage];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          Multi-Language Voice Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask farming questions in your local language — speech is captured live.
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
            {!sttSupported && (
              <div className="p-3 rounded border border-destructive/30 bg-destructive/5 flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Voice input requires Chrome, Edge or Safari. Use the quick queries below instead.
              </div>
            )}

            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Button
                  size="lg"
                  className={`w-24 h-24 rounded-full ${isListening ? "animate-pulse bg-destructive hover:bg-destructive/90" : ""}`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={!sttSupported}
                  aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
                </Button>
                {isListening && (
                  <div className="absolute -inset-4 border-4 border-destructive/40 rounded-full animate-ping" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium">{isListening ? "Listening…" : "Tap to speak"}</p>
                <p className="text-sm text-muted-foreground">
                  {lang.flag} {lang.name}
                </p>
              </div>
            </div>

            {(isListening || processingLevel > 0) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm">Processing…</span>
                </div>
                <Progress value={processingLevel} className="w-full" />
                {currentQuery && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Heard:</p>
                    <p className="text-sm">{currentQuery}</p>
                  </div>
                )}
              </div>
            )}

            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Volume2 className="h-5 w-5 text-green-600 animate-pulse" />
                <span className="text-green-700 dark:text-green-300">AI Assistant is speaking…</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4" />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1"
                aria-label="Volume"
              />
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium w-12">{volume}%</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Quick queries:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(QUICK_QUERIES[selectedLanguage] ?? QUICK_QUERIES.english).map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="text-left h-auto p-2 whitespace-normal justify-start"
                    onClick={() => runQuickQuery(q)}
                  >
                    <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="text-xs">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(SUPPORTED).map(([key, l]) => (
                <Button
                  key={key}
                  variant={selectedLanguage === key ? "default" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => setSelectedLanguage(key as keyof typeof SUPPORTED)}
                >
                  <span className="text-lg mr-2">{l.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs opacity-70">{l.code}</p>
                  </div>
                  {selectedLanguage === key && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {commands.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No voice commands yet</p>
              </div>
            ) : (
              commands.map((c, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{c.language}</span>
                      <Badge variant="outline">{c.confidence}% confident</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {c.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">You said:</p>
                      <p className="text-sm bg-muted p-2 rounded">{c.text}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">AI Response:</p>
                      <p className="text-sm bg-muted p-2 rounded">{c.response}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => speakResponse(c.response)}>
                    <Volume2 className="h-3 w-3 mr-1" />
                    Replay
                  </Button>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
