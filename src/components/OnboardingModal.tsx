import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, User, Heart, Target, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

const COMPANIONS = [
  { id: "drop", name: "Boba", type: "Water Droplet", emoji: "💧", desc: "A cozy droplet that loves backflips" },
  { id: "bunny", name: "Mocha", type: "Cozy Bunny", emoji: "🐰", desc: "Super soft ears, loves fresh sips" },
  { id: "penguin", name: "Pippin", type: "Penguin", emoji: "🐧", desc: "Cozy waddles, prefers cold ice water" },
  { id: "cat", name: "Mochi", type: "Sleepy Cat", emoji: "🐱", desc: "Purrs when you meet your daily goal" },
  { id: "blob", name: "Gloop", type: "Cute Blob", emoji: "🔮", desc: "Jiggles with excitement with every sip" },
  { id: "axolotl", name: "Bloop", type: "Pink Axolotl", emoji: "🦎", desc: "Waves its tiny pink gills cheerfully" }
];

export const OnboardingModal: React.FC = () => {
  const { profile, updateProfileSettings } = useApp();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [companionType, setCompanionType] = useState(profile?.companion_type || "drop");
  const [companionName, setCompanionName] = useState(profile?.companion_name || "Boba");
  const [dailyGoal, setDailyGoal] = useState(profile?.base_daily_goal_ml || 2000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !companionName.trim()) return;

    setIsSubmitting(true);
    await updateProfileSettings({
      display_name: displayName.trim(),
      companion_type: companionType,
      companion_name: companionName.trim(),
      base_daily_goal_ml: dailyGoal,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-card-elevated rounded-[36px] p-6.5 shadow-2xl relative overflow-hidden space-y-5"
      >
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 theme-bg-gradient rounded-2xl flex items-center justify-center shadow-md border border-white/50 mx-auto mb-2 text-2xl">
            ✨
          </div>
          <h2 className="text-2xl font-black text-[#2D283E]">Welcome to AquaBond!</h2>
          <p className="text-xs font-semibold text-[#8E8A9A]">Let's personalize your cozy hydration journey</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Step 1: Nickname */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Your Nickname</label>
            <div className="relative">
              <User className="w-4 h-4 theme-text-primary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Ryu"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner"
                required
              />
            </div>
          </div>

          {/* Step 2: Companion Choice Grid */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Choose Your Cozy Pet</label>
            <div className="grid grid-cols-3 gap-2">
              {COMPANIONS.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => {
                    setCompanionType(comp.id);
                    setCompanionName(comp.name);
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    companionType === comp.id
                      ? "theme-bg-accent theme-border-primary border-2 scale-102 shadow-xs"
                      : "bg-white/80 border-slate-100 opacity-75 hover:opacity-100"
                  }`}
                >
                  <span className="text-2xl block mb-1">{comp.emoji}</span>
                  <span className="text-[10px] font-black text-[#2D283E] block truncate">{comp.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Companion Pet Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Name Your Companion</label>
            <div className="relative">
              <Sparkles className="w-4 h-4 theme-text-primary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Boba"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner"
                required
              />
            </div>
          </div>

          {/* Step 4: Daily Target Goal */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Daily Goal (ml)</label>
              <span className="text-xs font-black theme-text-primary">{dailyGoal} ml</span>
            </div>
            <input
              type="range"
              min="1000"
              max="4000"
              step="100"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full accent-[#FF92A9] cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !displayName.trim()}
            className="w-full py-3.5 rounded-2xl theme-bg-gradient text-white text-xs font-black shadow-lg hover:opacity-95 transition-all duration-150 active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? "Saving..." : "Start Cozy Hydration ✨"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
