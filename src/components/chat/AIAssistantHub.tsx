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
  Mic, MicOff, ImagePlus, X, Camera, Loader2
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
  imageUrl?: string;
}

const ttsLanguageMap: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", te: "te-IN", ta: "ta-IN",
  mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN",
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get raw base64
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Continuous voice listening
  const [continuousListening, setContinuousListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMessages([{
      id: "welcome",
      content: t('ai.greeting'),
      type: "assistant",
      timestamp: new Date(),
    }]);
  }, [language, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').replace(/`/g, '').replace(/\[.*?\]/g, '');
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

  const sendMessage = async (forcedText?: string, imageData?: { base64: string; mimeType: string; previewUrl: string }) => {
    const messageText = (forcedText ?? inputMessage).trim();
    if ((!messageText && !imageData) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: messageText || "Please analyze this crop image",
      type: "user",
      timestamp: new Date(),
      imageUrl: imageData?.previewUrl,
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
      mode: imageData ? "vision" : "chat",
      imageBase64: imageData?.base64,
      imageMimeType: imageData?.mimeType,
      onDelta: upsertAssistant,
      onDone: () => {
        setMessages(prev =>
          prev.map(m => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m))
        );
        setIsLoading(false);
        setIsAnalyzingImage(false);

        if ((activeTab === "voice" || activeTab === "video") && assistantSoFar) {
          setTimeout(() => speakText(assistantSoFar), 300);
        } else if (voiceEnabled && activeTab === "chat" && assistantSoFar) {
          setTimeout(() => speakText(assistantSoFar), 300);
        }
      },
      onError: (err) => {
        toast.error(err || "Failed to get response");
        setIsLoading(false);
        setIsAnalyzingImage(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (uploadedImageFile) {
        sendWithImage();
      } else {
        sendMessage();
      }
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
    stopContinuousListening();
    if (voiceCallTimerRef.current) clearInterval(voiceCallTimerRef.current);
  };

  // Video call handlers
  const startVideoCall = () => {
    setVideoCallActive(true);
    setVideoCallDuration(0);
    videoCallTimerRef.current = setInterval(() => setVideoCallDuration(d => d + 1), 1000);
    speakText("Namaste! I am Dr. Krishi, your agricultural health advisor. Show me your crop photos or describe the symptoms you see.");
  };

  const endVideoCall = () => {
    setVideoCallActive(false);
    stopSpeaking();
    removeImage();
    if (videoCallTimerRef.current) clearInterval(videoCallTimerRef.current);
  };

  // Image upload handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    setUploadedImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    toast.success("📷 Photo ready! Click Send or describe the issue for diagnosis.");
  };

  const removeImage = () => {
    setUploadedImage(null);
    setUploadedImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const sendWithImage = async () => {
    if (!uploadedImageFile) { sendMessage(); return; }
    
    setIsAnalyzingImage(true);
    const prompt = inputMessage.trim() || "Please analyze this crop image for diseases, pests, or nutrient deficiencies. Provide detailed diagnosis and treatment recommendations.";
    
    try {
      const base64 = await fileToBase64(uploadedImageFile);
      const mimeType = uploadedImageFile.type;
      const previewUrl = uploadedImage!;
      
      removeImage();
      await sendMessage(prompt, { base64, mimeType, previewUrl });
    } catch (err) {
      toast.error("Failed to process image");
      setIsAnalyzingImage(false);
    }
  };

  // Continuous voice recognition for voice call
  const startContinuousListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Speech recognition not supported"); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = ttsLanguageMap[language] || "en-IN";

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInputMessage(finalTranscript + interim);
    };

    recognition.onend = () => {
      if (finalTranscript.trim() && continuousListening) {
        const text = finalTranscript.trim();
        finalTranscript = "";
        setInputMessage("");
        sendMessage(text);
        setTimeout(() => {
          if (continuousListening && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (error) { console.warn("Speech restart failed", error); }
          }
        }, 2000);
      } else if (continuousListening) {
        try { recognition.start(); } catch (error) { console.warn("Speech start failed", error); }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error("Speech error:", event.error);
      }
    };

    recognitionRef.current = recognition;
    setContinuousListening(true);
    recognition.start();
    toast.success("🎤 Hands-free mode active — speak naturally!");
  }, [language, continuousListening]);

  const stopContinuousListening = useCallback(() => {
    setContinuousListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (error) { console.warn("Speech stop failed", error); }
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "voice") stopContinuousListening();
  }, [activeTab, stopContinuousListening]);

  useEffect(() => {
    return () => {
      if (voiceCallTimerRef.current) clearInterval(voiceCallTimerRef.current);
      if (videoCallTimerRef.current) clearInterval(videoCallTimerRef.current);
      stopContinuousListening();
    };
  }, [stopContinuousListening]);

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
            <Avatar className="w-8 h-8 border border-primary/20 shrink-0">
              <AvatarFallback className="p-0 overflow-hidden">
                <img src={activeTab === "video" ? doctorAvatar : krishiAvatar} alt="AI" className="h-full w-full object-cover scale-110" />
              </AvatarFallback>
            </Avatar>
          )}
          <div className={`max-w-[80%] space-y-2 ${message.type === "user" ? "order-first" : ""}`}>
            {/* Show attached image */}
            {message.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-primary/20 max-w-[200px]">
                <img src={message.imageUrl} alt="Shared crop photo" className="w-full h-auto object-cover" />
              </div>
            )}
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
            <Avatar className="w-8 h-8 shrink-0">
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

  // ─── Video Call Avatar with realistic look ───
  const renderVideoAvatar = () => (
    <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
      {/* Simulated video feed background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.12),transparent_70%)]" />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
        <span className="text-white/80 text-xs font-medium tracking-wide">LIVE</span>
      </div>
      <div className="absolute top-3 right-3">
        <Badge className="bg-black/50 text-white/90 border-white/20 text-xs">
          {formatDuration(videoCallDuration)}
        </Badge>
      </div>
      {/* Connection quality indicator */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`w-1 rounded-full bg-green-400 ${i <= 3 ? 'opacity-100' : 'opacity-30'}`} style={{height: `${4 + i * 3}px`}} />
        ))}
        <span className="text-white/60 text-[10px] ml-1">HD</span>
      </div>

      <div className="flex flex-col items-center gap-3 z-10">
        <div className={`relative transition-all duration-500 ${avatarSpeaking ? 'scale-105' : 'scale-100'}`}>
          {/* Outer glow rings */}
          <div className={`absolute -inset-4 rounded-full transition-opacity duration-500 ${avatarSpeaking ? 'opacity-100' : 'opacity-0'}`}
            style={{background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)'}} />
          <div className={`absolute -inset-8 rounded-full transition-opacity duration-700 ${avatarSpeaking ? 'opacity-60 animate-ping' : 'opacity-0'}`}
            style={{background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', animationDuration: '2.5s'}} />
          
          <img
            src={doctorAvatar}
            alt="Dr. Krishi"
            className={`h-36 w-36 rounded-full object-cover border-[3px] shadow-2xl transition-all duration-300 ${
              avatarSpeaking ? 'border-green-400 shadow-green-500/40' : 'border-white/30 shadow-black/50'
            }`}
            loading="lazy"
          />
          
          {/* Speaking wave bars */}
          {avatarSpeaking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-[3px] bg-black/40 rounded-full px-2 py-1">
              {[1,2,3,4,5,6,7].map(i => (
                <div
                  key={i}
                  className="w-[3px] bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.08}s`, height: `${6 + Math.sin(i * 1.5) * 10}px`, animationDuration: '0.6s' }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-white font-bold text-base drop-shadow-lg">Dr. Krishi</h3>
          <p className="text-green-300/80 text-xs">Agricultural Health Advisor</p>
        </div>
      </div>

      {/* Bottom gradient for text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
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
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-b from-background to-muted/30">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-green-400/10 animate-pulse" />
                <div className="absolute -inset-10 rounded-full bg-green-400/5 animate-ping" style={{animationDuration: '3s'}} />
                <img src={krishiAvatar} alt="Krishi AI" className="h-32 w-32 rounded-full object-cover border-4 border-primary/30 shadow-xl" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">{t('ai.title')}</h3>
                <p className="text-muted-foreground text-sm mt-1">Tap to start a voice consultation</p>
                <p className="text-muted-foreground text-xs mt-0.5">Speak in any Indian language</p>
              </div>
              <Button onClick={startVoiceCall} size="lg" className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all hover:scale-105">
                <PhoneIcon className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Call header with avatar and controls */}
              <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-b from-green-900/30 via-green-900/10 to-transparent">
                <div className="relative">
                  <div className={`absolute -inset-3 rounded-full transition-all duration-500 ${isSpeaking ? 'bg-green-400/30 animate-pulse' : 'bg-green-400/10'}`} />
                  <img src={krishiAvatar} alt="Krishi AI" className={`h-20 w-20 rounded-full object-cover border-2 transition-all ${isSpeaking ? 'border-green-400 shadow-lg shadow-green-500/30' : 'border-green-400/50'}`} />
                  {isSpeaking && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 bg-black/30 rounded-full px-1.5 py-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-[2px] bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${6 + Math.random() * 10}px`, animationDuration: '0.5s' }} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5 inline-block" />
                    Connected • {formatDuration(voiceCallDuration)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={continuousListening ? "default" : "outline"}
                    size="sm"
                    onClick={continuousListening ? stopContinuousListening : startContinuousListening}
                    className={`gap-1.5 transition-all ${continuousListening ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {continuousListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {continuousListening ? "Stop Hands-Free" : "🎤 Hands-Free Mode"}
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderMessages()}
              </div>
              {!continuousListening && renderInputBar()}
              {continuousListening && (
                <div className="p-4 border-t bg-green-50/50 dark:bg-green-950/20 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="relative">
                      <Mic className="h-5 w-5 text-green-500" />
                      <div className="absolute -inset-1 rounded-full bg-green-500/20 animate-ping" />
                    </div>
                    <span>Listening... speak naturally</span>
                  </div>
                  {inputMessage && (
                    <p className="mt-2 text-sm font-medium text-foreground bg-muted rounded-lg p-2 italic">"{inputMessage}"</p>
                  )}
                </div>
              )}
              <div className="p-3 border-t flex justify-center">
                <Button onClick={endVoiceCall} variant="destructive" size="lg" className="rounded-full h-14 w-14 shadow-lg shadow-red-500/30 transition-all hover:scale-105">
                  <PhoneIcon className="h-5 w-5 rotate-[135deg]" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── Video Call Tab ─── */}
        <TabsContent value="video" className="flex-1 flex flex-col mt-0 overflow-hidden">
          {!videoCallActive ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-b from-background to-muted/30">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-green-400/10 animate-pulse" />
                <div className="absolute -inset-10 rounded-full bg-green-400/5 animate-ping" style={{animationDuration: '3s'}} />
                <img src={doctorAvatar} alt="Dr. Krishi" className="h-36 w-36 rounded-full object-cover border-4 border-green-400/30 shadow-xl" loading="lazy" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">Dr. Krishi</h3>
                <p className="text-muted-foreground text-sm mt-1">AI Agricultural Health Advisor</p>
                <p className="text-muted-foreground text-xs mt-0.5">📷 Share crop photos for instant disease diagnosis</p>
              </div>
              <Button onClick={startVideoCall} size="lg" className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all hover:scale-105">
                <Video className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Video feed area */}
              <div className="p-3 pb-2">
                {renderVideoAvatar()}
              </div>
              
              {/* Image upload preview */}
              {uploadedImage && (
                <div className="px-3 pb-2">
                  <div className="relative inline-flex items-start gap-3 bg-muted/50 rounded-lg p-2 border border-primary/20">
                    <img src={uploadedImage} alt="Crop photo" className="h-20 w-20 rounded-lg object-cover shadow" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">📷 Crop photo attached</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Ready for AI diagnosis</p>
                      {isAnalyzingImage && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Loader2 className="h-3 w-3 animate-spin text-green-500" />
                          <span className="text-xs text-green-600">Analyzing...</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="h-6 w-6 p-0 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {renderMessages()}
              </div>
              
              {/* Video call input with image upload */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    className="h-10 w-10 p-0 shrink-0"
                    title="Upload crop photo for diagnosis"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={uploadedImage ? "Describe the crop issue..." : "Ask Dr. Krishi or share a photo..."}
                      disabled={isLoading}
                      className="pr-12"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <VoiceInput
                        onTranscript={(text) => setInputMessage(prev => prev + (prev ? " " : "") + text)}
                        onListeningChange={setIsListening}
                        disabled={isLoading}
                        size="sm"
                      />
                    </div>
                  </div>
                  <Button onClick={sendWithImage} disabled={(!inputMessage.trim() && !uploadedImage) || isLoading} size="sm" className="h-10">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Bottom controls */}
              <div className="p-2 border-t flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <ImagePlus className="h-4 w-4" /> Share Photo
                </Button>
                <Button onClick={endVideoCall} variant="destructive" size="lg" className="rounded-full h-12 w-12 shadow-lg shadow-red-500/30">
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
