import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Mic, Square, Loader2, Volume2, VolumeX, Trash2, PhoneOff } from "lucide-react";
import { useHumanVoiceAgent } from "@/hooks/useHumanVoiceAgent";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
  { code: "as", name: "অসমীয়া (Assamese)" },
  { code: "ur", name: "اردو (Urdu)" },
];

const VOICES = [
  { id: "alloy",   label: "Alloy — warm neutral" },
  { id: "nova",    label: "Nova — bright, female" },
  { id: "shimmer", label: "Shimmer — soft, female" },
  { id: "onyx",    label: "Onyx — deep, male" },
  { id: "echo",    label: "Echo — clear, male" },
  { id: "sage",    label: "Sage — unhurried" },
];

const STYLES = [
  { id: "warm",       label: "Warm friend" },
  { id: "calm",       label: "Calm & slow" },
  { id: "energetic",  label: "Bright & energetic" },
];

const VoiceConsole = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");
  const [voice, setVoice] = useState("alloy");
  const [style, setStyle] = useState("warm");
  const [region, setRegion] = useState("India");
  const [profileName, setProfileName] = useState("");
  const [customText, setCustomText] = useState("Hello, this is a quick voice test. Speak naturally, like a friend.");

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

  const agent = useHumanVoiceAgent({
    language,
    voice,
    region,
    onError: (m) => toast.error(m),
  });

  const status = useMemo(() => {
    if (agent.isListening) return { label: "Listening", tone: "destructive" as const };
    if (agent.isThinking) return { label: "Thinking", tone: "secondary" as const };
    if (agent.isSpeaking) return { label: "Speaking", tone: "default" as const };
    return { label: "Idle", tone: "outline" as const };
  }, [agent.isListening, agent.isThinking, agent.isSpeaking]);

  const savePreferredVoice = async (v: string) => {
    setVoice(v);
    if (!user) return;
    await supabase.from("profiles").update({ preferred_voice: v }).eq("user_id", user.id);
    toast.success("Preferred voice saved to your profile");
  };

  const testTTS = async () => {
    if (!customText.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); return; }
    // Reuse the agent's speak path by faking a chat: simplest is to POST TTS directly.
    try {
      const res = await fetch(
        `https://exynaicvgadoenjfunqz.supabase.co/functions/v1/voice-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text: customText, voice, region, language, style }),
        }
      );
      if (!res.ok || !res.body) throw new Error(`TTS ${res.status}`);
      const ctx = new AudioContext({ sampleRate: 24000 });
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});
      let playhead = ctx.currentTime + 0.05;
      let pending = new Uint8Array(0);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const evt of events) {
          const line = evt.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const p = JSON.parse(data);
            if (p.type === "speech.audio.delta" && p.audio) {
              const bin = atob(p.audio);
              const bytes = new Uint8Array(pending.length + bin.length);
              bytes.set(pending);
              for (let i = 0; i < bin.length; i++) bytes[pending.length + i] = bin.charCodeAt(i);
              const usable = bytes.length - (bytes.length % 2);
              pending = bytes.slice(usable);
              if (!usable) continue;
              const samples = new Int16Array(bytes.buffer, 0, usable / 2);
              const floats = Float32Array.from(samples, (s) => s / 32768);
              const buffer = ctx.createBuffer(1, floats.length, 24000);
              buffer.copyToChannel(floats, 0);
              const src = ctx.createBufferSource();
              src.buffer = buffer;
              src.connect(ctx.destination);
              const start = Math.max(playhead, ctx.currentTime);
              src.start(start);
              playhead = start + buffer.duration;
            }
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "TTS test failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Voice Agent Test Console</h1>
          <p className="text-muted-foreground mt-1">
            QA the human voice agent — live transcript, streaming status, interruption, history.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-1 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Session</CardTitle>
                <CardDescription>
                  {profileName ? `Signed in as ${profileName}` : "Not signed in — sign in to personalize."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Voice</label>
                  <Select value={voice} onValueChange={savePreferredVoice}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Style</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Region</label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["India","Punjab","Haryana","Karnataka","Tamil Nadu","Maharashtra","Kerala","West Bengal","Assam","Odisha"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" /> Live conversation
                  </CardTitle>
                  <CardDescription>
                    Tap the mic and talk. Auto-stops after ~1.2s of silence. Tap again while speaking to interrupt.
                  </CardDescription>
                </div>
                <Badge variant={status.tone}>{status.label}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    variant={agent.isListening ? "destructive" : "default"}
                    onClick={() => {
                      if (agent.isListening) agent.stopListening();
                      else if (agent.isSpeaking) { agent.stopSpeaking(); agent.startListening(); }
                      else agent.startListening();
                    }}
                    className="gap-2"
                  >
                    {agent.isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> :
                     agent.isListening ? <Square className="h-4 w-4" /> :
                     <Mic className="h-4 w-4" />}
                    {agent.isListening ? "Stop" : agent.isSpeaking ? "Interrupt & talk" : "Start talking"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={agent.stopSpeaking} disabled={!agent.isSpeaking} className="gap-2">
                    <VolumeX className="h-4 w-4" /> Stop speaking
                  </Button>
                  <Button size="sm" variant="ghost" onClick={agent.stopAll} className="gap-2">
                    <PhoneOff className="h-4 w-4" /> End call
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-muted/40 border min-h-[80px]">
                    <p className="text-xs font-medium text-muted-foreground mb-1">You (live transcript)</p>
                    <p className="text-sm whitespace-pre-wrap">{agent.transcript || <span className="text-muted-foreground/60">—</span>}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 min-h-[80px]">
                    <p className="text-xs font-medium text-primary mb-1">Assistant (streaming)</p>
                    <p className="text-sm whitespace-pre-wrap">{agent.reply || <span className="text-muted-foreground/60">—</span>}</p>
                  </div>
                </div>

                {agent.error && (
                  <div className="p-2 text-xs rounded border border-destructive/40 bg-destructive/10 text-destructive">
                    {agent.error}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">TTS quick test</CardTitle>
                <CardDescription>Speak custom text with the current voice, style, and language.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea rows={3} value={customText} onChange={(e) => setCustomText(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={testTTS} className="gap-2"><Volume2 className="h-4 w-4" /> Speak</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Conversation history</CardTitle>
                  <CardDescription>{agent.history.length / 2} turns this session</CardDescription>
                </div>
                <Button size="sm" variant="ghost" onClick={agent.stopAll} className="gap-1">
                  <Trash2 className="h-4 w-4" /> Reset
                </Button>
              </CardHeader>
              <CardContent>
                {agent.history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No turns yet. Start talking to build history.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {agent.history.map((m, i) => (
                      <div key={i} className={cn("p-2 rounded text-sm", m.role === "user" ? "bg-muted/40" : "bg-primary/5 border border-primary/10")}>
                        <span className="text-xs font-medium mr-1">{m.role === "user" ? "You:" : "Assistant:"}</span>
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />
        <p className="text-xs text-muted-foreground">
          Powered by Lovable AI · <code>voice-transcribe</code> (Whisper) → <code>voice-chat</code> (Gemini, personalized) → <code>voice-tts</code> (locale-aware).
        </p>
      </div>
    </div>
  );
};

export default VoiceConsole;
