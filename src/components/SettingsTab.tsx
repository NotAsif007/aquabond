import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { getSupabase } from "../lib/supabaseClient";
import { 
  Sliders, 
  Moon, 
  Bell, 
  MapPin, 
  Database, 
  AlertTriangle,
  Check,
  Target,
  User,
  Shield,
  Smartphone
} from "lucide-react";
import { playPlop } from "../lib/audio";

const THEME_PRESETS = [
  { id: 'sakura', name: "Cozy Sakura", bg: "bg-[#FF92A9]" },
  { id: 'blue', name: "Ocean Bond", bg: "bg-[#7CB9E8]" },
  { id: 'lavender', name: "Lavender Dusk", bg: "bg-[#A78BFA]" },
  { id: 'mint', name: "Mint Dew", bg: "bg-[#34D399]" },
  { id: 'peach', name: "Cozy Peach", bg: "bg-[#FDBA74]" }
];

export const SettingsTab: React.FC = () => {
  const {
    supabaseMode,
    supabaseConfig,
    saveSupabaseCredentials,
    clearSupabaseCredentials,
    profile,
    dndEnabled,
    quietStart,
    quietEnd,
    setDndSettings,
    isDndActiveNow,
    updateCoordinates
  } = useApp();

  const [baseGoal, setBaseGoal] = useState<number>(profile?.daily_goal_ml || 2000);
  const [lat, setLat] = useState<string>(profile?.latitude?.toString() || "");
  const [lon, setLon] = useState<string>(profile?.longitude?.toString() || "");
  const [url, setUrl] = useState(supabaseConfig.url || "");
  const [key, setKey] = useState(supabaseConfig.anonKey || "");
  
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbSuccess, setDbSuccess] = useState<boolean>(false);
  const [goalSuccess, setGoalSuccess] = useState<boolean>(false);
  const [coordSuccess, setCoordSuccess] = useState<boolean>(false);
  const [coordError, setCoordError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  if (!profile) return null;

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
    // Update local context
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
          setCoordError("Geolocation permission denied. Please enter manually.");
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
      setCoordError("Please enter valid numbers for latitude and longitude.");
      return;
    }
    
    await updateCoordinates(parsedLat, parsedLon);
    setCoordSuccess(true);
    setTimeout(() => setCoordSuccess(false), 2000);
  };

  const handleSaveDb = (e: React.FormEvent) => {
    e.preventDefault();
    setDbError(null);
    setDbSuccess(false);

    if (!url.trim() || !key.trim()) {
      setDbError("Please enter both project URL and Anon key");
      return;
    }

    const connected = saveSupabaseCredentials(url.trim(), key.trim());
    if (connected) {
      setDbSuccess(true);
      setTimeout(() => setDbSuccess(false), 2000);
    } else {
      setDbError("Invalid URL or Key format");
    }
  };

  const handleClearDb = () => {
    playPlop();
    clearSupabaseCredentials();
    setUrl("");
    setKey("");
    setDbError(null);
    setDbSuccess(false);
  };

  const alertVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* Profile Summary Card */}
      <motion.div 
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0 }}
        className="glass-card-elevated rounded-[24px] p-5 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4] flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white shrink-0">
          {profile.display_name?.charAt(0).toUpperCase() || <User className="w-8 h-8" />}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black text-[#2D283E]">{profile.display_name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-[#FF92A9] bg-[#FFF0F2] px-2 py-0.5 rounded-full">Level {profile.level}</span>
            <span className="text-xs font-semibold text-[#8E8A9A]">{profile.xp} XP</span>
          </div>
          <p className="text-xs font-medium text-[#8E8A9A] mt-1">Companion: {profile.companion_name}</p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
        
        {/* LEFT COLUMN (now single column layout) */}
        <div className="space-y-6">
          
          {/* Base Hydration Goal */}
          <motion.div 
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-[24px] p-5 space-y-4"
          >
            <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <Target className="w-4.5 h-4.5 text-[#FF92A9]" />
              Base Hydration Goal
            </h4>

            <AnimatePresence>
              {goalSuccess && (
                <motion.div variants={alertVariants} initial="hidden" animate="visible" exit="exit" className="p-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Goal updated successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSaveGoal} className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  value={baseGoal} 
                  onChange={(e) => setBaseGoal(Math.max(100, parseInt(e.target.value) || 0))}
                  className="focus-ring w-full bg-white/60 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-[#2D283E]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono font-black text-[#8E8A9A] uppercase select-none">ml</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] text-white text-xs font-black rounded-xl shadow-xs transition-colors"
              >
                Save Target
              </motion.button>
            </form>
          </motion.div>

          {/* DND Hours Config */}
          <motion.div 
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-[24px] p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5">
                <Moon className="w-4.5 h-4.5 text-[#FF92A9]" />
                Quiet Hours (DND)
              </h4>
              <button 
                onClick={() => handleSaveDnd(!dndEnabled, quietStart, quietEnd)}
                className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${dndEnabled ? 'bg-[#FF92A9]' : 'bg-slate-300'}`}
              >
                <motion.div 
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                  style={{ marginLeft: dndEnabled ? '24px' : '0px' }}
                />
              </button>
            </div>

            <p className="text-[10px] font-semibold text-[#8E8A9A] leading-relaxed">
              Mute companion nudge notifications during your sleepy time.
            </p>

            <div className={`grid grid-cols-2 gap-3 transition-opacity ${!dndEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#8E8A9A] font-semibold">Quiet Hours Start</span>
                <input 
                  type="time" 
                  value={quietStart} 
                  onChange={(e) => handleSaveDnd(dndEnabled, e.target.value, quietEnd)}
                  className="focus-ring bg-white/60 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2D283E]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#8E8A9A] font-semibold">Quiet Hours End</span>
                <input 
                  type="time" 
                  value={quietEnd} 
                  onChange={(e) => handleSaveDnd(dndEnabled, quietStart, e.target.value)}
                  className="focus-ring bg-white/60 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2D283E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[10px] border-t border-white/20">
              <span className="text-[#8E8A9A] font-bold">DND Status Right Now:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                isDndActiveNow() 
                  ? "bg-amber-100 text-amber-700 border-amber-200" 
                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
              }`}>
                {isDndActiveNow() ? "🔇 Muted (Active)" : "🔔 Alerts Allowed"}
              </span>
            </div>
          </motion.div>

          {/* Coordinates Geolocation */}
          <motion.div 
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-[24px] p-5 space-y-4"
          >
            <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <MapPin className="w-4.5 h-4.5 text-[#FF92A9]" />
              Adaptive GPS Geolocation
            </h4>

            <AnimatePresence>
              {coordSuccess && (
                <motion.div variants={alertVariants} initial="hidden" animate="visible" exit="exit" className="p-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> GPS Coordinates updated successfully!
                </motion.div>
              )}
              {coordError && (
                <motion.div variants={alertVariants} initial="hidden" animate="visible" exit="exit" className="p-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-bold border border-red-100 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {coordError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSaveCoords} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#8E8A9A] font-semibold">Latitude (e.g. 37.77)</span>
                  <input 
                    type="text" 
                    value={lat} 
                    onChange={(e) => setLat(e.target.value)}
                    className="focus-ring bg-white/60 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2D283E]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#8E8A9A] font-semibold">Longitude (e.g. -122.41)</span>
                  <input 
                    type="text" 
                    value={lon} 
                    onChange={(e) => setLon(e.target.value)}
                    className="focus-ring bg-white/60 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2D283E]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-slate-100/50 text-[#4A4458] hover:bg-slate-200 border border-slate-200 text-xs font-black shadow-xs transition-colors"
                >
                  Save Coordinates
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleFetchLocation}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-[#7CB9E8] text-white text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  {isFetchingLocation ? (
                    <MapPin className="w-4 h-4 animate-pulse" />
                  ) : (
                    <>Detect Geolocation 📍</>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

        </div>

        {/* RIGHT COLUMN -> Now single column below */}
        <div className="space-y-6">
          <motion.div 
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-[24px] p-5 space-y-4"
          >
            <h4 className="text-xs font-extrabold text-[#2D283E] uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <Database className="w-4.5 h-4.5 text-[#3ecf8e]" />
              Supabase Backend Setup
            </h4>

            <AnimatePresence>
              {dbError && (
                <motion.div variants={alertVariants} initial="hidden" animate="visible" exit="exit" className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{dbError}</span>
                </motion.div>
              )}
              {dbSuccess && (
                <motion.div variants={alertVariants} initial="hidden" animate="visible" exit="exit" className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Connected successfully to Supabase!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSaveDb} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8E8A9A]">Supabase URL</label>
                <input 
                  type="text" 
                  placeholder="https://your-project-id.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="focus-ring w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-3xs font-semibold text-[#2D283E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8E8A9A]">Supabase Anon Key</label>
                <input 
                  type="password" 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="focus-ring w-full bg-white/60 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-3xs font-mono text-[#2D283E]"
                />
              </div>

              <div className="flex gap-2 pt-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3ecf8e] to-[#059669] hover:from-[#35be80] hover:to-[#047857] text-white text-xs font-black shadow-md transition-colors"
                >
                  Save Connection
                </motion.button>
                {supabaseMode && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleClearDb}
                    className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-xs font-extrabold transition-colors"
                  >
                    Disconnect
                  </motion.button>
                )}
              </div>
            </form>

            <div className="text-[10px] text-[#8E8A9A] leading-relaxed border-t border-white/20 pt-3.5 space-y-1">
              <span className="font-extrabold text-[#4A4458] block mb-0.5">☁️ Active Mode Sync Status:</span>
              <p>
                - {supabaseMode 
                  ? "🟢 Connected: Syncing sips, streak, and nudge hearts to your Supabase project in real-time."
                  : "🟡 Cozy Demo Mode: All operations run locally on your device using browser local storage. Connect database above to pair with a real partner."
                }
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
