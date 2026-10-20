"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { fetchCourses, fetchMyEnrollments, COURSE_CATEGORY_OPTIONS, type CourseCard } from "@/lib/store";
import { BookOpen, Star, Users, PlayCircle, Search, Layers, CheckCircle2 } from "lucide-react";

const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
    fetchMyEnrollments().then((list) => setEnrolledIds(new Set(list.map((e) => e.courseId))));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || c.level === selectedLevel;
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  const categories = useMemo(() => {
    const present = Array.from(new Set(courses.map((c) => c.category)));
    return ["All", ...COURSE_CATEGORY_OPTIONS.filter((c) => present.includes(c))];
  }, [courses]);

  return (
    <SiteShell
      public
      title="Course Library"
      description="Enroll in structured video courses from verified faculty — lessons, notes, assignments and progress tracking in one place."
    >
      <div className="space-y-6">
        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title, subject or instructor..."
                className="w-full h-10 rounded-2xl pl-10 pr-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              {LEVEL_OPTIONS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setSelectedLevel(lv)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedLevel === lv
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* COURSES GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Courses Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {courses.length === 0
                ? "Instructors haven't published any courses yet. Check back soon."
                : "No course matched your filters. Try another category or reset your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl transition duration-300 flex flex-col overflow-hidden group"
              >
                <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 text-white px-3 py-1 text-[10px] font-bold backdrop-blur">
                    {c.level}
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 dark:bg-slate-900/90 px-3 py-1 text-[10px] font-black text-emerald-600">
                    {c.price > 0 ? `₹${c.price}` : "FREE"}
                  </span>
                  {enrolledIds.has(c.id) && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Enrolled
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {c.category}
                      </span>
                      <span className="rounded-full bg-violet-100 dark:bg-violet-950 px-2.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                        {c.grade === "All" ? "All Classes" : c.grade}{c.stream !== "All" ? ` · ${c.stream}` : ""}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition leading-snug">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold line-clamp-2">{c.description}</p>
                  </div>

                  <div className="mt-auto space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>By {c.instructorName}</span>
                      {c.ratingCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {c.ratingAvg.toFixed(1)} ({c.ratingCount})
                        </span>
                      ) : (
                        <span className="text-slate-400">New</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold">
                      <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {c.moduleCount} modules</span>
                      <span className="inline-flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {c.lessonCount} lessons</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.enrolledCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
