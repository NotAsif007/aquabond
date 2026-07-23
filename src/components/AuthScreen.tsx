import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Droplet, Mail, Lock, User, Sparkles, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthScreenProps {
  onOpenDbConfig: () => void;
}

const COMPANIONS = [
  { id: "drop", name: "Water Drop (Boba)", emoji: "💧", desc: "A cozy droplet that loves backflips" },
  { id: "bunny", name: "Cozy Bunny (Mocha)", emoji: "🐰", desc: "Super soft ears, loves fresh sips" },
  { id: "penguin", name: "Penguin (Pippin)", emoji: "🐧", desc: "Cozy waddles, prefers cold ice water" },
  { id: "cat", name: "Sleepy Cat (Mochi)", emoji: "🐱", desc: "Purrs when you meet your daily goal" },
  { id: "blob", name: "Cute Blob (Gloop)", emoji: "🔮", desc: "Jiggles with excitement with every sip" },
  { id: "axolotl", name: "Axolotl (Bloop)", emoji: "🦎", desc: "Waves its tiny pink gills cheerfully" }
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenDbConfig }) => {
  const { supabaseMode, signIn, signUp, signInWithOAuth, authError, loading, clearSupabaseCredentials } = useApp();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Registration Profile Settings
  const [displayName, setDisplayName] = useState<string>("");
  const [companionType, setCompanionType] = useState<string>("drop");
  const [companionName, setCompanionName] = useState<string>("");
  
  // Body metrics
  const [gender, setGender] = useState<string>("other");
  const [age, setAge] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter email and password");
      return;
    }

    if (isRegister) {
      if (!displayName.trim() || !companionName.trim()) {
        setFormError("Please fill in your nickname and pet companion details");
        return;
      }

      await signUp(
        email.trim(), 
        password.trim(), 
        displayName.trim(), 
        companionType, 
        companionName.trim(),
        parseInt(age) || undefined,
        parseInt(heightCm) || undefined,
        parseFloat(weightKg) || undefined,
        gender
      );
    } else {
      await signIn(email.trim(), password.trim());
    }
  };

  const handleOAuth = async (provider: 'google' | 'discord') => {
    setFormError(null);
    await signInWithOAuth(provider);
  };

  const handleStartDemo = () => {
    clearSupabaseCredentials();
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF5F6] via-[#FFFDFB] to-[#E6F3FF] py-8 px-4 flex flex-col justify-center items-center font-sans antialiased text-[#4A4458] relative">
      
      <div className="max-w-[440px] w-full glass-card-elevated rounded-[40px] p-6.5 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white">
        
        {/* Floating background decorative accents */}
        <div className="absolute top-4 right-4 text-pink-300 animate-pulse pointer-events-none">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute bottom-8 left-4 text-sky-200 animate-float-slow pointer-events-none">
          <Droplet className="w-8 h-8" />
        </div>

        {/* LOGO & BRANDING */}
        <div className="text-center mb-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="w-16 h-16 theme-bg-gradient rounded-[24px] flex items-center justify-center shadow-lg border border-white/50 mx-auto mb-3"
          >
            <Droplet className="w-9 h-9 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-[#2D283E] tracking-tight">AquaBond</h1>
          <p className="text-xs text-[#8E8A9A] font-semibold mt-1">A Cozy Couple's Hydration Tracker</p>
        </div>

        {/* FORM ERROR / BACKEND ERROR DISPLAY */}
        <AnimatePresence>
          {(formError || authError) && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3.5 bg-red-50/90 text-red-700 rounded-2xl border border-red-100 text-xs font-semibold leading-relaxed flex items-center gap-2"
            >
              <span className="text-base">⚠️</span>
              <p>{formError || authError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUPABASE AUTHENTICATION FORM */}
        {supabaseMode ? (
          <div className="space-y-4">
            
            {/* SOCIAL OAUTH SIGN IN BUTTONS */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Auth Button */}
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 text-[#2D283E] text-xs font-bold shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-97"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </button>

              {/* Discord Auth Button */}
              <button
                type="button"
                onClick={() => handleOAuth('discord')}
                disabled={loading}
                className="py-2.5 px-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-97"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53S36,40.3,42.45,40.3C48.92,40.3,54,46,53.87,53,53.87,60,48.87,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.07-12.7,11.44-12.7C91.1,40.3,96.18,46,96.06,53,96.06,60,91.05,65.69,84.69,65.69Z" />
                </svg>
                Discord
              </button>
            </div>

            {/* DIVIDER */}
            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-200/60" />
              <span className="px-3 text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider">or email</span>
              <div className="flex-1 border-t border-slate-200/60" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* If Registering, show Nickname & Companion Details */}
              {isRegister && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3.5 border-b theme-border-accent pb-4 mb-2"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Your Nickname</label>
                    <div className="relative">
                      <User className="w-4 h-4 theme-text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="e.g. Ryu"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl pl-9 pr-3 py-2.5 text-base sm:text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Companion Pet Name</label>
                    <div className="relative">
                      <Sparkles className="w-4 h-4 theme-text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="e.g. Boba"
                        value={companionName}
                        onChange={(e) => setCompanionName(e.target.value)}
                        className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl pl-9 pr-3 py-2.5 text-base sm:text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Companion Choice Grid */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Select Cute Companion</label>
                    <div className="grid grid-cols-3 gap-2">
                      {COMPANIONS.map((comp) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => setCompanionType(comp.id)}
                          className={`p-2 rounded-2xl border text-center transition-all ${
                            companionType === comp.id 
                              ? "theme-bg-accent theme-border-primary scale-102 shadow-xs border-2" 
                              : "bg-white/80 border-slate-100 opacity-75 hover:opacity-100"
                          }`}
                          title={comp.desc}
                        >
                          <span className="text-xl block mb-0.5">{comp.emoji}</span>
                          <span className="text-[9px] font-bold text-[#2D283E] leading-none block truncate">{comp.name.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Body Metrics (Registration only) */}
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Gender</label>
                    <div className="flex gap-2">
                      {[
                        { id: "male", label: "Male", emoji: "👦" },
                        { id: "female", label: "Female", emoji: "👧" },
                        { id: "other", label: "Other", emoji: "🌈" },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGender(g.id)}
                          className={`flex-1 py-2 rounded-2xl border text-center transition-all text-xs font-bold ${
                            gender === g.id
                              ? "theme-bg-accent theme-border-primary border-2 shadow-xs"
                              : "bg-white/80 border-slate-100 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <span className="block text-lg">{g.emoji}</span>
                          <span className="text-[10px]">{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age / Height / Weight */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Age</label>
                      <input
                        type="number"
                        placeholder="25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="10"
                        max="100"
                        className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl px-3 py-2.5 text-base sm:text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Height</label>
                      <input
                        type="number"
                        placeholder="170"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        min="100"
                        max="250"
                        className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl px-3 py-2.5 text-base sm:text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner text-center"
                      />
                      <span className="text-[8px] text-center block text-[#8E8A9A]">cm</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Weight</label>
                      <input
                        type="number"
                        placeholder="65"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        min="20"
                        max="300"
                        className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl px-3 py-2.5 text-base sm:text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner text-center"
                      />
                      <span className="text-[8px] text-center block text-[#8E8A9A]">kg</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Email field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 theme-text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl pl-9 pr-3 py-2.5 text-base sm:text-xs font-semibold text-[#2D283E] focus:outline-none focus-ring shadow-inner"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 theme-text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/90 border border-white/80 focus:border-[#FF92A9] rounded-2xl pl-9 pr-9 py-2.5 text-base sm:text-xs font-mono text-[#2D283E] focus:outline-none focus-ring shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8A9A] hover:text-[#2D283E]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-2xl theme-bg-gradient text-white text-xs font-black shadow-lg hover:opacity-95 transition-all duration-150 active:scale-98 flex items-center justify-center gap-2"
              >
                {loading ? "Connecting..." : isRegister ? "Create Account & Start Onboarding" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Switch authentication type */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs theme-text-primary font-black hover:underline focus:outline-none"
                >
                  {isRegister ? "Already registered? Sign In here" : "Don't have an account? Sign Up now"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* DEMO MODE START CARD */
          <div className="space-y-5 text-center py-2 select-none">
            <div className="p-4 theme-bg-accent border theme-border-accent rounded-3xl text-left space-y-2">
              <span className="text-[10px] font-mono font-extrabold uppercase theme-text-primary tracking-wider block">Cozy Demo Session</span>
              <p className="text-xs text-[#8E8A9A] font-medium leading-relaxed">
                Welcome! You are currently exploring AquaBond in <strong>Demo / Local Mode</strong>. All data runs locally in your browser cache.
              </p>
            </div>

            <button
              onClick={handleStartDemo}
              className="w-full py-3.5 rounded-2xl theme-bg-gradient text-white text-xs font-black shadow-lg hover:opacity-95 transition-all duration-150 active:scale-98 flex items-center justify-center gap-1.5"
            >
              Start Cozy Demo Session
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="border-t theme-border-accent pt-4 flex justify-between items-center text-xs">
              <span className="text-[#8E8A9A] font-semibold">Want real-time couple sync?</span>
              <button
                onClick={onOpenDbConfig}
                className="theme-text-primary font-black hover:underline"
              >
                Configure Supabase
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
