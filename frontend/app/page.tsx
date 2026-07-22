"use client";

import Link from "next/link";
import { useState } from "react";
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Layout,
  ExternalLink,
  PlayCircle,
  FileText,
  ScrollText,
  NotebookTabs,
  Download,
  BarChart3,
  Users,
  ShieldCheck,
  Search,
  BookOpen,
  Eye,
  Maximize2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicShell } from "@/components/public-shell";
import {
  databaseCollections,
  flowSteps,
  mainFeatures,
  techStack,
  gradeConfig
} from "@/lib/platform-data";

const pageMockups = [
  { id: 1, title: "1. Login / Registration", category: "Authentication", route: "/login", desc: "Student Login, Registration, Class & Stream selection, Email/Password, Remember Me, Forgot Password." },
  { id: 2, title: "2. Student Dashboard", category: "Core Platform", route: "/dashboard", desc: "Welcome Student, Search Bar, Notification Bell, Profile Avatar, 9 Learning Cards, Stats: 24 Notes, 15 Papers, 8 Quizzes, 85% Score." },
  { id: 3, title: "3. Subjects Page", category: "Class-Wise", route: "/subjects", desc: "Displays subject cards according to selected class and stream with Total Notes, Papers, Videos, Quizzes, Download Button." },
  { id: 4, title: "4. Notes Page", category: "Study Material", route: "/notes", desc: "Subject Wise PDF Notes, Upload Date, File Size, PDF Viewer Preview Modal, Download Button." },
  { id: 5, title: "5. Previous Papers Page", category: "Board Exams", route: "/previous-papers", desc: "Year Wise Papers (2025 - 2021) with exam terms and direct PDF Download button." },
  { id: 6, title: "6. Quiz Page", category: "Assessment", route: "/quizzes", desc: "Interactive MCQ Quiz Player, 15:00 Timer, Question navigator, radio choices, instant Result & Accuracy score." },
  { id: 7, title: "7. Video Lectures Page", category: "E-Learning", route: "/videos", desc: "Subject Wise Video Lectures with duration, instructor name, thumbnail, and 1080p Video Player Modal." },
  { id: 8, title: "8. Notices Page", category: "Notice Board", route: "/notices", desc: "Latest Announcements, Exam Updates, Holiday Notices with category filters." },
  { id: 9, title: "9. Downloads Page", category: "User Storage", route: "/downloads", desc: "Downloaded Files History tracking saved PDF notes and board papers with re-download option." },
  { id: 10, title: "10. Results Page", category: "Analytics", route: "/results", desc: "Quiz Results table, overall performance charts, accuracy %, correct/incorrect score breakdown." },
  { id: 11, title: "11. Progress Page", category: "Tracking", route: "/progress", desc: "Overall Progress Bar, Completed Quizzes (6/8), Downloaded Notes (18), Downloaded Papers (9), Subject Mastery." },
  { id: 12, title: "12. Forgot Password", category: "Account Security", route: "/forgot-password", desc: "Email verification & automated password recovery link trigger." },
  { id: 13, title: "13. Reset Password", category: "Account Security", route: "/reset-password", desc: "Secure password reset form with confirmation validation." },
  { id: 14, title: "14. Edit Profile", category: "Settings", route: "/edit-profile", desc: "Form to update student identity, class, stream, profile avatar, and bio details." },
  { id: 15, title: "15. Admin Dashboard", category: "Management", route: "/admin", desc: "Admin Cards (Total Users, Notes, Papers, Quizzes, Downloads), Management Tabs, Upload PDF/Video, Recent Activities Panel, Analytics Charts." }
];

const classStreamMatrix = [
  { class: "10th Class", stream: "General", subjects: ["Mathematics", "Science", "Social Science", "English", "Hindi"] },
  { class: "11th Class", stream: "Medical", subjects: ["Biology", "Physics", "Chemistry", "English"] },
  { class: "11th Class", stream: "Non-Medical", subjects: ["Physics", "Chemistry", "Mathematics", "English"] },
  { class: "11th Class", stream: "Commerce", subjects: ["Accountancy", "Business Studies", "Economics", "English"] },
  { class: "11th Class", stream: "Arts", subjects: ["History", "Political Science", "Sociology", "English"] },
  { class: "12th Class", stream: "Medical", subjects: ["Biology", "Physics", "Chemistry"] },
  { class: "12th Class", stream: "Non-Medical", subjects: ["Mathematics", "Physics", "Chemistry"] },
  { class: "12th Class", stream: "Commerce", subjects: ["Accountancy", "Economics", "Business Studies"] },
  { class: "12th Class", stream: "Arts", subjects: ["History", "Geography", "Political Science"] }
];

