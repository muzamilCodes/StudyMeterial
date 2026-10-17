"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

const CONSENT_KEY = "study-material-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const decide = (value: "accepted" | "essential") => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Storage consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 md:left-auto md:right-6 md:w-[380px]"
    >
      <button
        onClick={() => decide("essential")}
        aria-label="Dismiss consent notice"
        className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-900 dark:text-white">We use on-device storage</p>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            StudyMaterial keeps your session and study history in your browser&apos;s local storage — no tracking
            cookies. See our{" "}
            <Link href="/privacy-policy" className="font-bold text-blue-600 hover:underline">Privacy Policy</Link>.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => decide("accepted")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Accept
            </button>
            <button
              onClick={() => decide("essential")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition"
            >
              Essential only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
