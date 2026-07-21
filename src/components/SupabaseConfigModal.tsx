import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Database, Link, AlertTriangle, Key, X, Check } from "lucide-react";

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { supabaseMode, supabaseConfig, saveSupabaseCredentials, clearSupabaseCredentials } = useApp();
  const [url, setUrl] = useState(supabaseConfig.url || "");
  const [key, setKey] = useState(supabaseConfig.anonKey || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!url.trim() || !key.trim()) {
      setError("Please fill in both fields");
      return;
    }

    try {
      const isConnected = saveSupabaseCredentials(url.trim(), key.trim());
      if (isConnected) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1200);
      } else {
        setError("Invalid URL or Key format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to establish connection");
    }
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl("");
    setKey("");
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border border-[#FFF0F2] rounded-[32px] p-6 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-[#FFF0F2] text-[#8E8A9A] hover:text-[#FF92A9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3ecf8e] to-[#34d399] flex items-center justify-center shadow-md">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#2D283E]">Supabase Connection Setup</h3>
            <p className="text-xs text-[#8E8A9A] font-semibold">Enable secure real-time syncing for couples</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Successfully connected to Supabase!</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#4A4458] flex items-center gap-1">
              <Link className="w-3.5 h-3.5 text-[#8E8A9A]" />
              Supabase Project URL
            </label>
            <input 
              type="text" 
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#FF92A9] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none shadow-2xs font-semibold text-[#2D283E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#4A4458] flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-[#8E8A9A]" />
              Supabase Anon Key
            </label>
            <input 
              type="password" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#FF92A9] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF92A9] focus:outline-none shadow-2xs font-mono text-[#2D283E]"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#3ecf8e] to-[#059669] hover:from-[#35be80] hover:to-[#047857] text-white text-xs font-extrabold shadow-md transition-all duration-150 active:scale-98"
            >
              Connect Database
            </button>
            {supabaseMode && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-xs font-extrabold transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </form>

        <div className="border-t border-[#FFF0F2] mt-5 pt-4 space-y-2 text-xs text-[#8E8A9A] leading-relaxed">
          <span className="font-extrabold text-[#2D283E] uppercase text-[10px] tracking-wider block font-mono">Setup Instructions</span>
          <p>
            1. Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#FF92A9] underline font-bold">supabase.com</a>.
          </p>
          <p>
            2. Run the PostgreSQL table migrations and setup RLS rules using the SQL editor.
          </p>
          <p>
            3. Retrieve your project URL and Anon key in your Supabase Dashboard settings under <strong>Project Settings &gt; API</strong> and paste them above.
          </p>
          <div className="bg-[#FFF0F2]/50 p-3 rounded-2xl border border-[#FFF0F2] text-[10px] flex flex-col gap-1">
            <span className="font-bold text-[#4A4458]">💡 Active Mode Status:</span>
            <span>
              {supabaseMode 
                ? "🟢 Connected: Syncing sips, streak, and nudge hearts to your Supabase project in real-time."
                : "🟡 Cozy Demo Mode: All operations run locally on your device using browser local storage. Connect database above to pair with a real partner."
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
