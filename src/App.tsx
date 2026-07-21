import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthScreen } from "./components/AuthScreen";
import { SupabaseConfigModal } from "./components/SupabaseConfigModal";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { DashboardTab } from "./components/DashboardTab";
import { DashboardAnalyticsTab } from "./components/DashboardAnalyticsTab";
import { PartnerTab } from "./components/PartnerTab";
import { ProgressTab } from "./components/ProgressTab";
import { SocialTab } from "./components/SocialTab";
import { ThemesTab } from "./components/ThemesTab";
import { SettingsTab } from "./components/SettingsTab";
import { OnboardingModal } from "./components/OnboardingModal";
import { Droplet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CozyPalette {
  primaryBg: string;
  bgGradient: string;
  primaryText: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
}

const COZY_THEMES: Record<string, CozyPalette> = {
  sakura: {
    primaryBg: "bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4]",
    bgGradient: "from-[#FDF8F5] via-[#FFF5F6] to-[#FFF0F2]",
    primaryText: "text-[#FF92A9]",
    accentBg: "bg-[#FFF0F2]",
    badgeBg: "bg-[#FFF0F2]",
    badgeText: "text-[#FF92A9]"
  },
  blue: {
    primaryBg: "bg-gradient-to-tr from-[#7CB9E8] to-[#4DA8CF]",
    bgGradient: "from-[#F5F9FC] via-[#EBF5FC] to-[#E6F3FF]",
    primaryText: "text-[#4DA8CF]",
    accentBg: "bg-[#E6F3FF]",
    badgeBg: "bg-[#E6F3FF]",
    badgeText: "text-[#4DA8CF]"
  },
  lavender: {
    primaryBg: "bg-gradient-to-tr from-[#A78BFA] to-[#C084FC]",
    bgGradient: "from-[#F8F5FF] via-[#F5F3FF] to-[#FAF5FF]",
    primaryText: "text-[#8B5CF6]",
    accentBg: "bg-[#F3E8FF]",
    badgeBg: "bg-[#F3E8FF]",
    badgeText: "text-[#8B5CF6]"
  },
  mint: {
    primaryBg: "bg-gradient-to-tr from-[#34D399] to-[#6EE7B7]",
    bgGradient: "from-[#F5FDFB] via-[#ECFDF5] to-[#F0FDF4]",
    primaryText: "text-[#059669]",
    accentBg: "bg-[#ECFDF5]",
    badgeBg: "bg-[#ECFDF5]",
    badgeText: "text-[#059669]"
  },
  peach: {
    primaryBg: "bg-gradient-to-tr from-[#FDBA74] to-[#FCA5A5]",
    bgGradient: "from-[#FFFAF5] via-[#FFF7ED] to-[#FFEDD5]",
    primaryText: "text-[#EA580C]",
    accentBg: "bg-[#FFF7ED]",
    badgeBg: "bg-[#FFF7ED]",
    badgeText: "text-[#EA580C]"
  }
};

const NAV_TABS = ["home", "analytics", "partner", "social", "settings"];

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.99 }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.22, 1, 0.36, 1],
  duration: 0.3
};

function AquaBondApp() {
  const { supabaseMode, profile, loading, messages } = useApp();
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);

  // Swipe gesture detection states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = NAV_TABS.indexOf(activeTab);
    if (isLeftSwipe && currentIndex < NAV_TABS.length - 1) {
      setActiveTab(NAV_TABS[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      setActiveTab(NAV_TABS[currentIndex - 1]);
    }
  };

  // Count unread messages
  const unreadCount = messages.filter(m => {
    if (!profile) return false;
    if (m.sender_id === profile.id) return false;
    const age = Date.now() - new Date(m.timestamp).getTime();
    return age < 5 * 60 * 1000;
  }).length;

  const activeThemeId = profile?.color_theme || "sakura";
  const palette = COZY_THEMES[activeThemeId] || COZY_THEMES.sakura;
  const needsOnboarding = Boolean(profile && (!profile.display_name || profile.display_name === "User" || profile.display_name === "Google User" || !profile.companion_name));

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeThemeId);
  }, [activeThemeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#FFF5F6] via-[#FFFDFB] to-[#E6F3FF] gap-3 relative">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.4, 
              ease: "easeInOut" 
            }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF92A9] to-[#FAD0C4] flex items-center justify-center shadow-lg border border-white/50 relative z-10"
          >
            <Droplet className="w-7 h-7 text-white" />
          </motion.div>

          <motion.div
            animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-2xl border-2 border-[#FF92A9]"
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-extrabold text-[#2D283E] tracking-wide">AquaBond</span>
          <span className="text-[10px] font-semibold text-[#8E8A9A] animate-pulse">Waking up companion...</span>
        </div>
      </div>
    );
  }

  // Auth check
  if (supabaseMode && !profile) {
    return (
      <>
        <AuthScreen onOpenDbConfig={() => setIsDbModalOpen(true)} />
        <SupabaseConfigModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      </>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "home": return <DashboardTab />;
      case "analytics": return <DashboardAnalyticsTab />;
      case "partner": return <PartnerTab />;
      case "social": return <SocialTab />;
      case "settings": return <SettingsTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-gradient-to-tr ${palette.bgGradient} transition-all duration-1000 ease-out pt-3 sm:py-6 px-3 sm:px-8 pb-20 sm:pb-6 font-sans antialiased text-[#4A4458] relative`}>
      <div className="max-w-7xl w-full mx-auto space-y-3 sm:space-y-6 relative z-10 flex-1 flex flex-col">
        
        {/* Header */}
        <Header />

        {/* Layout Grid */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-stretch flex-1">
          
          {/* Navigation */}
          <Navigation 
            activeTab={activeTab} 
            onChangeTab={setActiveTab} 
            accentClass={palette.primaryBg}
            unreadCount={unreadCount}
          />

          {/* Main Content with touch swipe gestures and page transitions */}
          <main 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex-1 w-full glass-card-elevated rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 min-h-[calc(100vh-160px)] flex flex-col justify-between relative overflow-hidden select-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="flex-1 flex flex-col h-full w-full justify-between"
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {needsOnboarding && <OnboardingModal />}
      <SupabaseConfigModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AquaBondApp />
    </AppProvider>
  );
}
