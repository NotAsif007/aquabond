import React from "react";
import { useApp } from "../context/AppContext";
import { TrendingUp, Award, AwardIcon, Calendar, CheckCircle2 } from "lucide-react";

export const StatsTab: React.FC = () => {
  const { profile, partnerProfile, logs, partnerLogs, allLogsLast7Days } = useApp();

  if (!profile) return null;

  // Today Math
  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const partnerTodayMl = partnerLogs.reduce((sum, l) => sum + l.amount_ml, 0);

  // Group last 7 days
  const getDaysArray = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push({
        dateStr: d.toDateString(),
        label: d.toLocaleDateString([], { weekday: 'short' }),
        user: 0,
        partner: 0
      });
    }
    return list;
  };

  const last7DaysData = getDaysArray();

  // Populate data
  allLogsLast7Days.forEach(log => {
    const logDateStr = new Date(log.timestamp).toDateString();
    const dayObj = last7DaysData.find(d => d.dateStr === logDateStr);
    if (dayObj) {
      if (log.user_id === profile.id) {
        dayObj.user += log.amount_ml;
      } else if (partnerProfile && log.user_id === partnerProfile.id) {
        dayObj.partner += log.amount_ml;
      }
    }
  });

  // Calculate averages
  const totalUserMl = last7DaysData.reduce((sum, d) => sum + d.user, 0);
  const avgUserMl = Math.round(totalUserMl / 7);

  let avgPartnerMl = 0;
  if (partnerProfile) {
    const totalPartnerMl = last7DaysData.reduce((sum, d) => sum + d.partner, 0);
    avgPartnerMl = Math.round(totalPartnerMl / 7);
  }

  // Find max value for chart scaling (min 2000 to keep it looking good)
  const maxVal = Math.max(
    2000,
    ...last7DaysData.map(d => Math.max(d.user, d.partner))
  );

  // Chart configuration
  const chartHeight = 150;
  const chartWidth = 320;
  const paddingX = 40;
  const paddingY = 20;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;
  const barSpacing = plotWidth / 7;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-extrabold text-[#2D283E] mb-1 flex items-center gap-2">
          <TrendingUp className="w-5.5 h-5.5 text-[#4DA8CF]" />
          Hydration Analytics
        </h3>
        <p className="text-sm text-[#8E8A9A] font-medium">Track your personal and couple goals over time.</p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1: Today's Intake */}
        <div className="bg-white/50 border border-white p-5 rounded-[24px] shadow-[0_8px_16px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#8E8A9A] font-mono tracking-wider uppercase">Today's Intake</span>
          <div className="mt-2">
            <strong className="text-2xl font-black text-[#2D283E]">{userTodayMl} ml</strong>
            <p className="text-[10px] text-[#8E8A9A] font-semibold mt-1">Goal: {profile.daily_goal_ml}ml</p>
          </div>
        </div>

        {/* Card 2: 7-Day Average */}
        <div className="bg-white/50 border border-white p-5 rounded-[24px] shadow-[0_8px_16px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#8E8A9A] font-mono tracking-wider uppercase">7-Day Average</span>
          <div className="mt-2">
            <strong className="text-2xl font-black text-[#4DA8CF]">{avgUserMl} ml / day</strong>
            {partnerProfile && (
              <p className="text-[10px] text-[#8E8A9A] font-semibold mt-1">Partner Average: {avgPartnerMl}ml/day</p>
            )}
          </div>
        </div>

        {/* Card 3: Streaks */}
        <div className="bg-white/50 border border-white p-5 rounded-[24px] shadow-[0_8px_16px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#8E8A9A] font-mono tracking-wider uppercase">Milestone Streaks</span>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4] flex items-center justify-center text-white font-extrabold text-sm shadow-xs border border-white/20">
              🔥
            </div>
            <div>
              <strong className="text-sm font-black text-[#2D283E]">
                {profile.current_streak} Day Streak
              </strong>
              <p className="text-[9px] text-[#8E8A9A] font-semibold">Longest Streak: {profile.longest_streak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* SVG CHART CONTAINER */}
      <div className="bg-white/50 border border-white p-5 rounded-[28px] shadow-[0_8px_16px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#FFF0F2] pb-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4.5 h-4.5 text-[#8E8A9A]" />
            <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider">Weekly Hydration Chart</h4>
          </div>
          {partnerProfile && (
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-400"></span> You</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-pink-400"></span> {partnerProfile.display_name}</span>
            </div>
          )}
        </div>

        {/* Responsive SVG Chart */}
        <div className="w-full overflow-x-auto py-2 flex justify-center">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-[480px]">
            {/* Chart grids */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#F5F3FF" strokeWidth="1" />
            <line x1={paddingX} y1={paddingY + plotHeight / 2} x2={chartWidth - paddingX} y2={paddingY + plotHeight / 2} stroke="#F5F3FF" strokeWidth="1" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#E6E4EC" strokeWidth="1.5" />

            {/* Y-Axis labels */}
            <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" fill="#8E8A9A" className="text-[8px] font-mono font-bold">{Math.round(maxVal)}ml</text>
            <text x={paddingX - 8} y={paddingY + plotHeight / 2 + 4} textAnchor="end" fill="#8E8A9A" className="text-[8px] font-mono font-bold">{Math.round(maxVal / 2)}ml</text>
            <text x={paddingX - 8} y={chartHeight - paddingY + 4} textAnchor="end" fill="#8E8A9A" className="text-[8px] font-mono font-bold">0ml</text>

            {/* Draw Bars */}
            {last7DaysData.map((day, idx) => {
              const xCenter = paddingX + idx * barSpacing + barSpacing / 2;
              
              // Heights
              const userBarHeight = (day.user / maxVal) * plotHeight;
              const partnerBarHeight = (day.partner / maxVal) * plotHeight;
              const yBase = chartHeight - paddingY;

              const isPartner = !!partnerProfile;
              const barWidth = isPartner ? 7 : 12;

              return (
                <g key={day.dateStr}>
                  {/* User Bar (Blue/Sky) */}
                  <rect 
                    x={isPartner ? xCenter - barWidth - 1.5 : xCenter - barWidth / 2} 
                    y={yBase - userBarHeight} 
                    width={barWidth} 
                    height={userBarHeight} 
                    rx={3}
                    className="fill-sky-400 stroke-sky-500 stroke-0.5"
                  />

                  {/* Partner Bar (Pink/Sakura) */}
                  {isPartner && (
                    <rect 
                      x={xCenter + 1.5} 
                      y={yBase - partnerBarHeight} 
                      width={barWidth} 
                      height={partnerBarHeight} 
                      rx={3}
                      className="fill-pink-400 stroke-pink-500 stroke-0.5"
                    />
                  )}

                  {/* X-Axis labels */}
                  <text 
                    x={xCenter} 
                    y={chartHeight - paddingY + 12} 
                    textAnchor="middle" 
                    fill="#4A4458" 
                    className="text-[8px] font-bold"
                  >
                    {day.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* COMPANION PROGRESS MILESTONES */}
      <div className="bg-white/50 border border-white p-5 rounded-[28px] shadow-[0_8px_16px_rgba(0,0,0,0.01)] space-y-3">
        <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4.5 h-4.5 text-[#FF92A9]" />
          Progression Milestones
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="p-3 bg-[#FFF0F2]/40 rounded-2xl border border-[#FFF0F2] flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[#2D283E] font-extrabold block">Cozy Hydration Goals</span>
              <span className="text-[#8E8A9A] font-semibold text-[10px]">Log water regularly to unlock companion accessories like Sunglasses and Scarfs.</span>
            </div>
          </div>

          <div className="p-3 bg-[#FFF0F2]/40 rounded-2xl border border-[#FFF0F2] flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[#2D283E] font-extrabold block">Combined Streak Reward</span>
              <span className="text-[#8E8A9A] font-semibold text-[10px]">Reach a 7-day joint couple streak to unlock the legendary Boba's Golden Crown.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
