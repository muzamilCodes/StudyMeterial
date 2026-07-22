"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { classSubjects } from "@/lib/platform-data";
import { fetchBackendNotes, fetchBackendPapers, fetchBackendQuizzes, getDownloadedFiles, getQuizResults, fetchBackendNotices } from "@/lib/store";
import {
  FileText,
  ScrollText,
  NotebookTabs,
  PlayCircle,
  Download,
  BarChart3,
  Sparkles,
  Bookmark,
  GraduationCap,
  Search,
  Bell,
  ArrowRight,
  Award
} from "lucide-react";

export default function DashboardPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [search, setSearch] = useState("");
  const [downloadCount, setDownloadCount] = useState(0);
  const [realNotesCount, setRealNotesCount] = useState(0);
  const [realPapersCount, setRealPapersCount] = useState(0);
  const [realQuizzesCount, setRealQuizzesCount] = useState(0);
  const [avgScore, setAvgScore] = useState("0%");
  const [latestNotice, setLatestNotice] = useState("Loading notice...");

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    fetchBackendNotes(grade, stream).then(data => setRealNotesCount(data.length));
    fetchBackendPapers(grade, stream).then(data => setRealPapersCount(data.length));
    fetchBackendQuizzes(grade, stream).then(data => setRealQuizzesCount(data.length));
    fetchBackendNotices().then(notices => {
      if (notices.length > 0) {
        setLatestNotice(notices[0].title);
      } else {
        setLatestNotice("No active announcements");
      }
    });

    const dls = getDownloadedFiles();
    const results = getQuizResults();

    setDownloadCount(dls.length);

    if (results.length > 0) {
      const sum = results.reduce((acc, r) => acc + r.accuracy, 0);
      setAvgScore(`${Math.round(sum / results.length)}%`);
    } else {
      setAvgScore("0%");
    }
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";
  const subjects = classSubjects[grade]?.[stream] || [];

  const dashboardCards = [
    { label: "Notes", count: `${realNotesCount} Files`, icon: FileText, href: "/notes", color: "from-blue-600 to-blue-500" },
    { label: "Previous Papers", count: `${realPapersCount} Papers`, icon: ScrollText, href: "/previous-papers", color: "from-orange-500 to-amber-500" },
    { label: "Quizzes", count: `${realQuizzesCount} Tests`, icon: NotebookTabs, href: "/quizzes", color: "from-indigo-600 to-purple-500" },
    { label: "Videos", count: `0 Lectures`, icon: PlayCircle, href: "/videos", color: "from-rose-500 to-pink-500" },
    { label: "Downloads", count: `${downloadCount} Saved`, icon: Download, href: "/downloads", color: "from-emerald-600 to-teal-500" },
    { label: "Results", count: `Quiz Scores`, icon: BarChart3, href: "/results", color: "from-cyan-600 to-blue-600" },
    { label: "Notices", count: "Updates Board", icon: Sparkles, href: "/notices", color: "from-purple-600 to-indigo-600" },
    { label: "Bookmarks", count: "0 Saved", icon: Bookmark, href: "#", color: "from-amber-500 to-orange-500" },
    { label: "My Progress", count: `${avgScore} Mastery`, icon: GraduationCap, href: "/progress", color: "from-blue-700 to-indigo-800" }
  ];

  return (
    <div className="space-y-6 text-slate-900">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md text-xs font-bold">
              Welcome Student
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Hello, {session?.name ?? "Muzamil Ahmad"}!
            </h2>
            <p className="text-xs md:text-sm text-blue-100 max-w-xl">
              Active Class: <span className="font-bold text-orange-300">Class {grade} ({stream} Stream)</span>. Content is dynamically filtered for your selected class.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-xs font-bold">Latest Notice</p>
                <p className="text-[11px] text-blue-100 line-clamp-1 max-w-[200px]">{latestNotice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, papers, quizzes..."
              className="h-11 rounded-2xl border-white/30 bg-white/15 pl-11 text-white placeholder:text-blue-200 focus:bg-white/20 focus:outline-none text-xs"
            />
          </div>
          <Button className="h-11 rounded-2xl bg-orange-500 px-6 font-bold hover:bg-orange-600 text-white text-xs shadow">
            Search
          </Button>
        </div>
      </div>

      {/* REAL Dashboard Statistics Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 mb-3">Real Platform Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Notes Uploaded</p>
                <p className="mt-2 text-2xl md:text-3xl font-extrabold text-blue-600">{realNotesCount}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Class {grade} PDF Notes</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Previous Papers</p>
                <p className="mt-2 text-2xl md:text-3xl font-extrabold text-orange-500">{realPapersCount}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Board Papers Available</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <ScrollText className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Quizzes</p>
                <p className="mt-2 text-2xl md:text-3xl font-extrabold text-indigo-600">{realQuizzesCount}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Auto-Generated & Admin Tests</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <NotebookTabs className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Score</p>
                <p className="mt-2 text-2xl md:text-3xl font-extrabold text-emerald-600">{avgScore}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Your Actual Accuracy Rate</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dashboard Module Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 mb-3">Learning Modules</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((card) => (
            <Link key={card.label} href={card.href}>
              <Card className="group relative overflow-hidden rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">{card.label}</h4>
                      <p className="text-xs font-semibold text-slate-500">{card.count}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Subjects Overview */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Class {grade} {stream} Configured Subjects</h3>
            <p className="text-xs text-slate-500">Subjects loaded for your selected class and stream</p>
          </div>
          <Link href="/subjects" className="text-xs font-bold text-blue-600 hover:underline">
            View All Subjects
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {subjects.map((sub) => (
            <div key={sub.name} className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900">{sub.name}</p>
                <p className="text-xs text-slate-500">{sub.description}</p>
              </div>
              <Link href="/quizzes" className="rounded-xl bg-orange-500 text-white text-xs font-bold px-3 py-1.5 shadow hover:bg-orange-600">
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
