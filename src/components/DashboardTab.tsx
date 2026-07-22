import React, { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CompanionAvatar } from "./CompanionAvatar";
import { 
  Droplet, 
  RefreshCw, 
  User,
  Zap,
  Sun,
  Moon,
  Sunrise
} from "lucide-react";
import { motion } from "motion/react";
import { playPlop } from "../lib/audio";

// Floating bubble component for inside the water
const WaterBubble: React.FC<{ delay: number; left: number; size: number }> = ({ delay, left, size }) => (
  <div
    className="absolute rounded-full bg-white/30 animate-bubble pointer-events-none"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      bottom: '10%',
      animationDelay: `${delay}s`,
      animationDuration: `${2.5 + Math.random() * 2}s`
    }}
  />
);

export const DashboardTab: React.FC = () => {
  const {
    profile,
    couple,
    logs,
    logDrink,
    resetIntake,
    weatherEnabled,
    weatherAdjust
  } = useApp();

  const [customWaterAmount, setCustomWaterAmount] = useState<string>("");
  const [displayPercent, setDisplayPercent] = useState<number>(0);
  const prevPercentRef = useRef<number>(0);

  if (!profile) return null;

  // Hydration math
  const baseGoal = profile.daily_goal_ml;
  const activeGoal = weatherEnabled ? baseGoal + weatherAdjust : baseGoal;
  
  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const userPercent = Math.min(100, Math.round((userTodayMl / activeGoal) * 100));
  const streakDays = couple ? couple.couple_streak : profile.current_streak;

  // Most recent log calculation
  const mostRecentLog = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [logs]);

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Animated counter effect
  useEffect(() => {
    const start = prevPercentRef.current;
    const end = userPercent;
    if (start === end) {
      setDisplayPercent(end);
      return;
    }
    
    const duration = 600;
    const startTime = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      setDisplayPercent(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    prevPercentRef.current = end;
  }, [userPercent]);

  const handleLogDrink = async (amount: number, type: 'cup' | 'glass' | 'bottle' | 'custom') => {
    if (amount <= 0) return;
    playPlop();
    await logDrink(amount, type);
  };

  const handleCustomLog = async () => {
    const parsed = parseInt(customWaterAmount);
    if (parsed && parsed > 0) {
      playPlop();
      await logDrink(parsed, 'custom');
      setCustomWaterAmount("");
    }
  };

  const getCompanionExpressionText = (name: string, pct: number) => {
    if (pct === 0) return `${name} is curled up asleep. Take a sip to wake them! 💤`;
    if (pct < 25) return `${name} is yawning... Needs more water. 🥱`;
    if (pct < 50) return `${name} is feeling happy and refreshed! 😊`;
    if (pct < 75) return `${name} is super excited! Halfway there! ✨`;
    if (pct < 100) return `${name} is doing happy little dances! 🥳`;
    return `Goal Met! ${name} is dancing under confetti! 👑💖`;
  };

  const bubbles = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({
    delay: i * 0.6,
    left: 15 + Math.random() * 70,
    size: 3 + Math.random() * 5
  })), []);

  // Daily greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: "Night owl! Don't forget water", emoji: "🌙" };
    if (hour < 12) return { text: "Good morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
    if (hour < 21) return { text: "Good evening", emoji: "🌅" };
    return { text: "Winding down", emoji: "🌙" };
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-xl mx-auto w-full space-y-4">
      
      {/* Compact Daily Greeting */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{greeting.emoji}</span>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2D283E] leading-tight">
              {greeting.text}, {profile.display_name?.split(' ')[0] || 'friend'}!
            </h2>
            <p className="text-[11px] text-[#8E8A9A] font-semibold">Let's stay hydrated together today.</p>
          </div>
        </div>

        {/* Streak pill indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 theme-bg-gradient text-white rounded-full text-xs font-black shadow-xs">
          🔥 <span className="font-mono">{streakDays}d</span>
        </div>
      </motion.div>

      {/* USER BOTTLE CARD — FOCUSED MAIN CONTENT */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card-elevated rounded-[32px] p-5 sm:p-6 flex flex-col justify-between items-center relative overflow-hidden"
      >
        <div className="w-full flex items-center justify-between border-b theme-border-accent pb-2.5 mb-3">
          <span className="text-xs font-black uppercase text-[#8E8A9A] tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 theme-text-primary" />
            Your Cozy Bottle
          </span>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 theme-bg-accent theme-text-primary rounded-lg border theme-border-accent flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {profile.companion_name}
          </span>
        </div>

        {/* Companion Bubble & Avatar */}
        <div className="flex flex-col items-center justify-center mb-3 min-h-[140px] w-full">
          <motion.div 
            key={userPercent}
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-2xl py-2 px-3.5 text-xs text-[#4A4458] leading-tight max-w-[88%] text-center mb-2 relative font-medium"
          >
            {getCompanionExpressionText(profile.companion_name, userPercent)}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/60 border-r border-b border-white/70 rotate-45"></div>
          </motion.div>

          <CompanionAvatar 
            type={profile.companion_type}
            name={profile.companion_name}
            percent={userPercent}
            skinId={profile.skin_id}
            outfitId={profile.outfit_id}
            level={profile.level}
            streakDays={streakDays}
          />
        </div>

        {/* User Glass Bottle with glow */}
        <div className={`relative w-full max-w-[170px] aspect-[5/8] glass-bottle rounded-[48px] overflow-hidden flex flex-col justify-end p-1.5 mb-5 ${userPercent >= 75 ? 'animate-glow' : ''}`}>
          {/* Glass highlight */}
          <div className="absolute top-5 left-3 w-1.5 h-14 bg-white/40 rounded-full blur-xs pointer-events-none"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer rounded-[48px] pointer-events-none z-20 opacity-40"></div>
          
          {/* Wave animation */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-[36px]"
            animate={{ height: `${userPercent}%` }}
            transition={{ type: "spring", stiffness: 65, damping: 11, mass: 0.9 }}
          >
            <div className="absolute inset-0 w-full h-full relative">
              <svg className="absolute -top-3 left-0 w-[200%] h-12 text-sky-300 opacity-60 animate-wave-slow" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M 0 10 Q 25 5, 50 10 T 100 10 T 150 10 T 200 10 L 200 20 L 0 20 Z" fill="currentColor" />
              </svg>
              <svg className="absolute -top-2 left-0 w-[200%] h-12 text-sky-400/90 animate-wave-fast" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M 0 10 Q 25 15, 50 10 T 100 10 T 150 10 T 200 10 L 200 20 L 0 20 Z" fill="currentColor" />
              </svg>
              <div className="absolute top-5 bottom-0 left-0 right-0 bg-gradient-to-b from-[#74C7E8] to-[#4DA8CF]"></div>
              
              {/* Floating bubbles inside water */}
              {bubbles.map((b, i) => (
                <WaterBubble key={i} delay={b.delay} left={b.left} size={b.size} />
              ))}
            </div>
          </motion.div>

          {/* Percentage Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none">
            <motion.span
              key={displayPercent}
              className="text-3xl font-black text-[#2D283E] drop-shadow-sm leading-none"
            >
              {displayPercent}%
            </motion.span>
            <span className="text-[10px] font-mono text-[#4A4458] font-bold bg-white/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full mt-1.5 border border-white/40 shadow-3xs">
              {userTodayMl} / {activeGoal} ml
            </span>
          </div>
        </div>

        {/* Quick Logs */}
        <div className="w-full space-y-2.5">
          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLogDrink(250, 'cup')}
              className="flex-1 py-2.5 rounded-2xl glass-card hover:border-[#FAD0C4] flex flex-col items-center btn-press"
            >
              <span className="text-sm font-extrabold text-[#4DA8CF]">+250ml</span>
              <span className="text-[9px] text-[#8E8A9A] font-bold uppercase">Cup 🥤</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLogDrink(500, 'bottle')}
              className="flex-1 py-2.5 rounded-2xl glass-card hover:border-[#FAD0C4] flex flex-col items-center btn-press"
            >
              <span className="text-sm font-extrabold text-[#4DA8CF]">+500ml</span>
              <span className="text-[9px] text-[#8E8A9A] font-bold uppercase">Bottle 🍶</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={async () => { playPlop(); await resetIntake(); }}
              className="p-3.5 rounded-2xl glass-card text-[#8E8A9A] hover:text-[#2D283E] hover:bg-[#FFF5F6] btn-press"
              title="Reset today's logs"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                placeholder="Custom ml..." 
                value={customWaterAmount} 
                onChange={(e) => setCustomWaterAmount(e.target.value)}
                className="w-full bg-white/70 border border-slate-200 focus:border-[#FF92A9] rounded-2xl pl-3.5 pr-8 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none font-semibold text-[#2D283E] backdrop-blur-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono font-black text-[#8E8A9A] uppercase">ml</span>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleCustomLog}
              className="px-4 py-2 text-xs rounded-2xl theme-bg-gradient text-white font-black shadow-xs hover:opacity-90 btn-press"
            >
              Log Drink
            </motion.button>
          </div>
        </div>

      </motion.div>

    </div>
  );
};
