"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { fetchBackendAssignments, type AssignmentItem } from "@/lib/store";
import { getStoredSession } from "@/lib/session";
import { CalendarDays, ClipboardList, FolderOpen, GraduationCap, User } from "lucide-react";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("");

  useEffect(() => {
    const s = getStoredSession();
    const grade = s?.grade || "11th";
    const stream = s?.stream || "General";
    setScope(`Class ${grade} · ${stream}`);
    fetchBackendAssignments({ grade, stream }).then((data) => {
      setAssignments(data);
      setLoading(false);
    });
  }, []);

  const isPast = (deadline: string) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
  };

  return (
    <SiteShell
      title="Assignments"
      description={scope ? `Assignments published by your faculty for ${scope}.` : "Assignments published by your faculty."}
    >
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-44 animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <FolderOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assignments Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your instructors have not published any assignments for {scope.toLowerCase()} yet. They will appear here as soon as they are posted.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-xl transition duration-300 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {a.subject}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      Class {a.grade} · {a.stream}
                    </span>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${isPast(a.deadline) ? "bg-rose-100 dark:bg-rose-950 text-rose-600" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"}`}>
                    {isPast(a.deadline) ? "Deadline passed" : "Open"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{a.title}</h3>
                {a.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{a.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-amber-500" /> Submit by {a.deadline || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <ClipboardList className="h-3.5 w-3.5" /> {a.marks} Marks
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {a.instructorName ? (
                      <>
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-500" /> {a.instructorName}
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" /> Faculty
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
