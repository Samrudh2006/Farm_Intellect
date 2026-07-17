import { useState, useRef, useEffect } from "react";
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
  ThumbsDown
} from "lucide-react";
import krishiLogo from "@/assets/krishi-ai-logo.png";
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

export const AIChatbot = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    id: "welcome",
    content: t('ai.greeting'),
    type: "assistant",
    timestamp: new Date(),
  };

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

  const handleVoiceTranscript = (text: string) => {
    setInputMessage(prev => prev + (prev ? " " : "") + text);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
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
      language,
      onDelta: upsertAssistant,
      onDone: () => {
        // Replace streaming id with permanent id
        setMessages((prev) =>
          prev.map((m) => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m))
        );
        setIsLoading(false);
      },
      onError: (err) => {
        toast.error(err);
        setIsLoading(false);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([{
    id: "welcome",
    content: t('ai.greeting'),
    type: "assistant",
    timestamp: new Date(),
  }]);
  
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied!");
  };

  const quickQuestions = [
    "Best crops for Rabi season in Punjab?",
    "How to control aphids in mustard crop?",
    "NPK dosage for wheat PBW 725?",
    "Current MSP for paddy 2025?",
    "How to improve soil organic carbon?",
  ];

  return (
    <Card className="w-full h-[600px] flex flex-col tricolor-card">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-primary/20">
              <img src={krishiAvatar} alt="Farm Intellect" className="h-10 w-10 object-cover scale-110" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('ai.title')}</CardTitle>
              <CardDescription>Real-time AI-powered farming advice</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setVoiceEnabled(!voiceEnabled)} className="h-8 w-8 p-0 hover:bg-primary/10">
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 w-8 p-0 hover:bg-destructive/10">
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
                    <img src={krishiAvatar} alt="Farm Intellect" className="h-full w-full object-cover scale-110" />
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
            <h4 className="text-sm font-medium mb-2">Quick Questions:</h4>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInputMessage(q)} 
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
                onKeyPress={handleKeyPress}
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
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading} 
              size="sm"
              className="bg-primary hover:bg-primary/90 transition-all"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              Press Enter to send
              {isListening && <Badge variant="secondary" className="animate-pulse">🎤 Listening...</Badge>}
            </span>
            <Badge variant="secondary" className="text-xs">Powered by Farm Intellect</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
