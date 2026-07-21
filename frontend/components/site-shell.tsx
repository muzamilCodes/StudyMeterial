"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  NotebookTabs,
  PlayCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
  ChevronDown,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, saveSession, type StudentSession } from "@/lib/session";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/subjects", label: "Subjects", icon: BookOpen, adminOnly: false },
  { href: "/notes", label: "Notes", icon: FileText, adminOnly: false },
  { href: "/previous-papers", label: "Previous Papers", icon: ScrollText, adminOnly: false },
  { href: "/quizzes", label: "Quizzes", icon: NotebookTabs, adminOnly: false },
  { href: "/videos", label: "Videos", icon: PlayCircle, adminOnly: false },
  { href: "/notices", label: "Notices", icon: Sparkles, adminOnly: false },
  { href: "/downloads", label: "Downloads", icon: Download, adminOnly: false },
  { href: "/results", label: "Results", icon: BarChart3, adminOnly: false },
  { href: "/progress", label: "Progress", icon: GraduationCap, adminOnly: false },
  { href: "/edit-profile", label: "Edit Profile", icon: Users, adminOnly: false },
  { href: "/admin", label: "Admin Panel", icon: ShieldCheck, adminOnly: true }
];

export function SiteShell({
  children,
  title,
  description
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [showClassSelector, setShowClassSelector] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    // SECURITY CHECK: If student tries to load /admin page directly without isAdmin
    if (pathname === "/admin" && !s?.isAdmin && s?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  const changeClassStream = (grade: "10th" | "11th" | "12th", stream: "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts") => {
    if (!session) return;
    const updated: StudentSession = { ...session, grade, stream };
    setSession(updated);
    saveSession(updated);
    setShowClassSelector(false);
    window.location.reload();
  };

  const isAdmin = session?.isAdmin === true || session?.role === "admin";

  return (
    <div className="page-shell grid min-h-screen gap-6 p-4 md:grid-cols-[280px_1fr] md:p-6 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] flex-col overflow-y-auto rounded-[2rem] p-5 md:flex border border-white/60 shadow-glass backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-premium">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold tracking-[0.2em] text-blue-700">STUDY MATERIAL</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PLATFORM</p>
            </div>
          </Link>
        </div>

        {/* Selected Class Card & Switcher */}
        <div className="relative mb-5 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-4 text-white shadow-premium">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-blue-200">Active Class</p>
            <button
              onClick={() => setShowClassSelector(!showClassSelector)}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold hover:bg-white/20 transition"
            >
              <span>Change</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <h2 className="mt-1 text-base font-extrabold text-white">
            {session?.grade ?? "11th"} - {session?.stream ?? "Medical"}
          </h2>
          <p className="mt-0.5 text-[11px] text-blue-100/80">Filtered content loaded.</p>

          {showClassSelector && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 space-y-1 rounded-2xl border border-white/40 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl text-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Select Class & Stream</p>
              <div className="grid gap-1">
                <button onClick={() => changeClassStream("10th", "General")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">10th Class (All Subjects)</button>
                <button onClick={() => changeClassStream("11th", "Medical")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">11th Medical</button>
                <button onClick={() => changeClassStream("11th", "Non-Medical")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">11th Non-Medical</button>
                <button onClick={() => changeClassStream("11th", "Commerce")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">11th Commerce</button>
                <button onClick={() => changeClassStream("11th", "Arts")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">11th Arts</button>
                <button onClick={() => changeClassStream("12th", "Medical")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">12th Medical</button>
                <button onClick={() => changeClassStream("12th", "Non-Medical")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">12th Non-Medical</button>
                <button onClick={() => changeClassStream("12th", "Commerce")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">12th Commerce</button>
                <button onClick={() => changeClassStream("12th", "Arts")} className="rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-blue-600/40 text-slate-200">12th Arts</button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="grid gap-1">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            if (item.adminOnly && !isAdmin) {
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between rounded-2xl px-4 py-2 text-xs font-semibold text-slate-400 opacity-60 cursor-not-allowed"
                  title="Admin Access Required"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <Lock className="h-3 w-3" />
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-premium"
                    : "text-slate-700 hover:bg-white/80 hover:text-blue-600"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-blue-600"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="space-y-6">
        {/* Top Header Navbar */}
        <header className="glass rounded-[2rem] p-5 md:p-6 border border-white/60 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge className="bg-blue-100 text-blue-700 font-bold border-blue-200">Class {session?.grade ?? "11th"}</Badge>
                <Badge className="bg-orange-100 text-orange-700 font-bold border-orange-200">{session?.stream ?? "Medical"} Stream</Badge>
                {isAdmin ? (
                  <Badge className="bg-emerald-600 text-white font-bold">Admin Mode</Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-700 font-semibold">Student View</Badge>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-0.5 text-xs text-slate-600">{description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/edit-profile">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-2 pr-4 shadow-sm hover:shadow transition">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm">
                    {session?.name ? session.name[0] : "M"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900">{session?.name ?? "Muzamil Ahmad"}</p>
                    <p className="text-[10px] font-semibold text-slate-500">{session?.email ?? "student@studymaterial.com"}</p>
                  </div>
                </div>
              </Link>

              <Link href="/" className="inline-flex h-10 items-center justify-center rounded-2xl bg-orange-500 px-4 text-xs font-bold text-white shadow-premium hover:bg-orange-600 transition">
                Infographic Showcase
              </Link>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
