"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Home,
  BookOpen, 
  FileText, 
  Video,
  Award,
  Bell, 
  MessageSquare, 
  Search, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";
import { getStoredSession, clearSession, type StudentSession } from "@/lib/session";
import { useTheme } from "@/components/theme-provider";
import { GlobalSearchModal } from "@/components/global-search-modal";
import { fetchBackendNotices, type RealNoticeItem } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", icon: Home, protected: false },
  { href: "/subjects", label: "Subjects", icon: BookOpen, protected: false },
  { href: "/notes", label: "Notes", icon: FileText, protected: false },
  { href: "/videos", label: "Live Classes", icon: Video, protected: false },
  { href: "/roadmap", label: "Roadmap", icon: Sparkles, protected: false },
  { href: "/quizzes", label: "Quizzes", icon: Award, protected: false }
];

export function PublicNavbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [realNotices, setRealNotices] = useState<RealNoticeItem[]>([]);
  
  // Modals & Drawers state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isMsgDrawerOpen, setIsMsgDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = getStoredSession();
      setSession(s);
    }
    fetchBackendNotices().then((data) => setRealNotices(data));
  }, []);

  // Global Ctrl+K or Cmd+K keyboard shortcut for Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setIsProfileDropdownOpen(false);
    router.push("/register");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-4 md:px-8 py-3">
          
          {/* BRANDING LOGO */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-orange-500 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105 duration-300">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-wider bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  STUDYMATERIAL
                </span>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 dark:text-blue-300">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Smart Learning Space
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS WITH ICONS (WITHOUT DASHBOARD AS REQUESTED) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const targetHref = item.protected && !session ? "/register" : item.href;
              return (
                <Link
                  key={item.label}
                  href={targetHref}
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <IconComp className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* GLOBAL SEARCH TRIGGER BAR */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center justify-between gap-3 w-64 lg:w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 px-3.5 py-2 text-xs font-medium text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-900 transition shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span>Search platform...</span>
            </div>
            <kbd className="hidden lg:inline-block rounded-md bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 border border-slate-200 dark:border-slate-700 shadow-xs">
              Ctrl+K
            </kbd>
          </button>

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* DARK / LIGHT MODE TOGGLE */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Dark/Light Mode"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </button>

            {/* NOTIFICATIONS BELL DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifDrawerOpen(!isNotifDrawerOpen);
                  setIsMsgDrawerOpen(false);
                  setIsProfileDropdownOpen(false);
                }}
                className="relative rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
              </button>

              {/* Notification Drawer with Real Notice Data */}
              {isNotifDrawerOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Real Notices & Alerts</span>
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {realNotices.length} Updates
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {realNotices.map((n) => (
                      <div key={n.id} className="py-3 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                          <span className="text-[10px] font-semibold text-orange-500">{n.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link href="/notices" onClick={() => setIsNotifDrawerOpen(false)} className="text-xs font-bold text-blue-600 hover:underline">
                      View Full Notice Board →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* MESSAGES ICON DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsMsgDrawerOpen(!isMsgDrawerOpen);
                  setIsNotifDrawerOpen(false);
                  setIsProfileDropdownOpen(false);
                }}
                className="relative rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Messages"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              </button>

              {/* Messages Drawer */}
              {isMsgDrawerOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Live Faculty Chat</span>
                    <Link href="/videos" onClick={() => setIsMsgDrawerOpen(false)} className="text-[11px] font-bold text-blue-600 hover:underline">
                      Open Live Room
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    <div className="py-3 flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0 text-xs">
                        DS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Dr. Ramesh Sharma (Faculty)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">&quot;Join today&apos;s live stream for interactive doubt clearing.&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE AVATAR DROPDOWN / AUTH BUTTONS */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    setIsNotifDrawerOpen(false);
                    setIsMsgDrawerOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="h-8 w-8 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {session.avatar ? (
                      <img src={session.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span>{session.name ? session.name[0] : "S"}</span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-200">
                    {session.name ? session.name.split(" ")[0] : "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100">{session.name || "Student"}</p>
                      <p className="text-[11px] text-slate-400 truncate">{session.email}</p>
                      <span className="mt-1.5 inline-block rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {session.grade} {session.stream}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>

                      <Link
                        href="/edit-profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>

                      {(session.role === "admin" || session.isAdmin) && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition border border-amber-500/20"
                        >
                          <ShieldCheck className="h-4 w-4 text-amber-500" />
                          Admin Console
                        </Link>
                      )}

                      {(session.role === "teacher" || session.email === "teacher@studymaterial.com") && (
                        <Link
                          href="/teacher"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition border border-blue-500/20"
                        >
                          <Award className="h-4 w-4 text-blue-500" />
                          Teacher Portal
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:opacity-95"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Register
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE RESPONSIVE DRAWER MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const targetHref = item.protected && !session ? "/register" : item.href;
              return (
                <Link
                  key={item.label}
                  href={targetHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition"
                >
                  <IconComp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  {item.label}
                </Link>
              );
            })}

            {!session && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                  Register Free Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
