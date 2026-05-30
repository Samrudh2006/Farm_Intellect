import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, Mic, MicOff, Volume2, StopCircle, Loader2, Navigation, Zap, Command } from "lucide-react";
import ReactMarkdown from "react-markdown";
import krishiAvatar from "@/assets/krishi-ai-avatar.png";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { AshokaChakra } from "@/components/ui/ashoka-chakra";
import { streamChat, type AiMessage } from "@/lib/aiStream";
import { toast } from "@/hooks/use-toast";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "question" | "command";
  commandType?: string;
}

const VOICE_PROCESS_DELAY_MS = 250;
const VOICE_SPEECH_RATE = 0.92;
const VOICE_MAX_SPOKEN_CHARS = 500;
const VOICE_QUALITY_REGEX = /(neural|natural|wavenet|enhanced|google|microsoft|premium)/i;

const NAV_TARGETS = [
  { path: "/login", patterns: [/\b(log ?in|login|sign ?in)\b/i, /लॉगिन/i, /साइन इन/i] },
  { path: "/sms-register", patterns: [/\b(sms|register|registration)\b/i, /रजिस्टर/i, /संदेश/i] },
  { path: "/", patterns: [/\b(home|homepage|landing)\b/i, /होम/i, /मुख्य पेज/i] },
] as const;

const langMap: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", te: "te-IN",
  ta: "ta-IN", pa: "pa-IN", mr: "mr-IN", gu: "gu-IN",
  kn: "kn-IN", ml: "ml-IN", or: "or-IN", ur: "ur-IN",
  as: "as-IN", // Assamese
  sa: "sa-IN", // Sanskrit
  ne: "ne-NP", // Nepali
  sd: "sd-IN", // Sindhi
  ks: "ks-IN", // Kashmiri
  kok: "kok-IN", // Konkani
  doi: "doi-IN", // Dogri
  mai: "mai-IN", // Maithili
  mni: "mni-IN", // Manipuri
  sat: "sat-IN", // Santali
  brx: "brx-IN", // Bodo
};

export const FloatingAIAssistant = () => {
  const navigate = useNavigate();
  const { executeVoiceCommand, getSuggestedCommands, isProcessing } = useVoiceCommands();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastTranscript, setLastTranscript] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const getBestVoice = useCallback(() => {
    const target = langMap[language] || "en-IN";
    const locale = target.split("-")[0] || "en";
    const exact = voices.filter((v) => v.lang.toLowerCase() === target.toLowerCase());
    const base = voices.filter((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase()));
    const ranked = [...exact, ...base, ...voices];
    return ranked.find((v) => VOICE_QUALITY_REGEX.test(v.name)) || ranked[0] || null;
  }, [language, voices]);

  // ── TTS ──
  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_~`>[\]()!]/g, "").replace(/\n+/g, ". ").slice(0, VOICE_MAX_SPOKEN_CHARS);
    const utterance = new SpeechSynthesisUtterance(clean);
    const voice = getBestVoice();
    utterance.lang = voice?.lang || langMap[language] || "en-IN";
    if (voice) utterance.voice = voice;
    utterance.rate = VOICE_SPEECH_RATE;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [getBestVoice, language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const handleNavigationIntent = useCallback((text: string) => {
    const matched = NAV_TARGETS.find((target) => target.patterns.some((pattern) => pattern.test(text)));
    if (!matched) return false;

    navigate(matched.path);
    toast({
      title: t("ai.voice_navigate"),
      description: `${t("common.loading")} ${matched.path}`,
    });
    return true;
  }, [navigate, t]);

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

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setLastTranscript(transcript);
        
        // Check if it's a command first
        const { isCommand, result } = await executeVoiceCommand(transcript);
        
        if (isCommand && result) {
          // It's a command - show command feedback
          setMessages(prev => [...prev, {
            role: "user",
            content: transcript,
            type: "command",
            commandType: result.command,
          }]);
          
          if (result.feedback) {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: `✨ ${result.feedback}`,
              type: "command",
            }]);
            speakText(result.feedback);
          }
        } else {
          // Not a command - process as question
          setTimeout(() => handleSendMessage(transcript), 250);
        }
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
  }, [handleNavigationIntent, isListening, language, executeVoiceCommand]);

  // ── Send message with real AI streaming ──
  const handleSendMessage = useCallback(async (messageText: string) => {
    const text = messageText.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
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
        if (assistantContent) {
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
  }, [isStreaming, messages, language, speakText]);

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
                <img src={krishiAvatar} alt="Farm Intellect" className="h-full w-full object-cover rounded-full scale-125" />
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
                <img src={krishiAvatar} alt="Farm Intellect" className="h-full w-full object-cover scale-110" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm font-heading">{t("ai.voice_agent_title")}</h3>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {t("ai.voice_agent_subtitle")}
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
                        onClick={() => { handleSendMessage(q); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-primary/20">
                    <p className="text-xs text-muted-foreground mb-2">Try voice commands:</p>
                    <div className="flex flex-wrap gap-1">
                      {getSuggestedCommands().map((cmd) => (
                        <span key={cmd} className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                          {cmd}
                        </span>
                      ))}
                    </div>
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

            {/* Voice actions */}
            <div className="p-3 border-t border-border">
              <div className="space-y-3"
              >
                <Button
                  type="button"
                  onClick={toggleListening}
                  disabled={isStreaming}
                  className={`w-full h-11 rounded-xl ${isListening ? "animate-pulse bg-destructive hover:bg-destructive/90" : "bg-accent text-accent-foreground hover:bg-accent/90"}`}
                  title={isListening ? t("ai.voice_stop_listening") : t("ai.voice_listen")}
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t("common.loading")}
                    </>
                  ) : isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      {t("ai.voice_stop_listening")}
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      {t("ai.voice_listen")}
                    </>
                  )}
                </Button>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <Navigation className="h-3.5 w-3.5" />
                  {t("ai.voice_nav_hint")}
                </div>
                <div className="text-[11px] text-accent flex items-center gap-2 mt-2">
                  <Command className="h-3.5 w-3.5" />
                  Commands: "go to crops", "show weather", "add crop"
                </div>
              </div>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 flex items-center justify-center gap-2 text-xs text-destructive"
                >
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Listening in {langMap[language]?.split("-")[0] || "English"}...
                </motion.div>
              )}
              {lastTranscript && !isListening && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("ai.voice_heard_label")} <span className="text-foreground">{lastTranscript}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
