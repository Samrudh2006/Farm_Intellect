import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  User,
  Volume2,
  VolumeX,
  RefreshCw,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  StopCircle
} from "lucide-react";
import krishiAvatar from "@/assets/krishi-ai-avatar.png";
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
  isTyping?: boolean;
}

// Text-to-Speech language mapping
const ttsLanguageMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  te: "te-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  or: "or-IN",
  as: "as-IN",
  ur: "ur-IN",
  sa: "sa-IN",
  ne: "ne-NP",
  sd: "sd-IN",
  ks: "ks-IN",
  kok: "kok-IN",
  doi: "doi-IN",
  mai: "mai-IN",
  mni: "mni-IN",
  sat: "sat-IN",
  brx: "brx-IN",
};

export const EnhancedAIChatbot = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Text-to-Speech function
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text - remove markdown
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = ttsLanguageMap[language] || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Find best matching voice
    const voices = window.speechSynthesis.getVoices();
    const langCode = ttsLanguageMap[language] || "en-IN";
    const matchingVoice = voices.find(v => v.lang === langCode) || 
                          voices.find(v => v.lang.startsWith(langCode.split('-')[0])) ||
                          voices.find(v => v.lang.startsWith('en'));
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const handleVoiceTranscript = (text: string) => {
    setInputMessage(prev => prev + (prev ? " " : "") + text);
  };

  const sendMessage = async (forcedText?: string) => {
    const messageText = (forcedText ?? inputMessage).trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: messageText,
      type: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    // Build AI message history (skip welcome, typing)
    const history: AiMessage[] = messages
      .filter((m) => m.id !== "welcome" && !m.isTyping)
      .map((m) => ({ role: m.type === "user" ? "user" as const : "assistant" as const, content: m.content }));
    history.push({ role: "user", content: userMsg.content });

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
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
        setMessages((prev) =>
          prev.map((m) => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m))
        );
        setIsLoading(false);

        if (voiceEnabled && assistantSoFar) {
          setTimeout(() => speakText(assistantSoFar), 300);
        }
      },
      onError: (err) => {
        toast.error(err || t('ai.error_chat_failed'));
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            content: t('ai.error_chat_failed'),
            type: "assistant",
            timestamp: new Date(),
          },
        ]);
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
    setMessages([{
      id: "welcome",
      content: t('ai.greeting'),
      type: "assistant",
      timestamp: new Date(),
    }]);
  };
  
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('ai.copied'));
  };

  const speakMessage = (content: string) => {
    speakText(content);
  };

  const quickQuestions = [
    t('ai.quick_crop_season'),
    t('ai.quick_pest_control'),
    t('ai.quick_fertilizer'),
    t('ai.quick_msp'),
    t('ai.quick_soil'),
  ];

  return (
    <Card className="w-full h-[600px] flex flex-col tricolor-card">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-primary/20">
              <img src={krishiAvatar} alt="Krishi AI" className="h-10 w-10 object-cover scale-110" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('ai.title')}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {t('ai.realtime_advice')}
                {voiceEnabled && <Badge variant="outline" className="text-xs">🔊 {t('ai.voice_on')}</Badge>}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={stopSpeaking}
                className="h-8 px-3 animate-pulse"
              >
               <StopCircle className="h-4 w-4 mr-1" />
                {t('ai.stop')}
              </Button>
            )}
            <Button 
              variant={voiceEnabled ? "default" : "ghost"} 
              size="sm" 
              onClick={() => {
                if (voiceEnabled) stopSpeaking();
                setVoiceEnabled(!voiceEnabled);
              }} 
              className="h-8 w-8 p-0"
              title={voiceEnabled ? t('ai.disable_voice') : t('ai.enable_voice')}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 w-8 p-0 hover:bg-destructive/10" title={t('ai.clear_chat')}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
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
                <div className={`p-3 rounded-lg transition-all ${message.type === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted hover:shadow-md"}`}>
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
                {!message.isTyping && message.id !== "streaming" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {message.type === "assistant" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => speakMessage(message.content)} 
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                          title={t('ai.listen_message')}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)} className="h-6 w-6 p-0 hover:bg-primary/10">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10"><ThumbsUp className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/10"><ThumbsDown className="h-3 w-3" /></Button>
                      </>
                    )}
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

        {messages.length === 1 && (
          <div className="p-4 border-t bg-muted/30">
            <h4 className="text-sm font-medium mb-2">{t('ai.quick_questions')}:</h4>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => sendMessage(q)} 
                  className="text-xs hover:bg-primary/10 hover:border-primary transition-all"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.placeholder')}
                disabled={isLoading}
                className="pr-12 transition-all focus:ring-2 focus:ring-primary"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  onListeningChange={setIsListening}
                  disabled={isLoading}
                  size="sm"
                  className={isListening ? "animate-saffron-pulse" : ""}
                />
              </div>
            </div>
            <Button 
              onClick={() => sendMessage()} 
              disabled={!inputMessage.trim() || isLoading} 
              size="sm"
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              {t('ai.press_enter')}
              {isListening && <Badge variant="secondary" className="animate-pulse">🎤 {t('ai.listening')}</Badge>}
              {isSpeaking && <Badge variant="default" className="animate-pulse">🔊 {t('ai.speaking')}</Badge>}
            </span>
            <Badge variant="secondary" className="text-xs">{t('ai.powered_by')}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
