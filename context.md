# AquaBond Handover Context

This file documents the architecture, file layout, features, and database schemas of the AquaBond couple's hydration tracker. It serves as a guide for any developer or AI assistant continuing this project.

---

## 1. Project Overview & Tech Stack
AquaBond is a responsive couple's hydration tracker built using:
- **Frontend:** React 19, TypeScript, TailwindCSS v4, Lucide Icons, and Framer Motion (`motion/react`).
- **Backend Sync:** Supabase (Auth, Postgres database, Realtime subscription engine) with cozy offline fallback (localStorage demo mode).
- **Mobile Wrapper:** Capacitor JS (configured with native Android and iOS folders).
- **APIs:** GPS-based keyless Open-Meteo REST service for adaptive weather adjustments.
- **Audio:** Web Audio API sound synthesizer (`playPlop`, `playHeartBurstSound`, `playLevelUpSound`).
- **Notifications:** Capacitor Local Notifications (mobile native) and Web Notification API (browsers) — FCM alternative.

---

## 2. Directory Layout & Key Modules
```
c:/Users/ASUS/Downloads/AquaBond-Spec-Center/
├── SPEC.md                   # Full product specification
├── context.md                # [THIS FILE] Project handover summary
├── capacitor.config.ts       # Capacitor native app setup (com.aquabond.app)
├── android/                  # Native Android Studio workspace
├── ios/                      # Native Xcode workspace (supports iOS compilation)
├── dist/                     # Compiled production assets (680KB JS, 62KB CSS)
└── src/
    ├── main.tsx              # Root React bootstrapper
    ├── App.tsx               # Main layout, page transitions (AnimatePresence), ambient particles, theme system
    ├── index.css             # Animation library (20+ keyframes), glassmorphism tokens, scrollbar styling
    ├── context/
    │   └── AppContext.tsx    # State provider (Auth, drink logs, streaks, pokes, messaging, real-time syncing)
    ├── lib/
    │   ├── supabaseClient.ts # Supabase client configurations
    │   ├── notifications.ts  # Cross-platform alerts (Capacitor Local Notifications + Web Notifications API)
    │   ├── audio.ts          # Chimes and drop plops Web Audio synthesizer
    │   └── weather.ts        # Open-Meteo GPS calculator
    └── components/
        ├── Header.tsx        # Glass header (profile avatar, streak pill, sign-out, animated gradient bar)
        ├── Navigation.tsx    # Bottom nav (mobile) + sidebar (desktop) with sliding layoutId indicators, badge dots
        ├── CompanionAvatar.tsx# 6 SVG pets with tap interaction, blinking, ZZZ sleep, confetti, level glow ring
        ├── DashboardTab.tsx  # Clean Home view: greeting, pet companion & interactive water bottle, quick sip logs
        ├── DashboardAnalyticsTab.tsx # Dedicated Dashboard tab: HydrationWidget, stats overview cards, weather advice box
        ├── HydrationWidget.tsx# Circular SVG progress ring, time-since-last-drink, pace indicator
        ├── QuickAddFAB.tsx   # Floating quick-add button (radial menu offset up/left to prevent edge cutoff)
        ├── PartnerTab.tsx    # Partner bottle, fixed sip button, 16-particle nudge burst, pink flash overlay
        ├── SocialTab.tsx     # Chat messaging UI (bubbles, sticker panel, pokes, date grouping)
        ├── ProgressTab.tsx   # Standalone weekly progress page (heatmap, badges, dual charts, counters)
        ├── ThemesTab.tsx     # Companion Shop, real-time avatar preview, level progress bar, color themes
        ├── StatsTab.tsx      # SVG weekly comparative dual-charts (used inside ProgressTab)
        ├── SettingsTab.tsx   # Profile card, presets, base goals, Quiet Hours, GPS, DB config
        ├── AuthScreen.tsx    # Supabase sign-in/sign-up flow
        └── SupabaseConfigModal.tsx # Database credentials configuration modal
```

---

## 3. CSS Animation System (index.css)
The app uses a comprehensive animation library with 20+ keyframes:

| Animation Class | Purpose |
|---|---|
| `animate-wave-slow/fast` | Water wave fill motion |
| `animate-float` / `animate-float-slow` | Gentle hover for pets & ambient particles |
| `animate-shimmer` | Glass bottle shimmer sweep |
| `animate-fadeInUp` / `animate-fadeInScale` | Staggered card entry transitions |
| `animate-glow` / `animate-glow-pink` | Pulsing glow ring on bottles (≥75%) |
| `animate-confetti` | Falling celebration particles |
| `animate-heartPop` | Scale-bounce for heart emojis |
| `animate-wiggle` | Shake/wobble for nudge vibration |
| `animate-blink` | SVG eye blinking (every 3.5s) |
| `animate-zzz` | Floating Z letters for sleeping pet |
| `animate-bubble` | Rising bubbles inside water fill |
| `animate-pulseDot` | Online status indicator pulse |
| `animate-typing-dot-1/2/3` | Chat typing indicator dots |
| `animate-nudge-flash` | Full-screen pink flash on nudge |
| `animate-level-ring` | Behind-pet glow ring pulse |
| `glass-card` | Standard glassmorphism card |
| `glass-card-elevated` | Elevated glassmorphism card |
| `glass-bottle` | Bottle container styling |
| `btn-press` | Button press tactile feedback |
| `scrollbar-thin` | Custom scrollbar styling |

