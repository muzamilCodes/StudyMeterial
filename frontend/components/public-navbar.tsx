"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LayoutDashboard, LogIn, Menu, LogOut, User, UserPlus } from "lucide-react";
import { getStoredSession, clearSession, type StudentSession } from "@/lib/session";

const navItems = [
  { href: "/", label: "Home", protected: false },
  { href: "/dashboard", label: "Dashboard", protected: true },
  { href: "/subjects", label: "Subjects", protected: false },
  { href: "/notes", label: "Notes", protected: false }
];

export function PublicNavbar() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = getStoredSession();
      setSession(s);
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    router.push("/register");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 px-6 py-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-lg transition-transform group-hover:scale-105 duration-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black tracking-[0.24em] bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              STUDY MATERIAL
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Smart Study Space
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden items-center gap-1.5 lg:flex">
          {navItems.map((item) => {
            const targetHref = item.protected && !session ? "/register" : item.href;
            return (
              <Link
                key={item.label}
                href={targetHref}
                className="relative rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA BUTTONS / LOGOUT BUTTON */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link
                href="/edit-profile"
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm hover:shadow transition"
              >
                <div className="h-8 w-8 rounded-xl overflow-hidden bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  {session.avatar ? (
                    <img src={session.avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{session.name ? session.name[0] : "S"}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800">{session.name ? session.name.split(" ")[0] : "Profile"}</span>
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Register Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM SLIDE NAV */}
      <div className="w-full px-4 pb-3 lg:hidden">
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/95 p-1.5 shadow-sm">
          <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-extrabold text-slate-700">
            <Menu className="h-3.5 w-3.5 text-blue-600" />
            Menu
          </span>
          {navItems.map((item) => {
            const targetHref = item.protected && !session ? "/register" : item.href;
            return (
              <Link
                key={item.label}
                href={targetHref}
                className="shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                {item.label}
              </Link>
            );
          })}
          {session ? (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition ml-auto flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          ) : (
            <Link
              href="/register"
              className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition ml-auto"
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
