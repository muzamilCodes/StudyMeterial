"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  FileText, 
  Award, 
  Video, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Clock, 
  Users, 
  Star, 
  Bell, 
  TrendingUp, 
  Play, 
  ShieldCheck, 
  ChevronRight,
  Eye,
  Calendar
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { 
  fetchBackendNotes, 
  fetchBackendPapers, 
  fetchBackendQuizzes, 
  fetchBackendNotices,
  logDownload,
  type RealNoteItem, 
  type RealPaperItem, 
  type RealNoticeItem 
} from "@/lib/store";
import { GlobalSearchModal } from "@/components/global-search-modal";

export default function HomePage() {
  const [notes, setNotes] = useState<RealNoteItem[]>([]);
  const [papers, setPapers] = useState<RealPaperItem[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [notices, setNotices] = useState<RealNoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // PDF Preview Modal state
  const [activePdfPreview, setActivePdfPreview] = useState<{ title: string; url: string } | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [nData, pData, qData, notifData] = await Promise.all([
          fetchBackendNotes(),
          fetchBackendPapers(),
          fetchBackendQuizzes(),
          fetchBackendNotices()
        ]);
        setNotes(nData.slice(0, 4));
        setPapers(pData.slice(0, 4));
        setQuizzes(qData.slice(0, 3));
        setNotices(notifData.slice(0, 4));
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleDownloadFile = (title: string, subject: string, category: "PDF Note" | "Previous Paper", fileSize: string, fileUrl?: string) => {
    logDownload(title, subject, category, fileSize, fileUrl);
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      alert(`Downloading "${title}" (${fileSize}). Logged to your downloads history.`);
    }
  };

  return (
    <PublicShell>
      <div className="w-full space-y-20 pb-20">
        
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-28">
          {/* Animated Glow Backdrops */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/20 to-orange-500/20 blur-3xl pointer-events-none rounded-full animate-pulse-glow" />

          <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/60 px-4 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 backdrop-blur-md shadow-xs">
                <Sparkles className="h-4 w-4 text-orange-500 animate-spin" />
                <span>Next-Gen Smart Study Platform for 10th, 11th & 12th</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                Master Your Exams with <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                  Structured Study Materials
                </span>
              </h1>

              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-medium leading-relaxed">
                Access curated PDF notes, 10-year solved board papers, live interactive classes, and automated self-assessment quizzes tailored for Medical, Non-Medical, Commerce & General streams.
              </p>

              {/* Instant Search Bar Trigger */}
              <div className="pt-2">
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="w-full max-w-xl flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 pl-4 shadow-xl hover:border-blue-400 transition group"
                >
                  <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-sm">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>Search notes, paper year, subject or live class...</span>
                  </div>
                  <span className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md group-hover:bg-blue-700 transition">
                    Search Now
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition duration-200"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                
                <Link
                  href="/videos"
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Play className="h-4 w-4 text-orange-500 fill-orange-500" />
                  <span>Join Live Stream</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex items-center gap-6 text-xs font-bold text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Verified Faculty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>MongoDB API Integrated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>4.9 / 5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Card Collage */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md space-y-4">
                
                {/* Main Hero Banner Card */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live Session Active</span>
                    </div>
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">Class 11th</span>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-5 text-white shadow-inner">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Physics Masterclass</p>
                    <h3 className="text-lg font-bold mt-1">Newton&apos;s Laws & Mechanics Numericals</h3>
                    <p className="text-xs text-slate-300 mt-1">Instructor: Prof. Ananya Roy (10+ Yrs Exp)</p>
                    <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Users className="h-3.5 w-3.5 text-orange-400" /> 142 Students Attending
                      </span>
                      <Link href="/videos" className="rounded-xl bg-orange-500 px-3 py-1.5 font-bold text-white hover:bg-orange-600 transition">
                        Join Room
                      </Link>
                    </div>
                  </div>

                  {/* Floating Stats Pill 1 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">Cell Biology PDF Notes</p>
                        <p className="text-[10px] text-slate-400">Uploaded Today • 2.8 MB</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">1.4k DLs</span>
                  </div>

                  {/* Floating Stats Pill 2 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center font-bold">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">Organic Chemistry Quiz</p>
                        <p className="text-[10px] text-slate-400">12 Questions • 20 Mins</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">Take Quiz</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* PLATFORM METRICS BANNER */}
        {/* ========================================================= */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-1">
                <p className="text-3xl md:text-5xl font-black tracking-tight">12,400+</p>
                <p className="text-xs md:text-sm font-bold text-blue-200">Active Students</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-5xl font-black tracking-tight">850+</p>
                <p className="text-xs md:text-sm font-bold text-blue-200">Curated PDF Notes</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-5xl font-black tracking-tight">420+</p>
                <p className="text-xs md:text-sm font-bold text-blue-200">Solved Papers</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-5xl font-black tracking-tight">98.4%</p>
                <p className="text-xs md:text-sm font-bold text-blue-200">Pass Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PLATFORM ROADMAP PREVIEW */}
        {/* ========================================================= */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Product roadmap</span>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mt-1">
                The next set of platform upgrades
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                A cleaner overview of the teaching, learning, and scale features that are being added across StudyMaterial.
              </p>
            </div>
            <Link href="/roadmap" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
              <span>Open full roadmap</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                title: "Teacher Module",
                desc: "Dashboard, profile, analytics, attendance reports, and timetable controls.",
                icon: Users,
                tone: "from-blue-600 to-indigo-600"
              },
              {
                title: "Recorded Video Module",
                desc: "Upload videos, chapters, playlists, watch history, and continue watching.",
                icon: Video,
                tone: "from-rose-500 to-orange-500"
              },
              {
                title: "Attendance & Progress",
                desc: "Attendance, learning progress, quiz performance, and monthly reports.",
                icon: TrendingUp,
                tone: "from-emerald-500 to-teal-600"
              },
              {
                title: "AI, Admin & Deployment",
                desc: "AI chatbot, role permissions, backups, caching, and CI/CD ready scaling.",
                icon: ShieldCheck,
                tone: "from-slate-700 to-slate-950"
              }
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition space-y-4"
                >
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.tone} text-white flex items-center justify-center shadow-md`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* POPULAR SUBJECTS SECTION */}
        {/* ========================================================= */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Stream Subjects</span>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mt-1">Popular Academic Subjects</h2>
            </div>
            <Link href="/subjects" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
              <span>View All Subjects</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Biology", grade: "11th / 12th Medical", notes: 10, papers: 6, quizzes: 5, bg: "from-emerald-500 to-teal-600", icon: BookOpen },
              { name: "Physics", grade: "11th / 12th Non-Med & Med", notes: 9, papers: 6, quizzes: 5, bg: "from-blue-600 to-indigo-600", icon: BookOpen },
              { name: "Chemistry", grade: "11th / 12th Non-Med & Med", notes: 9, papers: 6, quizzes: 5, bg: "from-purple-600 to-pink-600", icon: BookOpen },
              { name: "Mathematics", grade: "10th General / 11th Non-Med", notes: 8, papers: 5, quizzes: 4, bg: "from-amber-500 to-orange-600", icon: BookOpen }
            ].map((sub, idx) => {
              const IconComponent = sub.icon;
              return (
                <div 
                  key={idx} 
                  className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${sub.bg} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{sub.grade}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">{sub.notes}</p>
                        <p className="text-[10px] text-slate-400">Notes</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">{sub.papers}</p>
                        <p className="text-[10px] text-slate-400">Papers</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">{sub.quizzes}</p>
                        <p className="text-[10px] text-slate-400">Quizzes</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/subjects`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition"
                  >
                    <span>Open Subject</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* LATEST NOTES & PREVIOUS PAPERS GRID (LIVE API DATA) */}
        {/* ========================================================= */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-12">
          
          {/* LATEST NOTES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-500">Study Materials</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-0.5">Latest Curated PDF Notes</h2>
              </div>
              <Link href="/notes" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Explore All Notes
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {note.grade} {note.stream}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">{note.fileSize}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">{note.subject}</p>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">{note.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setActivePdfPreview({ title: note.title, url: note.pdfUrl || "https://www.w3schools.com/html/mov_bbb.mp4" })}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownloadFile(note.title, note.subject, "PDF Note", note.fileSize, note.pdfUrl)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PREVIOUS YEAR PAPERS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-500">Board Examinations</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-0.5">Previous Year Solved Papers</h2>
              </div>
              <Link href="/previous-papers" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All Papers
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {paper.year} Exam
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">{paper.fileSize}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{paper.subject}</p>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">{paper.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleDownloadFile(paper.title, paper.subject, "Previous Paper", paper.fileSize, paper.fileUrl)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Solved Paper
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* LIVE CLASSES & QUIZZES SECTION */}
        {/* ========================================================= */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Live Classes Banner Card */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-extrabold text-rose-400 border border-rose-500/30">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                Live Classes Schedule
              </span>
              <span className="text-xs font-bold text-slate-400">Interactive Rooms</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-black">Daily Interactive Live Sessions</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Join live streaming lectures led by senior faculty members. Participate in real-time Q&A, clear doubts, and download class whiteboard slides.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: "NEET Biology: Human Physiology & Genetics", time: "Today, 4:00 PM", teacher: "Dr. Ramesh Sharma" },
                { title: "JEE Physics: Electromagnetic Induction & Waves", time: "Tomorrow, 11:00 AM", teacher: "Prof. Ananya Roy" }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <div>
                    <p className="font-bold text-white">{c.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.teacher} • {c.time}</p>
                  </div>
                  <Link href="/videos" className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 transition">
                    Join Room
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quizzes Preview Card */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">Self-Assessment</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Online Quizzes</h3>
              </div>
              <Link href="/quizzes" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {quizzes.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{q.subject}</span>
                    <span className="text-slate-400">{q.durationMinutes} Mins</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{q.topic || q.title}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{q.questions?.length || 10} Multiple Choice Questions</span>
                    <Link href="/quizzes" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      Start Test →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* TEACHER HIGHLIGHTS & TESTIMONIALS */}
        {/* ========================================================= */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-12 space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Expert Mentors</span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">Learn from Experienced Educators</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Our faculty members have over a decade of teaching experience in board preparation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Dr. Ramesh Sharma", role: "Senior Biology Faculty", exp: "14+ Years Exp", desc: "Specializes in NEET preparation, Cellular Biology, and Human Genetics." },
              { name: "Prof. Ananya Roy", role: "Physics Department Head", exp: "10+ Years Exp", desc: "Expert in Mechanics, Electromagnetism, and board paper problem solving." },
              { name: "Dr. Vikram Seth", role: "Organic Chemistry HOD", exp: "16+ Years Exp", desc: "Author of multiple chemistry competitive preparation guidebooks." }
            ].map((t, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition text-center space-y-3">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.name}</h3>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{t.role}</p>
                  <span className="inline-block mt-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-[10px] font-bold text-slate-500">
                    {t.exp}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================================= */}
        {/* OFFICIAL ANNOUNCEMENTS TICKER */}
        {/* ========================================================= */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Official Notices & Announcements</h3>
                  <p className="text-xs text-slate-400">Latest updates from the examination board</p>
                </div>
              </div>
              <Link href="/notices" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Notice Board →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-orange-600 dark:text-orange-400">{n.category || "Notice"}</span>
                    <span className="text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* PDF PREVIEW MODAL */}
      {activePdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activePdfPreview.title}</h3>
                <p className="text-xs text-slate-400">PDF Viewer</p>
              </div>
              <button
                onClick={() => setActivePdfPreview(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-center">
              <FileText className="h-16 w-16 text-blue-600 mb-4 animate-bounce" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Interactive Document Viewer Loaded</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Viewing document preview for &quot;{activePdfPreview.title}&quot;. Connected to backend storage server.
              </p>
              <button
                onClick={() => {
                  window.open(activePdfPreview.url, "_blank");
                  setActivePdfPreview(null);
                }}
                className="mt-6 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                Open Full Document Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal Trigger */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </PublicShell>
  );
}
