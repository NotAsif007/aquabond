import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { getSupabase } from "../lib/supabaseClient";
import { 
  Sliders, 
  Moon, 
  Bell, 
  MapPin, 
  Check,
  Target,
  User,
  Shield,
  ShoppingBag,
  Sparkles,
  Lock,
  Palette,
  Award
} from "lucide-react";
import { playPlop } from "../lib/audio";
import { CompanionAvatar } from "./CompanionAvatar";

interface ThemePreset {
  id: 'sakura' | 'blue' | 'lavender' | 'mint' | 'peach';
  name: string;
  colorsBg: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { id: 'sakura', name: "Cozy Sakura", colorsBg: "bg-[#FF92A9]" },
  { id: 'blue', name: "Ocean Bond", colorsBg: "bg-[#7CB9E8]" },
  { id: 'lavender', name: "Lavender Dusk", colorsBg: "bg-[#A78BFA]" },
  { id: 'mint', name: "Mint Dew", colorsBg: "bg-[#34D399]" },
  { id: 'peach', name: "Cozy Peach", colorsBg: "bg-[#FDBA74]" }
];

interface AccessoryItem {
  id: string;
  name: string;
  desc: string;
  requirement: string;
  isUnlocked: boolean;
  xpCost: number;
  type: 'skin' | 'outfit';
}

