"use client";

import { useEffect, useState } from "react";
import { SubjectCard } from "@/components/subject-card";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import { getStoredSession, type StudentSession } from "@/lib/session";

type SubjectItem = {
  name: string;
  notes: number;
  papers: number;
  videos: number;
  quizzes: number;
};

export default function SubjectsPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  useEffect(() => {
    if (!session) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (session.grade) params.set("grade", session.grade);
        if (session.stream) params.set("stream", session.stream);

        const response = await fetch(apiUrl(`/api/subjects?${params.toString()}`), {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("study-material-token") ?? ""}`
          }
        });
        if (!response.ok) throw new Error("Backend unavailable");
        const json = (await response.json()) as { data?: SubjectItem[] };
        setSubjects(json.data ?? []);
      } catch {
        setError("No subjects uploaded yet");
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [session]);

  if (!session) {
    return (
      <EmptyState
        title="Login required"
        description="Please login as a student to see class-wise subjects and notes."
        action="Go to Login"
      />
    );
  }

  const classLabel = `${session.grade ?? "Class"} - ${session.stream ?? "Stream"}`;

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl">
        <p className="text-sm font-medium text-blue-600">Selected Class</p>
        <h2 className="mt-2 text-2xl font-semibold">{classLabel}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Only this student's uploaded class material appears here.
        </p>
      </div>

      {loading ? (
        <EmptyState
          title="Loading subjects"
          description="Fetching class-wise content from backend..."
        />
      ) : subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.name} {...subject} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={error ?? "No subjects uploaded yet"}
          description="Admin must upload subjects for this exact class and stream before they appear here."
          action="Open Admin"
        />
      )}
    </div>
  );
}
