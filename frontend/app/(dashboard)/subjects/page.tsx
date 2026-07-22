"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { classSubjects } from "@/lib/platform-data";
import { fetchBackendNotes, fetchBackendPapers, fetchBackendVideos, fetchBackendQuizzes, logDownload } from "@/lib/store";
import { FileText, ScrollText, PlayCircle, NotebookTabs, Download, BookOpen, CheckCircle2 } from "lucide-react";

export default function SubjectsPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [papersList, setPapersList] = useState<any[]>([]);
  const [videosList, setVideosList] = useState<any[]>([]);
  const [quizzesList, setQuizzesList] = useState<any[]>([]);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    fetchBackendNotes(grade, stream).then(data => setNotesList(data));
    fetchBackendPapers(grade, stream).then(data => setPapersList(data));
    fetchBackendVideos(grade, stream).then(data => setVideosList(data));
    fetchBackendQuizzes(grade, stream).then(data => setQuizzesList(data));
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";
  const subjects = classSubjects[grade]?.[stream] || [];

  const handleDownload = (subjectName: string) => {
    logDownload(`${subjectName} Class ${grade} Study Notes PDF`, subjectName, "PDF Note", "3.5 MB");
    setDownloadMsg(`Downloaded ${subjectName} study notes PDF! Saved in Downloads history.`);
    setTimeout(() => setDownloadMsg(null), 3500);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-1.5 text-xs font-bold">Class-Wise Subjects</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold">Class {grade} – {stream} Stream Subjects</h2>
            <p className="mt-1 text-xs md:text-sm text-blue-100/90 max-w-2xl">
              Subject modules loaded for your active class and stream. Below metrics reflect real uploaded materials and quizzes.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Active Subjects</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{subjects.length}</p>
          </div>
        </div>
      </div>

      {downloadMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 p-4 text-white font-bold text-xs shadow-lg animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>{downloadMsg}</p>
        </div>
      )}

      {/* Subject Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {subjects.map((sub) => {
          // Calculate REAL counts per subject
          const realSubjectNotes = notesList.filter(n => n.grade === grade && (grade === "10th" || n.stream === stream) && n.subject === sub.name).length;
          const realSubjectPapers = papersList.filter(p => p.grade === grade && (grade === "10th" || p.stream === stream) && p.subject === sub.name).length;
          const realSubjectVideos = videosList.filter(v => v.grade === grade && (grade === "10th" || v.stream === stream) && v.subject === sub.name).length;
          const realSubjectQuizzes = quizzesList.filter(q => q.grade === grade && (grade === "10th" || q.stream === stream) && q.subject === sub.name).length;

          return (
            <Card key={sub.name} className="group overflow-hidden rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-md">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 font-bold text-xs">{grade}</Badge>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 group-hover:text-blue-600 transition">{sub.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">{sub.description}</p>
                </div>

                {/* Real Counts Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href="/notes"
                    className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 border border-transparent p-2.5 transition cursor-pointer hover:shadow-sm"
                  >
                    <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total Notes</p>
                      <p className="text-xs font-extrabold text-slate-900">{realSubjectNotes} PDFs</p>
                    </div>
                  </Link>

                  <Link
                    href="/previous-papers"
                    className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-orange-50/50 hover:border-orange-200 border border-transparent p-2.5 transition cursor-pointer hover:shadow-sm"
                  >
                    <ScrollText className="h-4 w-4 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Prev Papers</p>
                      <p className="text-xs font-extrabold text-slate-900">{realSubjectPapers} Papers</p>
                    </div>
                  </Link>

                  <Link
                    href="/videos"
                    className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-rose-50/50 hover:border-rose-200 border border-transparent p-2.5 transition cursor-pointer hover:shadow-sm"
                  >
                    <PlayCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Videos</p>
                      <p className="text-xs font-extrabold text-slate-900">{realSubjectVideos} Vids</p>
                    </div>
                  </Link>

                  <Link
                    href="/quizzes"
                    className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 border border-transparent p-2.5 transition cursor-pointer hover:shadow-sm"
                  >
                    <NotebookTabs className="h-4 w-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">MCQ Quiz</p>
                      <p className="text-xs font-extrabold text-slate-900">{realSubjectQuizzes} Tests</p>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex gap-2">
                <Button
                  onClick={() => handleDownload(sub.name)}
                  className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download Notes
                </Button>
                <Link href="/quizzes" className="inline-flex h-10 items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-3 text-xs font-bold text-white shadow">
                  Quiz
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
