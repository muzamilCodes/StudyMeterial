"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { 
  fetchCourses, 
  fetchMyEnrollments, 
  COURSE_CATEGORY_OPTIONS, 
  ALL_CLASSES_OPTIONS, 
  ALL_SUBJECTS_OPTIONS, 
  type CourseCard 
} from "@/lib/store";
import { 
  BookOpen, 
  Star, 
  Users, 
  PlayCircle, 
  Search, 
  Layers, 
  CheckCircle2, 
  GraduationCap, 
  Sparkles, 
  User, 
  X, 
  Filter 
} from "lucide-react";

const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedInstructor, setSelectedInstructor] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses().then((data) => {
      // Students/visitors only get published courses
      setCourses(data);
      setLoading(false);
    });
    fetchMyEnrollments().then((list) => setEnrolledIds(new Set(list.map((e) => e.courseId))));
  }, []);

  // Distinct lists derived from available courses
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.academicLevel && c.academicLevel !== "All") set.add(c.academicLevel);
      else if (c.grade && c.grade !== "All") set.add(c.grade);
    });
    return ["All", ...Array.from(set)];
  }, [courses]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.subject) set.add(c.subject);
      else if (c.category) set.add(c.category);
    });
    return ["All", ...Array.from(set)];
  }, [courses]);

  const availableInstructors = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.instructorName) set.add(c.instructorName);
    });
    return ["All", ...Array.from(set)];
  }, [courses]);

  const categories = useMemo(() => {
    const present = Array.from(new Set(courses.map((c) => c.category)));
    return ["All", ...COURSE_CATEGORY_OPTIONS.filter((c) => present.includes(c))];
  }, [courses]);

  // Dynamic combinations present in courses (e.g. "Class 10 → Mathematics")
  const dynamicCategories = useMemo(() => {
    const map = new Map<string, { label: string; academicLevel: string; subject: string; count: number }>();
    courses.forEach((c) => {
      const cls = c.academicLevel || c.grade || "All";
      const sub = c.subject || c.category;
      if (cls !== "All" && sub) {
        const key = `${cls}:::${sub}`;
        if (!map.has(key)) {
          map.set(key, { label: `${cls} → ${sub}`, academicLevel: cls, subject: sub, count: 0 });
        }
        map.get(key)!.count += 1;
      }
    });
    return Array.from(map.values());
  }, [courses]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      const courseClass = c.academicLevel || c.grade || "All";
      const courseSub = c.subject || c.category;

      const matchesClass = selectedClass === "All" || courseClass === selectedClass;
      const matchesSubject = selectedSubject === "All" || courseSub === selectedSubject;
      const matchesInstructor = selectedInstructor === "All" || c.instructorName === selectedInstructor;
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      const matchesLevel = selectedLevel === "All" || c.level === selectedLevel;
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q) ||
        (c.subject && c.subject.toLowerCase().includes(q)) ||
        (c.academicLevel && c.academicLevel.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q);

      return matchesClass && matchesSubject && matchesInstructor && matchesCategory && matchesLevel && matchesSearch;
    });
  }, [courses, searchQuery, selectedClass, selectedSubject, selectedInstructor, selectedCategory, selectedLevel]);

  const hasActiveFilters = selectedClass !== "All" || selectedSubject !== "All" || selectedInstructor !== "All" || selectedCategory !== "All" || selectedLevel !== "All" || searchQuery !== "";

  const clearFilters = () => {
    setSelectedClass("All");
    setSelectedSubject("All");
    setSelectedInstructor("All");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSearchQuery("");
  };

  return (
    <SiteShell
      public
      title="Course Library"
      description="Enroll in class-based video courses taught by verified faculty — lessons, notes, assignments and curriculum tracking in one place."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* SEARCH & MULTI-DIMENSIONAL FILTERS */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course title, class, subject, or instructor name..."
                className="w-full h-11 rounded-2xl pl-10 pr-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 flex items-center gap-1.5 transition shrink-0"
              >
                <X className="h-3.5 w-3.5" /> Clear Filters
              </button>
            )}
          </div>

          {/* DROPDOWN SELECTORS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Filter by Academic Class */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Academic Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold"
              >
                <option value="All">All Classes ({courses.length})</option>
                {ALL_CLASSES_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Filter by Subject */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold"
              >
                <option value="All">All Subjects</option>
                {ALL_SUBJECTS_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Filter by Instructor */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Instructor</label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold"
              >
                {availableInstructors.map((ins) => (
                  <option key={ins} value={ins}>{ins === "All" ? "All Instructors" : ins}</option>
                ))}
              </select>
            </div>

            {/* Filter by Level */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Difficulty Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold"
              >
                {LEVEL_OPTIONS.map((lv) => (
                  <option key={lv} value={lv}>{lv === "All" ? "All Levels" : lv}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC TEACHING CATEGORIES PILLS BAR (e.g. Class 10 → Mathematics) */}
          {dynamicCategories.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Dynamic Teaching Categories:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => { setSelectedClass("All"); setSelectedSubject("All"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedClass === "All" && selectedSubject === "All"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  All Categories
                </button>
                {dynamicCategories.map((cat) => {
                  const isActive = selectedClass === cat.academicLevel && selectedSubject === cat.subject;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => {
                        setSelectedClass(cat.academicLevel);
                        setSelectedSubject(cat.subject);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                          : "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 border border-violet-200/60 dark:border-violet-900/50"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
                : "No courses matched your selected class, subject, or instructor filters. Try resetting filters."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl transition duration-300 flex flex-col overflow-hidden group"
              >
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 text-white px-3 py-1 text-[10px] font-bold backdrop-blur">
                    {c.level}
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1 text-[11px] font-black text-emerald-600 shadow-sm">
                    {c.price > 0 ? `₹${c.price}` : "FREE"}
                  </span>
                  {enrolledIds.has(c.id) && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-bold shadow-md">
                      <CheckCircle2 className="h-3 w-3" /> Enrolled
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div>
                    {/* DYNAMIC CATEGORY PILL (e.g. Class 10 → Mathematics) */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950/80 dark:to-indigo-950/80 border border-violet-200 dark:border-violet-800 px-3 py-0.5 text-[10px] font-black text-violet-700 dark:text-violet-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-violet-500" />
                        {c.academicLevel || c.grade || "All Classes"} → {c.subject || c.category}
                      </span>
                      {c.language && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {c.language}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition leading-snug line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <User className="h-3 w-3 text-slate-400" /> {c.instructorName}
                      </span>
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
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.enrolledCount} enrolled</span>
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
