import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Droplet, Mail, Lock, User, Sparkles, Heart, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

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
  const { supabaseMode, signIn, signUp, authError, loading, clearSupabaseCredentials } = useApp();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  // Registration Profile Settings
  const [displayName, setDisplayName] = useState<string>("");
  const [companionType, setCompanionType] = useState<string>("drop");
  const [companionName, setCompanionName] = useState<string>("");

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
        setFormError("Please fill in your name and companion details");
        return;
      }

      await signUp(
        email.trim(), 
        password.trim(), 
        displayName.trim(), 
        companionType, 
        companionName.trim()
      );
    } else {
      await signIn(email.trim(), password.trim());
    }
  };

  const handleStartDemo = () => {
    clearSupabaseCredentials();
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF5F6] via-[#FFFDFB] to-[#E6F3FF] py-8 px-4 flex flex-col justify-center items-center font-sans antialiased text-[#4A4458]">
      
      <div className="max-w-[420px] w-full bg-white/70 backdrop-blur-2xl border border-white rounded-[40px] p-6.5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Floating sparkles */}
        <div className="absolute top-4 right-4 text-pink-300 animate-pulse pointer-events-none">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute bottom-8 left-4 text-sky-200 animate-bounce pointer-events-none" style={{ animationDuration: "3s" }}>
          <Droplet className="w-8 h-8" />
        </div>

        {/* LOGO */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#FF92A9] to-[#7CB9E8] rounded-[22px] flex items-center justify-center shadow-lg border border-white/50 mx-auto mb-3.5">
            <Droplet className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#2D283E] tracking-tight">AquaBond</h1>
          <p className="text-xs text-[#8E8A9A] font-semibold mt-1">A Cozy Couple's Hydration Tracker</p>
        </div>



        {/* FORM ERROR / BACKEND ERROR DISPLAY */}
        {(formError || authError) && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs font-medium leading-relaxed">
            ⚠️ {formError || authError}
          </div>
        )}

        {/* SUBAPASE AUTHENTICATION FORM */}
        {supabaseMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* If Registering, show Nickname & Companion Details */}
            {isRegister && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 border-b border-[#FFF0F2] pb-4.5 mb-2"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Your Nickname</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8E8A9A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="e.g. Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#FF92A9] rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none font-semibold text-[#2D283E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Companion Pet Name</label>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-[#8E8A9A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="e.g. Boba"
                      value={companionName}
                      onChange={(e) => setCompanionName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#FF92A9] rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none font-semibold text-[#2D283E]"
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
                            ? "bg-[#FFF0F2] border-[#FF92A9] scale-102 shadow-xs" 
                            : "bg-white border-slate-100 opacity-75 hover:opacity-100"
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

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E8A9A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#FF92A9] rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none font-semibold text-[#2D283E]"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#8E8A9A] tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E8A9A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#FF92A9] rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none font-mono text-[#2D283E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] hover:from-[#f47f98] hover:to-[#fca5a5] text-white text-xs font-black shadow-lg transition-all duration-150 active:scale-98 flex items-center justify-center gap-1.5"
            >
              {loading ? "Establishing connection..." : isRegister ? "Create Account & Start Onboarding" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Switch authentication type */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-[#FF92A9] font-black hover:underline focus:outline-none"
              >
                {isRegister ? "Already registered? Sign In here" : "Don't have an account? Sign Up now"}
              </button>
            </div>
          </form>
        ) : (
          /* MOCK DEMO MODE START CARD */
          <div className="space-y-5 text-center py-2 select-none">
            <div className="p-4 bg-[#FFF0F2]/50 border border-[#FFF0F2] rounded-3xl text-left space-y-2">
              <span className="text-[10px] font-mono font-extrabold uppercase text-[#FF92A9] tracking-wider block">Cozy Demo Session</span>
              <p className="text-xs text-[#8E8A9A] font-medium leading-relaxed">
                Welcome! You are currently exploring AquaBond in <strong>Demo / Local Mode</strong>. All data runs locally in your browser cache.
              </p>
              <p className="text-xs text-[#8E8A9A] font-medium leading-relaxed">
                Click <strong>"Configure Supabase"</strong> at the bottom of the card if you wish to connect a database to test authentication, bonding, and real-time syncing between two devices.
              </p>
            </div>

            <button
              onClick={handleStartDemo}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] text-white text-xs font-black shadow-lg hover:from-[#f47f98] hover:to-[#fca5a5] transition-all duration-150 active:scale-98 flex items-center justify-center gap-1.5"
            >
              Start Cozy Demo Session
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="border-t border-[#FFF0F2] pt-4 flex justify-between items-center text-xs">
              <span className="text-[#8E8A9A] font-semibold">Want real-time couple sync?</span>
              <button
                onClick={onOpenDbConfig}
                className="text-[#FF92A9] font-black hover:underline"
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
