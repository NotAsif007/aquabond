import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Target, Flame, Droplet, Award, Trophy, Star, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import { StatsTab } from "./StatsTab";

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

export const ProgressTab: React.FC = () => {
  const { profile, couple, logs, partnerLogs } = useApp();

  if (!profile) return null;

  const baseGoal = profile.daily_goal_ml;
  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const partnerTodayMl = partnerLogs.reduce((sum, l) => sum + l.amount_ml, 0);
  const combinedTodayMl = userTodayMl + partnerTodayMl;

  const streakDays = couple ? couple.couple_streak : profile.current_streak;
  const longestStreak = profile.longest_streak || streakDays;

  const animatedStreak = useAnimatedCounter(streakDays, 1200);
  const animatedUserMl = useAnimatedCounter(userTodayMl, 1500);
  const animatedCombined = useAnimatedCounter(combinedTodayMl, 1500);

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
      desc: "Logged your first glass of water",
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
      desc: "Completed a full 7-day streak",
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
      desc: "Reached Companion Level 3",
      unlocked: profile.level >= 3
    },
    {
      id: "lvl_5",
      name: "Master Sipper 👑",
      desc: "Reached Companion Level 5",
      unlocked: profile.level >= 5
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-extrabold text-[#2D283E] mb-1 flex items-center gap-2">
          <TrendingUp className="w-5.5 h-5.5 text-[#FF92A9]" />
          Weekly Analytics & Progress
        </h3>
        <p className="text-sm text-[#8E8A9A] font-medium">Track your streak, combined hydration, weekly heatmap, and achievement badges.</p>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-[22px] p-3.5 flex flex-col justify-between space-y-2"
        >
          <div className="flex items-center justify-between text-[#FF92A9]">
            <Flame className="w-4 h-4 animate-pulse" />
            <span className="text-[9px] font-mono font-black uppercase text-[#8E8A9A]">Streak</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#2D283E] font-mono">{animatedStreak} d</div>
            <div className="text-[9px] text-[#8E8A9A] font-semibold">Best: {longestStreak} days</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="glass-card rounded-[22px] p-3.5 flex flex-col justify-between space-y-2"
        >
          <div className="flex items-center justify-between text-[#4DA8CF]">
            <Droplet className="w-4 h-4" />
            <span className="text-[9px] font-mono font-black uppercase text-[#8E8A9A]">Today</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#2D283E] font-mono">{animatedUserMl} ml</div>
            <div className="text-[9px] text-[#8E8A9A] font-semibold">Goal: {baseGoal} ml</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-[22px] p-3.5 flex flex-col justify-between space-y-2"
        >
          <div className="flex items-center justify-between text-purple-500">
            <Target className="w-4 h-4" />
            <span className="text-[9px] font-mono font-black uppercase text-[#8E8A9A]">Combined</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#2D283E] font-mono">{animatedCombined} ml</div>
            <div className="text-[9px] text-[#8E8A9A] font-semibold">Couple Total</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-card rounded-[22px] p-3.5 flex flex-col justify-between space-y-2"
        >
          <div className="flex items-center justify-between text-amber-500">
            <Trophy className="w-4 h-4" />
            <span className="text-[9px] font-mono font-black uppercase text-[#8E8A9A]">Level</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#2D283E] font-mono">Lvl {profile.level}</div>
            <div className="text-[9px] text-[#8E8A9A] font-semibold">{profile.xp} total XP</div>
          </div>
        </motion.div>
      </div>

      {/* 7-DAY HEATMAP CARD */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#FF92A9]" />
            7-Day Hydration Heatmap
          </h4>
          <span className="text-[10px] text-[#8E8A9A] font-semibold">Past week overview</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-1">
          {heatmapDays.map((day, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${day.heatmapClass} border ${
                  day.isToday ? "border-[#FF92A9] shadow-xs" : "border-white/40"
                }`}
                title={`${day.dayName}: ${day.dayTotal}ml (${day.percent}%)`}
              >
                <span className="text-[9px] font-black text-[#2D283E]">{day.percent}%</span>
              </div>
              <span className={`text-[9px] font-bold ${day.isToday ? "text-[#FF92A9]" : "text-[#8E8A9A]"}`}>
                {day.dayName}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ACHIEVEMENT BADGES GRID */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          Achievement Badges
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`p-3 rounded-2xl border transition-all ${
                b.unlocked
                  ? "bg-white/80 border-white shadow-xs"
                  : "bg-white/20 border-black/5 opacity-50 grayscale"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-[#2D283E]">{b.name}</span>
                {b.unlocked && <span className="text-[8px] font-extrabold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">Unlocked</span>}
              </div>
              <p className="text-[9px] text-[#8E8A9A] font-semibold leading-tight">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* COMPARATIVE DUAL-CHARTS */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card rounded-[28px] p-5 space-y-4"
      >
        <StatsTab />
      </motion.div>
    </div>
  );
};
