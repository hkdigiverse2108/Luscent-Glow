import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, RotateCcw, Bot, ChevronDown } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "model",
  content: "Welcome to Luscent Glow ✨ I'm Lumina, your personal Beauty Concierge. I'm here to help you discover the perfect skincare ritual, find your ideal products, and illuminate your radiance journey. How may I assist you today?",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  "What's good for dry skin?",
  "Build my morning routine",
  "Best vitamin C serum?",
  "Track my order",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-amber-500/20 border border-gold/20 flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-gold" />
      </div>
      <div className="bg-white/80 backdrop-blur border border-gold/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-amber-500/20 border border-gold/20 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles size={14} className="text-gold" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4a] text-white rounded-br-sm"
            : "bg-white/90 backdrop-blur border border-gold/10 text-charcoal rounded-bl-sm"
        }`}
      >
        <p className="font-body whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[10px] mt-1.5 font-body ${isUser ? "text-white/40 text-right" : "text-charcoal/40"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

const LuminaChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isLoading && !isMinimized) {
      // Small delay to ensure the textarea is no longer disabled in the DOM
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, isMinimized]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build history for API (exclude welcome message)
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(getApiUrl("/api/chat/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Lumina is unavailable");

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch (err: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: "I apologize, I'm momentarily indisposed. Please ensure the GEMINI_API_KEY is configured in your backend .env file, then try again. 🙏",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  return (
    <>
      {/* Floating Buttons Stack - bottom-right */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col-reverse items-end gap-3">

        {/* Lumina AI Button */}
        <div className="flex items-center gap-3">
          {/* Tooltip - shows to the left */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: 1.5 }}
                className="bg-white border border-gold/20 rounded-xl px-3 py-1.5 shadow-lg whitespace-nowrap"
              >
                <span className="text-xs font-body text-charcoal/70">✨ Ask Lumina, your Beauty AI</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #c9a84c 100%)",
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={!isOpen ? { boxShadow: ["0 0 0 0 rgba(201,168,76,0.4)", "0 0 0 14px rgba(201,168,76,0)", "0 0 0 0 rgba(201,168,76,0)"] } : {}}
            transition={!isOpen ? { duration: 2.5, repeat: Infinity } : {}}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} className="text-white" />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sparkles size={22} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>

            {unreadCount > 0 && !isOpen && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[199] w-[370px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            style={{ maxHeight: isMinimized ? "64px" : "580px", transition: "max-height 0.3s ease" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 50%, #1a1a2e 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/40 to-amber-400/20 border border-gold/30 flex items-center justify-center">
                    <Sparkles size={18} className="text-gold" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1a1a2e]" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">Lumina</h3>
                  <p className="text-[10px] font-body text-gold/70 uppercase tracking-widest">Beauty AI Concierge</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="New conversation"
                  className="w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  <ChevronDown size={16} className={`transition-transform ${isMinimized ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div
                  className="flex-1 overflow-y-auto p-4 custom-scrollbar"
                  style={{
                    background: "linear-gradient(180deg, #f9f7f4 0%, #fdfbf8 100%)",
                    minHeight: "320px",
                    maxHeight: "420px",
                  }}
                >
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}

                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length === 1 && (
                  <div className="px-4 py-2 bg-[#fdfbf8] border-t border-gold/5 flex gap-2 overflow-x-auto no-scrollbar">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="flex-shrink-0 px-3 py-1.5 bg-white border border-gold/20 rounded-full text-[11px] font-body font-medium text-charcoal/70 hover:bg-gold/5 hover:border-gold/40 hover:text-charcoal transition-all whitespace-nowrap"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div
                  className="px-4 py-3 flex-shrink-0 border-t border-gold/10"
                  style={{ background: "#ffffff" }}
                >
                  <div className="flex items-end gap-2 bg-[#f9f7f4] rounded-2xl border border-gold/15 px-4 py-3 focus-within:border-gold/40 focus-within:ring-2 focus-within:ring-gold/10 transition-all">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about skincare, products..."
                      className="flex-1 bg-transparent text-sm font-body text-charcoal placeholder:text-charcoal/30 resize-none focus:outline-none leading-relaxed"
                      style={{ maxHeight: "80px" }}
                      disabled={isLoading}
                    />
                    <motion.button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                      style={{
                        background: input.trim() && !isLoading
                          ? "linear-gradient(135deg, #1a1a2e, #c9a84c)"
                          : "transparent",
                        border: input.trim() && !isLoading ? "none" : "1px solid #e0d5c0",
                      }}
                    >
                      <Send size={16} className={input.trim() && !isLoading ? "text-white" : "text-charcoal/30"} />
                    </motion.button>
                  </div>
                  <p className="text-center text-[9px] font-body text-charcoal/25 mt-2 tracking-widest uppercase">
                    Powered by Gemini AI · Luscent Glow
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LuminaChatBot;
