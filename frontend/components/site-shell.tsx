"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ScrollText,
  Award,
  Video,
  Sparkles,
  Download,
  User,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  Lock,
  UserPlus,
  Users,
  UserCheck,
  Layers,
  FolderPlus,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Upload,
  HelpCircle,
  Bell,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, clearSession, type StudentSession } from "@/lib/session";
import { useTheme } from "@/components/theme-provider";

// USER SIDEBAR MENU
const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/previous-papers", label: "Previous Papers", icon: ScrollText },
  { href: "/quizzes", label: "Quizzes", icon: Award },
  { href: "/videos", label: "Live Classes", icon: Video },
  { href: "/roadmap", label: "Roadmap", icon: Sparkles },
  { href: "/notices", label: "Notices", icon: Sparkles },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/edit-profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

// ADMIN SIDEBAR MENU (modules with real working screens)
const adminNavItems = [
  { tab: "Dashboard Overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { tab: "Users & Students", label: "Users Directory", icon: Users },
  { tab: "Notes Management", label: "Notes Management", icon: FileText },
  { tab: "Upload PDF Note", label: "Upload PDF Note", icon: Upload },
  { tab: "Previous Papers", label: "Previous Papers", icon: ScrollText },
  { tab: "Upload Board Paper", label: "Upload Board Paper", icon: ScrollText },
  { tab: "Live Classes", label: "Live Classes Engine", icon: Video },
  { tab: "Publish Notice", label: "Publish Notice", icon: Bell },
  { tab: "Instructor Applications", label: "Instructor Approvals", icon: UserCheck },
];

export function SiteShell({
  children,
  title,
  description,
  activeAdminTab,
  onAdminTabChange
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  activeAdminTab?: string;
  onAdminTabChange?: (tab: string) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [session, setSession] = useState<StudentSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    const s = getStoredSession();
    if (!s) {
      setIsCheckingAuth(false);
      router.replace("/register?access_denied=true");
      return;
    }

    setSession(s);
    setIsCheckingAuth(false);
  }, [pathname, router, isAdminPage]);

  const handleLogout = () => {
    clearSession();
    router.push("/register");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isAdminUser = session?.isAdmin === true || session?.role === "admin";

  if (isCheckingAuth || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white text-center">
        <div className="space-y-4 max-w-sm rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 animate-pulse text-white shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs font-extrabold uppercase">
            Authentication Required
          </Badge>
          <h3 className="text-2xl font-black text-white">Registration Required</h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Please register or sign in to access your personal dashboard, class notes, and learning history.
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-sm font-black tracking-wider text-blue-600 dark:text-blue-400">
            {isAdminPage ? "ADMIN PANEL" : "STUDYMATERIAL"}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
            {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md pt-16 p-6 overflow-y-auto space-y-2">
          <div className="p-4 rounded-2xl bg-slate-900 text-white mb-4 border border-white/10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 font-bold flex items-center justify-center">
              {session.name ? session.name[0] : "S"}
            </div>
            <div>
              <p className="text-sm font-bold">{session.name || "User"}</p>
              <p className="text-xs text-slate-400">{isAdminPage ? "System Admin Mode" : `${session.grade} ${session.stream}`}</p>
            </div>
          </div>

          {/* Render Admin or User Items in Mobile Menu */}
          {isAdminPage ? (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 mb-2">Admin Control Menu</p>
              {adminNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeAdminTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      if (onAdminTabChange) onAdminTabChange(item.tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition text-left ${
                      isActive ? "bg-amber-600 text-white shadow" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30 mt-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Switch to Student View</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {userNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition ${
                      isActive ? "bg-blue-600 text-white shadow" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {isAdminUser && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mt-3"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold bg-rose-600/30 text-rose-300 border border-rose-500/30 mt-4"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Account</span>
          </button>
        </div>
      )}

      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 sticky top-0 h-screen p-4 z-30 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="space-y-5">
          
          {/* LOGO & COLLAPSE TOGGLE */}
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-md">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black tracking-wider text-blue-600 dark:text-blue-400">
                    {isAdminPage ? "ADMIN PANEL" : "STUDYMATERIAL"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {isAdminPage ? "CONSOLE" : `Class ${session.grade}`}
                  </p>
                </div>
              </Link>
            )}

            {isCollapsed && (
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Sidebar"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* BADGE / STATUS */}
          {!isCollapsed && (
            <div className={`rounded-2xl p-3.5 text-white shadow-sm ${isAdminPage ? "bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950" : "bg-gradient-to-br from-blue-600 to-indigo-700"}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {isAdminPage ? "Administrator Console" : "Enrolled Student"}
              </p>
              <p className="text-xs font-extrabold">{session.name || "User"}</p>
              <span className="inline-block mt-1 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                {isAdminPage ? "Master Controls" : `${session.grade} • ${session.stream}`}
              </span>
            </div>
          )}

          {/* NAVIGATION ITEMS */}
          <nav className="space-y-1">
            {isAdminPage ? (
              // ADMIN MENU ITEMS
              adminNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeAdminTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      if (onAdminTabChange) onAdminTabChange(item.tab);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition text-left ${
                      isActive
                        ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <IconComp className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })
            ) : (
              // USER MENU ITEMS
              userNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <IconComp className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })
            )}

            {/* SWITCH MODE LINK FOR ADMIN USER */}
            {isAdminUser && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                {isAdminPage ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    title={isCollapsed ? "Student View" : undefined}
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Student View</span>}
                  </Link>
                ) : (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                    title={isCollapsed ? "Admin Console" : undefined}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Admin Console</span>}
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-xl p-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400 shrink-0" /> : <Moon className="h-4 w-4 text-slate-600 shrink-0" />}
            {!isCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl p-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Logout"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Logout Account</span>}
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-full overflow-x-hidden">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {isAdminPage ? "Admin Console Mode" : `Class ${session.grade} (${session.stream})`}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/edit-profile"
              className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                {session.avatar ? (
                  <img src={session.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{session.name ? session.name[0] : "S"}</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{session.name || "User"}</p>
                <p className="text-[10px] text-slate-400">{session.email}</p>
              </div>
            </Link>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
