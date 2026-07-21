import React from "react";
import { motion } from "motion/react";
import { Droplet, LayoutDashboard, Users, MessageCircle, Settings } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  accentClass: string;
  unreadCount?: number;
}

// 5 core tabs for mobile & desktop
const navItems = [
  { id: "home", label: "Home", icon: Droplet },
  { id: "analytics", label: "Dashboard", icon: LayoutDashboard },
  { id: "partner", label: "Partner", icon: Users },
  { id: "social", label: "Chat", icon: MessageCircle },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  accentClass,
  unreadCount,
}) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);

  React.useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setIsKeyboardOpen(false);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const handleTabClick = (tabId: string) => {
    onChangeTab(tabId);
    if (tabId === "social") {
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Type a cozy message"]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 50);
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════
          CUTE FLOATING BUBBLE BOTTOM NAVIGATION BAR (Mobile)
          ═══════════════════════════════════════════ */}
      <nav className={`sm:hidden fixed bottom-4 inset-x-4 max-w-md mx-auto z-50 bg-white/85 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_32px_rgba(255,146,169,0.22)] border border-white/90 transition-all duration-300 ease-out ${
        isKeyboardOpen ? 'opacity-0 translate-y-16 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'
      }`}>
        <div className="flex items-center justify-between relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showBadge = item.id === "social" && (unreadCount ?? 0) > 0;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                whileTap={{ scale: 0.86 }}
                className="relative flex flex-col items-center justify-center py-2 px-3 rounded-full flex-1 z-10 transition-colors"
              >
                {/* Cute Sliding Bubble Background */}
                {isActive && (
                  <motion.div
                    layoutId="cute-bubble-pill"
                    className="absolute inset-0 rounded-full theme-bg-gradient shadow-md border border-white/50"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 28,
                    }}
                  />
                )}

                {/* Icon wrapper */}
                <div className="relative z-10 mb-0.5">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? "text-white scale-110 drop-shadow-xs" : "text-[#8E8A9A]"
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
                  className={`relative z-10 text-[9px] font-black tracking-tight leading-none transition-colors duration-200 ${
                    isActive ? "text-white" : "text-[#8E8A9A]"
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
      <nav className="hidden sm:flex flex-col gap-1.5 glass-card p-3.5 rounded-[28px] shrink-0 w-44">
        <span className="text-[8.5px] font-black uppercase text-[#8E8A9A] tracking-widest px-3 mb-1 block select-none">
          Navigation
        </span>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showBadge = item.id === "social" && (unreadCount ?? 0) > 0;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              whileTap={{ scale: 0.92 }}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-colors duration-200 ${
                isActive
                  ? "text-white"
                  : "text-[#8E8A9A] hover:text-[#2D283E] hover:bg-white/40"
              }`}
            >
              {/* Sliding active background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className={`absolute inset-0 rounded-2xl ${accentClass} shadow-md border border-white/20`}
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
                    className="w-4.5 h-4.5 shrink-0" 
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
