import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getSupabase, 
  isSupabaseConfigured, 
  getSupabaseCredentials, 
  updateSupabaseConfig 
} from "../lib/supabaseClient";
import { fetchWeather, calculateHydrationAdjust, getWeatherReason } from "../lib/weather";
import { playPlop, playHeartBurstSound, playLevelUpSound } from "../lib/audio";
import { showImmediateNotification } from "../lib/notifications";

// --- Types & Interfaces ---
export interface Profile {
  id: string;
  display_name: string;
  email: string | null;
  partner_id: string | null;
  couple_id: string | null;
  daily_goal_ml: number;
  unit: 'ml' | 'oz';
  timezone: string;
  weather_goal_enabled: boolean;
  latitude: number | null;
  longitude: number | null;
  companion_type: 'drop' | 'bunny' | 'penguin' | 'cat' | 'blob' | 'axolotl';
  companion_name: string;
  color_theme: 'sakura' | 'mint' | 'blue' | 'lavender' | 'pink' | 'peach';
  skin_id: string;
  outfit_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_drank_at: string | null;
  unlocked_skins: string[];
  unlocked_outfits: string[];
}

export interface Couple {
  id: string;
  user_a_id: string;
  user_b_id: string;
  connected_at: string;
  couple_streak: number;
  total_volume_drank_ml: number;
  days_goal_met_together: number;
  active_challenge_id: string | null;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  timestamp: string;
  measurement_unit: 'ml' | 'oz';
  source_device: 'android' | 'ios' | 'widget' | 'web';
  cup_type: 'cup' | 'glass' | 'bottle' | 'custom';
}

export interface CoupleMessage {
  id: string;
  couple_id: string;
  sender_id: string;
  type: 'nudge' | 'sparkle' | 'heart' | 'custom_cheer';
  content: string | null;
  timestamp: string;
}

interface FlyingHeart {
  id: number;
  left: number;
}

interface AppContextType {
  // Config & Mode
  supabaseMode: boolean;
  supabaseConfig: { url: string; anonKey: string };
  saveSupabaseCredentials: (url: string, key: string) => boolean;
  clearSupabaseCredentials: () => void;
  
