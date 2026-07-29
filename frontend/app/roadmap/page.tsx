"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Clock
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Badge } from "@/components/ui/badge";

type RoadmapCard = {
  title: string;
  status: string;
  accent: string;
  icon: typeof Users;
  summary: string;
  items: string[];
};

const roadmapPhases: Array<{
  phase: string;
  title: string;
  description: string;
  cards: RoadmapCard[];
}> = [
  {
    phase: "01",
    title: "Teaching and learning core",
    description: "The base layer for faculty, live sessions, structured content, and student progress tracking.",
    cards: [
      {
        title: "Teacher Module",
        status: "Priority",
        accent: "from-blue-600 to-indigo-600",
        icon: Users,
        summary: "Teacher workspace for planning, publishing, and monitoring classes.",
        items: ["Teacher Dashboard", "Teacher Profile", "Teacher Analytics", "Teacher Attendance Report", "Teacher Timetable"]
      },
      {
        title: "Recorded Video Module",
        status: "Priority",
        accent: "from-rose-500 to-orange-500",
        icon: Video,
        summary: "A cinematic video hub for lectures, playlists, and continue-watching journeys.",
        items: ["Upload Recorded Videos", "Video Player", "Continue Watching", "Watch History", "Chapter-wise Videos", "Playlist"]
      },
      {
        title: "Assignments",
        status: "Priority",
        accent: "from-amber-500 to-orange-600",
        icon: FileText,
        summary: "Assignment workflow from publishing to submission, marks, and teacher feedback.",
        items: ["Create Assignment", "Student Submission", "Assignment Marks", "Teacher Feedback"]
      },
      {
        title: "Attendance System",
        status: "Priority",
        accent: "from-emerald-500 to-teal-600",
        icon: CheckCircle2,
        summary: "Attendance capture for live and classroom sessions with reporting layers.",
        items: ["Student Attendance", "Live Class Attendance", "Attendance Reports", "Monthly Attendance"]
      },
      {
        title: "Student Progress",
        status: "Priority",
        accent: "from-violet-600 to-fuchsia-600",
        icon: BarChart3,
        summary: "Progress signals across learning, subjects, chapters, quizzes, and time ranges.",
        items: ["Learning Progress", "Subject Progress", "Chapter Progress", "Quiz Performance", "Weekly & Monthly Progress"]
      },
      {
        title: "Discussion System",
        status: "Priority",
        accent: "from-sky-600 to-cyan-600",
        icon: MessageSquare,
        summary: "A moderated doubt-clearing and forum experience for students and teachers.",
        items: ["Question & Answer", "Student Comments", "Teacher Replies", "Discussion Forum"]
      }
    ]
  },
  {
    phase: "02",
    title: "Student experience and communication",
    description: "Tools that keep students organized, informed, and engaged across the week.",
    cards: [
      {
        title: "Bookmarks",
        status: "Student favorite",
        accent: "from-slate-700 to-slate-900",
        icon: BookOpen,
        summary: "Saved learning assets so important notes, papers, and subjects stay one tap away.",
        items: ["Save Notes", "Save Videos", "Save Papers", "Favourite Subjects"]
      },
      {
        title: "Calendar & Timetable",
        status: "Student favorite",
        accent: "from-indigo-500 to-blue-600",
        icon: Calendar,
        summary: "A reliable planning layer for class schedules, exams, and live sessions.",
        items: ["Daily Schedule", "Weekly Timetable", "Exam Calendar", "Live Class Calendar"]
      },
      {
        title: "Notifications",
        status: "Student favorite",
        accent: "from-amber-500 to-rose-500",
        icon: Bell,
        summary: "Timely nudges for classes, assignments, and quiz reminders across channels.",
        items: ["Push Notifications", "Email Notifications", "Class Reminder", "Assignment Reminder", "Quiz Reminder"]
      },
      {
        title: "Certificates",
        status: "Motivation",
        accent: "from-yellow-500 to-orange-500",
        icon: Award,
        summary: "A certificate layer that rewards quiz completion and course progress.",
        items: ["Quiz Certificate", "Course Completion Certificate", "Download Certificate"]
      },
      {
        title: "Reports",
        status: "Insights",
        accent: "from-cyan-600 to-blue-700",
        icon: TrendingUp,
        summary: "Printable academic and attendance summaries for students, teachers, and parents.",
        items: ["Student Report", "Teacher Report", "Attendance Report", "Performance Report", "Download Report"]
      },
      {
        title: "Feedback System",
        status: "Trust layer",
        accent: "from-fuchsia-600 to-pink-600",
        icon: Sparkles,
        summary: "A feedback loop for improving teaching quality and live class experience.",
        items: ["Student Feedback", "Teacher Rating", "Live Class Rating"]
      }
    ]
  },
  {
    phase: "03",
    title: "Operations, scale, and future intelligence",
    description: "The admin, AI, performance, and deployment layer that keeps the platform dependable.",
    cards: [
      {
        title: "Parent Module",
        status: "Optional",
        accent: "from-emerald-600 to-blue-600",
        icon: Users,
        summary: "A family-facing view for progress, attendance, and marks.",
        items: ["Parent Dashboard", "Student Progress", "Attendance", "Marks"]
      },
      {
        title: "Admin Features",
        status: "System control",
        accent: "from-slate-700 to-slate-950",
        icon: ShieldCheck,
        summary: "Operational controls for governance, moderation, and system safety.",
        items: ["Activity Logs", "Backup & Restore", "Role Permission Manager", "Content Approval System"]
      },
      {
        title: "AI Features",
        status: "Future",
        accent: "from-purple-600 to-indigo-600",
        icon: Sparkles,
        summary: "AI assistance for learning, planning, and doubt solving.",
        items: ["AI Chatbot", "AI Quiz Generator", "AI Doubt Solver", "AI Study Planner"]
      },
      {
        title: "Performance",
        status: "Scale",
        accent: "from-teal-600 to-emerald-600",
        icon: Clock,
        summary: "Optimization work to keep the app fast on low bandwidth and large datasets.",
        items: ["Caching", "Lazy Loading", "Image Optimization", "API Optimization"]
      },
      {
        title: "Deployment",
        status: "Release",
        accent: "from-orange-600 to-red-600",
        icon: Download,
        summary: "Infrastructure checklist for shipping and maintaining the platform reliably.",
        items: ["MongoDB Atlas", "Vercel Deployment", "Render Deployment", "Environment Variables", "CI/CD Pipeline"]
      }
    ]
  }
];

