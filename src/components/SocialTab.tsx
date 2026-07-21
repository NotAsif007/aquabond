import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Send, Users, Smile, Wifi } from "lucide-react";
import { useApp } from "../context/AppContext";
import { playPlop } from "../lib/audio";

export const SocialTab: React.FC = () => {
  const { profile, partnerProfile, messages, sendPoke, sendMessage } = useApp();
  const [text, setText] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyboardOffset, setKeyboardOffset] = useState<number>(0);

  const STICKERS = ["💧", "🐰", "🐧", "🐱", "✨", "💖", "🌊", "🎉"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track virtual keyboard height on mobile like Instagram DM
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height;
        setKeyboardOffset(Math.max(0, offset));
      }
    };

    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);
    handleViewportChange();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  // Auto-focus chat input on tab mount so soft keyboard opens by default
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    playPlop();
    await sendMessage(text.trim());
    setText("");
    setShowStickers(false);
  };

  const handleSendSticker = async (sticker: string) => {
    playPlop();
    await sendMessage(sticker);
    setShowStickers(false);
  };

  const handlePoke = async () => {
    playPlop();
    await sendPoke("heart");
  };

  const groupedMessages = useMemo(() => {
    const sorted = [...(messages || [])].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const groups: Record<string, typeof messages> = {};
    sorted.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  const isEmpty = !messages || messages.length === 0;

  if (!profile) return null;

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-2xl mx-auto relative justify-between">
      {/* Partner Header */}
      <div className="glass-card rounded-[20px] p-3.5 mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl theme-bg-gradient flex items-center justify-center text-white font-extrabold text-sm shadow-xs border border-white/40">
            {(partnerProfile?.display_name || "P").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#2D283E]">
              {partnerProfile?.display_name || "Partner"}
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Connected</span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePoke}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-bg-accent theme-text-primary border theme-border-accent text-xs font-black shadow-3xs"
        >
          <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
          Send Love
        </motion.button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 scrollbar-thin">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-16 h-16 rounded-3xl bg-[#FFF0F2] text-[#FF92A9] flex items-center justify-center border border-[#FFF0F2]"
            >
              <MessageCircle className="w-8 h-8" />
            </motion.div>
            <div>
              <h4 className="text-base font-extrabold text-[#2D283E]">No messages yet</h4>
              <p className="text-xs text-[#8E8A9A] font-medium max-w-xs mt-1">
                Send a cozy message or sticker to your hydration partner!
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center justify-center gap-3 my-2">
                <div className="h-px bg-slate-200/60 flex-1" />
                <span className="text-[10px] font-bold text-[#8E8A9A] font-mono uppercase px-2 py-0.5 bg-white/50 rounded-full border border-white/60">
                  {date}
                </span>
                <div className="h-px bg-slate-200/60 flex-1" />
              </div>

              {(msgs as Array<{ id: string; sender_id: string; content: string; timestamp: string }>).map((msg) => {
                const isMine = msg.sender_id === profile.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: isMine ? 16 : -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] p-3 rounded-2xl shadow-3xs ${
                        isMine
                          ? "theme-bg-gradient text-white rounded-br-xs animate-slide-in-right"
                          : "bg-white/90 text-[#2D283E] border border-white/80 rounded-bl-xs animate-slide-in-left"
                      }`}
                    >
                      <p className="text-xs font-semibold leading-relaxed break-words">
                        {msg.content || ((msg as any).type === 'heart' ? '❤️ Sent a love nudge!' : '❤️ Sent a love nudge!')}
                      </p>
                      <span className={`text-[8px] font-mono font-bold block mt-1 ${isMine ? "text-white/75 text-right" : "text-[#8E8A9A]"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — moves dynamically with soft keyboard like Instagram DM */}
      <div 
        style={{ transform: keyboardOffset > 0 ? `translateY(-${keyboardOffset}px)` : 'none' }}
        className="mt-2 pb-3 sm:pb-1 shrink-0 relative transition-transform duration-100 ease-out"
      >
        {/* Sticker picker popover */}
        <AnimatePresence>
          {showStickers && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute bottom-14 left-0 right-0 glass-card-elevated rounded-2xl p-3 shadow-lg border border-white z-30"
            >
              <div className="grid grid-cols-4 gap-2">
                {STICKERS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendSticker(emoji)}
                    className="text-2xl p-2 rounded-xl hover:bg-white/60 transition-colors btn-press text-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStickers(!showStickers)}
            className="p-2.5 rounded-xl bg-white/80 text-[#8E8A9A] hover:text-[#FF92A9] border border-white/70 shadow-3xs transition-colors"
          >
            <Smile className="w-4.5 h-4.5" />
          </button>

          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a cozy message..."
            className="flex-1 bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-xl px-3.5 py-2.5 text-base sm:text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner"
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className={`p-2.5 rounded-xl text-white shadow-xs transition-all ${
              text.trim()
                ? "theme-bg-gradient active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
