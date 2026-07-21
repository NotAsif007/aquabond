import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { CompanionAvatar } from "./CompanionAvatar";
import { 
  Heart, 
  Users, 
  Send, 
  Check, 
  AlertCircle,
  Copy,
  UserPlus,
  Droplet,
  Sparkles,
  Wifi
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playPlop, playHeartBurstSound } from "../lib/audio";

export const PartnerTab: React.FC = () => {
  const {
    profile,
    partnerProfile,
    couple,
    partnerLogs,
    logPartnerDrink,
    sendPoke,
    linkPartner,
    unlinkPartner,
    isPartnerVibrating,
    flyingHearts
  } = useApp();

  const [inviteCode, setInviteCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [burstParticles, setBurstParticles] = useState<Array<{ id: number, angle: number, delay: number, distance: number, emoji: string }>>([]);
  const [nudgeFlash, setNudgeFlash] = useState(false);
  const [sipAnimation, setSipAnimation] = useState(false);

  // Trigger burst particles on partner nudge vibration
  useEffect(() => {
    if (isPartnerVibrating) {
      triggerBurstAnimation();
      setNudgeFlash(true);
      setTimeout(() => setNudgeFlash(false), 800);
    }
  }, [isPartnerVibrating]);

  const triggerBurstAnimation = () => {
    const emojis = ["❤️", "💖", "💕", "✨", "💗"];
    const newParticles = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      angle: (i * 360) / 16 + (Math.random() * 15 - 7.5),
      delay: Math.random() * 0.1,
      distance: Math.random() * 50 + 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    setBurstParticles(newParticles);
    setTimeout(() => setBurstParticles([]), 1200);
  };

  const handlePartnerSip = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI feedback
    setSipAnimation(true);
    playPlop();
    
    await logPartnerDrink(250, 'cup');
    
    setTimeout(() => setSipAnimation(false), 600);
  };

  const handlePoke = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    triggerBurstAnimation();
    playHeartBurstSound();
    sendPoke('heart');
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setIsLinking(true);
    playPlop();

    if (!inviteCode.trim()) {
      setLinkError("Please enter your partner's code");
      setIsLinking(false);
      return;
    }

    const success = await linkPartner(inviteCode.trim());
    setIsLinking(false);
    if (!success) {
      setLinkError("Could not connect. Verify your partner's ID code.");
    }
  };

  const copyMyCode = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    playPlop();
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) return null;

  // Partner Hydration Math
  const partnerGoal = partnerProfile ? partnerProfile.daily_goal_ml : 2000;
  const partnerTodayMl = partnerLogs.reduce((sum, l) => sum + l.amount_ml, 0);
  const partnerPercent = Math.min(100, Math.round((partnerTodayMl / partnerGoal) * 100));

  const getCompanionExpressionText = (name: string, pct: number) => {
    if (pct === 0) return `${name} is curled up asleep. Poke them to wake up! 💤`;
    if (pct < 25) return `${name} is yawning... Send them a nudge to drink! 🥱`;
    if (pct < 50) return `${name} is feeling happy and refreshed! 😊`;
    if (pct < 75) return `${name} is super excited! Halfway there! ✨`;
    if (pct < 100) return `${name} is doing happy little dances! 🥳`;
    return `Goal Met! ${name} is dancing under confetti! 👑💖`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full space-y-4 relative h-full">
      
      {/* Full-screen nudge flash overlay */}
      <AnimatePresence>
        {nudgeFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#FF92A9]/15 pointer-events-none z-50 animate-nudge-flash"
          />
        )}
      </AnimatePresence>

      {/* Floating hearts overlay */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {flyingHearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: "100%", x: `${heart.left}%`, scale: 0.5, opacity: 1 }}
            animate={{ y: "-10%", scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute text-rose-500 text-4xl"
          >
            ❤️
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-extrabold text-[#2D283E] mb-1 flex items-center gap-2">
          <Users className="w-5.5 h-5.5 text-[#FF92A9]" />
          Partner Hydration
        </h3>
        <p className="text-sm text-[#8E8A9A] font-medium">Track your partner's live intake and send encouragement nudges.</p>
      </motion.div>

      {partnerProfile ? (
        /* Connected State */
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card-elevated rounded-[32px] p-6 flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden"
        >
          {/* Connection status header */}
          <div className="w-full flex items-center justify-between border-b border-[#FFF0F2]/50 pb-3 mb-4">
            <span className="text-xs font-black uppercase text-[#8E8A9A] tracking-wider flex items-center gap-2">
              <span className="relative flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full absolute animate-pulseDot"></span>
              </span>
              {partnerProfile.display_name}
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-gradient-to-r from-[#FFF0F2] to-[#FFE4E6] text-[#FF92A9] rounded-lg border border-[#FFF0F2]/50">
              Level {partnerProfile.level}
            </span>
          </div>

          {/* Companion Bubble & Avatar */}
          <div className="flex flex-col items-center justify-center mb-4 min-h-[150px] w-full">
            <motion.div 
              key={partnerPercent}
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="glass-card rounded-2xl py-2.5 px-4 text-xs text-[#4A4458] leading-tight max-w-[85%] text-center mb-3 relative font-medium"
            >
              {getCompanionExpressionText(partnerProfile.companion_name, partnerPercent)}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/60 border-r border-b border-white/70 rotate-45"></div>
            </motion.div>

            <div className={`relative ${isPartnerVibrating ? 'animate-wiggle' : ''}`}>
              <CompanionAvatar 
                type={partnerProfile.companion_type}
                name={partnerProfile.companion_name}
                percent={partnerPercent}
                skinId={partnerProfile.skin_id}
                outfitId={partnerProfile.outfit_id}
                level={partnerProfile.level}
                streakDays={couple ? couple.couple_streak : profile.current_streak}
              />

              {/* Heart Burst Particle Overlay */}
              <div className="absolute top-1/2 left-1/2 pointer-events-none z-50">
                <AnimatePresence>
                  {burstParticles.map(p => {
                    const rad = (p.angle * Math.PI) / 180;
                    const targetX = Math.cos(rad) * p.distance;
                    const targetY = Math.sin(rad) * p.distance;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
                        animate={{ 
                          x: targetX, 
                          y: targetY, 
                          scale: [0.2, 1.6, 0], 
                          opacity: [1, 1, 0] 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 0.9, 
                          delay: p.delay,
                          ease: "easeOut" 
                        }}
                        className="absolute text-lg select-none"
                        style={{ transform: "translate(-50%, -50%)" }}
                      >
                        {p.emoji}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Partner Glass Bottle */}
          <div className={`relative w-full max-w-[185px] aspect-[5/8.2] glass-bottle rounded-[50px] overflow-hidden flex flex-col justify-end p-1.5 mb-6 ${partnerPercent >= 75 ? 'animate-glow-pink' : ''}`}>
            <div className="absolute top-6 left-3 w-1.5 h-16 bg-white/40 rounded-full blur-xs pointer-events-none"></div>
            
            {/* Shimmer */}
            <div className="absolute inset-0 animate-shimmer rounded-[50px] pointer-events-none z-20 opacity-40"></div>

            {/* Wave animation */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-[38px]"
              animate={{ height: `${partnerPercent}%` }}
              transition={{ type: "spring", stiffness: 65, damping: 11, mass: 0.9 }}
            >
              <div className="absolute inset-0 w-full h-full relative">
                <svg className="absolute -top-3 left-0 w-[200%] h-12 text-[#FFB6C1] opacity-60 animate-wave-slow" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 10 Q 25 5, 50 10 T 100 10 T 150 10 T 200 10 L 200 20 L 0 20 Z" fill="currentColor" />
                </svg>
                <svg className="absolute -top-2 left-0 w-[200%] h-12 text-[#FFC0CB] opacity-90 animate-wave-fast" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 10 Q 25 15, 50 10 T 100 10 T 150 10 T 200 10 L 200 20 L 0 20 Z" fill="currentColor" />
                </svg>
                <div className="absolute top-5 bottom-0 left-0 right-0 bg-gradient-to-b from-[#FFA4B4] to-[#FF92A9]"></div>
                
                {/* Bubbles */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white/25 animate-bubble pointer-events-none"
                    style={{
                      width: 3 + Math.random() * 4,
                      height: 3 + Math.random() * 4,
                      left: `${20 + Math.random() * 60}%`,
                      bottom: '10%',
                      animationDelay: `${i * 0.8}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Percentage Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none">
              <span className="text-3xl font-black text-[#2D283E] drop-shadow-sm leading-none">{partnerPercent}%</span>
              <span className="text-[10px] font-mono text-[#4A4458] font-bold bg-white/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full mt-1.5 border border-white/40 shadow-3xs">
                {partnerTodayMl} / {partnerGoal} ml
              </span>
            </div>
          </div>

          {/* Interactive Encourage & Mock Sip controls */}
          <div className="w-full grid grid-cols-2 gap-3.5 mt-2">
            <motion.button 
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.02 }}
              onClick={handlePoke}
              className="py-3.5 rounded-2xl bg-gradient-to-r from-[#FFF0F2] to-[#FFE4E6] hover:from-[#FFE4E6] hover:to-[#FFD6DA] text-[#FF92A9] text-xs font-black shadow-xs border border-white flex items-center justify-center gap-1.5 btn-press relative overflow-hidden"
            >
              <Heart className="w-4 h-4 text-[#FF92A9] fill-[#FF92A9]" />
              Poke Partner ❤️
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.02 }}
              onClick={handlePartnerSip}
              className={`py-3.5 rounded-2xl text-[#4DA8CF] text-xs font-black shadow-xs border border-white flex items-center justify-center gap-1.5 btn-press relative overflow-hidden ${
                sipAnimation 
                  ? 'bg-gradient-to-r from-[#D8EEFF] to-[#C2E4FF]' 
                  : 'bg-gradient-to-r from-[#E6F3FF] to-[#EBF5FC] hover:from-[#D8EEFF] hover:to-[#D8EEFF]'
              }`}
            >
              <AnimatePresence>
                {sipAnimation && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute w-8 h-8 bg-[#4DA8CF]/20 rounded-full"
                  />
                )}
              </AnimatePresence>
              <Droplet className="w-4 h-4" />
              + Partner Sip 💧
            </motion.button>
          </div>

          {/* Unlink button */}
          <div className="w-full flex justify-end mt-4 pt-3 border-t border-[#FFF0F2]/30">
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to disconnect from your partner? This resets your active couples streaks.")) {
                  unlinkPartner();
                }
              }}
              className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider"
            >
              Unlink Partner Connection
            </button>
          </div>

        </motion.div>
      ) : (
        /* Invite / Link Form */
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card-elevated rounded-[32px] p-6 space-y-6"
        >
          <div className="text-center space-y-2 max-w-md mx-auto py-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4] rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 mx-auto mb-3"
            >
              <UserPlus className="w-7 h-7 text-white" />
            </motion.div>
            <h4 className="text-lg font-black text-[#2D283E]">Link with your Partner</h4>
            <p className="text-xs text-[#8E8A9A] font-semibold leading-relaxed">
              Bond with your loved one to share live hydration statuses, match streaks, customize companion items together, and send cheering nudges!
            </p>
          </div>

          {/* Copy My Code widget */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 rounded-2xl space-y-3.5 max-w-md mx-auto"
          >
            <span className="text-[10px] font-bold text-[#8E8A9A] uppercase tracking-wider block flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              Your Sharing Code:
            </span>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={profile.id} 
                className="flex-1 bg-white/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold select-all text-[#2D283E] focus:outline-none backdrop-blur-xs"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={copyMyCode}
                className="px-4 py-2 bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 btn-press"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </motion.button>
            </div>
          </motion.div>

          {/* Paste partner code widget */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5 rounded-2xl space-y-3.5 max-w-md mx-auto"
          >
            <span className="text-[10px] font-bold text-[#8E8A9A] uppercase tracking-wider block">Connect via Partner Code:</span>
            
            <AnimatePresence>
              {linkError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{linkError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLink} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Paste partner's sharing code..." 
                value={inviteCode} 
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 bg-white/70 border border-slate-200 focus:border-[#FF92A9] rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none font-bold text-[#2D283E] backdrop-blur-xs"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="submit"
                disabled={isLinking}
                className="px-4 py-2 bg-[#2D283E] text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50 btn-press"
              >
                <Send className="w-3.5 h-3.5" />
                {isLinking ? "Linking..." : "Connect"}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
};
