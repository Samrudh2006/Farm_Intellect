import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Square, Loader2, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHumanVoiceAgent } from "@/hooks/useHumanVoiceAgent";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const VOICES = [
  { id: "alloy",   label: "Alloy — neutral, warm" },
  { id: "nova",    label: "Nova — bright, friendly (female)" },
  { id: "shimmer", label: "Shimmer — soft, calm (female)" },
  { id: "onyx",    label: "Onyx — deep, steady (male)" },
  { id: "echo",    label: "Echo — clear, thoughtful (male)" },
  { id: "sage",    label: "Sage — wise, unhurried" },
];

const LANGS = [
  { code: "en", name: "English" }, { code: "hi", name: "हिंदी" },
  { code: "bn", name: "বাংলা" }, { code: "te", name: "తెలుగు" },
  { code: "ta", name: "தமிழ்" }, { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" }, { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" }, { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "or", name: "ଓଡ଼ିଆ" }, { code: "as", name: "অসমীয়া" },
  { code: "ur", name: "اردو" },
];

export const HumanVoiceAgent = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [voice, setVoice] = useState<string>("alloy");
  const [selectedLang, setSelectedLang] = useState<string>(language || "en");
  const [region, setRegion] = useState<string>("India");
  const [profileName, setProfileName] = useState<string>("");

  // Load preferred voice + region from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, location, preferred_voice")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.preferred_voice) setVoice(data.preferred_voice);
      if (data?.location) setRegion(data.location);
      if (data?.display_name) setProfileName(data.display_name);
    })();
  }, [user]);

  const savePreferredVoice = async (v: string) => {
    setVoice(v);
    if (!user) return;
    await supabase.from("profiles").update({ preferred_voice: v }).eq("user_id", user.id);
  };

  const agent = useHumanVoiceAgent({
    language: selectedLang,
    voice,
    region,
    onError: (m) => toast.error(m),
  });

  const statusLabel = useMemo(() => {
    if (agent.isListening) return "Listening…";
    if (agent.isThinking) return "Thinking…";
    if (agent.isSpeaking) return "Speaking…";
    return "Tap the mic to talk";
  }, [agent.isListening, agent.isThinking, agent.isSpeaking]);

  const handleMic = () => {
    if (agent.isListening) {
      agent.stopListening();
    } else if (agent.isSpeaking) {
      agent.stopSpeaking();
      agent.startListening();
    } else {
      agent.startListening();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Assistant
            </CardTitle>
            {profileName && (
              <p className="text-sm text-muted-foreground mt-1">
                Personalized for {profileName} · {region}
              </p>
            )}
          </div>
          <Badge variant={agent.isListening ? "destructive" : agent.isSpeaking ? "default" : "secondary"}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Voice</label>
            <Select value={voice} onValueChange={savePreferredVoice}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VOICES.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mic */}
        <div className="flex flex-col items-center gap-3 py-4">
          <button
            onClick={handleMic}
            className={cn(
              "relative h-24 w-24 rounded-full flex items-center justify-center transition-all shadow-lg",
              agent.isListening && "bg-destructive text-destructive-foreground scale-110",
              agent.isSpeaking && "bg-primary text-primary-foreground animate-pulse",
              agent.isThinking && "bg-muted text-muted-foreground",
              !agent.isListening && !agent.isSpeaking && !agent.isThinking && "bg-primary text-primary-foreground hover:scale-105"
            )}
            aria-label={agent.isListening ? "Stop listening" : "Start listening"}
          >
            {agent.isThinking ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : agent.isListening ? (
              <Square className="h-9 w-9" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
            {agent.isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-destructive/40 animate-ping" />
            )}
          </button>
          <p className="text-sm text-muted-foreground">
            {agent.isListening ? "I'll stop after you pause" : agent.isSpeaking ? "Tap mic to interrupt" : "Tap to speak"}
          </p>
        </div>

        {agent.transcript && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs font-medium text-muted-foreground mb-1">You said</p>
            <p className="text-sm">{agent.transcript}</p>
          </div>
        )}

        {agent.reply && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">Assistant</p>
            <p className="text-sm whitespace-pre-wrap">{agent.reply}</p>
          </div>
        )}

        {agent.history.length > 0 && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Conversation history ({agent.history.length / 2} turns)</summary>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {agent.history.map((m, i) => (
                <div key={i} className={cn("p-2 rounded", m.role === "user" ? "bg-muted/50" : "bg-primary/5")}>
                  <span className="font-medium">{m.role === "user" ? "You" : "Assistant"}: </span>
                  {m.content}
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default HumanVoiceAgent;
