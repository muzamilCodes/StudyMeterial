"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { classSubjects } from "@/lib/platform-data";
import { BookOpen, FileText, ScrollText, Award, User, ArrowRight } from "lucide-react";

export default function SubjectsPage() {
  const [session, setSession] = useState<StudentSession | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";
  const subjectsList = classSubjects[grade]?.[stream] || [];

  return (
    <SiteShell
      title="Configured Academic Subjects"
      description={`Enrolled Subjects for Class ${grade} (${stream} Stream)`}
    >
      <div className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectsList.map((sub, idx) => (
            <div
              key={idx}
              className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-xl transition space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md group-hover:scale-105 transition">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-bold">
                    Class {grade}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub.description}</p>
                </div>

                {/* Faculty info */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Faculty: Dr. Senior Specialist</span>
                </div>

                {/* Counts Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-200">10</p>
                    <p className="text-[10px] text-slate-400">PDF Notes</p>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-200">6</p>
                    <p className="text-[10px] text-slate-400">Papers</p>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-200">5</p>
                    <p className="text-[10px] text-slate-400">Quizzes</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/notes"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  <span>Open Notes</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/quizzes"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                >
                  <span>Take Quiz</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </SiteShell>
  );
}
