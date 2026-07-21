import React, { useState, useCallback, useRef } from "react";
import { Sparkle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CompanionAvatarProps {
  type: 'drop' | 'bunny' | 'penguin' | 'cat' | 'blob' | 'axolotl';
  name: string;
  percent: number;
  skinId: string;
  outfitId: string;
  level?: number;
  streakDays?: number;
}

/* ─── Confetti color palette ─── */
const CONFETTI_COLORS = [
  "#FF92A9", "#FBBF24", "#34D399", "#7CB9E8",
  "#A78BFA", "#FB7185", "#F59E0B", "#60A5FA",
];

/* ─── Confetti particle shape/position seeds ─── */
const CONFETTI_PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  const radius = 48 + Math.random() * 10;
  return {
    id: i,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${(i * 0.15).toFixed(2)}s`,
    isSquare: i % 2 === 0,
    size: 5 + Math.random() * 4,
  };
});

/* ─── Level ring color mapping ─── */
const getLevelRingColor = (level: number): string => {
  switch (level) {
    case 2: return "#7CB9E8";
    case 3: return "#34D399";
    case 4: return "#FBBF24";
    case 5: return "#A78BFA";
    default: return "#7CB9E8";
  }
};

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  type,
  name,
  percent,
  skinId,
  outfitId,
  level = 1,
  streakDays = 0,
}) => {
  /* ─── Tap interaction state ─── */
  const [isTapped, setIsTapped] = useState(false);
  const [tapHearts, setTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const heartIdRef = useRef(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    // Trigger wiggle
    setIsTapped(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => setIsTapped(false), 600);

    // Burst 5 hearts with slight random offsets
    const newHearts = Array.from({ length: 5 }, (_, i) => ({
      id: heartIdRef.current++,
      x: (Math.random() - 0.5) * 50,
      y: -(Math.random() * 10),
    }));
    setTapHearts((prev) => [...prev, ...newHearts]);

    // Cleanup hearts after animation completes
    setTimeout(() => {
      setTapHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1200);
  }, []);

  // Determine emotion state
  const getCompanionExpression = (pct: number) => {
    if (pct === 0) return { label: "Sleepy", emoji: "💤" };
    if (pct < 25) return { label: "Sleepy/Yawning", emoji: "🥱" };
    if (pct < 50) return { label: "Happy", emoji: "😊" };
    if (pct < 75) return { label: "Excited", emoji: "✨" };
    if (pct < 100) return { label: "Energetic", emoji: "🥳" };
    return { label: "Celebrating", emoji: "👑" };
  };

  const expr = getCompanionExpression(percent);

  // Set skin colors
  const getSkinColors = (skin: string, companionType: string) => {
    if (skin === "sunset") {
      return { fill: "url(#sunsetGrad)", stroke: "#be185d" };
    }
    if (skin === "cosmic") {
      return { fill: "url(#cosmicGrad)", stroke: "#4338ca" };
    }
    // Default skins by companion type
    switch (companionType) {
      case "bunny": return { fill: "url(#bunnyGrad)", stroke: "#b45309" };
      case "penguin": return { fill: "url(#penguinGrad)", stroke: "#1e293b" };
      case "cat": return { fill: "url(#catGrad)", stroke: "#ea580c" };
      case "blob": return { fill: "url(#blobGrad)", stroke: "#7c3aed" };
      case "axolotl": return { fill: "url(#axolotlGrad)", stroke: "#db2777" };
      case "drop":
      default:
        return { fill: "url(#dropGrad)", stroke: "#0369a1" };
    }
  };

  const colors = getSkinColors(skinId, type);

  // Animation values — smoother curves
  const bounceAnimation = percent >= 100 
    ? { y: [0, -14, 0], scaleY: [1, 0.9, 1.1, 1], rotate: [0, 10, -10, 0] }
    : percent >= 75
    ? { y: [0, -8, 0], scaleY: [1, 0.95, 1.05, 1] }
    : percent >= 50
    ? { y: [0, -5, 0] }
    : percent >= 25
    ? { y: [0, -2, 0] }
    : { scaleY: [1, 0.96, 1] };

  const animDuration = percent >= 75 ? 0.8 : percent >= 50 ? 1.2 : 2;

  /* ─── Whether blinking eyes should be shown ─── */
  const shouldBlink = percent >= 25 && percent < 75;

  /* ─── Whether level ring is shown ─── */
  const showLevelRing = level >= 2;
  const isRainbowLevel = level >= 5;

  return (
    <div
      className={`relative w-28 h-28 flex items-center justify-center select-none animate-float`}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-label={`${name} the ${type} — ${expr.label}`}
    >
      {/* ═══ LEVEL GLOW RING (behind everything) ═══ */}
      {showLevelRing && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-24 h-24 rounded-full animate-level-ring"
            style={{
              background: isRainbowLevel
                ? "conic-gradient(#FF92A9, #FBBF24, #34D399, #7CB9E8, #A78BFA, #FF92A9)"
                : "transparent",
              border: isRainbowLevel ? "none" : `3px solid ${getLevelRingColor(level)}`,
              boxShadow: isRainbowLevel
                ? "0 0 18px rgba(167, 139, 250, 0.5), 0 0 36px rgba(255, 146, 169, 0.3)"
                : `0 0 14px ${getLevelRingColor(level)}55, 0 0 28px ${getLevelRingColor(level)}22`,
              opacity: 0.6,
            }}
          />
        </div>
      )}

      {/* ═══ SLEEPING ZZZ PARTICLES ═══ */}
      {percent === 0 && (
        <div className="absolute -top-3 right-0 pointer-events-none z-20">
          {[0, 0.7, 1.4].map((delay, i) => (
            <span
              key={i}
              className="absolute animate-zzz text-[#4DA8CF] font-bold select-none"
              style={{
                animationDelay: `${delay}s`,
                fontSize: `${10 + i * 3}px`,
                right: `${-4 + i * 6}px`,
                top: `${2 - i * 8}px`,
              }}
            >
              Z
            </span>
          ))}
        </div>
      )}

      {/* ═══ CONFETTI CELEBRATION ═══ */}
      {percent >= 100 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {CONFETTI_PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute animate-confetti"
              style={{
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.isSquare ? "1px" : "50%",
                animationDelay: p.delay,
                animationIterationCount: "infinite",
              }}
            />
          ))}
        </div>
      )}

      {/* ═══ TAP HEART BURST ═══ */}
      <AnimatePresence>
        {tapHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.5 }}
            animate={{ opacity: 0, y: -60 + heart.y, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute z-30 pointer-events-none text-sm"
            style={{ left: "50%", top: "30%", marginLeft: `${heart.x}px` }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ═══ MAIN PET CONTAINER ═══ */}
      <motion.div
        animate={bounceAnimation}
        transition={{
          repeat: Infinity,
          duration: animDuration,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`w-22 h-22 relative flex items-center justify-center ${isTapped ? "animate-wiggle" : ""}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <defs>
            {/* Gradients */}
            <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="bunnyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="penguinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ddd6fe" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="axolotlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="cosmicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Render Body & Features based on Companion Type */}
          {type === "drop" && (
            <path 
              d="M50 15 C20 50, 15 70, 15 80 C15 90, 30 95, 50 95 C70 95, 85 90, 85 80 C85 70, 80 50, 50 15 Z" 
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="3.5"
            />
          )}

          {type === "bunny" && (
            <g>
              {/* Left Ear */}
              <path 
                d="M 32 45 C 22 15, 34 10, 38 45 Z" 
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="3.5"
              />
              <path d="M 32 45 C 26 23, 33 20, 35 45 Z" fill="#fecdd3" />
              {/* Right Ear */}
              <path 
                d="M 68 45 C 78 15, 66 10, 62 45 Z" 
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="3.5"
              />
              <path d="M 68 45 C 74 23, 67 20, 65 45 Z" fill="#fecdd3" />
              {/* Main Body */}
              <circle cx="50" cy="70" r="26" fill={colors.fill} stroke={colors.stroke} strokeWidth="3.5" />
            </g>
          )}

          {type === "penguin" && (
            <g>
              {/* Main Body */}
              <circle cx="50" cy="70" r="26" fill={colors.fill} stroke={colors.stroke} strokeWidth="3.5" />
              {/* White Belly */}
              <ellipse cx="50" cy="74" rx="16" ry="17" fill="white" />
              {/* Flippers */}
              <path d="M 24 66 C 14 62, 18 78, 24 74" fill={colors.fill} stroke={colors.stroke} strokeWidth="2.5" />
              <path d="M 76 66 C 86 62, 82 78, 76 74" fill={colors.fill} stroke={colors.stroke} strokeWidth="2.5" />
              {/* Beak */}
              <polygon points="46,65 54,65 50,72" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
            </g>
          )}

          {type === "cat" && (
            <g>
              {/* Left Ear */}
              <polygon points="26,50 20,24 40,46" fill={colors.fill} stroke={colors.stroke} strokeWidth="3.5" />
              <polygon points="28,47 24,29 37,44" fill="#fecdd3" />
              {/* Right Ear */}
              <polygon points="74,50 80,24 60,46" fill={colors.fill} stroke={colors.stroke} strokeWidth="3.5" />
              <polygon points="72,47 76,29 63,44" fill="#fecdd3" />
              {/* Main Body */}
              <circle cx="50" cy="70" r="26" fill={colors.fill} stroke={colors.stroke} strokeWidth="3.5" />
              {/* Whiskers */}
              <line x1="20" y1="70" x2="10" y2="70" stroke={colors.stroke} strokeWidth="2" />
              <line x1="20" y1="74" x2="8" y2="76" stroke={colors.stroke} strokeWidth="2" />
              <line x1="80" y1="70" x2="90" y2="70" stroke={colors.stroke} strokeWidth="2" />
              <line x1="80" y1="74" x2="92" y2="76" stroke={colors.stroke} strokeWidth="2" />
            </g>
          )}

          {type === "blob" && (
            <path 
              d="M 50 40 C 20 40, 16 92, 50 92 C 84 92, 80 40, 50 40 Z" 
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="3.5"
            />
          )}

          {type === "axolotl" && (
            <g>
              {/* Left Gills frills */}
              <path d="M 26 58 Q 12 52 18 46" fill="#fb7185" stroke="#db2777" strokeWidth="2.5" />
              <path d="M 24 68 Q 8 68 14 62" fill="#fb7185" stroke="#db2777" strokeWidth="2.5" />
              <path d="M 26 78 Q 12 84 18 76" fill="#fb7185" stroke="#db2777" strokeWidth="2.5" />
              {/* Right Gills frills */}
              <path d="M 74 58 Q 88 52 82 46" fill="#fb7185" stroke="#db2777" strokeWidth="2.5" />
              <path d="M 76 68 Q 92 68 86 62" fill="#fb7185" stroke="#db2777" strokeWidth="2.5" />
              <path d="M 74 78 Q 88 84 82 76" fill="#fb7185" stroke="#db2777" strokeWidth="2.5" />
              {/* Main Body */}
              <circle cx="50" cy="70" r="26" fill={colors.fill} stroke={colors.stroke} strokeWidth="3.5" />
            </g>
          )}

          {/* Cheeks (Blushing) */}
          {percent > 0 && (
            <>
              <circle cx="34" cy="74" r="4.5" fill="#f43f5e" opacity="0.45" />
              <circle cx="66" cy="74" r="4.5" fill="#f43f5e" opacity="0.45" />
            </>
          )}

          {/* Dynamic Expressions */}
          {percent === 0 ? (
            /* Sleepy / Asleep */
            <>
              <path d="M 28 66 Q 33 71 33 66" stroke="#0c4a6e" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 67 66 Q 67 71 72 66" stroke="#0c4a6e" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Sleep bubble */}
              <circle cx="50" cy="74" r="3.5" fill="#bae6fd" stroke="#0c4a6e" strokeWidth="1.5" />
            </>
          ) : percent < 25 ? (
            /* Sleepy / Yawning */
            <>
              <line x1="28" y1="65" x2="36" y2="68" stroke="#0c4a6e" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="64" y1="68" x2="72" y2="65" stroke="#0c4a6e" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 45 74 Q 50 78 55 74" stroke="#0c4a6e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : percent < 50 ? (
            /* Happy — with blinking eyes */
            <>
              <g className={shouldBlink ? "animate-blink" : ""}>
                <path d="M 28 64 Q 33 58 38 64" stroke="#0c4a6e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M 62 64 Q 67 58 72 64" stroke="#0c4a6e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </g>
              <path d="M 46 72 Q 50 75 54 72" stroke="#0c4a6e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : percent < 75 ? (
            /* Excited — with blinking eyes */
            <>
              <g className={shouldBlink ? "animate-blink" : ""}>
                <circle cx="33" cy="63" r="4" fill="#0c4a6e" />
                <circle cx="67" cy="63" r="4" fill="#0c4a6e" />
              </g>
              <path d="M 44 71 Q 50 80 56 71 Z" fill="#0c4a6e" />
            </>
          ) : percent < 100 ? (
            /* Sparkling / Energetic */
            <>
              <path d="M 33 56 L 35 61 L 40 63 L 35 65 L 33 70 L 31 65 L 26 63 L 31 61 Z" fill="#0c4a6e" />
              <path d="M 67 56 L 69 61 L 74 63 L 69 65 L 67 70 L 65 65 L 60 63 L 65 61 Z" fill="#0c4a6e" />
              <path d="M 43 71 Q 50 82 57 71 Z" fill="#e11d48" stroke="#0c4a6e" strokeWidth="1.5" />
            </>
          ) : (
            /* Celebrating */
            <>
              <path d="M 28 64 Q 33 58 38 64" stroke="#0c4a6e" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M 62 64 Q 67 58 72 64" stroke="#0c4a6e" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M 42 70 Q 50 83 58 70 Z" fill="#e11d48" stroke="#0c4a6e" strokeWidth="1.5" />
            </>
          )}

          {/* Accessories */}
          {/* Golden Crown (Milestone / Complete Goal) */}
          {(outfitId === "crown" || (outfitId === "none" && percent >= 100)) && (
            <path 
              d="M 35 28 L 40 12 L 50 22 L 60 12 L 65 28 Z" 
              fill="#fbbf24" 
              stroke="#d97706" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
            />
          )}

          {/* Cozy Scarf */}
          {outfitId === "scarf" && (
            <path
              d="M 28 78 Q 50 88 72 78 L 70 82 Q 50 92 30 82 Z M 60 80 L 63 94 L 54 95 L 53 82 Z M 50 82 L 48 93 L 41 91 L 43 81 Z"
              fill="#f43f5e"
              stroke="#be185d"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}

          {/* Cool Sunglasses */}
          {outfitId === "sunglasses" && (
            <g>
              <ellipse cx="36" cy="62" rx="10" ry="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
              <ellipse cx="64" cy="62" rx="10" ry="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 46 62 Q 50 59 54 62" stroke="#1e293b" strokeWidth="2.5" fill="none" />
              <ellipse cx="39" cy="60" rx="3" ry="2" fill="white" opacity="0.6" />
              <ellipse cx="67" cy="60" rx="3" ry="2" fill="white" opacity="0.6" />
            </g>
          )}

          {/* Sprout Head Accessory */}
          {outfitId === "sprouts" && (
            <g transform="translate(42, 8)">
              <path d="M 8 12 Q 10 5 13 0" stroke="#78350f" strokeWidth="2" fill="none" />
              <path d="M 8 5 Q -2 -1 2 5 Q 8 8 8 5" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
              <path d="M 9 3 Q 18 -1 15 6 Q 9 8 9 3" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            </g>
          )}
        </svg>

        {/* Aura Sparkles effect */}
        {(percent >= 100 || streakDays >= 30 || outfitId === "aura") && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {(streakDays >= 30 || outfitId === "aura") ? (
              <>
                <Sparkle className="w-5 h-5 absolute -top-3 left-4 text-amber-400 animate-bounce" style={{ animationDuration: "1.5s" }} />
                <Sparkles className="w-4 h-4 absolute -bottom-2 -left-2 text-yellow-300 animate-spin" style={{ animationDuration: "4s" }} />
                <Sparkles className="w-4 h-4 absolute top-1/2 -right-4 text-amber-300 animate-pulse" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 absolute -top-2 -left-2 text-yellow-400 animate-spin" />
                <Sparkles className="w-4 h-4 absolute -bottom-1 -right-3 text-pink-400 animate-pulse" />
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
