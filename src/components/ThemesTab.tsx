import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Check, Sparkles, Lock, ShoppingBag, Crown, Star, Palette } from "lucide-react";
import { useApp } from "../context/AppContext";
import { playPlop } from "../lib/audio";
import { CompanionAvatar } from "./CompanionAvatar";

interface ThemePreset {
  id: 'sakura' | 'mint' | 'blue' | 'lavender' | 'pink' | 'peach';
  name: string;
  colorsBg: string;
  colorName: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { id: 'sakura', name: "Cozy Sakura", colorsBg: "bg-[#FF92A9]", colorName: "Warm Pink" },
  { id: 'blue', name: "Ocean Bond", colorsBg: "bg-[#7CB9E8]", colorName: "Ocean Blue" },
  { id: 'lavender', name: "Lavender Dusk", colorsBg: "bg-[#A78BFA]", colorName: "Lavender Purple" },
  { id: 'mint', name: "Mint Dew", colorsBg: "bg-[#34D399]", colorName: "Mint Green" },
  { id: 'peach', name: "Cozy Peach", colorsBg: "bg-[#FDBA74]", colorName: "Soft Apricot" }
];

export const ThemesTab: React.FC = () => {
  const { 
    profile, 
    couple,
    updateProfileTheme, 
    equipCompanionItem, 
    buyCompanionItem 
  } = useApp();

  if (!profile) return null;

  const currentXp = profile.xp;
  const currentLevel = profile.level;
  const streakDays = couple ? couple.couple_streak : profile.current_streak;

  const getLevelConfig = (lvl: number) => {
    switch (lvl) {
      case 5: return { name: "Oceanic Bond Master", nextXp: 2500, prevXp: 1200 };
      case 4: return { name: "Aquatic Overlord", nextXp: 2500, prevXp: 1200 };
      case 3: return { name: "Dew Drop Duo", nextXp: 1200, prevXp: 500 };
      case 2: return { name: "Cozy Sipper", nextXp: 500, prevXp: 150 };
      case 1:
      default:
        return { name: "Novice Hydrator", nextXp: 150, prevXp: 0 };
    }
  };

  const levelCfg = getLevelConfig(currentLevel);
  const xpRange = levelCfg.nextXp - levelCfg.prevXp;
  const xpEarned = currentXp - levelCfg.prevXp;
  const levelPercent = currentLevel === 5 ? 100 : Math.min(100, Math.max(0, Math.round((xpEarned / xpRange) * 100)));
  const hydrationPercent = Math.min(100, Math.round(((profile.daily_volume || 0) / (profile.daily_goal_ml || 2000)) * 100));

  interface AccessoryItem {
    id: string;
    name: string;
    desc: string;
    requirement: string;
    isUnlocked: boolean;
    xpCost: number;
    type: 'skin' | 'outfit';
  }

  const accessories: AccessoryItem[] = [
    {
      id: "scarf",
      name: "Cozy Scarf 🧣",
      desc: "A soft wool scarf to keep Boba warm.",
      requirement: "Level 2 (150 XP)",
      isUnlocked: currentXp >= 150,
      xpCost: 100,
      type: "outfit"
    },
    {
      id: "sunglasses",
      name: "Cool Sunglasses 🕶️",
      desc: "Protects companion from screen glares.",
      requirement: "Level 3 (500 XP)",
      isUnlocked: currentXp >= 500,
      xpCost: 200,
      type: "outfit" as const
    },
    {
      id: "sprouts",
      name: "Sprout Leaf 🌱",
      desc: "A tiny leaf growing on Boba's head.",
      requirement: "3-Day Streak",
      isUnlocked: streakDays >= 3,
      xpCost: 0,
      type: "outfit" as const
    },
    {
      id: "crown",
      name: "Golden Crown 👑",
      desc: "Royal crown awarded for superb streaks.",
      requirement: "7-Day Streak",
      isUnlocked: streakDays >= 7,
      xpCost: 0,
      type: "outfit" as const
    }
  ];

  const handleEquip = async (itemId: string, type: 'skin' | 'outfit') => {
    playPlop();
    await equipCompanionItem(type, itemId);
  };

  const handleBuy = async (itemId: string, type: 'skin' | 'outfit', cost: number) => {
    playPlop();
    await buyCompanionItem(type, itemId, cost);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h3 className="text-xl font-extrabold text-[#2D283E] mb-1 flex items-center gap-2">
          <Award className="w-5.5 h-5.5 text-[#FF92A9]" />
          Level-Up & Accessories
        </h3>
        <p className="text-sm text-[#8E8A9A] font-medium">Earn XP by drinking water and poking your partner.</p>
      </motion.div>

      {/* COMPANION PREVIEW CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card-elevated rounded-[24px] p-6 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24" />
        </div>
        <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono mb-4 z-10">Your Companion</h4>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FFF0F2] to-white flex items-center justify-center shadow-inner border-4 border-white mb-3">
            <CompanionAvatar 
              type={profile.companion_type} 
              name={profile.companion_name} 
              skin={profile.skin_id} 
              outfit={profile.outfit_id} 
              hydrationPercent={hydrationPercent} 
            />
          </div>
          <span className="text-sm font-black text-[#2D283E] bg-white/80 px-4 py-1 rounded-full shadow-sm">
            {profile.companion_name || "Boba"}
          </span>
        </div>
      </motion.div>

      {/* LEVEL PROGRESS PANEL */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-[24px] p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4] text-white flex items-center justify-center font-black text-base shadow-md border-2 border-white">
              Lvl {currentLevel}
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#FF92A9] font-mono tracking-wider uppercase block">Companion Rank</span>
              <h4 className="text-base font-black text-[#2D283E]">{levelCfg.name}</h4>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs">
            <span className="text-sm font-black text-[#2D283E]">{currentXp} XP</span>
            {currentLevel < 5 ? (
              <p className="text-[10px] text-[#8E8A9A] font-semibold">{(levelCfg.nextXp - currentXp)} XP needed for Level {currentLevel + 1}</p>
            ) : (
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 sm:justify-end">✨ Max Level Reached!</p>
            )}
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative w-full h-3 bg-white/80 rounded-full border border-white/50 overflow-hidden shadow-inner">
          {/* Segment Markers */}
          <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none z-10">
            <div className="w-px h-full bg-white/50"></div>
            <div className="w-px h-full bg-white/50"></div>
            <div className="w-px h-full bg-white/50"></div>
          </div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${levelPercent}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] rounded-full animate-gradient-shift"
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>
      </motion.div>

      {/* COLOR THEMES */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[#FF92A9]" /> Color Theme Accent
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {THEME_PRESETS.map((t) => {
            const isEquipped = profile.color_theme === t.id;
            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => {
                  playPlop();
                  updateProfileTheme(t.id);
                }}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-colors ${
                  isEquipped 
                    ? "bg-[#FFF0F2] text-[#FF92A9] font-extrabold border-transparent" 
                    : "bg-white/60 border-white hover:bg-white/90 text-[#4A4458] font-bold"
                }`}
              >
                {isEquipped && (
                  <motion.div 
                    layoutId="theme-ring"
                    className="absolute inset-0 border-2 border-[#FF92A9] rounded-2xl z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 w-3.5 h-3.5 rounded-full ${t.colorsBg} border border-white/40 shrink-0 shadow-sm`}></span>
                <span className="relative z-10 text-xs leading-none">{t.name}</span>
                {isEquipped && <Check className="relative z-10 w-3.5 h-3.5 text-[#FF92A9] ml-1" />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ACCESSORY SHOP */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5 px-1">
          <ShoppingBag className="w-4.5 h-4.5 text-[#FF92A9]" /> Companion Shop
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accessories.map((item, index) => {
            const unlockedList = item.type === 'skin' ? (profile.unlocked_skins || []) : (profile.unlocked_outfits || []);
            const isPurchased = unlockedList.includes(item.id);
            const activeId = item.type === 'skin' ? profile.skin_id : profile.outfit_id;
            const isEquipped = activeId === item.id;
            
            const showBuy = item.isUnlocked && !isPurchased && item.xpCost > 0;
            const canAfford = currentXp >= item.xpCost;

            return (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.06 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className={`glass-card rounded-[24px] p-4 flex flex-col justify-between shadow-xs relative overflow-hidden ${
                  isEquipped ? "ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]" : ""
                }`}
              >
                {!item.isUnlocked && (
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30 z-10 flex items-center justify-center rounded-[24px]">
                    <div className="bg-white/80 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-600">Locked</span>
                    </div>
                  </div>
                )}
                
                <div className="relative z-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black text-[#2D283E] flex items-center gap-1">
                      {item.name}
                      {isEquipped && <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />}
                    </span>
                    {isPurchased ? (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Owned</span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-mono shadow-sm">{item.requirement}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8E8A9A] font-semibold leading-tight mb-3">{item.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/40 relative z-0 mt-auto">
                  {/* Lock Message */}
                  {!item.isUnlocked && (
                    <button disabled className="w-full py-2 text-[10px] font-black rounded-xl bg-slate-100/50 text-slate-400 cursor-not-allowed">
                      Unlock at {item.requirement}
                    </button>
                  )}

                  {/* Buy Button */}
                  {showBuy && (
                    <motion.button 
                      whileTap={canAfford ? { scale: 0.95 } : {}}
                      onClick={() => handleBuy(item.id, item.type, item.xpCost)}
                      disabled={!canAfford}
                      className={`w-full py-2 text-[10px] font-black rounded-xl transition-all shadow-sm ${
                        canAfford 
                          ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Buy for {item.xpCost} XP {canAfford ? "✨" : "🔒"}
                    </motion.button>
                  )}

                  {/* Free Unlock Claim */}
                  {item.isUnlocked && !isPurchased && item.xpCost === 0 && (
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBuy(item.id, item.type, 0)}
                      className="w-full py-2 text-[10px] font-black rounded-xl bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] text-white shadow-sm"
                    >
                      Claim Free Item 🎁
                    </motion.button>
                  )}

                  {/* Equip Toggle */}
                  {isPurchased && (
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEquip(isEquipped ? "none" : item.id, item.type)}
                      className={`w-full py-2 text-[10px] font-black rounded-xl transition-colors shadow-sm ${
                        isEquipped 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white/80 text-[#FF92A9] hover:bg-white"
                      }`}
                    >
                      {isEquipped ? "Unequip 🔄" : "Equip Now"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
