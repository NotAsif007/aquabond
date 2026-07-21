import React from "react";
import { useApp } from "../context/AppContext";
import { HydrationWidget } from "./HydrationWidget";
import { 
  Flame, 
  Award, 
  Droplet, 
  CloudSun, 
  LayoutDashboard 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const DashboardAnalyticsTab: React.FC = () => {
  const {
    profile,
    couple,
    logs,
    weatherEnabled,
    temperature,
    humidity,
    weatherReason
  } = useApp();

  if (!profile) return null;

  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const streakDays = couple ? couple.couple_streak : profile.current_streak;

  const getXpProgress = () => {
    const xp = profile.xp;
    if (xp < 150) return Math.min(100, Math.round((xp / 150) * 100));
    if (xp < 500) return Math.min(100, Math.round(((xp - 150) / 350) * 100));
    if (xp < 1200) return Math.min(100, Math.round(((xp - 500) / 700) * 100));
    if (xp < 2500) return Math.min(100, Math.round(((xp - 1200) / 1300) * 100));
    return 100;
  };

  const getNextLevelXp = () => {
    if (profile.level === 1) return 150;
    if (profile.level === 2) return 500;
    if (profile.level === 3) return 1200;
    if (profile.level === 4) return 2500;
    return 2500;
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h3 className="text-xl font-extrabold text-[#2D283E] mb-1 flex items-center gap-2">
          <LayoutDashboard className="w-5.5 h-5.5 text-[#FF92A9]" />
          Dashboard Overview
        </h3>
        <p className="text-sm text-[#8E8A9A] font-medium">Hydration pace, level progression, and live weather conditions.</p>
      </div>

      {/* Hydration Widget */}
      <HydrationWidget />

      {/* STATS OVERVIEW CARDS */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card rounded-[24px] p-5 grid grid-cols-3 gap-4 text-center items-center"
      >
        {/* Streak card */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center mb-1">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <span className="text-[10px] text-[#8E8A9A] font-bold uppercase tracking-wider leading-none">Streak</span>
          <span className="text-xs font-black text-[#2D283E] mt-1">{streakDays} Days</span>
        </div>

        {/* Level Up progress card */}
        <div className="flex flex-col items-center px-1">
          <div className="w-9 h-9 rounded-xl bg-[#FFF0F2] text-[#FF92A9] border border-[#FFF0F2] flex items-center justify-center mb-1">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-[#8E8A9A] font-bold uppercase tracking-wider leading-none">Level {profile.level}</span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 border border-slate-200 overflow-hidden relative">
            <motion.div 
              className="bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getXpProgress()}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="text-[8px] text-[#8E8A9A] font-mono mt-1 font-bold">{profile.xp} / {getNextLevelXp()} XP</span>
        </div>

        {/* Drank Today */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#4DA8CF] border border-sky-100 flex items-center justify-center mb-1">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] text-[#8E8A9A] font-bold uppercase tracking-wider leading-none">Today</span>
          <span className="text-xs font-black text-[#2D283E] mt-1">{userTodayMl} ml</span>
        </div>
      </motion.div>

      {/* ADAPTIVE WEATHER ADVICE BOX */}
      <AnimatePresence>
        {weatherEnabled && (
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-[24px] p-5 space-y-1.5"
          >
            <div className="flex items-center gap-1.5 border-b border-[#FFF0F2]/50 pb-1.5">
              <CloudSun className="w-4.5 h-4.5 text-[#FF92A9]" />
              <h4 className="text-[10px] font-black text-[#2D283E] uppercase tracking-wider block font-mono">Weather Goal Adjustment</h4>
            </div>
            <div className="text-xs leading-relaxed font-semibold">
              <p className="text-[#8E8A9A]">
                Current GPS conditions: <strong className="text-[#2D283E]">{temperature}°C</strong>, <strong className="text-[#2D283E]">{humidity}% humidity</strong>.
              </p>
              <p className="text-[#4A4458] mt-1 bg-[#FFF0F2]/30 border border-[#FFF0F2] p-2.5 rounded-xl italic">
                "{weatherReason}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
