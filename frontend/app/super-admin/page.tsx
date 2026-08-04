import Link from "next/link";
import { Shield, Users, Settings, BarChart3, Database, ArrowRight } from "lucide-react";

const cards = [
  { label: "System Users", value: "4 Roles", icon: Users },
  { label: "Backups", value: "Ready", icon: Database },
  { label: "Audit Logs", value: "Enabled", icon: BarChart3 },
  { label: "Settings", value: "Centralized", icon: Settings }
];

export default function SuperAdminPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#0f172a_45%,#111827)] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200">
            <Shield className="h-4 w-4" />
            Super Admin Console
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Global control room for the study platform</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Manage users, permissions, analytics, backup and restore, notifications, and the overall system policy from a single secure surface.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/super-admin/login" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/super-admin/register" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white">
              Register
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <Icon className="h-6 w-6 text-cyan-300" />
                <p className="mt-6 text-sm text-slate-300">{card.label}</p>
                <p className="mt-1 text-2xl font-black">{card.value}</p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
