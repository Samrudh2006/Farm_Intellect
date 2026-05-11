import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Mic, MicOff, Volume2, StopCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import krishiAvatar from "@/assets/krishi-ai-avatar.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { streamChat, type AiMessage } from "@/lib/aiStream";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const langMap: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", te: "te-IN",
  ta: "ta-IN", pa: "pa-IN", mr: "mr-IN", gu: "gu-IN",
  kn: "kn-IN", ml: "ml-IN", or: "or-IN", ur: "ur-IN",
};

export const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── TTS ──
  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_~`>[\]()!]/g, "").replace(/\n+/g, ". ").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = langMap[language] || "en-IN";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // ── Voice Recognition ──
  const toggleListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Voice not supported", description: "Your browser doesn't support speech recognition. Try Chrome.", variant: "destructive" });
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = langMap[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
        // Auto-send after a short delay
        setTimeout(() => handleSendMessage(transcript), 300);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== "aborted") {
        toast({ title: "Voice error", description: `Microphone error: ${e.error}`, variant: "destructive" });
      }
    };
    setIsListening(true);
    recognition.start();
  }, [isListening, language]);

  // ── Send message with real AI streaming ──
  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Build AI message history
    const aiMessages: AiMessage[] = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add language instruction if not English
    if (language !== "en") {
      const langNames: Record<string, string> = {
        hi: "Hindi", bn: "Bengali", te: "Telugu", ta: "Tamil",
        pa: "Punjabi", mr: "Marathi", gu: "Gujarati", kn: "Kannada",
        ml: "Malayalam", or: "Odia", ur: "Urdu",
      };
      const langName = langNames[language] || "Hindi";
      aiMessages.unshift({
        role: "system",
        content: `Respond primarily in ${langName}. Use Devanagari/native script. Include English technical terms where helpful.`,
      });
    }

    let assistantContent = "";

    await streamChat({
      messages: aiMessages,
      mode: "chat",
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      },
      onDone: () => {
        setIsStreaming(false);
        // Auto-speak response if it came from voice input
        if (overrideText && assistantContent) {
          speakText(assistantContent);
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        toast({ title: "AI Error", description: err, variant: "destructive" });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${err}\n\nPlease try again.` },
        ]);
      },
    });
  }, [input, isStreaming, messages, language, speakText]);

  const handleSend = () => handleSendMessage();

  const quickQuestions = language === "hi"
    ? ["गेहूं कैसे उगाएं?", "सरकारी योजनाएं", "कीट प्रबंधन"]
    : ["How to grow wheat?", "Government schemes", "Pest management"];

  return (
    <>
      {/* FAB */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-16 w-16 rounded-full shadow-xl hover:shadow-2xl transition-shadow overflow-hidden border-2 border-primary/30 bg-white p-0 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="flex items-center justify-center h-full w-full bg-gradient-to-br from-accent to-primary">
                <X className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="h-full w-full">
                <img src={krishiAvatar} alt="Krishi AI" className="h-full w-full object-cover rounded-full scale-125" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-accent/30 pointer-events-none" />
        )}
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-accent to-primary text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex-shrink-0">
                <img src={krishiAvatar} alt="Krishi AI" className="h-full w-full object-cover scale-110" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm font-heading">{t("ai.title")}</h3>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI-Powered • Real-time
                </p>
              </div>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                  <StopCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[360px]">
              {messages.length === 0 && (
                <div className="text-center py-4 space-y-3">
                  <AshokaChakra size={40} className="mx-auto" />
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {t("ai.greeting")}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); handleSendMessage(q); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="relative group max-w-[85%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md prose prose-sm prose-green max-w-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "assistant" && msg.content && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/10"
                        title="Listen to response"
                      >
                        <Volume2 className={`h-3 w-3 ${isSpeaking ? "text-accent animate-pulse" : "text-muted-foreground"}`} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-4 py-3 bg-muted rounded-2xl rounded-bl-md w-fit">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={toggleListening}
                  disabled={isStreaming}
                  className={`flex-shrink-0 rounded-full h-9 w-9 ${isListening ? "animate-pulse" : ""}`}
                  title={isListening ? "Stop listening" : "Speak to Krishi AI"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "🎙️ Listening..." : t("ai.placeholder")}
                  className="flex-1 text-sm"
                  disabled={isStreaming}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isStreaming}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 w-9 flex-shrink-0"
                >
                  {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 flex items-center justify-center gap-2 text-xs text-destructive"
                >
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Listening in {langMap[language]?.split("-")[0] || "English"}...
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