export default function PresentationBoardPage() {
  const [selectedMockup, setSelectedMockup] = useState<typeof pageMockups[0] | null>(null);

  return (
    <PublicShell>
      <div className="page-shell space-y-12 px-4 py-6 md:px-8 md:py-8 max-w-[1600px] mx-auto">
        {/* SECTION 1: MAIN TITLE & HERO INFOGRAPHIC HEADER */}
        <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-950 p-8 md:p-12 text-white shadow-2xl border border-white/10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 space-y-8 text-center max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-1.5 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                Ultra HD 4K Presentation Board • Behance & Dribbble Level
              </Badge>
              <Badge className="bg-orange-500 text-white px-4 py-1.5 font-bold text-xs uppercase tracking-wider">
                Figma Quality SaaS UI
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-extrabold tracking-[0.4em] text-orange-400">STUDY MATERIAL</p>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                STUDY MATERIAL – EDUCATIONAL PLATFORM
              </h1>
              <p className="text-lg md:text-2xl font-semibold text-blue-100/90 max-w-4xl mx-auto leading-relaxed">
                One Platform for 10th, 11th & 12th Students (Medical, Non-Medical, Commerce & Arts)
              </p>
            </div>

            {/* Platform Quick Stats Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15">
                <p className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">15 Website Pages</p>
                <p className="text-2xl font-extrabold text-white mt-1">100% Built</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15">
                <p className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Class-Wise Filter</p>
                <p className="text-2xl font-extrabold text-orange-300 mt-1">Isolated</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15">
                <p className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Design Theme</p>
                <p className="text-2xl font-extrabold text-white mt-1">Blue & Orange</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15">
                <p className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Quality Standard</p>
                <p className="text-2xl font-extrabold text-emerald-300 mt-1">Apple UI Level</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/dashboard" className="inline-flex h-14 items-center justify-center rounded-2xl bg-orange-500 px-8 text-base font-extrabold text-white shadow-premium hover:bg-orange-600 transition">
                Open Interactive Student App <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/admin" className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-base font-extrabold text-slate-900 shadow-premium hover:bg-slate-50 transition">
                Open Admin Control Center
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2: COMPLETE PLATFORM USER FLOW STEPPER */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-700 font-bold">Complete Student Lifecycle</Badge>
            <h2 className="text-3xl font-extrabold text-slate-950">Platform User Flow</h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              From student registration to class stream selection, interactive learning, quizzes, results, and progress metrics.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
            {flowSteps.map((step, idx) => (
              <div key={step} className="group relative rounded-2xl border border-white/60 bg-white/80 p-4 text-center shadow-glass backdrop-blur-xl hover:shadow-xl hover:border-blue-500 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs mx-auto mb-2 group-hover:scale-110 transition">
                  {idx + 1}
                </div>
                <p className="text-xs font-bold text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: CLASS & STREAM SUBJECT MATRIX */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-orange-100 text-orange-700 font-bold">Class-Wise Isolation Engine</Badge>
            <h2 className="text-3xl font-extrabold text-slate-950">Class & Stream Configuration Matrix</h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              When a student selects a class, only that class study material appears on their dashboard.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {classStreamMatrix.map((item, idx) => (
              <Card key={idx} className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-600 text-white font-bold">{item.class}</Badge>
                  <Badge className="bg-orange-100 text-orange-700 font-bold">{item.stream}</Badge>
                </div>
                <h3 className="font-extrabold text-lg text-slate-950 mb-2">{item.class} – {item.stream}</h3>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {item.subjects.map((s) => (
                    <span key={s} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 4: SINGLE LARGE INFOGRAPHIC SHOWCASE – ALL 15 WEBSITE PAGES GRID */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-700 font-bold">Single Large Infographic Visual Board</Badge>
            <h2 className="text-3xl font-extrabold text-slate-950">All 15 Website Pages Mockup Presentation</h2>
            <p className="text-slate-600 text-sm max-w-3xl mx-auto">
              Complete high-resolution representation of all 15 platform views designed in blue & white theme with orange accent, glassmorphism, soft shadows, and rounded corners.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pageMockups.map((page) => (
              <Card
                key={page.id}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/90 p-6 shadow-glass backdrop-blur-xl transition hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Mockup Header Pill */}
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-50 text-blue-700 font-bold">{page.category}</Badge>
                    <span className="text-xs font-bold text-slate-400">Ultra HD 4K</span>
                  </div>

                  {/* Mockup Screen Visual Simulation Frame */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 text-white shadow-inner flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">studymaterial.edu{page.route}</span>
                    </div>

                    <div className="my-auto text-center space-y-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 mx-auto">
                        <Layout className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-white">{page.title}</p>
                      <p className="text-[10px] text-blue-200/80 max-w-xs mx-auto line-clamp-2">{page.desc}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                      <span>Status: Verified Live</span>
                      <span className="text-orange-400 font-bold">Class-Wise</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950 group-hover:text-blue-600 transition">{page.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{page.desc}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex gap-2">
                  <Link href={page.route} className="flex-1">
                    <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow">
                      <ExternalLink className="mr-2 h-4 w-4" /> Launch Page View
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setSelectedMockup(page)}
                    variant="outline"
                    className="h-11 px-3 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 5: MAIN FEATURES CHECKLIST */}
        <section className="rounded-[3rem] bg-white p-8 md:p-12 shadow-glass backdrop-blur-xl border border-white/60 space-y-8">
          <div className="text-center space-y-2">
            <Badge className="bg-emerald-100 text-emerald-700 font-bold">Comprehensive Capabilities</Badge>
            <h2 className="text-3xl font-extrabold text-slate-950">Main Features Checklist</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mainFeatures.map((feat) => (
              <div key={feat} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                <span className="font-bold text-sm text-slate-900">{feat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: TECH STACK & DATABASE COLLECTIONS ARCHITECTURE */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* Tech Stack Card */}
          <Card className="rounded-[3rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-2xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">Tech Stack Section</h3>
                <p className="text-xs text-slate-400">Enterprise production web technologies</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {techStack.map((tech) => (
                <span key={tech} className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md">
                  {tech}
                </span>
              ))}
            </div>
          </Card>

          {/* Database Collections Card */}
          <Card className="rounded-[3rem] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-8 text-white shadow-2xl border border-white/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">Database Collections</h3>
                <p className="text-xs text-slate-400">MongoDB Atlas NoSQL schema architecture</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {databaseCollections.map((col) => (
                <div key={col} className="rounded-xl bg-white/10 border border-white/15 p-3 text-center backdrop-blur-md">
                  <p className="text-xs font-extrabold text-orange-300">{col}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Mockup Fullscreen Modal */}
        {selectedMockup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-4xl rounded-[3rem] bg-white p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <Badge className="bg-blue-100 text-blue-700 mb-1">{selectedMockup.category}</Badge>
                  <h3 className="text-2xl font-extrabold text-slate-900">{selectedMockup.title}</h3>
                </div>
                <button onClick={() => setSelectedMockup(null)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200">
                  <ExternalLink className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="h-80 rounded-2xl bg-slate-950 p-8 text-white flex flex-col items-center justify-center text-center space-y-4">
                <Layout className="h-16 w-16 text-orange-400 animate-bounce" />
                <div>
                  <h4 className="text-2xl font-extrabold">{selectedMockup.title} Mockup Screen</h4>
                  <p className="text-sm text-slate-300 max-w-lg mt-2">{selectedMockup.desc}</p>
                </div>
                <Badge className="bg-orange-500 text-white font-bold">Ultra HD 4K Figma Quality Preview</Badge>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setSelectedMockup(null)} className="rounded-xl">
                  Close Window
                </Button>
                <Link href={selectedMockup.route}>
                  <Button className="rounded-xl bg-blue-600 text-white font-semibold">
                    Launch Interactive Page <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
