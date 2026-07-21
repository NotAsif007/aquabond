import React from "react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { Droplet, Flame, LogOut } from "lucide-react";
import { playPlop } from "../lib/audio";

export const Header: React.FC = () => {
  const { supabaseMode, profile, couple, logs, signOut } = useApp();

  if (!profile) return null;

  const streakDays = couple ? couple.couple_streak : profile.current_streak;
  const initial = (profile.display_name || profile.email || "A")
    .charAt(0)
    .toUpperCase();

  const baseGoal = profile.daily_goal_ml;
  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);

  const handleSignOut = async () => {
    playPlop();
    if (window.confirm("Are you sure you want to sign out of AquaBond?")) {
      await signOut();
    }
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
      className="relative w-full glass-card-elevated rounded-[28px] py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between gap-3 overflow-hidden"
    >
      {/* ── Left: Avatar + Branding ────────────────────── */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Profile avatar */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md border border-white/40 text-white font-extrabold text-sm select-none">
            {initial}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulseDot" />
        </div>

        {/* Brand text — compact on mobile */}
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-[#2D283E] flex items-center gap-1.5 leading-none">
            AquaBond
            <span className="hidden sm:inline text-[9px] tracking-wider px-2.5 py-0.5 bg-[#FFF0F2] text-[#FF92A9] font-mono font-bold rounded-full uppercase border border-[#FFF0F2]/50">
              {supabaseMode ? "Live" : "Demo"}
            </span>
          </h1>
          {/* Hydration summary — visible on desktop */}
          <p className="hidden sm:block text-[10px] text-[#8E8A9A] font-semibold mt-0.5">
            <span className="font-black text-[#4DA8CF]">{userTodayMl}ml</span> / {baseGoal}ml today
          </p>
        </div>
      </div>

      {/* ── Right: Intake pill (mobile) + Streak + Sign-out ────── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile-only compact intake pill */}
        <div className="sm:hidden flex items-center gap-1 bg-sky-50 border border-sky-100 text-[#4DA8CF] px-2 py-1 rounded-lg text-[10px] font-black">
          <Droplet className="w-3 h-3 fill-current" />
          {userTodayMl}ml
        </div>

        {/* Streak pill */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black shadow-xs border border-white/20 select-none cursor-default"
        >
          <Flame className="w-3 sm:w-4 h-3 sm:h-4 text-white animate-pulse" />
          <span className="font-mono">{streakDays}</span>
          <span className="hidden sm:inline font-mono">Day Streak</span>
        </motion.div>

        {/* Sign-out */}
        {supabaseMode && (
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-xl text-[#8E8A9A] hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};
