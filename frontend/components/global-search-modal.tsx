"use client";

import React, { useState, useEffect } from "react";
import { Search, X, BookOpen, FileText, Video, Award, User, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type SearchCategory = "all" | "subjects" | "notes" | "papers" | "quizzes" | "teachers" | "classes";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SEARCH_DATA = [
  { id: "s1", title: "Biology - Class 11th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "11th Medical" },
  { id: "s2", title: "Physics - Class 11th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "11th Medical / Non-Med" },
  { id: "s3", title: "Chemistry - Class 11th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "11th Medical" },
  { id: "s4", title: "Mathematics - Class 10th", category: "subjects", icon: BookOpen, href: "/subjects", tag: "10th General" },
  
  { id: "n1", title: "Cell Biology & Molecular Genetics Notes", category: "notes", icon: FileText, href: "/notes", tag: "PDF • 2.8 MB" },
  { id: "n2", title: "Newton's Laws & Vector Physics Comprehensive Notes", category: "notes", icon: FileText, href: "/notes", tag: "PDF • 3.4 MB" },
  { id: "n3", title: "Organic Chemistry Reaction Mechanism Notes", category: "notes", icon: FileText, href: "/notes", tag: "PDF • 4.1 MB" },
  
  { id: "p1", title: "2025 Board Exam Physics Model Paper", category: "papers", icon: FileText, href: "/previous-papers", tag: "Year 2025" },
  { id: "p2", title: "2024 Biology Mid-Term Term Paper", category: "papers", icon: FileText, href: "/previous-papers", tag: "Year 2024" },
  { id: "p3", title: "2025 Mathematics Sample Question Paper", category: "papers", icon: FileText, href: "/previous-papers", tag: "Year 2025" },

  { id: "q1", title: "Cellular Biology Quick Quiz & Self-Assessment", category: "quizzes", icon: HelpCircle, href: "/quizzes", tag: "10 Questions • 15 Mins" },
  { id: "q2", title: "Physics Kinematics Speed Test Quiz", category: "quizzes", icon: HelpCircle, href: "/quizzes", tag: "8 Questions • 12 Mins" },
  { id: "q3", title: "Chemistry Chemical Bonding Quiz", category: "quizzes", icon: HelpCircle, href: "/quizzes", tag: "12 Questions • 20 Mins" },

  { id: "c1", title: "NEET Biology Masterclass: Human Anatomy Live", category: "classes", icon: Video, href: "/videos", tag: "Live • Today 4:00 PM" },
  { id: "c2", title: "JEE Physics Numericals Sprint Session", category: "classes", icon: Video, href: "/videos", tag: "Live • Tomorrow 11:00 AM" },

  { id: "t1", title: "Dr. Ramesh Sharma (Senior Biology Faculty)", category: "teachers", icon: User, href: "/videos", tag: "14+ Yrs Exp" },
  { id: "t2", title: "Prof. Ananya Roy (Physics Specialist)", category: "teachers", icon: User, href: "/videos", tag: "10+ Yrs Exp" },
  { id: "t3", title: "Dr. Vikram Seth (Organic Chemistry HOD)", category: "teachers", icon: User, href: "/videos", tag: "16+ Yrs Exp" }
];

export function GlobalSearchModal({ isOpen, onClose, initialQuery = "" }: GlobalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
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

  if (!isOpen) return null;

  const filteredResults = SEARCH_DATA.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery = query.trim() === "" || 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.tag.toLowerCase().includes(query.toLowerCase());
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
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching search results found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for &quot;Biology&quot;, &quot;Physics&quot;, &quot;Notes&quot;, or &quot;Paper&quot;.</p>
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
          <span>Search integrated across 12 Database Collections</span>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300">ESC</span> to close
          </div>
        </div>
      </div>
    </div>
  );
}
