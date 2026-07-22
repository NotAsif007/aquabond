import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Droplet, Clock, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

export const HydrationWidget: React.FC = () => {
  const { profile, logs } = useApp();
  const [now, setNow] = useState(Date.now());

  // Update "now" every 30 seconds for time display
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!profile) return null;

  const baseGoal = profile.daily_goal_ml;
  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const percent = Math.min(100, Math.round((userTodayMl / Math.max(baseGoal, 1)) * 100));

  // Time since last drink — sort logs descending to find most recent log
  const mostRecentLog = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [logs]);

  const lastDrinkTime = mostRecentLog ? new Date(mostRecentLog.timestamp).getTime() : null;
  const timeSinceLastDrink = lastDrinkTime ? now - lastDrinkTime : null;

  const getTimeSinceLabel = (ms: number | null) => {
    if (ms === null) return "No drinks yet";
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
    return "1d+ ago";
  };

  const getTimeSinceColor = (ms: number | null) => {
    if (ms === null) return "text-[#8E8A9A]";
    const minutes = Math.floor(ms / 60000);
    if (minutes < 30) return "text-emerald-500";
    if (minutes < 60) return "text-amber-500";
    if (minutes < 120) return "text-orange-500";
    return "text-red-500";
  };

  // Daily pace calculation
  const getPaceStatus = () => {
    const nowDate = new Date();
    const hoursElapsed = nowDate.getHours() + nowDate.getMinutes() / 60;
    // Assume 16 waking hours (6am to 10pm)
    const wakingHours = Math.max(0, Math.min(16, hoursElapsed - 6));
    const expectedPercent = Math.round((wakingHours / 16) * 100);
    const diff = percent - expectedPercent;

    if (diff >= 10) return { label: "Ahead", color: "text-emerald-500", bg: "bg-emerald-50", icon: "🚀" };
    if (diff >= -5) return { label: "On pace", color: "text-sky-500", bg: "bg-sky-50", icon: "✅" };
    if (diff >= -20) return { label: "Slightly behind", color: "text-amber-500", bg: "bg-amber-50", icon: "⏰" };
    return { label: "Behind schedule", color: "text-red-500", bg: "bg-red-50", icon: "💧" };
  };

  const pace = getPaceStatus();

  // SVG circular progress ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const ringColor = percent >= 100 ? "#34D399" : percent >= 50 ? "#4DA8CF" : "#FF92A9";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-[24px] p-4 sm:p-5"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Circular Progress Ring */}
        <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            {/* Background track */}
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              stroke="rgba(226,232,240,0.5)"
              strokeWidth="6"
            />
            {/* Progress arc */}
            <motion.circle
              cx="40" cy="40" r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ filter: `drop-shadow(0 0 4px ${ringColor}40)` }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg sm:text-xl font-black text-[#2D283E] leading-none">{percent}%</span>
            <span className="text-[8px] font-mono font-bold text-[#8E8A9A] mt-0.5">daily</span>
          </div>
        </div>

        {/* Info columns */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {/* Last drink */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/60 border border-white/70 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#8E8A9A]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-[#8E8A9A] uppercase tracking-wider block leading-none">Last drink</span>
              <span className={`text-xs font-black ${getTimeSinceColor(timeSinceLastDrink)} leading-none mt-0.5 block`}>
                {getTimeSinceLabel(timeSinceLastDrink)}
              </span>
            </div>
          </div>

          {/* Pace */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${pace.bg} border border-white/70 flex items-center justify-center shrink-0 text-xs`}>
              {pace.icon}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-[#8E8A9A] uppercase tracking-wider block leading-none">Pace</span>
              <span className={`text-xs font-black ${pace.color} leading-none mt-0.5 block`}>
                {pace.label}
              </span>
            </div>
          </div>

          {/* Intake compact */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-white/70 flex items-center justify-center shrink-0">
              <Droplet className="w-3.5 h-3.5 text-[#4DA8CF]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-[#8E8A9A] uppercase tracking-wider block leading-none">Intake</span>
              <span className="text-xs font-black text-[#2D283E] leading-none mt-0.5 block">
                {userTodayMl} / {baseGoal} ml
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
