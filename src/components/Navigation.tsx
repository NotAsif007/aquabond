import React from "react";
import { motion } from "motion/react";
import { Droplet, LayoutDashboard, Users, MessageCircle, TrendingUp, Award, Settings } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  accentClass: string;
  unreadCount?: number;
}

// 5 core mobile bottom tabs for spacious, professional layout
const mobileNavItems = [
  { id: "home", label: "Home", icon: Droplet },
  { id: "analytics", label: "Dashboard", icon: LayoutDashboard },
  { id: "partner", label: "Partner", icon: Users },
  { id: "social", label: "Chat", icon: MessageCircle },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

// Full 7 desktop sidebar tabs
const desktopNavItems = [
  { id: "home", label: "Home", icon: Droplet },
  { id: "analytics", label: "Dashboard", icon: LayoutDashboard },
  { id: "partner", label: "Partner", icon: Users },
  { id: "social", label: "Chat", icon: MessageCircle },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "shop", label: "Shop", icon: Award },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  accentClass,
  unreadCount,
}) => {
  return (
    <>
      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM TAB BAR (Spacious & Clean)
          ═══════════════════════════════════════════ */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/60 shadow-[0_-6px_24px_rgba(0,0,0,0.06)] safe-area-pb">
        <div className="flex items-center justify-between py-1.5 px-3 max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showBadge = item.id === "social" && (unreadCount ?? 0) > 0;

            return (
              <motion.button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                whileTap={{ scale: 0.88 }}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 z-10 flex-1 ${
                  isActive ? "bg-[#FFF0F2] text-[#FF92A9]" : "text-[#8E8A9A] hover:text-[#2D283E]"
                }`}
              >
                {/* Active Indicator Glow Pill */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-[#FFF0F2] border border-[#FFF0F2]/80 shadow-3xs"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon wrapper */}
                <div className="relative z-10 mb-0.5">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? "scale-110 text-[#FF92A9]" : "text-[#8E8A9A]"
                    }`}
                    fill={isActive && item.id === "home" ? "currentColor" : "none"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Notification badge */}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-pulseDot" />
                  )}
                </div>

                <span
                  className={`relative z-10 text-[9.5px] font-extrabold tracking-tight leading-none transition-colors duration-200 ${
                    isActive ? "text-[#FF92A9]" : "text-[#8E8A9A]"
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          DESKTOP SIDEBAR
          ═══════════════════════════════════════════ */}
      <nav className="hidden sm:flex flex-col gap-1 glass-card p-3 rounded-[24px] shrink-0 w-44">
        <span className="text-[8px] font-black uppercase text-[#8E8A9A] tracking-widest px-3 mb-1 block select-none">
          Navigation
        </span>

        {desktopNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showBadge = item.id === "social" && (unreadCount ?? 0) > 0;

          return (
            <motion.button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              whileTap={{ scale: 0.92 }}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors duration-200 ${
                isActive
                  ? "text-white"
                  : "text-[#8E8A9A] hover:text-[#2D283E] hover:bg-white/40"
              }`}
            >
              {/* Sliding active background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className={`absolute inset-0 rounded-xl ${accentClass} shadow-md`}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon + label */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="relative">
                  <Icon 
                    className="w-4 h-4 shrink-0" 
                    fill={isActive && item.id === "home" ? "currentColor" : "none"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-white animate-pulseDot" />
                  )}
                </div>
                <span>{item.label}</span>
              </div>
            </motion.button>
          );
        })}
      </nav>
    </>
  );
};
