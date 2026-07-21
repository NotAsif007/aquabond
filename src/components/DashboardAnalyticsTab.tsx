import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { HydrationWidget } from "./HydrationWidget";
import { StatsTab } from "./StatsTab";
import { 
  Flame, 
  Award, 
  Droplet, 
  CloudSun, 
  LayoutDashboard,
  Calendar,
  Trophy,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function useAnimatedCounter(end: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

export const DashboardAnalyticsTab: React.FC = () => {
  const {
    profile,
    couple,
    logs,
    partnerLogs,
    weatherEnabled,
    temperature,
    humidity,
    weatherReason
  } = useApp();

  if (!profile) return null;

  const baseGoal = profile.daily_goal_ml;
  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const streakDays = couple ? couple.couple_streak : profile.current_streak;
  const longestStreak = profile.longest_streak || streakDays;

  const animatedStreak = useAnimatedCounter(streakDays, 1200);
  const animatedUserMl = useAnimatedCounter(userTodayMl, 1500);

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

  // Generate 7-day heatmap data
  const generateHeatmap = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayLogs = logs.filter((l) => new Date(l.timestamp).toDateString() === dateStr);
      const dayTotal = dayLogs.reduce((sum, l) => sum + l.amount_ml, 0);
      const percent = Math.min(100, Math.round((dayTotal / Math.max(baseGoal, 1)) * 100));

      let heatmapClass = "heatmap-0";
      if (percent >= 100) heatmapClass = "heatmap-4";
      else if (percent >= 75) heatmapClass = "heatmap-3";
      else if (percent >= 50) heatmapClass = "heatmap-2";
      else if (percent >= 25) heatmapClass = "heatmap-1";

      days.push({ dayName, percent, dayTotal, heatmapClass, isToday: i === 0 });
    }
    return days;
  };

  const heatmapDays = generateHeatmap();

  // Badges list
  const badges = [
    {
      id: "first_sip",
      name: "First Sip 🥤",
      desc: "Logged your first sip",
      unlocked: profile.xp > 0 || logs.length > 0
    },
    {
      id: "streak_3",
      name: "3-Day Streak 🔥",
      desc: "Maintained a 3-day streak",
      unlocked: longestStreak >= 3
    },
    {
      id: "streak_7",
      name: "Week Warrior 🏆",
      desc: "Completed a 7-day streak",
      unlocked: longestStreak >= 7
    },
    {
      id: "streak_30",
      name: "Monthly Hero ⭐",
      desc: "30-day streak legend",
      unlocked: longestStreak >= 30
    },
    {
      id: "lvl_3",
      name: "Hydration Pro 💎",
      desc: "Reached Level 3",
      unlocked: profile.level >= 3
    },
    {
      id: "lvl_5",
      name: "Max Level 👑",
      desc: "Reached Level 5",
      unlocked: profile.level >= 5
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-extrabold text-[#2D283E] mb-1 flex items-center gap-2">
          <LayoutDashboard className="w-5.5 h-5.5 text-[#FF92A9]" />
          Dashboard & Weekly Progress
        </h3>
        <p className="text-sm text-[#8E8A9A] font-medium">Hydration pace, 7-day heatmap, achievements, and weekly charts.</p>
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
          <span className="text-xs font-black text-[#2D283E] mt-1">{animatedStreak} Days</span>
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
          <span className="text-xs font-black text-[#2D283E] mt-1">{animatedUserMl} ml</span>
        </div>
      </motion.div>

      {/* WEEKLY HEATMAP CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[#FFF0F2]/50 pb-2">
          <span className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#FF92A9]" />
            7-Day Hydration Heatmap
          </span>
          <span className="text-[10px] font-bold text-[#8E8A9A]">Goal: {baseGoal}ml</span>
        </div>

        <div className="flex items-center justify-between gap-1.5 pt-1">
          {heatmapDays.map((day, idx) => (
            <motion.div 
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 300 }}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${day.heatmapClass} ${
                  day.isToday ? "ring-2 ring-[#FF92A9] ring-offset-1" : ""
                }`}
                title={`${day.dayName}: ${day.dayTotal}ml (${day.percent}%)`}
              >
                {day.percent > 0 ? `${day.percent}%` : "0"}
              </div>
              <span className={`text-[9px] font-bold uppercase ${day.isToday ? "text-[#FF92A9]" : "text-[#8E8A9A]"}`}>
                {day.dayName}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ACHIEVEMENTS BADGES GRID */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[#FFF0F2]/50 pb-2">
          <span className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#FF92A9]" />
            Achievement Trophies
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {badges.map((b) => (
            <div 
              key={b.id} 
              className={`p-3 rounded-2xl border transition-all ${
                b.unlocked 
                  ? "bg-white/80 border-[#FF92A9]/40 shadow-xs" 
                  : "bg-slate-50/50 border-slate-200/60 opacity-50 grayscale"
              }`}
            >
              <div className="text-base font-bold mb-1">{b.name}</div>
              <div className="text-[10px] text-[#8E8A9A] font-semibold leading-snug">{b.desc}</div>
              <div className="mt-1.5 text-[9px] font-mono font-bold">
                {b.unlocked ? (
                  <span className="text-emerald-600">✓ Unlocked</span>
                ) : (
                  <span className="text-slate-400">🔒 Locked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* WEEKLY DUAL-CHARTS */}
      <StatsTab />

      {/* ADAPTIVE WEATHER ADVICE BOX */}
      <AnimatePresence>
        {weatherEnabled && (
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.25 }}
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
