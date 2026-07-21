import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://bfmbitsrnrrpfwzcrvmn.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbWJpdHNybnJycGZ3emNydm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjI1NDUsImV4cCI6MjA5OTU5ODU0NX0.K4SYY00feAutVPur2QCEIDRoFr7W2BePluJQ_LnoY9I";

// Retrieve config from local storage, environment variables, or hardcoded defaults for host builds
let supabaseUrl = localStorage.getItem("aquabond_supabase_url") || (import.meta as any).env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
let supabaseAnonKey = localStorage.getItem("aquabond_supabase_anon_key") || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

export function isSupabaseConfigured(): boolean {
  return !!supabaseClient;
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

export function getSupabaseCredentials() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}

export function updateSupabaseConfig(url: string, anonKey: string): boolean {
  if (!url || !anonKey) {
    localStorage.removeItem("aquabond_supabase_url");
    localStorage.removeItem("aquabond_supabase_anon_key");
    supabaseUrl = DEFAULT_SUPABASE_URL;
    supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;
    supabaseClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
    return true;
  }

  try {
    const newClient = createClient(url, anonKey);
    localStorage.setItem("aquabond_supabase_url", url);
    localStorage.setItem("aquabond_supabase_anon_key", anonKey);
    supabaseUrl = url;
    supabaseAnonKey = anonKey;
    supabaseClient = newClient;
    return true;
  } catch (err) {
    console.error("Invalid Supabase credentials:", err);
    return false;
  }
}