const summaryStats = [
  { label: "Requested modules", value: "17+" },
  { label: "User personas", value: "4" },
  { label: "Priority phases", value: "3" }
];

export default function RoadmapPage() {
  return (
    <PublicShell>
      <main className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_42%),linear-gradient(180deg,_rgba(15,23,42,0.03),_transparent)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_45%),linear-gradient(180deg,_rgba(15,23,42,0.34),_transparent)]" />

        <section className="max-w-[1600px] mx-auto px-6 md:px-12 pt-14 md:pt-20 pb-10">
          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 space-y-6">
              <Badge className="rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Product roadmap
              </Badge>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.05]">
                  Everything that is coming to
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                    StudyMaterial
                  </span>
                </h1>
                <p className="max-w-2xl text-sm md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  This page turns the feature list into a clear product experience. Instead of a flat checklist, users can see how
                  the platform is evolving across teaching, learning, reporting, AI, and deployment.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01]"
                >
                  Open Student Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/teacher"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Teacher Portal
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {summaryStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm backdrop-blur"
                  >
                    <p className="text-3xl font-black text-slate-950 dark:text-white">{item.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-slate-950 text-white p-6 md:p-8 shadow-2xl shadow-blue-950/20 overflow-hidden relative">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/10">
                        <Sparkles className="h-6 w-6 text-orange-300" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">UX direction</p>
                        <p className="text-sm font-bold text-white">Cleaner, faster, more guided</p>
                      </div>
                    </div>
                    <Badge className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Planning
                    </Badge>
                  </div>

                  <div className="grid gap-3">
                    {[
                      "Teacher-first dashboards with clear class actions",
                      "Video, assignment, and attendance workflows in one flow",
                      "Reports, parent visibility, and AI helpers for scale",
                      "Mobile-friendly layouts with low-friction navigation"
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                        <p className="text-sm text-slate-200 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl bg-white text-slate-900 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Launch focus</p>
                        <p className="text-lg font-black">Teaching and learning core</p>
                      </div>
                      <BarChart3 className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-600 to-orange-500" />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Core academic features first, then communication, then intelligent automation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {roadmapPhases.map((phase) => (
          <section key={phase.phase} className="max-w-[1600px] mx-auto px-6 md:px-12 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div className="space-y-2">
                <Badge className="w-fit rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em]">
                  Phase {phase.phase}
                </Badge>
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-950 dark:text-white">{phase.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600 dark:text-slate-400">{phase.description}</p>
                </div>
              </div>
              <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Want early access?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {phase.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="group rounded-[1.9rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-black/10`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black text-slate-950 dark:text-white">{card.title}</h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{card.summary}</p>
                        </div>
                        <Badge className="whitespace-nowrap rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {card.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-2">
                        {card.items.map((item) => (
                          <div key={item} className="flex items-start gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <section className="max-w-[1600px] mx-auto px-6 md:px-12 pb-20">
          <div className="rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-950 p-8 md:p-10 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-center">
              <div className="space-y-3">
                <Badge className="w-fit rounded-full bg-white/10 text-white border border-white/20">
                  Ready for product expansion
                </Badge>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                  This roadmap is structured to ship in layers, without breaking the current experience.
                </h2>
                <p className="max-w-2xl text-sm md:text-base text-blue-100 leading-relaxed">
                  We first strengthen the teaching workflow, then student engagement, then parent and admin visibility, and
                  finally AI and deployment hardening.
                </p>
              </div>

              <div className="rounded-[1.75rem] bg-white/10 border border-white/15 p-5 backdrop-blur-sm space-y-3">
                {[
                  "Teacher and student UX stays consistent across modules",
                  "Every section is optimized for mobile and desktop",
                  "Feature rollout can happen gradually without redesigning the whole app"
                ].map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-white/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
