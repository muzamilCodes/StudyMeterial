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
  Lock,
  Menu,
  X,
  User,
  Home,
  LogOut,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, saveSession, clearSession, type StudentSession } from "@/lib/session";

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    if (!s) {
      // User is NOT registered or logged in! Redirect immediately to register
      setIsCheckingAuth(false);
      router.replace("/register?access_denied=true");
      return;
    }

    setSession(s);
    setIsCheckingAuth(false);

    if (pathname === "/admin" && !s.isAdmin && s.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  const changeClassStream = (grade: "10th" | "11th" | "12th", stream: "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts") => {
    if (!session) return;
    const updated: StudentSession = { ...session, grade, stream };
    setSession(updated);
    saveSession(updated);
    setShowClassSelector(false);
    setMobileMenuOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    clearSession();
    router.push("/register");
  };

  const isAdmin = session?.isAdmin === true || session?.role === "admin";

  // ROUTE GUARD: If unauthenticated, show strict registration requirement screen
  if (isCheckingAuth || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white text-center">
        <div className="space-y-4 max-w-sm rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 animate-pulse text-white shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs font-extrabold uppercase">Access Blocked</Badge>
          <h3 className="text-2xl font-black text-white">Registration Required</h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            You are not registered or logged in. You cannot view the student dashboard or profile until you create an account.
          </p>
          <div className="pt-2 space-y-2">
            <Link href="/register">
              <Button className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" /> Go to Register Page
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full h-12 rounded-2xl border-white/20 text-slate-200 hover:bg-white/10 font-bold text-xs">
                Already Have Account? Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell grid min-h-screen gap-4 p-2.5 sm:p-4 md:grid-cols-[280px_1fr] md:p-6 text-slate-900 pb-20 md:pb-6 overflow-x-hidden w-full max-w-full">
      {/* Mobile Top Navigation Header */}
      <div className="flex md:hidden items-center justify-between rounded-2xl bg-slate-950 p-3 text-white shadow-lg sticky top-2 z-40 border border-white/10 w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wider text-blue-400">STUDY MATERIAL</p>
            <p className="text-[9px] font-bold text-slate-400">Class {session?.grade ?? "11th"}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClassSelector(!showClassSelector)}
            className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-blue-200 border border-white/15"
          >
            {session?.grade ?? "11th"} ▾
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-rose-500/20 p-1.5 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl bg-blue-600 p-2 text-white shadow hover:bg-blue-700 transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Class Switcher Modal */}
      {showClassSelector && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xs rounded-2xl bg-slate-900 p-4 text-white space-y-2 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Class & Stream</p>
              <button onClick={() => setShowClassSelector(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="grid gap-1 pt-1 text-xs">
              <button onClick={() => changeClassStream("10th", "General")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">10th Class (All Subjects)</button>
              <button onClick={() => changeClassStream("11th", "Medical")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">11th Medical</button>
              <button onClick={() => changeClassStream("11th", "Non-Medical")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">11th Non-Medical</button>
              <button onClick={() => changeClassStream("11th", "Commerce")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">11th Commerce</button>
              <button onClick={() => changeClassStream("11th", "Arts")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">11th Arts</button>
              <button onClick={() => changeClassStream("12th", "Medical")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">12th Medical</button>
              <button onClick={() => changeClassStream("12th", "Non-Medical")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">12th Non-Medical</button>
              <button onClick={() => changeClassStream("12th", "Commerce")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">12th Commerce</button>
              <button onClick={() => changeClassStream("12th", "Arts")} className="rounded-xl px-3 py-2 text-left font-bold hover:bg-blue-600">12th Arts</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md pt-16 p-4 overflow-y-auto">
          <div className="space-y-2 pb-8">
            <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-slate-900 p-4 text-white mb-3 shadow-lg border border-white/10 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/30 shrink-0 bg-blue-600 flex items-center justify-center font-bold">
                {session.avatar ? (
                  <img src={session.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{session.name ? session.name[0] : "M"}</span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Active Student</p>
                <p className="text-base font-extrabold">{session.name ?? "Student"}</p>
                <p className="text-xs text-blue-100 font-semibold">{session.grade} ({session.stream})</p>
              </div>
            </div>

            <div className="grid gap-1">
              {nav.map((item) => {
                const isActive = pathname === item.href;
                if (item.adminOnly && !isAdmin) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${
                      isActive ? "bg-blue-600 text-white shadow" : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    <item.icon className="h-4 w-4 text-blue-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold bg-rose-600/30 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition mt-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] flex-col justify-between overflow-y-auto rounded-[2rem] p-5 md:flex border border-white/60 shadow-glass backdrop-blur-xl">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
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

          {/* Selected Class Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-4 text-white shadow-premium">
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
              {session.grade ?? "11th"} - {session.stream ?? "Medical"}
            </h2>
            <p className="mt-0.5 text-[11px] text-blue-100/80">Filtered content loaded.</p>
          </div>

          {/* Navigation Links */}
          <nav className="grid gap-1">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              if (item.adminOnly && !isAdmin) {
                return null;
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
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="pt-4 border-t border-slate-200/60 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Top Header Navbar */}
        <header className="glass rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/60 shadow-glass backdrop-blur-xl w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge className="bg-blue-100 text-blue-700 font-bold border-blue-200 text-[10px] sm:text-xs">Class {session.grade ?? "11th"}</Badge>
                <Badge className="bg-orange-100 text-orange-700 font-bold border-orange-200 text-[10px] sm:text-xs">{session.stream ?? "Medical"} Stream</Badge>
                {isAdmin ? (
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px] sm:text-xs">Admin Mode</Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-700 font-semibold text-[10px] sm:text-xs">Student View</Badge>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-0.5 text-xs text-slate-600 hidden sm:block">{description}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/edit-profile">
                <div className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200 bg-white/80 p-1.5 sm:p-2 pr-3 sm:pr-4 shadow-sm hover:shadow transition">
                  <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden bg-blue-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0">
                    {session.avatar ? (
                      <img src={session.avatar} alt="Profile Picture" className="h-full w-full object-cover" />
                    ) : (
                      <span>{session.name ? session.name[0] : "M"}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">{session.name ?? "Student"}</p>
                    <p className="text-[10px] font-semibold text-slate-500 hidden sm:block">{session.email}</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-2xl bg-rose-500 hover:bg-rose-600 px-3 sm:px-4 text-xs font-bold text-white shadow-md transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Bottom Floating Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-white/10 p-1.5 backdrop-blur-lg flex justify-around text-white w-full">
        <Link href="/dashboard" className={`flex flex-col items-center p-1 text-[10px] font-bold ${pathname === "/dashboard" ? "text-orange-400" : "text-slate-400"}`}>
          <LayoutDashboard className="h-4 w-4 mb-0.5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/subjects" className={`flex flex-col items-center p-1 text-[10px] font-bold ${pathname === "/subjects" ? "text-orange-400" : "text-slate-400"}`}>
          <BookOpen className="h-4 w-4 mb-0.5" />
          <span>Subjects</span>
        </Link>
        <Link href="/notes" className={`flex flex-col items-center p-1 text-[10px] font-bold ${pathname === "/notes" ? "text-orange-400" : "text-slate-400"}`}>
          <FileText className="h-4 w-4 mb-0.5" />
          <span>Notes</span>
        </Link>
        <Link href="/quizzes" className={`flex flex-col items-center p-1 text-[10px] font-bold ${pathname === "/quizzes" ? "text-orange-400" : "text-slate-400"}`}>
          <NotebookTabs className="h-4 w-4 mb-0.5" />
          <span>Quizzes</span>
        </Link>
        <Link href="/progress" className={`flex flex-col items-center p-1 text-[10px] font-bold ${pathname === "/progress" ? "text-orange-400" : "text-slate-400"}`}>
          <GraduationCap className="h-4 w-4 mb-0.5" />
          <span>Progress</span>
        </Link>
      </div>
    </div>
  );
}
