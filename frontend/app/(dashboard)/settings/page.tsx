"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useTheme } from "@/components/theme-provider";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { 
  Settings, 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Lock, 
  CheckCircle2,
  Save,
  Monitor
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [session, setSession] = useState<StudentSession | null>(null);

  // Preference Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [classReminders, setClassReminders] = useState(true);
  const [quizAlerts, setQuizAlerts] = useState(true);
  const [language, setLanguage] = useState("English (US)");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <SiteShell
      title="Platform & Account Settings"
      description="Configure theme appearance, notification preferences, language, and security settings."
    >
      <div className="space-y-8 max-w-4xl">
        
        {savedMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* THEME PREFERENCES */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Theme & Visual Appearance</h3>
              <p className="text-xs text-slate-400">Choose your preferred visual mode for StudyMaterial.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { id: "light", label: "Light Mode", icon: Sun },
              { id: "dark", label: "Dark Mode", icon: Moon },
              { id: "system", label: "System Default", icon: Monitor }
            ].map((t) => {
              const IconComp = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition space-y-2 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <IconComp className="h-6 w-6" />
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Controls</h3>
              <p className="text-xs text-slate-400">Manage alerts and email reminders.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Weekly Digest & Exam Date Alerts</p>
                <p className="text-[11px] text-slate-400">Receive model paper updates via email.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Live Interactive Class Reminders</p>
                <p className="text-[11px] text-slate-400">Get notified 15 mins before live stream lectures.</p>
              </div>
              <input
                type="checkbox"
                checked={classReminders}
                onChange={(e) => setClassReminders(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Quiz & Test Result Announcements</p>
                <p className="text-[11px] text-slate-400">Instant notification when quiz score is calculated.</p>
              </div>
              <input
                type="checkbox"
                checked={quizAlerts}
                onChange={(e) => setQuizAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* LANGUAGE & REGIONAL */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Language & Region</h3>
              <p className="text-xs text-slate-400">Select UI language.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200">Display Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="English (US)">English (US)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Urdu">Urdu (اردو)</option>
            </select>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="rounded-2xl bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>

      </div>
    </SiteShell>
  );
}
