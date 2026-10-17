"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { GraduationCap, Mail, Phone, MapPin, Send, Heart, ArrowUpRight } from "lucide-react";
import { apiUrl } from "@/lib/api";

export function PublicFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState<string | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  async function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterMsg(null);
    try {
      const res = await fetch(apiUrl("/api/newsletter"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      setNewsletterMsg(data.message ?? (res.ok ? "Subscribed!" : "Subscription failed."));
      if (res.ok) setNewsletterEmail("");
    } catch {
      setNewsletterMsg("Unable to reach the server. Try again later.");
    } finally {
      setNewsletterLoading(false);
    }
  }

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-12 transition-colors">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* BRAND & DESCRIPTION */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-orange-500 text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                STUDYMATERIAL
              </span>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Smart Education Platform
              </p>
            </div>
          </Link>
          
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            Empowering students with class-wise educational materials, comprehensive notes, previous year solved board papers, interactive live classes, and self-assessment quizzes for 10th, 11th, and 12th grades.
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" />
              <span>support@studymaterial.com</span>
            </div>
          </div>
        </div>

        {/* QUICK NAVIGATION */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Navigation
          </p>
          <ul className="space-y-2 text-xs font-semibold">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                <span>Home Landing</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                <span>Student Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/subjects" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                <span>All Subjects</span>
              </Link>
            </li>
            <li>
              <Link href="/notes" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                <span>Curated Notes</span>
              </Link>
            </li>
            <li>
              <Link href="/previous-papers" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
                <span>Previous Year Papers</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* ACADEMICS & CLASSES */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Academic Streams
          </p>
          <ul className="space-y-2 text-xs font-semibold">
            <li>
              <Link href="/videos" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Live Interactive Classes
              </Link>
            </li>
            <li>
              <Link href="/quizzes" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Online Quiz Tests
              </Link>
            </li>
            <li>
              <span className="text-slate-400">Class 10th General</span>
            </li>
            <li>
              <span className="text-slate-400">Class 11th Medical / Non-Med</span>
            </li>
            <li>
              <span className="text-slate-400">Class 12th Commerce & Arts</span>
            </li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Exam Updates & Newsletter
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Subscribe for free weekly model paper uploads and exam date reminders.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="absolute right-1.5 top-1.5 rounded-lg bg-blue-600 p-1.5 text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            {newsletterMsg && (
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{newsletterMsg}</p>
            )}
          </form>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-[1600px] mx-auto mt-12 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
        <p>© 2026 StudyMaterial Educational Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">API Status</span>
        </div>
      </div>
    </footer>
  );
}
