"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ScrollText, 
  Award, 
  Video, 
  Download, 
  BarChart3, 
  Sparkles, 
  Bell, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  CheckSquare, 
  Play, 
  ExternalLink,
  ShieldAlert,
  Flame,
  Zap,
  TrendingUp,
  RefreshCw,
  Eye
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { 
  fetchBackendNotes, 
  fetchBackendPapers, 
  fetchBackendQuizzes, 
  fetchBackendNotices, 
  getDownloadedFiles, 
  getQuizResults,
  logDownload,
  type RealNoteItem,
  type RealPaperItem,
  type RealNoticeItem,
  type DownloadRecord,
  type QuizResultRecord
} from "@/lib/store";

export default function DashboardPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  
  // Real API / Store state
  const [notes, setNotes] = useState<RealNoteItem[]>([]);
  const [papers, setPapers] = useState<RealPaperItem[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [notices, setNotices] = useState<RealNoticeItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // PDF Preview State
  const [previewPdf, setPreviewPdf] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    async function loadDashboardData() {
      setLoading(true);
      try {
        const grade = s?.grade ?? "11th";
        const stream = s?.stream ?? "Medical";

        const [notesData, papersData, quizzesData, noticesData] = await Promise.all([
          fetchBackendNotes(grade, stream),
          fetchBackendPapers(grade, stream),
          fetchBackendQuizzes(grade, stream),
          fetchBackendNotices()
        ]);

        setNotes(notesData);
        setPapers(papersData);
        setQuizzes(quizzesData);
        setNotices(noticesData);

        setDownloads(getDownloadedFiles());
        setQuizResults(getQuizResults());
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";

  // Calculate learning progress mastery
  const totalItemsAvailable = notes.length + papers.length + quizzes.length;
  const completedCount = downloads.length + quizResults.length;
  const progressPercent = Math.min(100, Math.round(((completedCount || 3) / (totalItemsAvailable || 10)) * 100));

  const handleDownload = (title: string, subject: string, category: "PDF Note" | "Previous Paper", fileSize: string, fileUrl?: string) => {
    logDownload(title, subject, category, fileSize, fileUrl);
    setDownloads(getDownloadedFiles());
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      alert(`Downloaded "${title}" (${fileSize}). Updated in your downloads history.`);
    }
  };

  return (
    <SiteShell
      title="Student Learning Dashboard"
      description={`Personalized learning hub for Class ${grade} (${stream} Stream)`}
    >
      <div className="space-y-8">
        
        {/* ========================================================= */}
        {/* WELCOME BANNER & STUDENT PROFILE SUMMARY */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 md:p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-blue-200 border border-white/20">
                  Class {grade} • {stream}
                </span>
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-extrabold text-orange-300 border border-orange-500/30 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" /> Active 5-Day Study Streak
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Welcome Back, {session?.name || "Student"}! 👋
              </h2>
              <p className="text-xs md:text-sm text-blue-100 max-w-2xl leading-relaxed">
                Here is your daily study status overview. You have 3 pending assignments and 2 upcoming live interactive classes scheduled today.
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/videos"
                className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-orange-600 transition"
              >
                <Play className="h-4 w-4 fill-white" />
                Join Live Stream
              </Link>
              <Link
                href="/quizzes"
                className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-5 py-3 text-xs font-bold text-white hover:bg-white/20 border border-white/20 transition"
              >
                <Award className="h-4 w-4" />
                Take Quick Quiz
              </Link>
            </div>
          </div>

          {/* Learning Progress Bar */}
          <div className="pt-4 border-t border-white/15 space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-blue-200">Overall Course Mastery & Completion Progress</span>
              <span className="text-orange-300 font-extrabold">{progressPercent}% Completed</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ROADMAP STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Teacher and content studio",
              desc: "Teacher dashboard, profile, analytics, attendance, recordings, and assignments.",
              href: "/roadmap",
              icon: CheckSquare
            },
            {
              title: "Student progress layer",
              desc: "Learning progress, bookmarks, certificates, feedback, and weekly reporting.",
              href: "/roadmap",
              icon: TrendingUp
            },
            {
              title: "AI and platform scale",
              desc: "AI helpers, caching, deployment, role management, and admin controls.",
              href: "/roadmap",
              icon: Zap
            }
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-xl transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 12 DYNAMIC DASHBOARD WIDGETS GRID */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* WIDGET 1: LIVE CLASSES */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Classes</h3>
                    <p className="text-[11px] text-slate-400">Interactive Rooms</p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[10px] font-extrabold border border-rose-500/20">
                  LIVE NOW
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Cell Biology & Genetics Masterclass</p>
                <p className="text-[11px] text-slate-400">Dr. Ramesh Sharma • Today 4:00 PM</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 animate-pulse" /> Starts in 15 mins
                  </span>
                  <Link href="/videos" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Enter Class Room →
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/videos" className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View All Scheduled Live Stream Lectures
            </Link>
          </div>

          {/* WIDGET 2: NOTICES */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notice Board</h3>
                    <p className="text-[11px] text-slate-400">Official Updates</p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2 py-0.5 text-[10px] font-extrabold">
                  {notices.length} Notices
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {notices.slice(0, 2).map((n) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-orange-500 font-bold mb-0.5">
                      <span>{n.category || "Notice"}</span>
                      <span className="text-slate-400">{n.date}</span>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{n.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/notices" className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Open Full Notice Board
            </Link>
          </div>

          {/* WIDGET 3: ASSIGNMENTS */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assignments</h3>
                    <p className="text-[11px] text-slate-400">Homework & Submissions</p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-bold">
                  2 Pending
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Biology Lab Report Chapter 4</p>
                    <p className="text-[10px] text-rose-500 font-bold mt-0.5">Due: Tomorrow 11:59 PM</p>
                  </div>
                  <span className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-[10px] font-bold">Submit</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Physics Vector Numericals</p>
                    <p className="text-[10px] text-amber-500 font-bold mt-0.5">Due: July 30, 2026</p>
                  </div>
                  <span className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-[10px] font-bold">Submit</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs font-bold text-slate-400">All submissions synced with faculty server</p>
          </div>

          {/* WIDGET 4: ATTENDANCE */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Tracker</h3>
                  <p className="text-[11px] text-slate-400">Monthly Attendance Rate</p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">94.5%</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600 dark:text-slate-400">Classes Attended:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">38 / 40 Sessions</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[94.5%]" />
              </div>
              <p className="text-[11px] text-slate-400">Maintained regular attendance threshold for final examinations.</p>
            </div>
          </div>

          {/* WIDGET 5: NOTES */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent PDF Notes</h3>
                    <p className="text-[11px] text-slate-400">Class {grade} {stream}</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[10px] font-bold">
                  {notes.length} Total
                </span>
              </div>

              <div className="space-y-2">
                {notes.slice(0, 2).map((n) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-orange-500 font-bold">{n.subject} • {n.fileSize}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(n.title, n.subject, "PDF Note", n.fileSize, n.pdfUrl)}
                      className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/notes" className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Browse All Class Notes Archive
            </Link>
          </div>

          {/* WIDGET 6: STUDY MATERIALS */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Study Materials</h3>
                    <p className="text-[11px] text-slate-400">Curated Reference Guides</p>
                  </div>
                </div>
                <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-2 py-0.5 text-[10px] font-bold">
                  NCERT & Exemplar
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">NCERT Biology Class 11th Chapterwise Solutions</p>
                <p className="text-[10px] text-slate-400">Full textbook solutions with diagrams</p>
                <Link href="/subjects" className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
                  Access Study Drive →
                </Link>
              </div>
            </div>

            <Link href="/subjects" className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Explore All Subjects & Books
            </Link>
          </div>

          {/* WIDGET 7: QUIZ RESULTS */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quiz Results</h3>
                    <p className="text-[11px] text-slate-400">Past Test Scores</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                  {quizResults.length} Attempted
                </span>
              </div>

              {quizResults.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                  No quizzes attempted yet. Take your first quiz today!
                </div>
              ) : (
                <div className="space-y-2">
                  {quizResults.slice(0, 2).map((res) => (
                    <div key={res.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{res.quizTitle}</p>
                        <p className="text-[10px] text-slate-400">{res.completedAt}</p>
                      </div>
                      <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{res.accuracy}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/quizzes" className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Take Interactive Self-Assessment Quiz
            </Link>
          </div>

          {/* WIDGET 8: RECENT DOWNLOADS */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Downloads</h3>
                    <p className="text-[11px] text-slate-400">Offline Saved Material</p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 px-2 py-0.5 text-[10px] font-bold">
                  {downloads.length} Saved
                </span>
              </div>

              {downloads.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                  No files downloaded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {downloads.slice(0, 2).map((dl) => (
                    <div key={dl.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{dl.title}</p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">{dl.category} • {dl.fileSize}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{dl.downloadedAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/downloads" className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View Full Download History Log
            </Link>
          </div>

          {/* WIDGET 9: UPCOMING EXAMS */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Exams</h3>
                  <p className="text-[11px] text-slate-400">Board Schedule Countdown</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Biology Mid-Term Examination</p>
                  <p className="text-[10px] text-slate-400">Aug 12, 2026 • 10:00 AM</p>
                </div>
                <span className="rounded-lg bg-rose-500 text-white px-2.5 py-1 text-[10px] font-black">15 Days</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Physics Pre-Board Theory Test</p>
                  <p className="text-[10px] text-slate-400">Sep 04, 2026 • 09:30 AM</p>
                </div>
                <span className="rounded-lg bg-amber-500 text-white px-2.5 py-1 text-[10px] font-black">38 Days</span>
              </div>
            </div>
          </div>

          {/* WIDGET 10: LATEST NOTIFICATIONS */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Notifications</h3>
                  <p className="text-[11px] text-slate-400">Class & System Feed</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">2025 Physics Model Paper Added</p>
                  <p className="text-[10px] text-slate-400">Faculty uploaded solved board papers.</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">New Quiz Available: Cellular Anatomy</p>
                  <p className="text-[10px] text-slate-400">Test your knowledge before the exam.</p>
                </div>
              </div>
            </div>
          </div>

          {/* WIDGET 11: CALENDAR */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Calendar</h3>
                  <p className="text-[11px] text-slate-400">July - August 2026</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-center space-y-2">
              <div className="grid grid-cols-7 gap-1 font-bold text-[10px] text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 font-semibold text-[11px]">
                <span className="text-slate-300">27</span><span className="text-slate-300">28</span><span className="bg-blue-600 text-white rounded-lg p-1 font-black shadow">29</span><span>30</span><span>31</span><span>1</span><span>2</span>
              </div>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 pt-1">Today: Physics Live Session (4:00 PM)</p>
            </div>
          </div>

          {/* WIDGET 12: ANNOUNCEMENTS */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-orange-500/20 text-orange-300 px-3 py-1 text-[10px] font-black border border-orange-500/30">
                CRITICAL ANNOUNCEMENT
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Independence Day Special Scholarship Quiz</h4>
              <p className="text-xs text-slate-300 mt-1">
                Participate in the upcoming online state scholarship quiz on August 15th for free access to advanced prep material.
              </p>
            </div>
            <Link href="/quizzes" className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:underline">
              <span>Register for Quiz</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* PDF PREVIEW MODAL */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{previewPdf.title}</h3>
                <p className="text-xs text-slate-400">PDF Document Previewer</p>
              </div>
              <button
                onClick={() => setPreviewPdf(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-center">
              <FileText className="h-16 w-16 text-blue-600 mb-4 animate-bounce" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Interactive Document Viewer</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Document preview for &quot;{previewPdf.title}&quot; is active.
              </p>
              <button
                onClick={() => {
                  window.open(previewPdf.url, "_blank");
                  setPreviewPdf(null);
                }}
                className="mt-6 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                Open Full Document Window
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
