import React from "react";
import { motion } from "motion/react";
import { Droplet, LayoutDashboard, Users, MessageCircle, TrendingUp, Award, Settings } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  accentClass: string;
  unreadCount?: number;
}

const navItems = [
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
          MOBILE BOTTOM TAB BAR
          ═══════════════════════════════════════════ */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-white/60 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] safe-area-pb">
        <div className="flex items-center justify-around py-1 px-0.5 relative max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showBadge = item.id === "social" && (unreadCount ?? 0) > 0;

            return (
              <motion.button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                whileTap={{ scale: 0.8 }}
                className="relative flex flex-col items-center gap-0.5 py-1 px-1 z-10 min-w-[42px]"
              >
                {/* Sliding indicator pill */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-1 bg-gradient-to-r from-[#FF92A9] to-[#FAD0C4] rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon wrapper */}
                <div className="relative">
                  <Icon
                    className={`w-4.5 h-4.5 transition-all duration-200 ${
                      isActive ? "text-[#FF92A9] scale-110" : "text-[#8E8A9A]"
                    }`}
                    fill={isActive && item.id === "home" ? "currentColor" : "none"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Notification badge */}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white animate-pulseDot" />
                  )}
                </div>

                <span
                  className={`text-[8px] font-bold tracking-wide uppercase leading-none transition-colors duration-200 ${
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

        {navItems.map((item) => {
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
