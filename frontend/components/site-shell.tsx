import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, Download, FileText, GraduationCap, LayoutDashboard, NotebookTabs, PlayCircle, ScrollText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/previous-papers", label: "Previous Papers", icon: ScrollText },
  { href: "/quizzes", label: "Quizzes", icon: NotebookTabs },
  { href: "/videos", label: "Videos", icon: PlayCircle },
  { href: "/notices", label: "Notices", icon: Sparkles },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/results", label: "Results", icon: BarChart3 },
  { href: "/progress", label: "Progress", icon: GraduationCap },
  { href: "/edit-profile", label: "Edit Profile", icon: Users },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
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
  return (
    <div className="page-shell grid min-h-screen gap-6 p-4 md:grid-cols-[280px_1fr] md:p-6">
      <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] rounded-[2rem] p-5 md:block">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-premium">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.28em] text-blue-700">STUDY MATERIAL</p>
            <p className="text-xs text-slate-500">Educational Platform</p>
          </div>
        </div>

        <div className="mb-5 rounded-3xl bg-gradient-to-br from-blue-600 to-slate-900 p-4 text-white shadow-premium">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-100">Class Aware</p>
          <h2 className="mt-2 text-lg font-semibold">Only selected class material appears.</h2>
          <p className="mt-2 text-sm text-blue-100/90">Role based, stream based, and subject filtered content.</p>
        </div>

        <nav className="grid gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white/70"
            >
              <item.icon className="h-4 w-4 text-blue-600" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="space-y-6">
        <header className="glass rounded-[2rem] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="mb-3 bg-blue-50 text-blue-700">Premium Educational SaaS</Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Student View</Button>
              <Button variant="accent">Admin View</Button>
            </div>
          </div>
        </header>
        {children}
        <footer className="glass rounded-[2rem] p-4 md:p-5">
          <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Study Material. Premium class-wise educational platform.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="transition hover:text-blue-600">Dashboard</Link>
              <Link href="/subjects" className="transition hover:text-blue-600">Subjects</Link>
              <Link href="/admin" className="transition hover:text-blue-600">Admin</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
