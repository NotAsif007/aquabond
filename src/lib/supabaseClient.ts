import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Retrieve config from local storage or environment variables
let supabaseUrl = localStorage.getItem("aquabond_supabase_url") || (import.meta as any).env.VITE_SUPABASE_URL || "";
let supabaseAnonKey = localStorage.getItem("aquabond_supabase_anon_key") || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

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
    supabaseUrl = "";
    supabaseAnonKey = "";
    supabaseClient = null;
    return false;
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