  // Auth
  profile: Profile | null;
  partnerProfile: Profile | null;
  couple: Couple | null;
  loading: boolean;
  authError: string | null;
  signUp: (email: string, password: string, displayName: string, companionType: string, companionName: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  
  // Drink Operations
  logs: WaterLog[];
  partnerLogs: WaterLog[];
  allLogsLast7Days: WaterLog[];
  logDrink: (amountMl: number, cupType: 'cup' | 'glass' | 'bottle' | 'custom') => Promise<void>;
  logPartnerDrink: (amountMl: number, cupType: 'cup' | 'glass' | 'bottle' | 'custom') => Promise<void>;
  deleteDrink: (logId: string) => Promise<void>;
  resetIntake: () => Promise<void>;
  
  // Social & Pokes
  messages: CoupleMessage[];
  sendPoke: (type: 'nudge' | 'sparkle' | 'heart' | 'custom_cheer', content?: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  linkPartner: (partnerInviteCode: string) => Promise<boolean>;
  unlinkPartner: () => Promise<void>;
  
  // Weather
  weatherEnabled: boolean;
  temperature: number;
  humidity: number;
  weatherAdjust: number;
  weatherReason: string;
  toggleWeatherGoal: (enabled: boolean) => Promise<void>;
  updateCoordinates: (lat: number, lon: number) => Promise<void>;
  
  // DND / Settings
  dndEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  setDndSettings: (enabled: boolean, start: string, end: string) => void;
  isDndActiveNow: () => boolean;
  
  // Customization
  updateProfileTheme: (theme: Profile['color_theme']) => Promise<void>;
  equipCompanionItem: (type: 'skin' | 'outfit', itemId: string) => Promise<void>;
  buyCompanionItem: (type: 'skin' | 'outfit', itemId: string, xpCost: number) => Promise<void>;
  
  // UI triggers
  flyingHearts: FlyingHeart[];
  triggerLocalFlyingHeart: () => void;
  isPartnerVibrating: boolean;
  setIsPartnerVibrating: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Local Storage Helpers for Demo Mode ---
const MOCK_USER_ID = "mock-user-123";
const MOCK_PARTNER_ID = "mock-partner-456";
const MOCK_COUPLE_ID = "mock-couple-789";

const INITIAL_MOCK_PROFILE: Profile = {
  id: MOCK_USER_ID,
  display_name: "Alex",
  email: "alex@cozy.com",
  partner_id: MOCK_PARTNER_ID,
  couple_id: MOCK_COUPLE_ID,
  daily_goal_ml: 2000,
  unit: 'ml',
  timezone: 'UTC',
  weather_goal_enabled: true,
  latitude: 37.7749,
  longitude: -122.4194,
  companion_type: 'drop',
  companion_name: "Boba",
  color_theme: 'sakura',
  skin_id: 'default',
  outfit_id: 'none',
  xp: 650,
  level: 3,
  current_streak: 12,
  longest_streak: 18,
  last_drank_at: new Date().toISOString(),
  unlocked_skins: ['default', 'sunset'],
  unlocked_outfits: ['none', 'scarf', 'sunglasses']
};

const INITIAL_MOCK_PARTNER: Profile = {
  id: MOCK_PARTNER_ID,
  display_name: "Lina",
  email: "lina@cozy.com",
  partner_id: MOCK_USER_ID,
  couple_id: MOCK_COUPLE_ID,
  daily_goal_ml: 2000,
  unit: 'ml',
  timezone: 'UTC',
  weather_goal_enabled: false,
  latitude: null,
  longitude: null,
  companion_type: 'bunny',
  companion_name: "Mocha",
  color_theme: 'mint',
  skin_id: 'default',
  outfit_id: 'none',
  xp: 800,
  level: 3,
  current_streak: 14,
  longest_streak: 20,
  last_drank_at: new Date().toISOString(),
  unlocked_skins: ['default'],
  unlocked_outfits: ['none']
};

const INITIAL_MOCK_COUPLE: Couple = {
  id: MOCK_COUPLE_ID,
  user_a_id: MOCK_USER_ID,
  user_b_id: MOCK_PARTNER_ID,
  connected_at: new Date().toISOString(),
  couple_streak: 12,
  total_volume_drank_ml: 45200,
  days_goal_met_together: 10,
  active_challenge_id: null
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- States ---
  const [supabaseMode, setSupabaseMode] = useState<boolean>(isSupabaseConfigured());
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseCredentials());
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [partnerLogs, setPartnerLogs] = useState<WaterLog[]>([]);
  const [allLogsLast7Days, setAllLogsLast7Days] = useState<WaterLog[]>([]);
  const [messages, setMessages] = useState<CoupleMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Geolocation & Weather
  const [temperature, setTemperature] = useState<number>(24);
  const [humidity, setHumidity] = useState<number>(55);
  const [weatherAdjust, setWeatherAdjust] = useState<number>(0);
  const [weatherReason, setWeatherReason] = useState<string>("");
  const [weatherEnabled, setWeatherEnabled] = useState<boolean>(false);
  
  // DND & Settings
  const [dndEnabled, setDndEnabled] = useState<boolean>(() => {
    return localStorage.getItem("aquabond_dnd_enabled") !== "false";
  });
  const [quietStart, setQuietStart] = useState<string>(() => {
    return localStorage.getItem("aquabond_quiet_start") || "22:00";
  });
  const [quietEnd, setQuietEnd] = useState<string>(() => {
    return localStorage.getItem("aquabond_quiet_end") || "08:00";
  });
  
  // UI triggers
  const [flyingHearts, setFlyingHearts] = useState<FlyingHeart[]>([]);
  const [isPartnerVibrating, setIsPartnerVibrating] = useState<boolean>(false);

  // --- Dynamic Loader ---
  useEffect(() => {
    if (supabaseMode) {
      loadSupabaseData();
    } else {
      loadDemoData();
    }
  }, [supabaseMode]);

  // --- Geolocation & Weather Fetcher ---
  useEffect(() => {
    const fetchLocalWeather = async () => {
      const companionName = profile ? profile.companion_name : "Boba";
      if (!weatherEnabled) {
        setWeatherAdjust(0);
        setWeatherReason("");
        return;
      }
      
      let lat = 37.7749;
      let lon = -122.4194;
      
      if (profile?.latitude && profile?.longitude) {
        lat = profile.latitude;
        lon = profile.longitude;
      } else {
        // Fallback or request browser geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const newLat = pos.coords.latitude;
              const newLon = pos.coords.longitude;
              if (supabaseMode && profile) {
                const supabase = getSupabase();
                if (supabase) {
                  await supabase.from("profiles").update({ latitude: newLat, longitude: newLon }).eq("id", profile.id);
                  setProfile(prev => prev ? { ...prev, latitude: newLat, longitude: newLon } : null);
                }
              }
              const w = await fetchWeather(newLat, newLon);
              setTemperature(w.temp);
              setHumidity(w.humidity);
              const adj = calculateHydrationAdjust(w.temp, w.humidity);
              setWeatherAdjust(adj);
              setWeatherReason(getWeatherReason(w.temp, w.humidity, companionName));
            },
            async () => {
              // Geolocation denied, load fallback SF weather
              const w = await fetchWeather(lat, lon);
              setTemperature(w.temp);
              setHumidity(w.humidity);
              const adj = calculateHydrationAdjust(w.temp, w.humidity);
              setWeatherAdjust(adj);
              setWeatherReason(getWeatherReason(w.temp, w.humidity, companionName));
            }
          );
          return;
        }
      }
      
      const w = await fetchWeather(lat, lon);
      setTemperature(w.temp);
      setHumidity(w.humidity);
      const adj = calculateHydrationAdjust(w.temp, w.humidity);
      setWeatherAdjust(adj);
      setWeatherReason(getWeatherReason(w.temp, w.humidity, companionName));
    };

    fetchLocalWeather();
  }, [weatherEnabled, profile?.latitude, profile?.longitude, profile?.companion_name]);

  // --- Real-time Synchronizer for Supabase ---
  useEffect(() => {
    if (!supabaseMode || !profile || !profile.couple_id) return;
    
    const supabase = getSupabase();
    if (!supabase) return;
    
    const coupleId = profile.couple_id;
    const partnerId = profile.partner_id;

    // Realtime channel subscriptions
    const logsSubscription = supabase
      .channel("water-logs-sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "water_logs"
        },
        (payload) => {
          // Refresh logs
          fetchTodayLogs(profile.id, partnerId);
          fetchLast7DaysLogs(profile.id, partnerId);
        }
      )
      .subscribe();

    const profileSubscription = supabase
      .channel("profiles-sync")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles"
        },
        (payload) => {
          const updatedProfile = payload.new as Profile;
          if (updatedProfile.id === profile.id) {
            setProfile(updatedProfile);
          } else if (updatedProfile.id === partnerId) {
            setPartnerProfile(updatedProfile);
          }
        }
      )
      .subscribe();

    const coupleSubscription = supabase
      .channel("couples-sync")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "couples",
          filter: `id=eq.${coupleId}`
        },
        (payload) => {
          setCouple(payload.new as Couple);
        }
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel("messages-sync")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "couple_messages",
          filter: `couple_id=eq.${coupleId}`
        },
        (payload) => {
          const msg = payload.new as CoupleMessage;
          setMessages(prev => [msg, ...prev].slice(0, 30));

          // Trigger local nudge alerts/vibrations if sender is partner
          if (msg.sender_id === partnerId) {
            // Trigger push/local notifications as FCM alternative
            const alertText = msg.type === "heart" 
              ? "sent you a loving heart nudge! ❤️" 
              : msg.type === "sparkle" 
              ? "showered you with sparkles! ✨" 
              : msg.type === "nudge"
              ? "poked you to remind drinking water! 💧"
              : `: "${msg.content || ""}" 💬`;

            showImmediateNotification(
              "AquaBond Nudge!", 
              `${partnerProfile ? partnerProfile.display_name : "Your partner"} ${alertText}`
            );

            if (!isDndActiveNow()) {
              // Trigger heart float animation
              if (msg.type === "heart" || msg.type === "sparkle") {
                triggerLocalFlyingHeart();
                playHeartBurstSound();
                setIsPartnerVibrating(true);
                setTimeout(() => setIsPartnerVibrating(false), 350);
              } else {
                playPlop();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logsSubscription);
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(coupleSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [supabaseMode, profile?.id, profile?.couple_id, profile?.partner_id]);

  // --- Loader: Supabase Mode ---
  const loadSupabaseData = async () => {
    setLoading(true);
    setAuthError(null);
    const supabase = getSupabase();
    
    if (!supabase) {
      setSupabaseMode(false);
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: userProfile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileErr || !userProfile) {
        // If profile doesn't exist yet but user is authenticated (should be handled on sign up)
        setProfile(null);
        setLoading(false);
        return;
      }

      const prof = userProfile as Profile;
      setProfile(prof);
      setWeatherEnabled(prof.weather_goal_enabled);

      if (prof.partner_id) {
        // Fetch partner profile
        const { data: partProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", prof.partner_id)
          .single();
        setPartnerProfile(partProfile as Profile);
      } else {
        setPartnerProfile(null);
      }

      if (prof.couple_id) {
        // Fetch couple record
        const { data: coupleRec } = await supabase
          .from("couples")
          .select("*")
          .eq("id", prof.couple_id)
          .single();
        setCouple(coupleRec as Couple);

        // Fetch messages
        const { data: msgs } = await supabase
          .from("couple_messages")
          .select("*")
          .eq("couple_id", prof.couple_id)
          .order("timestamp", { ascending: false })
          .limit(30);
        setMessages((msgs as CoupleMessage[]) || []);
      } else {
        setCouple(null);
        setMessages([]);
      }

      // Fetch today's logs & last 7 days
      await fetchTodayLogs(prof.id, prof.partner_id);
      await fetchLast7DaysLogs(prof.id, prof.partner_id);

    } catch (err: any) {
      console.error("Error loading Supabase data:", err);
      setAuthError(err.message || "Failed to load database content");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLogs = async (myId: string, partnerId: string | null) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayStr = startOfToday.toISOString();

    // User logs
    const { data: myTodayLogs } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", myId)
      .gte("timestamp", startOfTodayStr);
    
    setLogs((myTodayLogs as WaterLog[]) || []);

    // Partner logs
    if (partnerId) {
      const { data: partTodayLogs } = await supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", partnerId)
        .gte("timestamp", startOfTodayStr);
      setPartnerLogs((partTodayLogs as WaterLog[]) || []);
    } else {
      setPartnerLogs([]);
    }
  };

  const fetchLast7DaysLogs = async (myId: string, partnerId: string | null) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const userIds = [myId];
    if (partnerId) userIds.push(partnerId);

    const { data: pastLogs } = await supabase
      .from("water_logs")
      .select("*")
      .in("user_id", userIds)
      .gte("timestamp", sevenDaysAgoStr);

    setAllLogsLast7Days((pastLogs as WaterLog[]) || []);
  };

  // --- Loader: Demo Mode ---
  const loadDemoData = () => {
    setLoading(true);
    setAuthError(null);

    // Retrieve from localStorage or set default
    const storedProfile = localStorage.getItem("aquabond_demo_profile");
    const storedPartner = localStorage.getItem("aquabond_demo_partner");
    const storedCouple = localStorage.getItem("aquabond_demo_couple");
    const storedLogs = localStorage.getItem("aquabond_demo_logs");
    const storedPartnerLogs = localStorage.getItem("aquabond_demo_partner_logs");
    const storedMessages = localStorage.getItem("aquabond_demo_messages");

    if (storedProfile) {
      const prof = JSON.parse(storedProfile) as Profile;
      setProfile(prof);
      setWeatherEnabled(prof.weather_goal_enabled);
    } else {
      setProfile(INITIAL_MOCK_PROFILE);
      setWeatherEnabled(INITIAL_MOCK_PROFILE.weather_goal_enabled);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(INITIAL_MOCK_PROFILE));
    }

    if (storedPartner) {
      setPartnerProfile(JSON.parse(storedPartner));
    } else {
      setPartnerProfile(INITIAL_MOCK_PARTNER);
      localStorage.setItem("aquabond_demo_partner", JSON.stringify(INITIAL_MOCK_PARTNER));
    }

    if (storedCouple) {
      setCouple(JSON.parse(storedCouple));
    } else {
      setCouple(INITIAL_MOCK_COUPLE);
      localStorage.setItem("aquabond_demo_couple", JSON.stringify(INITIAL_MOCK_COUPLE));
    }

    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      // Setup some default drinks for today in demo mode
      const initialLogs: WaterLog[] = [
        {
          id: "log-1",
          user_id: MOCK_USER_ID,
          amount_ml: 250,
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          measurement_unit: 'ml',
          source_device: 'web',
          cup_type: 'cup'
        },
        {
          id: "log-2",
          user_id: MOCK_USER_ID,
          amount_ml: 500,
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          measurement_unit: 'ml',
          source_device: 'web',
          cup_type: 'bottle'
        }
      ];
      setLogs(initialLogs);
      localStorage.setItem("aquabond_demo_logs", JSON.stringify(initialLogs));
    }

    if (storedPartnerLogs) {
      setPartnerLogs(JSON.parse(storedPartnerLogs));
    } else {
      const initialPartnerLogs: WaterLog[] = [
        {
          id: "log-p1",
          user_id: MOCK_PARTNER_ID,
          amount_ml: 250,
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          measurement_unit: 'ml',
          source_device: 'web',
          cup_type: 'cup'
        },
        {
          id: "log-p2",
          user_id: MOCK_PARTNER_ID,
          amount_ml: 500,
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          measurement_unit: 'ml',
          source_device: 'web',
          cup_type: 'bottle'
        }
      ];
      setPartnerLogs(initialPartnerLogs);
      localStorage.setItem("aquabond_demo_partner_logs", JSON.stringify(initialPartnerLogs));
    }

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      const initialMsgs: CoupleMessage[] = [
        {
          id: "msg-1",
          couple_id: MOCK_COUPLE_ID,
          sender_id: MOCK_PARTNER_ID,
          type: 'custom_cheer',
          content: "Remember to take a sip! ❤️",
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          id: "msg-2",
          couple_id: MOCK_COUPLE_ID,
          sender_id: MOCK_USER_ID,
          type: 'heart',
          content: null,
          timestamp: new Date(Date.now() - 3600000 * 3.1).toISOString()
        }
      ];
      setMessages(initialMsgs);
      localStorage.setItem("aquabond_demo_messages", JSON.stringify(initialMsgs));
    }

    // Populate fake logs last 7 days for the demo graph
    const initialLast7Days: WaterLog[] = [];
    const idList = [MOCK_USER_ID, MOCK_PARTNER_ID];
    
    // Add logs for last 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // User logs for past days
      initialLast7Days.push({
        id: `prev-user-${i}`,
        user_id: MOCK_USER_ID,
        amount_ml: 1200 + Math.floor(Math.random() * 1200),
        timestamp: date.toISOString(),
        measurement_unit: 'ml',
        source_device: 'web',
        cup_type: 'bottle'
      });

      // Partner logs for past days
      initialLast7Days.push({
        id: `prev-partner-${i}`,
        user_id: MOCK_PARTNER_ID,
        amount_ml: 1000 + Math.floor(Math.random() * 1400),
        timestamp: date.toISOString(),
        measurement_unit: 'ml',
        source_device: 'web',
        cup_type: 'bottle'
      });
    }
    setAllLogsLast7Days(initialLast7Days);
    setLoading(false);
  };

  // --- Auth: Sign Up ---
  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    companionType: string, 
    companionName: string
  ): Promise<boolean> => {
    setAuthError(null);
    if (!supabaseMode) {
      setAuthError("Auth is disabled in Demo Mode. Connect Supabase first!");
      return false;
    }
    
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Could not register user.");

      // Create profiles table row for user
      const newProfile = {
        id: data.user.id,
        display_name: displayName,
        email: email,
        companion_type: companionType,
        companion_name: companionName,
        daily_goal_ml: 2000,
        unit: 'ml',
        timezone: 'UTC',
        weather_goal_enabled: false,
        color_theme: 'sakura',
        skin_id: 'default',
        outfit_id: 'none',
        xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        unlocked_skins: ['default'],
        unlocked_outfits: ['none']
      };

      const { error: profileErr } = await supabase
        .from("profiles")
        .insert([newProfile]);

      if (profileErr) throw profileErr;

      // Automatically sign in
      await loadSupabaseData();
      return true;

    } catch (err: any) {
      console.error("Sign up error:", err);
      setAuthError(err.message || "Failed to sign up user.");
      return false;
    }
  };

  // --- Auth: Sign In ---
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    if (!supabaseMode) {
      // In Demo Mode, simulate a sign-in with default mock
      setSupabaseMode(false);
      return true;
    }

    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await loadSupabaseData();
      return true;

    } catch (err: any) {
      console.error("Sign in error:", err);
      setAuthError(err.message || "Failed to sign in user.");
      return false;
    }
  };

  // --- Auth: Sign Out ---
  const signOut = async () => {
    if (supabaseMode) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setProfile(null);
    setPartnerProfile(null);
    setCouple(null);
    setLogs([]);
    setPartnerLogs([]);
    setMessages([]);
  };

  // --- Database Settings Configuration ---
  const saveSupabaseCredentials = (url: string, key: string): boolean => {
    const success = updateSupabaseConfig(url, key);
    if (success) {
      setSupabaseConfig({ url, anonKey: key });
      setSupabaseMode(true);
    }
    return success;
  };

  const clearSupabaseCredentials = () => {
    updateSupabaseConfig("", "");
    setSupabaseConfig({ url: "", anonKey: "" });
    setSupabaseMode(false);
    localStorage.removeItem("aquabond_supabase_url");
    localStorage.removeItem("aquabond_supabase_anon_key");
  };

  // --- Quiet Hours DND Logic ---
  const isDndActiveNow = (): boolean => {
    if (!dndEnabled) return false;
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMin] = quietStart.split(":").map(Number);
      const [endHour, endMin] = quietEnd.split(":").map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        // Overlaps midnight (e.g. 22:00 to 08:00)
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
    } catch (e) {
      return false;
    }
  };

  const setDndSettings = (enabled: boolean, start: string, end: string) => {
    setDndEnabled(enabled);
    setQuietStart(start);
    setQuietEnd(end);
    localStorage.setItem("aquabond_dnd_enabled", enabled.toString());
    localStorage.setItem("aquabond_quiet_start", start);
    localStorage.setItem("aquabond_quiet_end", end);
  };

  // --- Water Logger Core Actions ---
  const logDrink = async (
    amountMl: number, 
    cupType: 'cup' | 'glass' | 'bottle' | 'custom'
  ) => {
    if (!profile) return;
    
    // Play plop
    if (!isDndActiveNow()) {
      playPlop();
    }

    // Calculate level-up & XP progression
    // XP: +10 XP per 100ml logged
    const gainedXp = Math.max(10, Math.round((amountMl / 100) * 10));
    const newXp = profile.xp + gainedXp;
    
    // Check level thresholds
    let newLevel = profile.level;
    if (newXp >= 2500 && profile.level < 5) newLevel = 5;
    else if (newXp >= 1200 && profile.level < 4) newLevel = 4;
    else if (newXp >= 500 && profile.level < 3) newLevel = 3;
    else if (newXp >= 150 && profile.level < 2) newLevel = 2;

    const didLevelUp = newLevel > profile.level;
    if (didLevelUp && !isDndActiveNow()) {
      setTimeout(() => playLevelUpSound(), 600);
    }

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        // 1. Insert log
        const newLog = {
          user_id: profile.id,
          amount_ml: amountMl,
          measurement_unit: profile.unit,
          source_device: 'web',
          cup_type: cupType
        };
        const { error: logErr } = await supabase.from("water_logs").insert([newLog]);
        if (logErr) throw logErr;

        // 2. Update streak and XP in profile
        const { error: profErr } = await supabase
          .from("profiles")
          .update({
            xp: newXp,
            level: newLevel,
            last_drank_at: new Date().toISOString(),
            // Streaks are updated locally for simplicity, or calculated
            current_streak: profile.current_streak === 0 ? 1 : profile.current_streak // Simple increment for demo sync
          })
          .eq("id", profile.id);
        if (profErr) throw profErr;

        // 3. Update couple streak and total volume
        if (profile.couple_id && couple) {
          await supabase
            .from("couples")
            .update({
              total_volume_drank_ml: couple.total_volume_drank_ml + amountMl
            })
            .eq("id", profile.couple_id);
        }

      } catch (err) {
        console.error("Error logging drink in Supabase:", err);
      }
    } else {
      // Demo Mode
      const newLog: WaterLog = {
        id: `demo-log-${Date.now()}`,
        user_id: profile.id,
        amount_ml: amountMl,
        timestamp: new Date().toISOString(),
        measurement_unit: profile.unit,
        source_device: 'web',
        cup_type: cupType
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem("aquabond_demo_logs", JSON.stringify(updatedLogs));

      const updatedProfile = {
        ...profile,
        xp: newXp,
        level: newLevel,
        last_drank_at: newLog.timestamp,
        current_streak: profile.current_streak === 0 ? 1 : profile.current_streak
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));

      if (couple) {
        const updatedCouple = {
          ...couple,
          total_volume_drank_ml: couple.total_volume_drank_ml + amountMl
        };
        setCouple(updatedCouple);
        localStorage.setItem("aquabond_demo_couple", JSON.stringify(updatedCouple));
      }
    }
  };

  const logPartnerDrink = async (
    amountMl: number, 
    cupType: 'cup' | 'glass' | 'bottle' | 'custom'
  ) => {
    if (!partnerProfile) return;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const newLog = {
          user_id: partnerProfile.id,
          amount_ml: amountMl,
          measurement_unit: partnerProfile.unit,
          source_device: 'web',
          cup_type: cupType
        };
        const { error } = await supabase.from("water_logs").insert([newLog]);
        if (error) throw error;
      } catch (err) {
        console.error("Error logging partner drink in Supabase:", err);
      }
    } else {
      // Demo Mode — use functional update to avoid full re-render
      const newLog: WaterLog = {
        id: `demo-log-part-${Date.now()}`,
        user_id: partnerProfile.id,
        amount_ml: amountMl,
        timestamp: new Date().toISOString(),
        measurement_unit: partnerProfile.unit,
        source_device: 'web',
        cup_type: cupType
      };

      setPartnerLogs(prev => {
        const updated = [newLog, ...prev];
        localStorage.setItem("aquabond_demo_partner_logs", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteDrink = async (logId: string) => {
    if (!profile) return;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const { error } = await supabase.from("water_logs").delete().eq("id", logId);
        if (error) throw error;
      } catch (err) {
        console.error("Error deleting log in Supabase:", err);
      }
    } else {
      // Demo Mode
      const updatedLogs = logs.filter(l => l.id !== logId);
      setLogs(updatedLogs);
      localStorage.setItem("aquabond_demo_logs", JSON.stringify(updatedLogs));
    }
  };

  const resetIntake = async () => {
    if (!profile) return;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Delete logs for today
        const { error } = await supabase
          .from("water_logs")
          .delete()
          .eq("user_id", profile.id)
          .gte("timestamp", startOfToday.toISOString());
        if (error) throw error;
      } catch (err) {
        console.error("Error resetting intake in Supabase:", err);
      }
    } else {
      // Demo Mode
      setLogs([]);
      localStorage.setItem("aquabond_demo_logs", JSON.stringify([]));
    }
  };

  // --- Messaging & Pokes ---
  const sendPoke = async (
    type: 'nudge' | 'sparkle' | 'heart' | 'custom_cheer', 
    content?: string
  ) => {
    if (!profile || !profile.couple_id) return;

    // Trigger local flying hearts immediately for instant feedback
    if (type === "heart" || type === "sparkle") {
      triggerLocalFlyingHeart();
      playHeartBurstSound();
    } else {
      playPlop();
    }

    // Award +15 XP for team interaction
    const newXp = profile.xp + 15;
    let newLevel = profile.level;
    if (newXp >= 2500 && profile.level < 5) newLevel = 5;
    else if (newXp >= 1200 && profile.level < 4) newLevel = 4;
    else if (newXp >= 500 && profile.level < 3) newLevel = 3;
    else if (newXp >= 150 && profile.level < 2) newLevel = 2;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const newMsg = {
          couple_id: profile.couple_id,
          sender_id: profile.id,
          type,
          content: content || null
        };
        const { error: msgErr } = await supabase.from("couple_messages").insert([newMsg]);
        if (msgErr) throw msgErr;

        // Add XP to sender
        await supabase
          .from("profiles")
          .update({ xp: newXp, level: newLevel })
          .eq("id", profile.id);

      } catch (err) {
        console.error("Error sending poke in Supabase:", err);
      }
    } else {
      // Demo Mode
      const newMsg: CoupleMessage = {
        id: `demo-msg-${Date.now()}`,
        couple_id: profile.couple_id,
        sender_id: profile.id,
        type,
        content: content || null,
        timestamp: new Date().toISOString()
      };

      const updatedMsgs = [newMsg, ...messages].slice(0, 30);
      setMessages(updatedMsgs);
      localStorage.setItem("aquabond_demo_messages", JSON.stringify(updatedMsgs));

      const updatedProfile = {
        ...profile,
        xp: newXp,
        level: newLevel
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));

      // Simulate partner receiving poke after 800ms
      setTimeout(() => {
        if (!isDndActiveNow()) {
          triggerLocalFlyingHeart();
          playHeartBurstSound();
          setIsPartnerVibrating(true);
          setTimeout(() => setIsPartnerVibrating(false), 350);
        }
      }, 800);
    }
  };

  // --- Send Text Message (Chat) ---
  const sendMessage = async (text: string) => {
    if (!profile || !profile.couple_id || !text.trim()) return;

    playPlop();

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const newMsg = {
          couple_id: profile.couple_id,
          sender_id: profile.id,
          type: 'custom_cheer' as const,
          content: text.trim()
        };
        const { error } = await supabase.from("couple_messages").insert([newMsg]);
        if (error) throw error;
      } catch (err) {
        console.error("Error sending message in Supabase:", err);
      }
    } else {
      // Demo Mode
      const newMsg: CoupleMessage = {
        id: `demo-chat-${Date.now()}`,
        couple_id: profile.couple_id,
        sender_id: profile.id,
        type: 'custom_cheer',
        content: text.trim(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const updated = [...prev, newMsg].slice(-50);
        localStorage.setItem("aquabond_demo_messages", JSON.stringify(updated));
        return updated;
      });

      // Simulate partner reply after 2-4 seconds in demo mode
      const partnerReplies = [
        "Aww, you're the best! 💕",
        "Drink more water babe! 💧",
        "I just drank a cup! 🥤",
        "Love you! Stay hydrated 😘",
        "Our streak is amazing! 🔥",
        "Let's hit our goals today! ✨"
      ];
      setTimeout(() => {
        const reply: CoupleMessage = {
          id: `demo-chat-reply-${Date.now()}`,
          couple_id: profile.couple_id!,
          sender_id: partnerProfile?.id || MOCK_PARTNER_ID,
          type: 'custom_cheer',
          content: partnerReplies[Math.floor(Math.random() * partnerReplies.length)],
          timestamp: new Date().toISOString()
        };
        setMessages(prev => {
          const updated = [...prev, reply].slice(-50);
          localStorage.setItem("aquabond_demo_messages", JSON.stringify(updated));
          return updated;
        });
        if (!isDndActiveNow()) {
          showImmediateNotification(
            "💬 New Message",
            `${partnerProfile?.display_name || 'Partner'}: ${reply.content}`
          );
        }
      }, 2000 + Math.random() * 2000);
    }
  };

  // --- Partner Link & Unlink ---
  const linkPartner = async (partnerInviteCode: string): Promise<boolean> => {
    if (!profile) return false;
    const cleanCode = partnerInviteCode.trim();
    if (!cleanCode) return false;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return false;

      try {
        // 1. Find partner profile
        const { data: partnerProf, error: findErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", cleanCode)
          .single();

        if (findErr || !partnerProf) {
          throw new Error("Partner not found. Double check their UUID code.");
        }

        // 2. Create couples record
        // Order user IDs to satisfy unique constraint unique_couple (A < B)
        const [aId, bId] = [profile.id, partnerProf.id].sort();
        
        // Check if couple already exists
        let coupleRec;
        const { data: existingCouple } = await supabase
          .from("couples")
          .select("*")
          .eq("user_a_id", aId)
          .eq("user_b_id", bId);

        if (existingCouple && existingCouple.length > 0) {
          coupleRec = existingCouple[0];
        } else {
          const { data: newCouple, error: coupleErr } = await supabase
            .from("couples")
            .insert([{
              user_a_id: aId,
              user_b_id: bId,
              couple_streak: 1,
              total_volume_drank_ml: 0,
              days_goal_met_together: 0
            }])
            .select()
            .single();

          if (coupleErr) throw coupleErr;
          coupleRec = newCouple;
        }

        // 3. Update profiles for both partners
        const { error: myUpdateErr } = await supabase
          .from("profiles")
          .update({ partner_id: partnerProf.id, couple_id: coupleRec.id })
          .eq("id", profile.id);

        if (myUpdateErr) throw myUpdateErr;

        const { error: partnerUpdateErr } = await supabase
          .from("profiles")
          .update({ partner_id: profile.id, couple_id: coupleRec.id })
          .eq("id", partnerProf.id);

        if (partnerUpdateErr) throw partnerUpdateErr;

        // Reload data
        await loadSupabaseData();
        return true;

      } catch (err: any) {
        console.error("Partner linking error:", err);
        setAuthError(err.message || "Failed to link partner.");
        return false;
      }
    } else {
      // Demo Mode linking simulator
      playPlop();
      const updatedProfile = {
        ...profile,
        partner_id: MOCK_PARTNER_ID,
        couple_id: MOCK_COUPLE_ID
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));
      return true;
    }
  };

  const unlinkPartner = async () => {
    if (!profile) return;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        // Remove references from profiles
        const { error: myErr } = await supabase
          .from("profiles")
          .update({ partner_id: null, couple_id: null })
          .eq("id", profile.id);
        if (myErr) throw myErr;

        if (profile.partner_id) {
          await supabase
            .from("profiles")
            .update({ partner_id: null, couple_id: null })
            .eq("id", profile.partner_id);
        }

        // Optionally delete the couples table row
        if (profile.couple_id) {
          await supabase.from("couples").delete().eq("id", profile.couple_id);
        }

        // Reload data
        await loadSupabaseData();

      } catch (err) {
        console.error("Partner unlink error:", err);
      }
    } else {
      // Demo Mode unlinking
      playPlop();
      const updatedProfile = {
        ...profile,
        partner_id: null,
        couple_id: null
      };
      setProfile(updatedProfile);
      setPartnerProfile(null);
      setCouple(null);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));
    }
  };

  // --- Customize Theme ---
  const updateProfileTheme = async (theme: Profile['color_theme']) => {
    if (!profile) return;
    playPlop();

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        await supabase.from("profiles").update({ color_theme: theme }).eq("id", profile.id);
        setProfile(prev => prev ? { ...prev, color_theme: theme } : null);
      } catch (err) {
        console.error("Error setting theme in Supabase:", err);
      }
    } else {
      // Demo Mode
      const updatedProfile = {
        ...profile,
        color_theme: theme
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));
    }
  };

  // --- Purchase accessories / skins ---
  const buyCompanionItem = async (type: 'skin' | 'outfit', itemId: string, xpCost: number) => {
    if (!profile) return;
    if (profile.xp < xpCost) return;

    playPlop();
    const newXp = profile.xp - xpCost;

    let unlockedList = type === 'skin' ? [...profile.unlocked_skins] : [...profile.unlocked_outfits];
    if (!unlockedList.includes(itemId)) {
      unlockedList.push(itemId);
    }

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const updateObj = type === 'skin' 
          ? { xp: newXp, unlocked_skins: unlockedList, skin_id: itemId } 
          : { xp: newXp, unlocked_outfits: unlockedList, outfit_id: itemId };

        await supabase.from("profiles").update(updateObj).eq("id", profile.id);
        
        setProfile(prev => {
          if (!prev) return null;
          return type === 'skin'
            ? { ...prev, xp: newXp, unlocked_skins: unlockedList, skin_id: itemId }
            : { ...prev, xp: newXp, unlocked_outfits: unlockedList, outfit_id: itemId };
        });

      } catch (err) {
        console.error("Error purchasing customization item:", err);
      }
    } else {
      // Demo Mode
      const updatedProfile = {
        ...profile,
        xp: newXp,
        unlocked_skins: type === 'skin' ? unlockedList : profile.unlocked_skins,
        unlocked_outfits: type === 'outfit' ? unlockedList : profile.unlocked_outfits,
        skin_id: type === 'skin' ? itemId : profile.skin_id,
        outfit_id: type === 'outfit' ? itemId : profile.outfit_id
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));
    }
  };

  const equipCompanionItem = async (type: 'skin' | 'outfit', itemId: string) => {
    if (!profile) return;
    playPlop();

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        const updateObj = type === 'skin' ? { skin_id: itemId } : { outfit_id: itemId };
        await supabase.from("profiles").update(updateObj).eq("id", profile.id);
        setProfile(prev => {
          if (!prev) return null;
          return type === 'skin' ? { ...prev, skin_id: itemId } : { ...prev, outfit_id: itemId };
        });
      } catch (err) {
        console.error("Error equipping item:", err);
      }
    } else {
      // Demo Mode
      const updatedProfile = {
        ...profile,
        skin_id: type === 'skin' ? itemId : profile.skin_id,
        outfit_id: type === 'outfit' ? itemId : profile.outfit_id
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));
    }
  };

  const toggleWeatherGoal = async (enabled: boolean) => {
    if (!profile) return;
    playPlop();
    setWeatherEnabled(enabled);

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        await supabase.from("profiles").update({ weather_goal_enabled: enabled }).eq("id", profile.id);
        setProfile(prev => prev ? { ...prev, weather_goal_enabled: enabled } : null);
      } catch (err) {
        console.error("Error setting weather toggle:", err);
      }
    } else {
      // Demo Mode
      const updatedProfile = {
        ...profile,
        weather_goal_enabled: enabled
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));
    }
  };

  const updateCoordinates = async (lat: number, lon: number) => {
    if (!profile) return;

    if (supabaseMode) {
      const supabase = getSupabase();
      if (!supabase) return;

      try {
        await supabase.from("profiles").update({ latitude: lat, longitude: lon }).eq("id", profile.id);
        setProfile(prev => prev ? { ...prev, latitude: lat, longitude: lon } : null);
      } catch (err) {
        console.error("Error setting coordinates:", err);
      }
    } else {
      // Demo Mode
      const updatedProfile = {
        ...profile,
        latitude: lat,
        longitude: lon
      };
      setProfile(updatedProfile);
      localStorage.setItem("aquabond_demo_profile", JSON.stringify(updatedProfile));
    }
  };

  // --- Heart Animation trigger ---
  const triggerLocalFlyingHeart = () => {
    const id = Date.now();
    setFlyingHearts(prev => [...prev, { id, left: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setFlyingHearts(prev => prev.filter(h => h.id !== id));
    }, 1500);
  };

  return (
    <AppContext.Provider value={{
      supabaseMode,
      supabaseConfig,
      saveSupabaseCredentials,
      clearSupabaseCredentials,
      
      profile,
      partnerProfile,
      couple,
      loading,
      authError,
      signUp,
      signIn,
      signOut,
      
      logs,
      partnerLogs,
      allLogsLast7Days,
      logDrink,
      logPartnerDrink,
      deleteDrink,
      resetIntake,
      
      messages,
      sendPoke,
      sendMessage,
      linkPartner,
      unlinkPartner,
      
      weatherEnabled,
      temperature,
      humidity,
      weatherAdjust,
      weatherReason,
      toggleWeatherGoal,
      updateCoordinates,
      
      dndEnabled,
      quietStart,
      quietEnd,
      setDndSettings,
      isDndActiveNow,
      
      updateProfileTheme,
      equipCompanionItem,
      buyCompanionItem,
      
      flyingHearts,
      triggerLocalFlyingHeart,
      isPartnerVibrating,
      setIsPartnerVibrating
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