export const SettingsTab: React.FC = () => {
  const {
    supabaseMode,
    profile,
    couple,
    dndEnabled,
    quietStart,
    quietEnd,
    setDndSettings,
    isDndActiveNow,
    updateCoordinates,
    updateProfileTheme,
    equipCompanionItem,
    buyCompanionItem,
    logs
  } = useApp();

  const [baseGoal, setBaseGoal] = useState<number>(profile?.daily_goal_ml || 2000);
  const [lat, setLat] = useState<string>(profile?.latitude?.toString() || "");
  const [lon, setLon] = useState<string>(profile?.longitude?.toString() || "");
  
  const [goalSuccess, setGoalSuccess] = useState<boolean>(false);
  const [coordSuccess, setCoordSuccess] = useState<boolean>(false);
  const [coordError, setCoordError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  if (!profile) return null;

  const currentXp = profile.xp;
  const currentLevel = profile.level;
  const streakDays = couple ? couple.couple_streak : profile.current_streak;

  const userTodayMl = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const hydrationPercent = Math.min(100, Math.round((userTodayMl / (profile.daily_goal_ml || 2000)) * 100));

  const accessories: AccessoryItem[] = [
    {
      id: "scarf",
      name: "Cozy Scarf 🧣",
      desc: "A soft wool scarf for Boba.",
      requirement: "Level 2 (150 XP)",
      isUnlocked: currentXp >= 150,
      xpCost: 100,
      type: "outfit"
    },
    {
      id: "sunglasses",
      name: "Cool Glasses 🕶️",
      desc: "Protects companion from screen glares.",
      requirement: "Level 3 (500 XP)",
      isUnlocked: currentXp >= 500,
      xpCost: 200,
      type: "outfit"
    },
    {
      id: "sprouts",
      name: "Sprout Leaf 🌱",
      desc: "A tiny leaf growing on Boba's head.",
      requirement: "3-Day Streak",
      isUnlocked: streakDays >= 3,
      xpCost: 0,
      type: "outfit"
    },
    {
      id: "crown",
      name: "Golden Crown 👑",
      desc: "Royal crown awarded for superb streaks.",
      requirement: "7-Day Streak",
      isUnlocked: streakDays >= 7,
      xpCost: 0,
      type: "outfit"
    },
    {
      id: "sparkle",
      name: "Sparkle Skin ✨",
      desc: "Gives companion a glowing aura.",
      requirement: "Level 4 (1200 XP)",
      isUnlocked: currentXp >= 1200,
      xpCost: 350,
      type: "skin"
    },
    {
      id: "gold",
      name: "Golden Skin 🌟",
      desc: "Prestige skin for master hydrators.",
      requirement: "Level 5 (2500 XP)",
      isUnlocked: currentXp >= 2500,
      xpCost: 500,
      type: "skin"
    }
  ];

  const handleSaveDnd = (enabled: boolean, start: string, end: string) => {
    playPlop();
    setDndSettings(enabled, start, end);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalSuccess(false);
    playPlop();

    if (baseGoal <= 0) return;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("profiles").update({ daily_goal_ml: baseGoal }).eq("id", profile.id);
      }
    }
    profile.daily_goal_ml = baseGoal;
    setGoalSuccess(true);
    setTimeout(() => setGoalSuccess(false), 2000);
  };

  const handleFetchLocation = () => {
    playPlop();
    setCoordError(null);
    if ("geolocation" in navigator) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLat = pos.coords.latitude;
          const newLon = pos.coords.longitude;
          setLat(newLat.toString());
          setLon(newLon.toString());
          await updateCoordinates(newLat, newLon);
          setCoordSuccess(true);
          setIsFetchingLocation(false);
          setTimeout(() => setCoordSuccess(false), 2000);
        },
        () => {
          setIsFetchingLocation(false);
          setCoordError("Geolocation permission denied.");
        }
      );
    } else {
      setCoordError("Geolocation is not supported by your browser.");
    }
  };

  const handleSaveCoords = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoordSuccess(false);
    setCoordError(null);
    playPlop();

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    
    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      setCoordError("Please enter valid numbers.");
      return;
    }

    await updateCoordinates(parsedLat, parsedLon);
    setCoordSuccess(true);
    setTimeout(() => setCoordSuccess(false), 2000);
  };

  const handleThemeChange = async (themeId: ThemePreset['id']) => {
    playPlop();
    await updateProfileTheme(themeId);
  };

  const handleItemClick = (item: AccessoryItem) => {
    playPlop();
    const isEquipped = item.type === 'outfit' 
      ? profile.outfit_id === item.id 
      : profile.skin_id === item.id;

    if (isEquipped) {
      equipCompanionItem(item.type, item.type === 'outfit' ? 'none' : 'default');
      return;
    }

    const isOwned = item.type === 'outfit' 
      ? profile.unlocked_outfits.includes(item.id)
      : profile.unlocked_skins.includes(item.id);

    if (isOwned || item.isUnlocked) {
      equipCompanionItem(item.type, item.id);
    } else if (item.xpCost > 0 && currentXp >= item.xpCost) {
      buyCompanionItem(item.id, item.type, item.xpCost);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-extrabold text-[#2D283E] mb-1 flex items-center gap-2">
          <Sliders className="w-5.5 h-5.5 text-[#FF92A9]" />
          Settings & Companion Shop
        </h3>
        <p className="text-sm text-[#8E8A9A] font-medium">Equip companion accessories, select color themes, and configure goals.</p>
      </div>

      {/* 1. COMPANION LIVE PREVIEW CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card-elevated rounded-[28px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#FFF0F2] border border-[#FFF0F2] flex items-center justify-center p-2 relative shrink-0">
            <CompanionAvatar 
              type={profile.companion_type}
              name={profile.companion_name}
              skin={profile.skin_id}
              outfit={profile.outfit_id}
              percent={hydrationPercent}
              size="lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-[#2D283E]">{profile.companion_name}</h4>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFF0F2] text-[#FF92A9] px-2 py-0.5 rounded-full border border-[#FFF0F2]/50">
                Level {profile.level}
              </span>
            </div>
            <p className="text-xs text-[#8E8A9A] font-medium mt-0.5">
              Skin: <span className="font-bold text-[#4A4458] capitalize">{profile.skin_id}</span> • Outfit: <span className="font-bold text-[#4A4458] capitalize">{profile.outfit_id}</span>
            </p>
            <p className="text-[10px] font-mono font-bold text-[#4DA8CF] mt-1">
              XP: {profile.xp} Points
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. ACCESSORY SHOP GRID */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[#FFF0F2]/50 pb-2">
          <span className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#FF92A9]" />
            Companion Accessory Shop
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {accessories.map((item) => {
            const isEquipped = item.type === 'outfit' 
              ? profile.outfit_id === item.id 
              : profile.skin_id === item.id;
            
            const isOwned = item.type === 'outfit' 
              ? profile.unlocked_outfits.includes(item.id)
              : profile.unlocked_skins.includes(item.id);

            const canAfford = item.xpCost > 0 && currentXp >= item.xpCost;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isEquipped 
                    ? "bg-emerald-50/90 border-emerald-300 shadow-sm ring-2 ring-emerald-400/40" 
                    : isOwned || item.isUnlocked 
                    ? "bg-white/80 border-slate-200 hover:border-[#FF92A9]" 
                    : "bg-slate-50/60 border-slate-200/80 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#2D283E]">{item.name}</span>
                    {isEquipped && (
                      <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Equipped</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8E8A9A] font-medium leading-snug mt-1">{item.desc}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9.5px] font-bold">
                  {isOwned || item.isUnlocked ? (
                    <span className={isEquipped ? "text-emerald-600 font-extrabold" : "text-[#FF92A9]"}>
                      {isEquipped ? "Unequip" : "Equip Item"}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {item.requirement}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 3. COLOR THEME SELECTOR */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center gap-1.5 border-b border-[#FFF0F2]/50 pb-2">
          <Palette className="w-4 h-4 text-[#FF92A9]" />
          <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider font-mono">Theme Palette</h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {THEME_PRESETS.map((t) => {
            const isSelected = (profile.color_theme || 'sakura') === t.id;
            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleThemeChange(t.id)}
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 ${
                  isSelected ? "bg-white border-[#FF92A9] shadow-sm ring-2 ring-[#FF92A9]/30" : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <div className={`w-6 h-6 rounded-xl ${t.colorsBg} shadow-3xs shrink-0 flex items-center justify-center text-white`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-extrabold text-[#2D283E] truncate">{t.name}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 4. DAILY WATER GOAL FORM */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center gap-1.5 border-b border-[#FFF0F2]/50 pb-2">
          <Target className="w-4 h-4 text-[#FF92A9]" />
          <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider font-mono">Daily Target Goal</h4>
        </div>

        <form onSubmit={handleSaveGoal} className="flex gap-3 items-center">
          <input 
            type="number"
            value={baseGoal}
            onChange={(e) => setBaseGoal(parseInt(e.target.value) || 0)}
            className="flex-1 bg-white/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#2D283E]"
            placeholder="2000"
          />
          <span className="text-xs font-bold text-[#8E8A9A]">ml</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] text-white rounded-xl text-xs font-black shadow-xs"
          >
            Save Target
          </motion.button>
        </form>
        {goalSuccess && (
          <p className="text-[10px] font-bold text-emerald-600">✓ Target goal updated successfully!</p>
        )}
      </motion.div>

      {/* 5. DND QUIET HOURS */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[#FFF0F2]/50 pb-2">
          <span className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-[#FF92A9]" />
            DND Quiet Hours
          </span>
          {isDndActiveNow && (
            <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Quiet Active 🌙</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs font-extrabold text-[#2D283E]">Enable Quiet Hours</span>
            <p className="text-[10px] text-[#8E8A9A] font-medium">Mutes nudges and reminders while sleeping.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSaveDnd(!dndEnabled, quietStart, quietEnd)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${dndEnabled ? "bg-[#FF92A9]" : "bg-slate-200"}`}
          >
            <motion.div 
              layout
              className="w-4 h-4 rounded-full bg-white shadow-xs"
              animate={{ x: dndEnabled ? 24 : 0 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* 6. GEOLOCATION GPS */}
      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-[24px] p-5 space-y-3"
      >
        <div className="flex items-center gap-1.5 border-b border-[#FFF0F2]/50 pb-2">
          <MapPin className="w-4 h-4 text-[#FF92A9]" />
          <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider font-mono">Location & Weather Sync</h4>
        </div>

        <form onSubmit={handleSaveCoords} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-[#8E8A9A]">Latitude</label>
              <input 
                type="text" 
                value={lat} 
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-white/70 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2D283E]"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#8E8A9A]">Longitude</label>
              <input 
                type="text" 
                value={lon} 
                onChange={(e) => setLon(e.target.value)}
                className="w-full bg-white/70 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2D283E]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-100 text-[#4A4458] hover:bg-slate-200 border border-slate-200 text-xs font-bold"
            >
              Save Location
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleFetchLocation}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-[#7CB9E8] text-white text-xs font-bold flex items-center justify-center gap-1"
            >
              {isFetchingLocation ? <MapPin className="w-3.5 h-3.5 animate-pulse" /> : "Detect GPS 📍"}
            </motion.button>
          </div>
        </form>
        {coordSuccess && <p className="text-[10px] font-bold text-emerald-600">✓ Location updated!</p>}
        {coordError && <p className="text-[10px] font-bold text-red-500">{coordError}</p>}
      </motion.div>

    </div>
  );
};
