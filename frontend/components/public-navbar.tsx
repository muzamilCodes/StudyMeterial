import Link from "next/link";
import { GraduationCap, LayoutDashboard, LogIn, Menu } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/subjects", label: "Subjects" },
  { href: "/notes", label: "Notes" },
  { href: "/admin", label: "Admin" }
];

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/75 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-premium">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-blue-700">STUDY MATERIAL</p>
            <p className="text-xs text-slate-500">Educational Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-premium transition hover:bg-blue-700 md:inline-flex"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="page-shell px-4 pb-4 md:px-6 lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-2">
          <span className="flex shrink-0 items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700">
            <Menu className="h-4 w-4" />
            Menu
          </span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
