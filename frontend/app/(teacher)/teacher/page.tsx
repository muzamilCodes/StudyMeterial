"use client";

import { Fragment, useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { 
  fetchEnterpriseLiveClasses, 
  createEnterpriseLiveClass,
  publishEnterpriseLiveClass,
  deleteEnterpriseLiveClass,
  createBackendNote,
  createBackendNotice,
  fetchBackendNotes,
  fetchBackendAttendance,
  uploadBackendFile,
  fetchBackendAssignments,
  createBackendAssignment,
  deleteBackendAssignment,
  fetchCourses,
  fetchCourseDetail,
  setBackendCourseStatus,
  deleteBackendCourse,
  fetchInstructorCourseStats,
  fetchInstructorEnrollments,
  fetchInstructorCourseReviews,
  createBackendQuiz,
  type AssignmentItem,
  type AttendanceRecord,
  type EnterpriseLiveClassItem,
  type CourseCard,
  type CourseEnrollmentRow,
  type CourseReviewItem,
  type InstructorCourseStats,
  type Grade,
  type Stream
} from "@/lib/store";
import { InstructorCourseBuilder } from "@/components/instructor-course-builder";
import { LessonAnalytics } from "@/components/lesson-analytics";
import { 
  Video, 
  FileText, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Radio, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Award, 
  Upload, 
  MessageSquare,
  BarChart3,
  Clock,
  HelpCircle,
  FolderPlus,
  TrendingUp,
  Layers,
  Pencil,
  Star,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuizQuestionState = { question: string; options: string[]; answer: string };

export default function TeacherDashboardPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [liveClasses, setLiveClasses] = useState<EnterpriseLiveClassItem[]>([]);
  const [platformNotes, setPlatformNotes] = useState<{ id: string }[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Class Creation Form State
  const [classTitle, setClassTitle] = useState("");
  const [classSubject, setClassSubject] = useState("Biology");
  const [classGrade, setClassGrade] = useState<Grade>("11th");
  const [classStream, setClassStream] = useState<Stream>("Medical");
  const [classDate, setClassDate] = useState("");
  const [classTime, setClassTime] = useState("09:00 PM");
  const [classEndTime, setClassEndTime] = useState("10:00 PM");
  const [classDuration, setClassDuration] = useState("60 Mins");
  const [classPlatform, setClassPlatform] = useState<any>("Google Meet");
  const [classMeetingLink, setClassMeetingLink] = useState("");

  // Note Upload Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("Biology");
  const [noteGrade, setNoteGrade] = useState<Grade>("11th");
  const [noteStream, setNoteStream] = useState<Stream>("Medical");
  const [notePages, setNotePages] = useState(1);
  const [noteFile, setNoteFile] = useState<File | null>(null);

  // Assignment Form State
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignSubject, setAssignSubject] = useState("Biology");
  const [assignGrade, setAssignGrade] = useState<Grade>("11th");
  const [assignStream, setAssignStream] = useState<Stream>("Medical");
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignMarks, setAssignMarks] = useState(50);
  const [assignDescription, setAssignDescription] = useState("");

  // Quiz Form State
  const [quizTitle, setQuizTitle] = useState("");
  const [quizSubject, setQuizSubject] = useState("Biology");
  const [quizGrade, setQuizGrade] = useState<Grade>("11th");
  const [quizStream, setQuizStream] = useState<Stream>("Medical");
  const [quizDuration, setQuizDuration] = useState(15);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionState[]>([
    { question: "", options: ["", "", "", ""], answer: "" }
  ]);

  // Course Platform State
  const [myCourses, setMyCourses] = useState<CourseCard[]>([]);
  const [courseStats, setCourseStats] = useState<InstructorCourseStats | null>(null);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollmentRow[]>([]);
  const [courseReviews, setCourseReviews] = useState<CourseReviewItem[]>([]);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [analyticsCourseId, setAnalyticsCourseId] = useState<string | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    refreshData();
  }, []);

  const refreshData = () => {
    fetchEnterpriseLiveClasses().then((data) => setLiveClasses(data));
    fetchBackendNotes().then((data) => setPlatformNotes(data));
    fetchBackendAttendance().then((data) => setAttendanceLogs(data));
    fetchBackendAssignments({ mine: true }).then(setAssignments);
    fetchCourses({ mine: true }).then(setMyCourses);
    fetchInstructorCourseStats().then(setCourseStats);
    fetchInstructorEnrollments().then(setCourseEnrollments);
    fetchInstructorCourseReviews().then(setCourseReviews);
  };

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleCreateLiveClass = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!classTitle || !classDate || !classMeetingLink) {
      setSuccessMsg("Class title, date, and a real meeting link are required.");
      setTimeout(() => setSuccessMsg(null), 3500);
      return;
    }
    setLoading(true);
    try {
      const ok = await createEnterpriseLiveClass({
        title: classTitle,
        subject: classSubject,
        category: "Faculty Special Preparation",
        description: `Live interactive preparation lecture for Class ${classGrade} ${classStream}.`,
        teacherName: session?.name || "Faculty Teacher",
        teacherBio: "Senior Faculty Educator",
        date: classDate,
        startTime: classTime,
        endTime: classEndTime,
        duration: classDuration,
        meetingPlatform: classPlatform,
        meetingLink: classMeetingLink,
        maxStudents: 500,
        language: "English & Hindi",
        difficultyLevel: "Intermediate",
        status: isDraft ? "Draft" : "Published",
        allowRecording: true,
        allowChat: true,
        allowScreenShare: true,
        allowStudentQuestions: true,
        grade: classGrade,
        stream: classStream
      });

      if (ok) {
        setSuccessMsg(isDraft ? `Draft live class "${classTitle}" created!` : `Published live class "${classTitle}" & sent student notice!`);
        setClassTitle("");
        refreshData();
      }
    } catch {
      setSuccessMsg("❌ Error creating live class.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteFile) {
      setSuccessMsg("Note title and a PDF file are required.");
      setTimeout(() => setSuccessMsg(null), 3500);
      return;
    }
    setLoading(true);
    try {
      const uploadRes = await uploadBackendFile(noteFile);
      if (!uploadRes) {
        setSuccessMsg("File upload failed. Check that you are signed in.");
        setLoading(false);
        setTimeout(() => setSuccessMsg(null), 3500);
        return;
      }
      const ok = await createBackendNote({
        title: noteTitle,
        subject: noteSubject,
        grade: noteGrade,
        stream: noteStream,
        pdfUrl: uploadRes.url,
        fileSize: uploadRes.fileSize,
        pages: Number(notePages) || 1
      });
      if (ok) {
        setSuccessMsg(`Uploaded Study Note: "${noteTitle}"!`);
        setNoteTitle("");
        setNoteFile(null);
        refreshData();
      } else {
        setSuccessMsg("Server rejected the note. Are your administrator/teacher credentials valid?");
      }
    } catch {
      setSuccessMsg("Error uploading study note.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) {
      notify("Assignment title is required.");
      return;
    }
    setLoading(true);
    const res = await createBackendAssignment({
      title: assignTitle.trim(),
      description: assignDescription.trim(),
      subject: assignSubject,
      grade: assignGrade,
      stream: assignStream,
      deadline: assignDeadline,
      marks: Number(assignMarks) || 50
    });
    setLoading(false);
    if (res.ok) {
      notify(`Published Assignment: "${assignTitle}"!`);
      setAssignTitle("");
      setAssignDescription("");
      refreshData();
    } else {
      notify(res.message || "Server rejected the assignment.");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    const res = await deleteBackendAssignment(id);
    notify(res.ok ? "Assignment deleted." : res.message || "Delete failed.");
    refreshData();
  };

  const handlePublishQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = quizQuestions
      .map((q) => {
        const options = q.options.map((o) => o.trim()).filter(Boolean);
        return { question: q.question.trim(), options, correctIndex: options.indexOf(q.answer.trim()) };
      })
      .filter((q) => q.question && q.options.length >= 2);
    if (!quizTitle.trim() || cleaned.length === 0) {
      notify("Quiz title and at least one question with 2+ options are required.");
      return;
    }
    const invalid = cleaned.find((q) => q.correctIndex < 0);
    if (invalid) {
      notify(`Set the correct answer for: "${invalid.question}"`);
      return;
    }
    setLoading(true);
    const ok = await createBackendQuiz({
      subject: quizSubject,
      title: quizTitle.trim(),
      grade: quizGrade,
      stream: quizStream,
      durationMinutes: Number(quizDuration) || 10,
      questions: cleaned
    });
    setLoading(false);
    if (ok) {
      notify(`Quiz "${quizTitle}" published — students can attempt it in their Quizzes section!`);
      setQuizTitle("");
      setQuizQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
    } else {
      notify("Server rejected the quiz. Check your sign-in and fields.");
    }
  };

  return (
    <SiteShell
      title="Faculty Teacher Portal"
      description="Manage live lectures, curriculum study notes, student assignments, and live attendance logs."
      activeTeacherTab={activeTab}
      onTeacherTabChange={setActiveTab}
    >
      <div className="space-y-8 max-w-[1600px] mx-auto text-slate-900 dark:text-white">

        {/* NOTIFICATION TOAST */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* TOP FACULTY BANNER */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 md:p-8 text-white shadow-2xl border border-blue-800/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-black border border-emerald-500/30 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" /> Faculty Educator Portal Active
                  </span>
                  <span className="rounded-full bg-blue-500/20 text-blue-300 px-3 py-1 text-xs font-bold border border-blue-500/30">
                    Class 11th & 12th Senior Instructor
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black">
                  Welcome back, {session?.name || "Faculty"}!
                </h2>
                <p className="text-xs md:text-sm text-blue-200/90 max-w-2xl">
                  Create interactive live classes, upload chapter formula notes, assign student homework, and track live classroom attendance directly in MongoDB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "My Courses", val: String(courseStats?.courses ?? 0), icon: BookOpen, col: "from-violet-600 to-purple-600" },
                { label: "Video Lessons", val: String(courseStats?.videoLessons ?? 0), icon: Video, col: "from-sky-600 to-cyan-600" },
                { label: "Enrolled Students", val: String(courseStats?.students ?? 0), icon: Users, col: "from-blue-600 to-indigo-600" },
                { label: "Total Earnings", val: `₹${courseStats?.earnings ?? 0}`, icon: TrendingUp, col: "from-emerald-600 to-teal-600" },
                { label: "Total Live Classes Scheduled", val: String(liveClasses.length), icon: Radio, col: "from-rose-600 to-pink-600" },
                { label: "Published Chapter Notes", val: String(platformNotes.length), icon: FileText, col: "from-amber-500 to-orange-600" },
                { label: "Active Student Assignments", val: String(assignments.length), icon: FolderPlus, col: "from-teal-600 to-emerald-600" },
                { label: "Course Reviews", val: String(courseStats?.ratings ?? 0), icon: Award, col: "from-fuchsia-600 to-pink-600" }
              ].map((card, idx) => (
                <div key={idx} className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.label}</span>
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${card.col} text-white shadow-md`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">{card.val}</h3>
                </div>
              ))}
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { tab: "Create Course", label: "Create a Course", desc: "Build curriculum with video lectures", icon: BookOpen, accent: "bg-violet-600 hover:bg-violet-700" },
                  { tab: "My Courses", label: "Manage My Courses", desc: "Publish drafts, edit lessons, delete", icon: Layers, accent: "bg-sky-600 hover:bg-sky-700" },
                  { tab: "Schedule Live Class", label: "Schedule a Live Class", desc: "Go live on Google Meet / Zoom", icon: Video, accent: "bg-blue-600 hover:bg-blue-700" },
                  { tab: "Upload Notes", label: "Upload Study Note", desc: "Add a PDF chapter / formula sheet", icon: Upload, accent: "bg-amber-600 hover:bg-amber-700" },
                  { tab: "Assignments", label: "Publish Assignment", desc: "Set homework with a deadline", icon: FolderPlus, accent: "bg-emerald-600 hover:bg-emerald-700" },
                  { tab: "Student Progress", label: "Student Progress", desc: "Track lesson completion per student", icon: BarChart3, accent: "bg-indigo-600 hover:bg-indigo-700" }
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(action.tab)}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className={`p-2.5 rounded-xl text-white ${action.accent}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black">{action.label}</p>
                      <p className="text-xs text-slate-400">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CREATE COURSE TAB */}
        {activeTab === "Create Course" && (
          <InstructorCourseBuilder
            editCourseId={editCourseId}
            onMessage={notify}
            onSaved={() => {
              refreshData();
              if (editCourseId) {
                setEditCourseId(null);
                setActiveTab("My Courses");
              }
            }}
          />
        )}

        {/* MY COURSES TAB */}
        {activeTab === "My Courses" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">My Courses</h3>
                <p className="text-xs text-slate-400">{myCourses.length} course(s) stored in MongoDB — students only see Published ones</p>
              </div>
              <Button onClick={() => { setEditCourseId(null); setActiveTab("Create Course"); }} className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-1">
                <Plus className="h-4 w-4" /> Create Course
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                  <tr>
                    <th className="p-3">Course</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Lessons</th>
                    <th className="p-3">Students</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {myCourses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 font-semibold">
                        No courses yet. Click "Create Course" to build your first course with modules and video lessons.
                      </td>
                    </tr>
                  ) : myCourses.map((c) => (
                    <Fragment key={c.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold max-w-[240px]">
                        {c.title}
                        <p className="text-[10px] font-semibold text-violet-500">{c.grade === "All" ? "All Classes" : c.grade}{c.stream !== "All" ? ` · ${c.stream}` : ""}</p>
                      </td>
                      <td className="p-3 text-blue-600 font-bold">{c.category}</td>
                      <td className="p-3 text-slate-500">{c.level}</td>
                      <td className="p-3 font-black">{c.price > 0 ? `₹${c.price}` : "Free"}</td>
                      <td className="p-3">{c.lessonCount}</td>
                      <td className="p-3">{c.enrolledCount}</td>
                      <td className="p-3">
                        {c.ratingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {c.ratingAvg} ({c.ratingCount})
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          c.status === "Published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const res = await setBackendCourseStatus(c.id, c.status === "Published" ? "Draft" : "Published");
                              notify(res.ok ? `Course "${c.title}" is now ${c.status === "Published" ? "draft" : "published"}!` : res.message || "Action failed.");
                              refreshData();
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" /> {c.status === "Published" ? "Unpublish" : c.status === "Pending Approval" ? "Approve & Publish" : "Publish"}
                          </button>
                          <button
                            onClick={() => setAnalyticsCourseId(analyticsCourseId === c.id ? null : c.id)}
                            className="p-1.5 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950"
                            title="Views, likes, shares & comments per video"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setEditCourseId(c.id); setActiveTab("Create Course"); }}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950" title="Edit course"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete course "${c.title}"? All its enrollments and reviews will be removed.`)) {
                                const res = await deleteBackendCourse(c.id);
                                notify(res.ok ? `Course "${c.title}" deleted.` : res.message || "Delete failed.");
                                refreshData();
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {analyticsCourseId === c.id && (
                      <tr>
                        <td colSpan={9} className="bg-slate-50/60 dark:bg-slate-950/40 p-0">
                          <LessonAnalytics courseId={c.id} />
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STUDENT PROGRESS TAB */}
        {activeTab === "Student Progress" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black">Student Course Progress</h3>
              <p className="text-xs text-slate-400">Live completion tracking from MongoDB enrollments</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Lessons Done</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {courseEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-semibold">
                        No student enrollments yet. Progress appears here once students join your published courses.
                      </td>
                    </tr>
                  ) : courseEnrollments.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">{row.studentName}</td>
                      <td className="p-3 text-slate-500">{row.email}</td>
                      <td className="p-3 text-blue-600 font-bold">{row.courseTitle}</td>
                      <td className="p-3">{row.completed} / {row.totalLessons}</td>
                      <td className="p-3 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500" style={{ width: `${row.progressPct}%` }} />
                          </div>
                          <span className="font-black text-emerald-600">{row.progressPct}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">{row.enrolledAt ? String(row.enrolledAt).slice(0, 10) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVIEWS & RATINGS TAB */}
        {activeTab === "Reviews & Ratings" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black">Student Reviews & Ratings</h3>
              <p className="text-xs text-slate-400">Only enrolled students can review your courses</p>
            </div>
            {courseReviews.length === 0 ? (
              <p className="p-6 text-center text-slate-400 font-semibold text-xs">No reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseReviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black">{r.studentName}</p>
                      <span className="inline-flex items-center gap-1 text-amber-500 font-black text-xs">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {r.rating}/5
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-blue-600">{r.courseTitle}</p>
                    {r.comment && <p className="text-xs text-slate-500">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "Earnings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: "Total Earnings", val: `₹${courseStats?.earnings ?? 0}`, icon: TrendingUp, col: "from-emerald-600 to-teal-600" },
                { label: "Enrolled Students", val: String(courseStats?.students ?? 0), icon: Users, col: "from-blue-600 to-indigo-600" },
                { label: "Published Courses", val: String(courseStats?.published ?? 0), icon: BookOpen, col: "from-violet-600 to-purple-600" }
              ].map((card, idx) => (
                <div key={idx} className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.label}</span>
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${card.col} text-white shadow-md`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">{card.val}</h3>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black">Per-Course Earnings</h3>
                <p className="text-xs text-slate-400">Calculated from real enrollments: course price × enrolled students</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                    <tr>
                      <th className="p-3">Course</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Enrollments</th>
                      <th className="p-3">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {myCourses.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-400 font-semibold">No courses yet.</td></tr>
                    ) : myCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold">{c.title}</td>
                        <td className="p-3">{c.price > 0 ? `₹${c.price}` : "Free"}</td>
                        <td className="p-3">{c.enrolledCount}</td>
                        <td className="p-3 font-black text-emerald-600">₹{c.price * c.enrolledCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MY LIVE CLASSES TAB */}
        {activeTab === "My Live Classes" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">My Scheduled & Live Classes</h3>
                <p className="text-xs text-slate-400">Total {liveClasses.length} live classes created in MongoDB</p>
              </div>
              <Button onClick={() => setActiveTab("Schedule Live Class")} className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-1">
                <Plus className="h-4 w-4" /> Schedule Class
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Class & Stream</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {liveClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-semibold">
                        No live classes yet. Use "Schedule Live Class" to create your first session.
                      </td>
                    </tr>
                  ) : liveClasses.map((lc) => (
                    <tr key={lc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold">{lc.title}</td>
                      <td className="p-3 text-blue-600 font-bold">{lc.subject}</td>
                      <td className="p-3 text-slate-500">Class {lc.grade} ({lc.stream})</td>
                      <td className="p-3 font-semibold">{lc.meetingPlatform}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          lc.status === "Published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-700"
                        }`}>
                          {lc.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        {lc.status !== "Published" && (
                          <button
                            onClick={async () => {
                              const ok = await publishEnterpriseLiveClass(lc.id);
                              if (ok) {
                                setSuccessMsg(`Published Class "${lc.title}"!`);
                                refreshData();
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" /> Publish
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (confirm(`Delete live class "${lc.title}"?`)) {
                              await deleteEnterpriseLiveClass(lc.id);
                              refreshData();
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCHEDULE LIVE CLASS TAB */}
        {activeTab === "Schedule Live Class" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="text-xl font-black">Schedule New Live Classroom Session</h3>
              <p className="text-xs text-slate-400">Class will be saved directly into MongoDB and broadcast to student dashboards.</p>
            </div>

            <form className="space-y-5 text-xs">
              <div>
                <Label className="font-bold">Class Title</Label>
                <Input
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  placeholder="e.g. Molecular Genetics & DNA Polymerase Mechanisms"
                  className="mt-1.5 rounded-xl h-11 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="font-bold">Subject</Label>
                  <select
                    value={classSubject}
                    onChange={(e) => setClassSubject(e.target.value)}
                    className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <Label className="font-bold">Target Grade</Label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value as Grade)}
                    className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                    <option value="12th">12th Class</option>
                  </select>
                </div>
                <div>
                  <Label className="font-bold">Stream</Label>
                  <select
                    value={classStream}
                    onChange={(e) => setClassStream(e.target.value as Stream)}
                    className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Non-Medical">Non-Medical</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="font-bold">Class Date</Label>
                  <Input
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    required
                    className="mt-1.5 rounded-xl h-11 text-xs"
                  />
                </div>
                <div>
                  <Label className="font-bold">Start Time</Label>
                  <Input
                    type="time"
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    required
                    className="mt-1.5 rounded-xl h-11 text-xs"
                  />
                </div>
                <div>
                  <Label className="font-bold">End Time</Label>
                  <Input
                    type="time"
                    value={classEndTime}
                    onChange={(e) => setClassEndTime(e.target.value)}
                    required
                    className="mt-1.5 rounded-xl h-11 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Meeting Platform</Label>
                  <select
                    value={classPlatform}
                    onChange={(e) => setClassPlatform(e.target.value as any)}
                    className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Jitsi">Jitsi Meet</option>
                    <option value="LiveKit">LiveKit Broadcast</option>
                  </select>
                </div>
                <div>
                  <Label className="font-bold">Live Meeting Link</Label>
                  <Input
                    value={classMeetingLink}
                    onChange={(e) => setClassMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    required
                    type="url"
                    className="mt-1.5 rounded-xl h-11 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  onClick={(e) => handleCreateLiveClass(e, true)}
                  disabled={loading}
                  variant="outline"
                  className="rounded-2xl font-bold h-11 text-xs px-6"
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleCreateLiveClass(e, false)}
                  disabled={loading}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-xs px-8"
                >
                  {loading ? "Publishing..." : "🚀 Schedule & Publish Live Class"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* UPLOAD NOTES TAB */}
        {activeTab === "Upload Notes" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs max-w-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black">Upload PDF Study Note / Formula Sheet</h3>
              <p className="text-xs text-slate-400">PDF material will be instantly available to enrolled students.</p>
            </div>

            <form onSubmit={handleUploadNote} className="space-y-4 text-xs">
              <div>
                <Label className="font-bold">Note Title</Label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Chapter 5: Genetics Formula & Pedigree Ratios Sheet"
                  className="mt-1.5 rounded-xl h-11 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Subject</Label>
                  <select
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
                <div>
                  <Label className="font-bold">Class</Label>
                  <select
                    value={noteGrade}
                    onChange={(e) => setNoteGrade(e.target.value as Grade)}
                    className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                    <option value="12th">12th Class</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Total Pages</Label>
                  <Input
                    type="number"
                    min={1}
                    value={notePages}
                    onChange={(e) => setNotePages(Number(e.target.value))}
                    className="mt-1.5 rounded-xl h-11 text-xs"
                  />
                </div>
                <div>
                  <Label className="font-bold">Stream</Label>
                  <select
                    value={noteStream}
                    onChange={(e) => setNoteStream(e.target.value as Stream)}
                    className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Non-Medical">Non-Medical</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="font-bold">PDF File Upload</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                  required
                  className="mt-1.5 rounded-xl h-11 text-xs pt-2 bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 text-xs shadow-lg">
                {loading ? "Uploading..." : "Upload Note to MongoDB"}
              </Button>
            </form>
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === "Assignments" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs max-w-3xl space-y-4">
              <h3 className="text-xl font-black">Publish New Student Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
                <div>
                  <Label className="font-bold">Assignment Title</Label>
                  <Input
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    placeholder="e.g. Pedigree Chart Analysis & Cross Ratios Assignment"
                    className="mt-1.5 rounded-xl h-11 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <Label className="font-bold">Subject</Label>
                    <select
                      value={assignSubject}
                      onChange={(e) => setAssignSubject(e.target.value)}
                      className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                    >
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>
                  <div>
                    <Label className="font-bold">Class</Label>
                    <select
                      value={assignGrade}
                      onChange={(e) => setAssignGrade(e.target.value as Grade)}
                      className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                    >
                      <option value="10th">10th Class</option>
                      <option value="11th">11th Class</option>
                      <option value="12th">12th Class</option>
                    </select>
                  </div>
                  <div>
                    <Label className="font-bold">Stream</Label>
                    <select
                      value={assignStream}
                      onChange={(e) => setAssignStream(e.target.value as Stream)}
                      className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                    >
                      <option value="Medical">Medical</option>
                      <option value="Non-Medical">Non-Medical</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <Label className="font-bold">Deadline Date</Label>
                    <Input
                      type="date"
                      value={assignDeadline}
                      onChange={(e) => setAssignDeadline(e.target.value)}
                      required
                      className="mt-1.5 rounded-xl h-11 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Maximum Marks</Label>
                    <Input
                      type="number"
                      value={assignMarks}
                      onChange={(e) => setAssignMarks(Number(e.target.value))}
                      className="mt-1.5 rounded-xl h-11 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-bold">Description / Instructions</Label>
                  <textarea
                    value={assignDescription}
                    onChange={(e) => setAssignDescription(e.target.value)}
                    placeholder="e.g. Solve all pedigree-chart cross ratios and submit a handwritten PDF before the deadline."
                    rows={3}
                    className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold resize-none"
                  />
                </div>

                <Button type="submit" disabled={loading} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs px-8 disabled:opacity-60">
                  {loading ? "Publishing..." : "Publish Student Assignment"}
                </Button>
              </form>
            </div>

            {/* ASSIGNMENTS DIRECTORY TABLE */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <h4 className="text-sm font-black mb-4">Active Published Assignments</h4>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Stream</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 font-semibold">No assignments published yet. Use the form above to publish one.</td>
                    </tr>
                  ) : assignments.map((as) => (
                    <tr key={as.id}>
                      <td className="p-3 font-bold">{as.title}</td>
                      <td className="p-3 text-blue-600 font-bold">{as.subject}</td>
                      <td className="p-3 text-slate-500">Class {as.grade}</td>
                      <td className="p-3 text-slate-500">{as.stream}</td>
                      <td className="p-3 font-semibold">{as.deadline}</td>
                      <td className="p-3 font-black text-emerald-600">{as.marks} Marks</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteAssignment(as.id)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Remove assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QUIZ PUBLISH CARD */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs max-w-3xl space-y-4">
              <div>
                <h3 className="text-xl font-black">Publish Student Quiz</h3>
                <p className="text-xs text-slate-400">Saved to MongoDB and available instantly in the students' Quizzes section.</p>
              </div>

              <form onSubmit={handlePublishQuiz} className="space-y-4 text-xs">
                <div>
                  <Label className="font-bold">Quiz Title</Label>
                  <Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Genetics Rapid Fire – 10 Questions" className="mt-1.5 rounded-xl h-11 text-xs" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <Label className="font-bold">Subject</Label>
                    <select value={quizSubject} onChange={(e) => setQuizSubject(e.target.value)}
                      className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div>
                    <Label className="font-bold">Class</Label>
                    <select value={quizGrade} onChange={(e) => setQuizGrade(e.target.value as Grade)}
                      className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
                      <option value="10th">10th Class</option>
                      <option value="11th">11th Class</option>
                      <option value="12th">12th Class</option>
                    </select>
                  </div>
                  <div>
                    <Label className="font-bold">Stream</Label>
                    <select value={quizStream} onChange={(e) => setQuizStream(e.target.value as Stream)}
                      className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
                      <option value="Medical">Medical</option>
                      <option value="Non-Medical">Non-Medical</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <Label className="font-bold">Duration (min)</Label>
                    <Input type="number" min={1} value={quizDuration} onChange={(e) => setQuizDuration(Number(e.target.value))}
                      className="mt-1.5 rounded-xl h-11 text-xs" />
                  </div>
                </div>

                {quizQuestions.map((q, qi) => (
                  <div key={qi} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold">Question {qi + 1}</Label>
                      {quizQuestions.length > 1 && (
                        <button type="button" onClick={() => setQuizQuestions((p) => p.filter((_, i) => i !== qi))}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                    <Input value={q.question} placeholder="Write the question…"
                      onChange={(e) => setQuizQuestions((p) => p.map((x, i) => i === qi ? { ...x, question: e.target.value } : x))}
                      className="rounded-xl h-10 text-xs" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`ans-${qi}`} checked={q.answer === opt && opt !== ""} onChange={() => setQuizQuestions((p) => p.map((x, i) => i === qi ? { ...x, answer: opt } : x))}
                            className="accent-emerald-600" disabled={!opt.trim()} title="Mark as correct answer" />
                          <Input value={opt} placeholder={`Option ${oi + 1}`}
                            onChange={(e) => setQuizQuestions((p) => p.map((x, i) => {
                              if (i !== qi) return x;
                              const options = x.options.map((o, j) => j === oi ? e.target.value : o);
                              return { ...x, options, answer: x.answer === x.options[oi] ? e.target.value : x.answer };
                            }))}
                            className="rounded-xl h-10 text-xs" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">Select the radio button next to the correct option.</p>
                  </div>
                ))}

                <Button type="button" onClick={() => setQuizQuestions((p) => [...p, { question: "", options: ["", "", "", ""], answer: "" }])}
                  variant="outline" className="rounded-xl text-xs font-bold gap-1 h-10">
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </Button>

                <Button type="submit" disabled={loading} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 text-xs px-8">
                  {loading ? "Publishing…" : "Publish Quiz to MongoDB"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ATTENDANCE LOGS TAB */}
        {activeTab === "Attendance Logs" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black">Live Classroom Attendance Log</h3>
              <p className="text-xs text-slate-400">Real-time attendance captured from live video rooms</p>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Class Session</th>
                  <th className="p-3">Join Time</th>
                  <th className="p-3">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-semibold">
                      No attendance records yet. Logs appear here when students join a published live class room.
                    </td>
                  </tr>
                ) : attendanceLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold">{row.studentName}</td>
                    <td className="p-3 text-slate-500">{row.email}</td>
                    <td className="p-3 font-semibold text-blue-600">{liveClasses.find(c => c.id === row.classId)?.title || row.classId}</td>
                    <td className="p-3 text-slate-500">{row.joinTime}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        row.status === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </SiteShell>
  );
}
