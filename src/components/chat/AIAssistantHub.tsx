import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Send, User, Volume2, VolumeX, Trash2, Copy, ThumbsUp, ThumbsDown,
  StopCircle, RefreshCw, MessageCircle, Phone as PhoneIcon, Video,
  Mic, MicOff, ImagePlus, X, Camera
} from "lucide-react";
import krishiAvatar from "@/assets/krishi-ai-avatar.png";
import doctorAvatar from "@/assets/doctor-avatar.png";
import { streamChat, type AiMessage } from "@/lib/aiStream";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { VoiceInput } from "@/components/ui/voice-input";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
}

const ttsLanguageMap: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", te: "te-IN", ta: "ta-IN",
  mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN",
};

export const AIAssistantHub = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "video">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice call state
  const [voiceCallActive, setVoiceCallActive] = useState(false);
  const [voiceCallDuration, setVoiceCallDuration] = useState(0);
  const voiceCallTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Video call state
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [videoCallDuration, setVideoCallDuration] = useState(0);
  const videoCallTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMessages([{
      id: "welcome",
      content: t('ai.greeting'),
      type: "assistant",
      timestamp: new Date(),
    }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').replace(/`/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = ttsLanguageMap[language] || "en-IN";
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const langCode = ttsLanguageMap[language] || "en-IN";
    const voice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith('en'));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { setIsSpeaking(true); setAvatarSpeaking(true); };
    utterance.onend = () => { setIsSpeaking(false); setAvatarSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); setAvatarSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setAvatarSpeaking(false);
  }, []);

  const sendMessage = async (forcedText?: string) => {
    const messageText = (forcedText ?? inputMessage).trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: messageText,
      type: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    const history: AiMessage[] = messages
      .filter(m => m.id !== "welcome")
      .map(m => ({ role: m.type === "user" ? "user" as const : "assistant" as const, content: m.content }));
    history.push({ role: "user", content: userMsg.content });

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.type === "assistant" && last.id === "streaming") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { id: "streaming", content: assistantSoFar, type: "assistant", timestamp: new Date() }];
      });
    };

    await streamChat({
      messages: history,
      mode: "chat",
      onDelta: upsertAssistant,
      onDone: () => {
        setMessages(prev =>
          prev.map(m => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m))
        );
        setIsLoading(false);

        // Auto-speak in voice/video call modes
        if ((activeTab === "voice" || activeTab === "video") && assistantSoFar) {
          setTimeout(() => speakText(assistantSoFar), 300);
        } else if (voiceEnabled && activeTab === "chat" && assistantSoFar) {
          setTimeout(() => speakText(assistantSoFar), 300);
        }
      },
      onError: (err) => {
        toast.error(err || "Failed to get response");
        setIsLoading(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([{ id: "welcome", content: t('ai.greeting'), type: "assistant", timestamp: new Date() }]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied!");
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Voice call handlers
  const startVoiceCall = () => {
    setVoiceCallActive(true);
    setVoiceCallDuration(0);
    voiceCallTimerRef.current = setInterval(() => setVoiceCallDuration(d => d + 1), 1000);
    speakText(t('ai.greeting'));
  };

  const endVoiceCall = () => {
    setVoiceCallActive(false);
    stopSpeaking();
    if (voiceCallTimerRef.current) clearInterval(voiceCallTimerRef.current);
  };

  // Video call handlers
  const startVideoCall = () => {
    setVideoCallActive(true);
    setVideoCallDuration(0);
    videoCallTimerRef.current = setInterval(() => setVideoCallDuration(d => d + 1), 1000);
    speakText("Namaste! I am Dr. Krishi, your agricultural health advisor. How can I help your crops today?");
  };

  const endVideoCall = () => {
    setVideoCallActive(false);
    stopSpeaking();
    if (videoCallTimerRef.current) clearInterval(videoCallTimerRef.current);
  };

  useEffect(() => {
    return () => {
      if (voiceCallTimerRef.current) clearInterval(voiceCallTimerRef.current);
      if (videoCallTimerRef.current) clearInterval(videoCallTimerRef.current);
    };
  }, []);

  const quickQuestions = [
    t('ai.quick_crop_season'),
    t('ai.quick_pest_control'),
    t('ai.quick_fertilizer'),
    t('ai.quick_msp'),
  ];

  // ─── Chat Messages Renderer ───
  const renderMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex gap-3 animate-fade-in ${message.type === "user" ? "justify-end" : "justify-start"}`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {message.type === "assistant" && (
            <Avatar className="w-8 h-8 border border-primary/20">
              <AvatarFallback className="p-0 overflow-hidden">
                <img src={krishiAvatar} alt="Krishi AI" className="h-full w-full object-cover scale-110" />
              </AvatarFallback>
            </Avatar>
          )}
          <div className={`max-w-[80%] space-y-2 ${message.type === "user" ? "order-first" : ""}`}>
            <div className={`p-3 rounded-lg ${message.type === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted hover:shadow-md"}`}>
              {message.type === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              {message.id === "streaming" && isLoading && (
                <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
              )}
            </div>
            {message.id !== "streaming" && message.type === "assistant" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <Button variant="ghost" size="sm" onClick={() => speakText(message.content)} className="h-6 w-6 p-0"><Volume2 className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)} className="h-6 w-6 p-0"><Copy className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><ThumbsUp className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><ThumbsDown className="h-3 w-3" /></Button>
              </div>
            )}
          </div>
          {message.type === "user" && (
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent/20"><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );

  // ─── Input Bar ───
  const renderInputBar = () => (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ai.placeholder')}
            disabled={isLoading}
            className="pr-12"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <VoiceInput
              onTranscript={(text) => setInputMessage(prev => prev + (prev ? " " : "") + text)}
              onListeningChange={setIsListening}
              disabled={isLoading}
              size="sm"
              className={isListening ? "animate-saffron-pulse" : ""}
            />
          </div>
        </div>
        <Button onClick={() => sendMessage()} disabled={!inputMessage.trim() || isLoading} size="sm">
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          {t('ai.press_enter')}
          {isListening && <Badge variant="secondary" className="animate-pulse">🎤 {t('ai.listening')}</Badge>}
          {isSpeaking && <Badge variant="default" className="animate-pulse">🔊 {t('ai.speaking')}</Badge>}
        </span>
      </div>
    </div>
  );

  // ─── Video Call Avatar ───
  const renderVideoAvatar = () => (
    <div className="relative w-full aspect-video bg-gradient-to-b from-green-900/80 to-green-950/90 rounded-xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.15),transparent_70%)]" />
      <div className="flex flex-col items-center gap-4">
        <div className={`relative transition-transform duration-300 ${avatarSpeaking ? 'scale-105' : 'scale-100'}`}>
          <div className={`absolute -inset-3 rounded-full ${avatarSpeaking ? 'bg-green-400/30 animate-pulse' : 'bg-green-400/10'}`} />
          <div className={`absolute -inset-6 rounded-full ${avatarSpeaking ? 'bg-green-400/15 animate-ping' : 'hidden'}`} style={{ animationDuration: '2s' }} />
          <img
            src={doctorAvatar}
            alt="Dr. Krishi"
            className="h-40 w-40 rounded-full object-cover border-4 border-green-400/50 shadow-2xl"
            loading="lazy"
          />
          {avatarSpeaking && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-1.5 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s`, height: `${8 + Math.random() * 16}px` }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-white font-bold text-lg">Dr. Krishi</h3>
          <p className="text-green-300 text-sm">Agricultural Health Advisor</p>
          {videoCallActive && (
            <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-500/30">
              🔴 Live • {formatDuration(videoCallDuration)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full h-[700px] flex flex-col tricolor-card overflow-hidden">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-primary/20">
              <img src={krishiAvatar} alt="Krishi AI" className="h-10 w-10 object-cover scale-110" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('ai.title')}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('ai.realtime_advice')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isSpeaking && (
              <Button variant="destructive" size="sm" onClick={stopSpeaking} className="h-8 px-2 animate-pulse">
                <StopCircle className="h-4 w-4 mr-1" /> Stop
              </Button>
            )}
            <Button
              variant={voiceEnabled ? "default" : "ghost"}
              size="sm"
              onClick={() => { if (voiceEnabled) stopSpeaking(); setVoiceEnabled(!voiceEnabled); }}
              className="h-8 w-8 p-0"
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 w-8 p-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b bg-muted/30 h-12 px-2">
          <TabsTrigger value="chat" className="flex-1 gap-2 data-[state=active]:bg-primary/10">
            <MessageCircle className="h-4 w-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex-1 gap-2 data-[state=active]:bg-primary/10">
            <PhoneIcon className="h-4 w-4" /> Voice Call
          </TabsTrigger>
          <TabsTrigger value="video" className="flex-1 gap-2 data-[state=active]:bg-primary/10">
            <Video className="h-4 w-4" /> Video Call
          </TabsTrigger>
        </TabsList>

        {/* ─── Chat Tab ─── */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
          {renderMessages()}
          {messages.length === 1 && (
            <div className="p-3 border-t bg-muted/30">
              <p className="text-xs font-medium mb-2">{t('ai.quick_questions')}:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, i) => (
                  <Button key={i} variant="outline" size="sm" onClick={() => sendMessage(q)} className="text-xs">{q}</Button>
                ))}
              </div>
            </div>
          )}
          {renderInputBar()}
        </TabsContent>

        {/* ─── Voice Call Tab ─── */}
        <TabsContent value="voice" className="flex-1 flex flex-col mt-0 overflow-hidden">
          {!voiceCallActive ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-green-400/10 animate-pulse" />
                <img src={krishiAvatar} alt="Krishi AI" className="h-32 w-32 rounded-full object-cover border-4 border-primary/30 shadow-xl" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">{t('ai.title')}</h3>
                <p className="text-muted-foreground text-sm mt-1">Tap to start a voice consultation</p>
              </div>
              <Button onClick={startVoiceCall} size="lg" className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-lg">
                <PhoneIcon className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-b from-green-900/20 to-transparent">
                <div className="relative">
                  <div className={`absolute -inset-3 rounded-full ${isSpeaking ? 'bg-green-400/30 animate-pulse' : 'bg-green-400/10'}`} />
                  <img src={krishiAvatar} alt="Krishi AI" className="h-20 w-20 rounded-full object-cover border-2 border-green-400/50" />
                  {isSpeaking && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s`, height: `${6 + Math.random() * 10}px` }} />
                      ))}
                    </div>
                  )}
                </div>
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">
                  🔴 Connected • {formatDuration(voiceCallDuration)}
                </Badge>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderMessages()}
              </div>
              {renderInputBar()}
              <div className="p-3 border-t flex justify-center">
                <Button onClick={endVoiceCall} variant="destructive" size="lg" className="rounded-full h-14 w-14">
                  <PhoneIcon className="h-5 w-5 rotate-[135deg]" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── Video Call Tab ─── */}
        <TabsContent value="video" className="flex-1 flex flex-col mt-0 overflow-hidden">
          {!videoCallActive ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-green-400/10 animate-pulse" />
                <img src={doctorAvatar} alt="Dr. Krishi" className="h-36 w-36 rounded-full object-cover border-4 border-green-400/30 shadow-xl" loading="lazy" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">Dr. Krishi</h3>
                <p className="text-muted-foreground text-sm mt-1">AI Agricultural Health Advisor</p>
                <p className="text-muted-foreground text-xs mt-0.5">Video consultation for crop health diagnosis</p>
              </div>
              <Button onClick={startVideoCall} size="lg" className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-lg">
                <Video className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3">
                {renderVideoAvatar()}
              </div>
              <div className="flex-1 overflow-y-auto max-h-[200px]">
                {renderMessages()}
              </div>
              {renderInputBar()}
              <div className="p-2 border-t flex justify-center">
                <Button onClick={endVideoCall} variant="destructive" size="lg" className="rounded-full h-12 w-12">
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
