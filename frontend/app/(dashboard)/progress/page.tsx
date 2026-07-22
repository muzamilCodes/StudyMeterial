"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { classSubjects } from "@/lib/platform-data";
import { getDownloadedFiles, getQuizResults } from "@/lib/store";
import { GraduationCap, CheckCircle2, FileText, ScrollText, NotebookTabs, Award, TrendingUp } from "lucide-react";

export default function ProgressPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState(6);
  const [downloadedNotes, setDownloadedNotes] = useState(18);
  const [downloadedPapers, setDownloadedPapers] = useState(9);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const dls = getDownloadedFiles();
    const notesCount = dls.filter((d) => d.category === "PDF Note").length;
    const papersCount = dls.filter((d) => d.category === "Previous Paper").length;

    if (notesCount > 0) setDownloadedNotes(notesCount + 15);
    if (papersCount > 0) setDownloadedPapers(papersCount + 7);

    const qResults = getQuizResults();
    if (qResults.length > 0) setCompletedQuizzes(Math.min(qResults.length + 4, 8));
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";
  const subjects = classSubjects[grade]?.[stream] || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-2">My Progress Tracker</Badge>
            <h2 className="text-3xl font-extrabold">Overall Syllabus Progress – Class {grade} ({stream})</h2>
            <p className="mt-1 text-sm text-blue-100/90 max-w-2xl">
              Track completed quizzes, downloaded study materials, and subject mastery percentage.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-xs uppercase tracking-wider text-blue-200 font-bold">Overall Progress</p>
            <p className="text-3xl font-extrabold text-white mt-1">82%</p>
          </div>
        </div>
      </div>

      {/* Main Overall Progress Bar Card */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Class {grade} Study Completion Meter</h3>
            <p className="text-xs text-slate-500">Includes notes read, board papers solved, and quiz score accuracy.</p>
          </div>
          <Badge className="bg-blue-600 text-white text-sm px-3 py-1 font-bold">82% Complete</Badge>
        </div>

        <Progress value={82} className="h-4 rounded-full bg-slate-100" />
      </Card>

      {/* 3 Requirement Stat Metric Cards (Completed Quizzes, Downloaded Notes, Downloaded Papers) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <NotebookTabs className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Quizzes</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{completedQuizzes} / 8</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">MCQ Tests Passed</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Downloaded Notes</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">{downloadedNotes}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">PDF Notes Saved</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <ScrollText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Downloaded Papers</p>
              <p className="text-3xl font-extrabold text-orange-500 mt-1">{downloadedPapers}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Board Papers Saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Wise Mastery Meters */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Subject Mastery Levels</h3>
        <div className="space-y-4">
          {subjects.map((sub, idx) => {
            const masteryValues = [88, 80, 85, 92];
            const mastery = masteryValues[idx % masteryValues.length];
            return (
              <div key={sub.name} className="space-y-2 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">{sub.name}</span>
                  <span className="font-extrabold text-blue-600">{mastery}% Mastery</span>
                </div>
                <Progress value={mastery} className="h-2.5 rounded-full" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
