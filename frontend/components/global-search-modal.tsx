"use client";

import React, { useState, useEffect } from "react";
import { Search, X, BookOpen, FileText, Video, User, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  fetchBackendNotes,
  fetchBackendPapers,
  fetchBackendQuizzes,
  fetchEnterpriseLiveClasses,
  type RealNoteItem,
  type RealPaperItem,
  type EnterpriseLiveClassItem,
} from "@/lib/store";
import { type QuizItem } from "@/lib/platform-data";

export type SearchCategory = "all" | "subjects" | "notes" | "papers" | "quizzes" | "teachers" | "classes";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

type SearchResult = {
  id: string;
  title: string;
  category: Exclude<SearchCategory, "all">;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tag: string;
};

// Subjects are a stable navigation catalogue, not per-item data.
const STATIC_SUBJECTS: SearchResult[] = [
  { id: "s1", title: "Biology - Class 11th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "11th Medical" },
  { id: "s2", title: "Physics - Class 11th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "11th Medical / Non-Med" },
  { id: "s3", title: "Chemistry - Class 11th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "11th Medical" },
  { id: "s4", title: "Mathematics - Class 10th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "10th General" },
];

export function GlobalSearchModal({ isOpen, onClose, initialQuery = "" }: GlobalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [dynamicResults, setDynamicResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchBackendNotes().catch(() => [] as RealNoteItem[]),
      fetchBackendPapers().catch(() => [] as RealPaperItem[]),
      fetchBackendQuizzes().catch(() => [] as QuizItem[]),
      fetchEnterpriseLiveClasses().catch(() => [] as EnterpriseLiveClassItem[]),
    ]).then(([notes, papers, quizzes, classes]) => {
      if (cancelled) return;

      const noteResults: SearchResult[] = notes.map((n) => ({
        id: `note-${n.id}`,
        title: n.title,
        category: "notes",
        icon: FileText,
        href: "/notes",
        tag: `${n.subject}${n.fileSize ? ` • ${n.fileSize}` : ""}`,
      }));

      const paperResults: SearchResult[] = papers.map((p) => ({
        id: `paper-${p.id}`,
        title: p.title,
        category: "papers",
        icon: FileText,
        href: "/previous-papers",
        tag: `${p.subject} • ${p.year ? `Year ${p.year}` : "Board Paper"}`,
      }));

      const quizResults: SearchResult[] = quizzes.map((q) => ({
        id: `quiz-${q.id}`,
        title: q.title,
        category: "quizzes",
        icon: HelpCircle,
        href: "/quizzes",
        tag: `${q.subject} • ${q.totalQuestions || q.questions?.length || 0} Questions`,
      }));

      const classResults: SearchResult[] = classes.map((c) => ({
        id: `class-${c.id}`,
        title: c.title,
        category: "classes",
        icon: Video,
        href: "/videos",
        tag: `${c.status} • ${c.teacherName}`,
      }));

      const teacherResults: SearchResult[] = [
        ...new Map(classes.filter((c) => c.teacherName).map((c) => [c.teacherName, c])).values(),
      ].map((c) => ({
        id: `teacher-${c.teacherName}`,
        title: c.teacherName,
        category: "teachers",
        icon: User,
        href: "/videos",
        tag: `${c.subject} Faculty`,
      }));

      setDynamicResults([...noteResults, ...paperResults, ...quizResults, ...classResults, ...teacherResults]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const allResults = [...STATIC_SUBJECTS, ...dynamicResults];

  const filteredResults = allResults.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery = q === "" ||
      item.title.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleSelectResult = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div 
        className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, notes, teachers, quizzes, live classes, papers..."
            className="w-full bg-transparent text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
          {(
            [
              { id: "all", label: "All Items" },
              { id: "subjects", label: "Subjects" },
              { id: "notes", label: "Notes" },
              { id: "papers", label: "Papers" },
              { id: "quizzes", label: "Quizzes" },
              { id: "classes", label: "Live Classes" },
              { id: "teachers", label: "Teachers" }
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Searching platform content...</p>
              <p className="text-xs text-slate-400 mt-1">Loading notes, papers, quizzes, live classes &amp; faculty.</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching search results found</p>
              <p className="text-xs text-slate-400 mt-1">
                {dynamicResults.length === 0
                  ? "No notes, papers, quizzes or live classes have been published yet."
                  : "Try a different keyword or category filter."}
              </p>
            </div>
          ) : (
            filteredResults.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item.href)}
                  className="group flex items-center justify-between p-3.5 rounded-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-950 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {item.title}
                      </p>
                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <span>View</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Searching {allResults.length} live platform {allResults.length === 1 ? "item" : "items"}</span>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300">ESC</span> to close
          </div>
        </div>
      </div>
    </div>
  );
}
