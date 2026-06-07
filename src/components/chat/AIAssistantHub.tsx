import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Volume2, VolumeX, Trash2, Copy, ThumbsUp, ThumbsDown, CircleStop as StopCircle, RefreshCw, MessageCircle, Phone as PhoneIcon, Video, Mic, MicOff, ImagePlus, X, Camera, Loader as Loader2 } from "lucide-react";
import { krishiAiAvatarImage } from "@/lib/imageAssets";
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
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const AIAssistantHub = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{
      id: "welcome",
      content: t('ai.greeting') || "Namaste! I am Farm Intellect, your agricultural assistant. Ask me anything about farming.",
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
    utterance.onstart = () => { setIsSpeaking(true); };
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
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

        if (voiceEnabled && assistantSoFar) {
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
    setMessages([{ id: "welcome", content: t('ai.greeting') || "Namaste! I am Farm Intellect, your agricultural assistant.", type: "assistant", timestamp: new Date() }]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied!");
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

  const quickQuestions = [
    t('ai.quick_crop_season') || "Which crops should I grow this season?",
    t('ai.quick_pest_control') || "How to control fall armyworm in maize?",
    t('ai.quick_fertilizer') || "What fertilizer dose is best for wheat?",
    t('ai.quick_msp') || "What is the current government MSP for paddy?",
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
                <img src={krishiAiAvatarImage} alt="AI" className="h-full w-full object-cover scale-110" />
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
      {uploadedImage && (
        <div className="pb-2">
          <div className="relative inline-flex items-start gap-3 bg-muted/50 rounded-lg p-2 border border-primary/20">
            <img src={uploadedImage} alt="Crop photo" className="h-16 w-16 rounded-lg object-cover shadow" />
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
            placeholder={uploadedImage ? "Describe the crop issue..." : t('ai.placeholder') || "Ask Farm Intellect..."}
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
        <Button onClick={uploadedImageFile ? sendWithImage : () => sendMessage()} disabled={(!inputMessage.trim() && !uploadedImage) || isLoading} size="sm">
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          {t('ai.press_enter') || "Press Enter to send"}
          {isListening && <Badge variant="secondary" className="animate-pulse">🎤 {t('ai.listening') || "Listening..."}</Badge>}
          {isSpeaking && <Badge variant="default" className="animate-pulse">🔊 {t('ai.speaking') || "Speaking..."}</Badge>}
        </span>
      </div>
    </div>
  );

  return (
    <Card className="w-full h-[700px] flex flex-col tricolor-card overflow-hidden">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-primary/20">
              <img src={krishiAiAvatarImage} alt="Farm Intellect" className="h-10 w-10 object-cover scale-110" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('ai.title') || "AI Assistant"}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('ai.realtime_advice') || "Real-time Agricultural Advice"}</p>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {renderMessages()}
        {messages.length === 1 && (
          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs font-medium mb-2">{t('ai.quick_questions') || "Quick Questions"}:</p>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => sendMessage(q)} className="text-xs">{q}</Button>
              ))}
            </div>
          </div>
        )}
        {renderInputBar()}
      </div>
    </Card>
  );
};
