import Link from "next/link";
import { BookOpen, ClipboardCheck, BellRing, CalendarDays, Trophy, ArrowRight } from "lucide-react";

const stats = [
  { label: "Assignments", value: "12 pending", icon: ClipboardCheck },
  { label: "Quiz Score", value: "86%", icon: Trophy },
  { label: "Notices", value: "4 new", icon: BellRing },
  { label: "Timetable", value: "Today 3", icon: CalendarDays }
];

export default function StudentPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_45%),linear-gradient(180deg,#f8fafc,#e2e8f0)] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            <BookOpen className="h-4 w-4" />
            Student Portal
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Your daily learning cockpit</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Track attendance, assignments, quizzes, notes, timetable, results, and notifications from a focused student workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/student/login" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/student/register" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800">
              Register
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-lg">
                <Icon className="h-6 w-6 text-blue-600" />
                <p className="mt-6 text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{stat.value}</p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
