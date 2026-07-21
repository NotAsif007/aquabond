import React, { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playPlop } from "../lib/audio";

interface QuickOption {
  label: string;
  amount: number;
  type: 'cup' | 'glass' | 'bottle' | 'custom';
  emoji: string;
  x: number;
  y: number;
}

// All coordinates have x <= 0 to expand UP and LEFT, never right!
const QUICK_OPTIONS: QuickOption[] = [
  { label: "150ml", amount: 150, type: "cup", emoji: "☕", x: -72, y: 0 },
  { label: "250ml", amount: 250, type: "cup", emoji: "🥤", x: -62, y: -58 },
  { label: "500ml", amount: 500, type: "bottle", emoji: "🍶", x: -28, y: -92 },
  { label: "750ml", amount: 750, type: "bottle", emoji: "💧", x: 18, y: -115 },
];

export const QuickAddFAB: React.FC = () => {
  const { profile, logDrink } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [lastLogged, setLastLogged] = useState<string | null>(null);

  const toggleMenu = useCallback(() => {
    playPlop();
    setIsOpen(prev => !prev);
    setLastLogged(null);
  }, []);

  const handleQuickLog = useCallback(async (option: QuickOption) => {
    playPlop();
    setLastLogged(`+${option.amount}ml`);
    setIsOpen(false);
    await logDrink(option.amount, option.type);
    
    setTimeout(() => setLastLogged(null), 2000);
  }, [logDrink]);

  if (!profile) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-5 sm:right-8 z-50">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-40"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Radial options expanding UP and LEFT */}
      <AnimatePresence>
        {isOpen && QUICK_OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.label}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{ scale: 1, x: opt.x, y: opt.y, opacity: 1 }}
            exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 24,
              delay: i * 0.04,
            }}
            onClick={() => handleQuickLog(opt)}
            className="absolute bottom-1 right-1 z-50 w-13 h-13 rounded-2xl bg-white/95 backdrop-blur-md border border-white shadow-xl flex flex-col items-center justify-center gap-0.5 btn-press hover:scale-110 transition-transform"
          >
            <span className="text-sm leading-none">{opt.emoji}</span>
            <span className="text-[9px] font-black text-[#2D283E] leading-none">{opt.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Last logged tooltip */}
      <AnimatePresence>
        {lastLogged && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.8 }}
            className="absolute -top-10 right-0 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap z-50"
          >
            {lastLogged} logged ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={toggleMenu}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className="relative z-50 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4] text-white shadow-xl flex items-center justify-center border-2 border-white/40"
        style={{
          boxShadow: "0 6px 24px rgba(255, 146, 169, 0.4), 0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
        
        {/* Pulsing ring behind FAB */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.45], opacity: [0.35, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl border-2 border-[#FF92A9]"
          />
        )}
      </motion.button>
    </div>
  );
};