---

## 4. Core Features

### 💧 Responsive Viewport Layout
- Full-screen responsive web app (no phone frame mock-up)
- **Mobile:** Bottom tab bar + scrollable cards + header
- **Desktop:** Left sidebar navigation + main content panel + full-width header
- **Page Transitions:** AnimatePresence crossfade/slide between tabs

### 🐰 Interactive Pet Companion System
- 6 companion types: drop, bunny, penguin, cat, blob, axolotl
- **Expressions:** Sleepy (0%) → Yawning (<25%) → Happy (<50%) → Excited (<75%) → Energetic (<100%) → Celebrating (100%)
- **Animations:** Idle float, tap wiggle + heart burst, eye blink, sleeping ZZZ, confetti celebration, level glow ring
- **Accessories:** Crown, scarf, sunglasses, sprout — equipped via shop
- **Level glow colors:** L2=blue, L3=green, L4=gold, L5=purple, L5+=rainbow

### 💖 Partner Nudge System
- Fixed "Partner Sip" button (no page reload, optimistic UI update)
- 16-particle heart burst animation from companion
- Full-screen pink flash overlay on nudge
- Partner's companion does `animate-wiggle` on poke receive

### 💬 Real Messaging / Chat
- Full chat UI with left/right aligned bubbles
- User messages = pink gradient bubbles (right), partner = white glass bubbles (left)
- Pokes/reactions = centered animated emoji + label
- Day-grouped timestamps (Today, Yesterday, dates)
- Typing indicator (3 animated dots)
- Quick emoji reactions bar (❤️ ✨ 💧)
- Auto-scroll to newest message
- Demo mode auto-replies from partner (2-4s delay)
- `sendMessage(text)` context method for real text chat
- `sendPoke(type)` for preset reactions

### 🎨 Theme System
5 color palettes: Sakura (pink), Blue, Lavender, Mint, Peach — each controlling gradient backgrounds, accent colors, and badge styling.

### 🔔 Notification System (FCM Alternative)
- **Mobile:** Capacitor Local Notifications (no FCM dependency)
- **Web:** Browser Web Notification API
- Instant alerts for partner nudges and messages
- Scheduled hydration reminders
- Quiet Hours / DND window support

---

## 5. AppContext API (key methods)

| Method | Description |
|---|---|
| `logDrink(ml, type)` | Log user's water intake |
| `logPartnerDrink(ml, type)` | Log drink for partner (functional state update) |
| `sendPoke(type, content?)` | Send heart/sparkle/nudge reaction |
| `sendMessage(text)` | Send text chat message (with demo auto-reply) |
| `linkPartner(code)` | Connect to partner via UUID |
| `unlinkPartner()` | Disconnect from partner |
| `resetIntake()` | Reset today's logs |
| `updateProfileTheme(theme)` | Change color palette |
| `equipCompanionItem(type, id)` | Equip skin/outfit |
| `buyCompanionItem(type, id, xp)` | Purchase with XP |
| `toggleWeatherGoal(enabled)` | Enable GPS weather adjustments |
| `setDndSettings(enabled, start, end)` | Configure quiet hours |

---

## 6. Build & Run

```bash
# Development server
npm run dev          # → http://localhost:3000

# Production build
npm run build        # → dist/ folder

# Type checking
npm run lint         # → tsc --noEmit

# Mobile (Capacitor)
npx cap sync         # Sync web assets to native projects
npx cap open android # Open in Android Studio
npx cap open ios     # Open in Xcode
```

---

## 7. Supabase SQL Schema
Required tables (create via Supabase Dashboard SQL editor):

```sql
-- profiles: User accounts and settings
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  partner_id UUID REFERENCES profiles(id),
  couple_id UUID,
  daily_goal_ml INT DEFAULT 2000,
  unit TEXT DEFAULT 'ml',
  timezone TEXT DEFAULT 'UTC',
  weather_goal_enabled BOOLEAN DEFAULT false,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  companion_type TEXT DEFAULT 'drop',
  companion_name TEXT DEFAULT 'Droplet',
  color_theme TEXT DEFAULT 'sakura',
  skin_id TEXT DEFAULT 'default',
  outfit_id TEXT DEFAULT 'none',
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_drank_at TIMESTAMPTZ,
  unlocked_skins TEXT[] DEFAULT ARRAY['default'],
  unlocked_outfits TEXT[] DEFAULT ARRAY['none'],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- couples: Partner bonds
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID REFERENCES profiles(id) NOT NULL,
  user_b_id UUID REFERENCES profiles(id) NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT now(),
  couple_streak INT DEFAULT 0,
  total_volume_drank_ml INT DEFAULT 0,
  days_goal_met_together INT DEFAULT 0,
  active_challenge_id UUID
);

-- water_logs: Drink intake entries
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount_ml INT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  measurement_unit TEXT DEFAULT 'ml',
  source_device TEXT DEFAULT 'web',
  cup_type TEXT DEFAULT 'cup'
);

-- couple_messages: Chat and poke messages
CREATE TABLE couple_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'heart', 'sparkle', 'nudge', 'custom_cheer'
  content TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Known Issues & Future Work
- JS bundle is 680KB (consider code-splitting with dynamic imports)
- Capacitor platforms need `npx cap sync` after each build
- Real-time Supabase subscriptions need RLS policies configured
- Weather API calls are rate-limited to every 30 minutes
- For production: add proper error boundaries, retry logic, and offline queue
