"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredSession, saveSession, type StudentSession } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import {
  fetchBackendAdminDashboard,
  fetchBackendNotes,
  fetchCourses,
  deleteBackendCourse,
  setBackendCourseStatus,
  type CourseCard,
  createBackendNote,
  deleteBackendNote,
  fetchBackendPapers,
  createBackendPaper,
  deleteBackendPaper,
  fetchBackendVideos,
  createBackendVideo,
  deleteBackendVideo,
  uploadBackendFile,
  createBackendQuiz,
  createBackendNotice,
  fetchEnterpriseLiveClasses,
  createEnterpriseLiveClass,
  publishEnterpriseLiveClass,
  deleteEnterpriseLiveClass,
  type EnterpriseLiveClassItem,
  type LiveClassLifecycle,
  type RealNoteItem,
  type RealPaperItem,
  type RealVideoItem,
  type RegisteredUserItem
} from "@/lib/store";
import { type Grade, type Stream } from "@/lib/platform-data";
import { InstructorApprovalsTab } from "@/components/instructor-approvals-tab";
import { InstructorCourseBuilder } from "@/components/instructor-course-builder";
import { LessonAnalytics } from "@/components/lesson-analytics";
import {
  Users,
  FileText,
  ScrollText,
  NotebookTabs,
  Download,
  Upload,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Video,
  ShieldCheck,
  Plus,
  AlertTriangle,
  Trash2,
  UserCheck,
  BookOpen,
  TrendingUp,
  Activity,
  Layers,
  Award,
  HelpCircle,
  Bell,
  Settings,
  Pencil,
  LogOut
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Form states for Upload PDF
  const [pdfGrade, setPdfGrade] = useState<Grade>("11th");
  const [pdfStream, setPdfStream] = useState<Stream>("Medical");
  const [pdfSubject, setPdfSubject] = useState("Biology");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfPages, setPdfPages] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Form states for Upload Paper
  const [paperGrade, setPaperGrade] = useState<Grade>("11th");
  const [paperStream, setPaperStream] = useState<Stream>("Medical");
  const [paperSubject, setPaperSubject] = useState("Biology");
  const [paperTitle, setPaperTitle] = useState("");
  const [paperYear, setPaperYear] = useState("2025");
  const [paperTerm, setPaperTerm] = useState("Board Exam");
  const [paperFile, setPaperFile] = useState<File | null>(null);

  // Form states for Upload Video / Live Class
  const [vidGrade, setVidGrade] = useState<Grade>("11th");
  const [vidStream, setVidStream] = useState<Stream>("Medical");
  const [vidSubject, setVidSubject] = useState("Biology");
  const [vidTitle, setVidTitle] = useState("");
  const [vidInstructor, setVidInstructor] = useState("");
  const [vidDuration, setVidDuration] = useState("60 Mins");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Enterprise Live Class Extended Form States
  const [liveCategory, setLiveCategory] = useState("NEET Special Preparation");
  const [liveDesc, setLiveDesc] = useState("");
  const [liveTeacherPhoto, setLiveTeacherPhoto] = useState("");
  const [liveTeacherBio, setLiveTeacherBio] = useState("");
  const [liveDate, setLiveDate] = useState("Today, July 28, 2026");
  const [liveStartTime, setLiveStartTime] = useState("09:00 PM");
  const [liveEndTime, setLiveEndTime] = useState("10:00 PM");
  const [liveTimeZone, setLiveTimeZone] = useState("IST (UTC+5:30)");
  const [livePlatform, setLivePlatform] = useState<"Google Meet" | "Zoom" | "Jitsi" | "LiveKit" | "Custom">("Google Meet");
  const [liveLink, setLiveLink] = useState("https://meet.google.com/abc-defg-hij");
  const [liveMeetingId, setLiveMeetingId] = useState("982-124-4412");
  const [liveMeetingPassword, setLiveMeetingPassword] = useState("STUDBIO2026");
  const [liveMaxStudents, setLiveMaxStudents] = useState(500);
  const [liveLanguage, setLiveLanguage] = useState("English & Hindi");
  const [liveDifficulty, setLiveDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [liveBannerUrl, setLiveBannerUrl] = useState("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80");
  const [liveTags, setLiveTags] = useState("Genetics, NEET, Class 11th");
  const [liveStatus, setLiveStatus] = useState<LiveClassLifecycle>("Published");
  const [liveAllowRecording, setLiveAllowRecording] = useState(true);
  const [liveAllowChat, setLiveAllowChat] = useState(true);
  const [liveAllowScreenShare, setLiveAllowScreenShare] = useState(true);
  const [liveAllowQuestions, setLiveAllowQuestions] = useState(true);
  const [livePrereqs, setLivePrereqs] = useState("Read chapter basics before joining");
  const [liveOutcomes, setLiveOutcomes] = useState("Understand core formulas and solve numerical problems");

  // Admin Live Classes Filter States
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterTeacher, setFilterTeacher] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterSearch, setFilterSearch] = useState("");
  const [enterpriseLiveClasses, setEnterpriseLiveClasses] = useState<EnterpriseLiveClassItem[]>([]);

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("Exam Updates");

  const [uploading, setUploading] = useState(false);

  // Live arrays
  const [realNotes, setRealNotes] = useState<RealNoteItem[]>([]);
  const [realPapers, setRealPapers] = useState<RealPaperItem[]>([]);
  const [adminCourses, setAdminCourses] = useState<CourseCard[]>([]);
  const [adminEditCourseId, setAdminEditCourseId] = useState<string | null>(null);
  const [adminAnalyticsCourseId, setAdminAnalyticsCourseId] = useState<string | null>(null);
  const [realVideos, setRealVideos] = useState<RealVideoItem[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserItem[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalNotes: 0,
    totalPapers: 0,
    totalVideos: 0,
    totalLiveClasses: 0,
    totalQuizzes: 0,
    totalNotices: 0,
    totalDownloads: 0
  });
  const [streamDist, setStreamDist] = useState({ medical: 0, nonMedical: 0, commerce: 0, arts: 0, general: 0 });

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    if (s && (s.isAdmin || s.role === "admin")) {
      setAuthorized(true);
      refreshData();
    } else {
      setAuthorized(false);
    }
  }, []);

  const [adminLoginEmail, setAdminLoginEmail] = useState("");
  const [adminLoginPassword, setAdminLoginPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError(null);
    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminLoginEmail, password: adminLoginPassword })
      });
      const data = await response.json();

      if (!response.ok) {
        setAdminLoginError(data.message ?? "Login failed");
        return;
      }
      const role = data.user?.role ?? "student";
      if (role !== "admin" && role !== "superAdmin") {
        setAdminLoginError("This account does not have administrator privileges.");
        return;
      }

      localStorage.setItem("study-material-token", data.token);
      const adminSession: StudentSession = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        name: data.user.username,
        role: role as StudentSession["role"],
        isAdmin: true,
        grade: data.user.grade ?? "11th",
        stream: data.user.stream ?? "Medical"
      };
      saveSession(adminSession);
      setSession(adminSession);
      setAuthorized(true);
      refreshData();
    } catch {
      setAdminLoginError("Unable to reach the backend server.");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const refreshData = () => {
    fetchBackendNotes().then(data => setRealNotes(data));
    fetchBackendPapers().then(data => setRealPapers(data));
    fetchBackendVideos().then(data => setRealVideos(data));
    fetchEnterpriseLiveClasses().then(data => setEnterpriseLiveClasses(data));
    fetchCourses({ all: true }).then(setAdminCourses);
    fetchBackendAdminDashboard().then(res => {
      setAdminStats(res.stats);
      setRegisteredUsers(res.usersList);
      setStreamDist(res.distributions);
    });
  };

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 animate-pulse">
          <ShieldCheck className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Sign in with an administrator account to access master controls. Only accounts with the admin role are granted access.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="w-full space-y-3 pt-2">
          <div className="grid gap-2 text-left">
            <Label htmlFor="admin-email" className="text-xs font-bold">Admin Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="you@example.com"
              value={adminLoginEmail}
              onChange={(e) => setAdminLoginEmail(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>
          <div className="grid gap-2 text-left">
            <Label htmlFor="admin-password" className="text-xs font-bold">Password</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={adminLoginPassword}
              onChange={(e) => setAdminLoginPassword(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          {adminLoginError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>{adminLoginError}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={adminLoginLoading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20"
          >
            {adminLoginLoading ? "Verifying credentials..." : "🛡️ Sign In as Administrator"}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full h-12 rounded-2xl border-slate-300 dark:border-slate-700 text-xs font-bold"
          >
            Return to Student Dashboard
          </Button>
        </form>
      </div>
    );
  }

  // Action handlers
  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfTitle || !pdfFile) return;

    setUploading(true);
    try {
      const uploadRes = await uploadBackendFile(pdfFile);
      if (!uploadRes) {
        setUploadSuccess("❌ File upload failed.");
        setUploading(false);
        return;
      }

      const ok = await createBackendNote({
        subject: pdfSubject,
        title: pdfTitle,
        grade: pdfGrade,
        stream: pdfGrade === "10th" ? "General" : pdfStream,
        fileSize: uploadRes.fileSize,
        pages: Number(pdfPages),
        pdfUrl: uploadRes.url
      });

      if (ok) {
        setUploadSuccess(`Uploaded PDF Note: "${pdfTitle}"!`);
        setPdfTitle("");
        setPdfFile(null);
        refreshData();
      }
    } catch {
      setUploadSuccess("❌ Error uploading note.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle || !paperFile) return;
    setUploading(true);
    try {
      const uploadRes = await uploadBackendFile(paperFile);
      if (!uploadRes) {
        setUploadSuccess("❌ Paper upload failed.");
        setUploading(false);
        return;
      }

      const ok = await createBackendPaper({
        subject: paperSubject,
        title: paperTitle,
        year: paperYear,
        term: paperTerm,
        grade: paperGrade,
        stream: paperGrade === "10th" ? "General" : paperStream,
        fileSize: uploadRes.fileSize,
        fileUrl: uploadRes.url
      });

      if (ok) {
        setUploadSuccess(`Uploaded Solved Paper: "${paperTitle}"!`);
        setPaperTitle("");
        setPaperFile(null);
        refreshData();
      }
    } catch {
      setUploadSuccess("❌ Error uploading paper.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!vidTitle || !vidInstructor) return;
    setUploading(true);
    try {
      let fileUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
      if (videoFile) {
        const uploadRes = await uploadBackendFile(videoFile);
        if (uploadRes) fileUrl = uploadRes.url;
      }

      const statusToSet: LiveClassLifecycle = isDraft ? "Draft" : liveStatus;

      const ok = await createEnterpriseLiveClass({
        title: vidTitle,
        subject: vidSubject,
        category: liveCategory,
        description: liveDesc || `${vidTitle} - Live Session for Class ${vidGrade} ${vidStream}.`,
        teacherName: vidInstructor,
        teacherPhoto: liveTeacherPhoto,
        teacherBio: liveTeacherBio,
        date: liveDate,
        startTime: liveStartTime,
        endTime: liveEndTime,
        duration: vidDuration,
        timeZone: liveTimeZone,
        meetingPlatform: livePlatform,
        meetingLink: liveLink,
        meetingId: liveMeetingId,
        meetingPassword: liveMeetingPassword,
        maxStudents: Number(liveMaxStudents),
        language: liveLanguage,
        difficultyLevel: liveDifficulty,
        bannerUrl: liveBannerUrl,
        thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
        tags: liveTags.split(",").map(t => t.trim()),
        status: statusToSet,
        allowRecording: liveAllowRecording,
        allowChat: liveAllowChat,
        allowScreenShare: liveAllowScreenShare,
        allowStudentQuestions: liveAllowQuestions,
        prerequisites: livePrereqs.split("\n").filter(Boolean),
        learningOutcomes: liveOutcomes.split("\n").filter(Boolean),
        recordingUrl: fileUrl,
        grade: vidGrade,
        stream: vidGrade === "10th" ? "General" : vidStream
      });

      if (ok) {
        setUploadSuccess(isDraft ? `Saved Draft Live Class: "${vidTitle}"!` : `Published Live Class: "${vidTitle}"!`);
        setVidTitle("");
        setVideoFile(null);
        refreshData();
      }
    } catch {
      setUploadSuccess("❌ Error creating live class.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeBody) return;
    setUploading(true);
    try {
      const ok = await createBackendNotice({ title: noticeTitle, body: noticeBody, category: noticeCategory });
      if (ok) {
        setUploadSuccess(`Notice published: "${noticeTitle}"!`);
        setNoticeTitle("");
        setNoticeBody("");
      }
    } catch {
      setUploadSuccess("❌ Error publishing notice.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const adminCards = [
    { label: "Total Registered Users", value: String(adminStats.totalUsers || registeredUsers.length), icon: Users, color: "from-blue-600 to-indigo-600" },
    { label: "Total Active Students", value: String(adminStats.totalStudents), icon: UserCheck, color: "from-emerald-600 to-teal-600" },
    { label: "Faculty & Teachers", value: String(adminStats.totalTeachers), icon: Award, color: "from-purple-600 to-pink-600" },
    { label: "Configured Subjects", value: String(new Set([...realNotes, ...realPapers, ...realVideos].map(i => i.subject)).size), icon: BookOpen, color: "from-indigo-600 to-blue-600" },
    { label: "Published PDF Notes", value: String(adminStats.totalNotes), icon: FileText, color: "from-amber-500 to-orange-600" },
    { label: "Solved Board Papers", value: String(adminStats.totalPapers), icon: ScrollText, color: "from-orange-600 to-rose-600" },
    { label: "Live Interactive Classes", value: String(adminStats.totalLiveClasses), icon: Video, color: "from-rose-600 to-pink-600" },
    { label: "Active Quizzes", value: String(adminStats.totalQuizzes), icon: HelpCircle, color: "from-cyan-600 to-blue-600" },
    { label: "Published Notices", value: String(adminStats.totalNotices), icon: Bell, color: "from-blue-600 to-cyan-600" },
    { label: "Downloads (This Browser)", value: String(adminStats.totalDownloads), icon: Download, color: "from-teal-600 to-emerald-600" }
  ];

  const now = new Date();
  const growthMonths = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    const label = d.toLocaleString("en", { month: "short" });
    const count = registeredUsers.filter(u => {
      const ud = new Date(u.joinedTs);
      return ud.getFullYear() === d.getFullYear() && ud.getMonth() === d.getMonth();
    }).length;
    return { month: label, val: count };
  });
  const growthMax = Math.max(...growthMonths.map(m => m.val), 1);
  const lastMonth = growthMonths[growthMonths.length - 1].val;
  const prevMonth = growthMonths[growthMonths.length - 2]?.val ?? 0;
  const growthBadge = prevMonth > 0
    ? `${lastMonth >= prevMonth ? "+" : ""}${Math.round(((lastMonth - prevMonth) / prevMonth) * 100)}% vs Last Month`
    : `${lastMonth} new this month`;

  const distEntries = [
    { label: "Medical", count: streamDist.medical, color: "bg-emerald-500" },
    { label: "Non-Medical", count: streamDist.nonMedical, color: "bg-blue-600" },
    { label: "Commerce", count: streamDist.commerce, color: "bg-amber-500" },
    { label: "Arts", count: streamDist.arts, color: "bg-purple-600" },
    { label: "General (10th)", count: streamDist.general, color: "bg-rose-500" }
  ];
  const distTotal = distEntries.reduce((sum, e) => sum + e.count, 0) || 1;

  return (
    <SiteShell
      title={`Admin Console - ${activeTab}`}
      description="System administration, content uploads, platform analytics, and database management."
      activeAdminTab={activeTab}
      onAdminTabChange={setActiveTab}
    >
      <div className="space-y-8">
        
        {/* TOP STATUS BAR */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-0.5 text-xs font-bold border border-emerald-500/30">
                MongoDB Active
              </span>
              <span className="rounded-full bg-amber-500/20 text-amber-400 px-3 py-0.5 text-xs font-bold border border-amber-500/30">
                Current View: {activeTab}
              </span>
            </div>
            <h2 className="text-2xl font-black">Platform Administration Console</h2>
            <p className="text-xs text-slate-400">Managing notes, papers, live classes, quizzes, notices and users from MongoDB.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={refreshData} className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-bold">
              Refresh Stats
            </Button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* DASHBOARD OVERVIEW TAB */}
        {/* ========================================================= */}
        {activeTab === "Dashboard Overview" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Core Platform Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {adminCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-lg transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</span>
                      <div className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-xs`}>
                        <card.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Updated real-time
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* VISUAL CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">User Growth & Registration Trend</h4>
                    <p className="text-xs text-slate-400">Monthly new registrations (from real join dates)</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold text-[10px]">
                    {growthBadge}
                  </Badge>
                </div>
                <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {growthMonths.map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition">{bar.val}</span>
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-orange-500 transition-all duration-300"
                        style={{ height: `${(bar.val / growthMax) * 100}%`, minHeight: bar.val > 0 ? "6px" : "2px" }}
                      />
                      <span className="text-[10px] font-bold text-slate-400">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Student Distribution by Academic Stream</h4>
                    <p className="text-xs text-slate-400">Registered students grouped by their stream</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-[10px]">
                    {adminStats.totalStudents} Students
                  </Badge>
                </div>
                <div className="space-y-3 pt-2">
                  {distEntries.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                        <span>{item.label} ({item.count})</span>
                        <span>{Math.round((item.count / distTotal) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / distTotal) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* USERS & STUDENTS TAB */}
        {/* ========================================================= */}
        {(activeTab === "Users & Students" || activeTab === "Dashboard Overview") && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Registered Users & Enrolled Students</h4>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{registeredUsers.length} Enrolled</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-black">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Grade & Stream</th>
                    <th className="p-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registeredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">Loading registered users...</td>
                    </tr>
                  ) : (
                    registeredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{u.username}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${u.role === "admin" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">{u.grade} {u.stream}</td>
                        <td className="p-3 text-slate-400">{u.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* NOTES MANAGEMENT TAB */}
        {/* ========================================================= */}
        {(activeTab === "Notes Management" || activeTab === "Dashboard Overview") && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active PDF Notes Management</h4>
              <span className="text-xs font-bold text-orange-500">{realNotes.length} Notes Uploaded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-black">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">File Size</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {realNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-orange-500">{note.subject}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{note.title}</td>
                      <td className="p-3 text-slate-500">{note.grade} {note.stream}</td>
                      <td className="p-3 text-slate-400">{note.fileSize}</td>
                      <td className="p-3">
                        <button
                          onClick={async () => {
                            if (confirm("Delete this note?")) {
                              await deleteBackendNote(note.id);
                              refreshData();
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                          title="Delete Note"
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

        {/* ========================================================= */}
        {/* PREVIOUS PAPERS TAB */}
        {/* ========================================================= */}
        {activeTab === "Previous Papers" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Previous Solved Board Papers</h4>
              <span className="text-xs font-bold text-indigo-500">{realPapers.length} Papers Uploaded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-black">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {realPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-indigo-500">{paper.subject}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{paper.title}</td>
                      <td className="p-3 text-slate-500">{paper.year}</td>
                      <td className="p-3 text-slate-400">{paper.grade} {paper.stream}</td>
                      <td className="p-3">
                        <button
                          onClick={async () => {
                            if (confirm("Delete this paper?")) {
                              await deleteBackendPaper(paper.id);
                              refreshData();
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
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

        {/* ========================================================= */}
        {/* ENTERPRISE LIVE CLASSES MANAGEMENT TAB */}
        {/* ========================================================= */}
        {activeTab === "Live Classes" && (
          <div className="space-y-8">
            
            {/* CREATE LIVE CLASS FORM */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Create & Schedule Live Class</h3>
                  <p className="text-xs text-slate-400">Production-ready Live Class management for Google Meet, Zoom, Jitsi & LiveKit.</p>
                </div>
                <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30 text-xs font-extrabold uppercase">
                  Live Engine
                </Badge>
              </div>

              <form onSubmit={(e) => handleVideoSubmit(e, false)} className="space-y-6 text-xs">
                
                {/* BASIC DETAILS */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-rose-600">1. Basic Information</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="font-bold">Class Title</Label>
                      <Input
                        value={vidTitle}
                        onChange={(e) => setVidTitle(e.target.value)}
                        placeholder="e.g. Cellular Genetics & DNA Replication Masterclass"
                        required
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Subject</Label>
                      <select
                        value={vidSubject}
                        onChange={(e) => setVidSubject(e.target.value)}
                        className="w-full mt-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                      >
                        <option value="Biology">Biology</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                    <div>
                      <Label className="font-bold">Category</Label>
                      <Input
                        value={liveCategory}
                        onChange={(e) => setLiveCategory(e.target.value)}
                        placeholder="e.g. NEET Special Preparation"
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold">Class Detailed Description</Label>
                    <textarea
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      placeholder="Write detailed session summary, objectives, and agenda..."
                      rows={3}
                      className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* TEACHER PROFILE */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-blue-600">2. Teacher Profile</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="font-bold">Teacher Full Name</Label>
                      <Input
                        value={vidInstructor}
                        onChange={(e) => setVidInstructor(e.target.value)}
                        placeholder="Enter teacher's full name"
                        required
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Teacher Photo URL</Label>
                      <Input
                        value={liveTeacherPhoto}
                        onChange={(e) => setLiveTeacherPhoto(e.target.value)}
                        placeholder="https://..."
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Teacher Bio & Designation</Label>
                      <Input
                        value={liveTeacherBio}
                        onChange={(e) => setLiveTeacherBio(e.target.value)}
                        placeholder="Senior Faculty (14+ Yrs Exp)"
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* SCHEDULE & TIMING */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-purple-600">3. Date, Time & Target Grade</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <Label className="font-bold">Target Grade</Label>
                      <select
                        value={vidGrade}
                        onChange={(e) => setVidGrade(e.target.value as Grade)}
                        className="w-full mt-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                      >
                        <option value="10th">10th Class</option>
                        <option value="11th">11th Class</option>
                        <option value="12th">12th Class</option>
                      </select>
                    </div>
                    <div>
                      <Label className="font-bold">Academic Stream</Label>
                      <select
                        value={vidStream}
                        onChange={(e) => setVidStream(e.target.value as Stream)}
                        className="w-full mt-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                      >
                        <option value="Medical">Medical</option>
                        <option value="Non-Medical">Non-Medical</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <Label className="font-bold">Class Date</Label>
                      <Input
                        value={liveDate}
                        onChange={(e) => setLiveDate(e.target.value)}
                        placeholder="Today, July 28, 2026"
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Start Time & Duration</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={liveStartTime} onChange={(e) => setLiveStartTime(e.target.value)} placeholder="09:00 PM" className="h-10 rounded-xl" />
                        <Input value={vidDuration} onChange={(e) => setVidDuration(e.target.value)} placeholder="60 Mins" className="h-10 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MEETING PLATFORM & CREDENTIALS */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-emerald-600">4. Meeting Platform & Credentials</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <Label className="font-bold">Platform</Label>
                      <select
                        value={livePlatform}
                        onChange={(e) => setLivePlatform(e.target.value as any)}
                        className="w-full mt-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                      >
                        <option value="Google Meet">Google Meet</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Jitsi">Jitsi</option>
                        <option value="LiveKit">LiveKit</option>
                        <option value="Custom">Custom Stream</option>
                      </select>
                    </div>
                    <div>
                      <Label className="font-bold">Meeting Link URL</Label>
                      <Input
                        value={liveLink}
                        onChange={(e) => setLiveLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Meeting ID</Label>
                      <Input
                        value={liveMeetingId}
                        onChange={(e) => setLiveMeetingId(e.target.value)}
                        placeholder="982-124-4412"
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Meeting Password</Label>
                      <Input
                        value={liveMeetingPassword}
                        onChange={(e) => setLiveMeetingPassword(e.target.value)}
                        placeholder="STUDBIO2026"
                        className="mt-1 h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* FLAGS & PERMISSIONS */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-amber-600">5. Interactive Room Features & Permissions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input type="checkbox" checked={liveAllowRecording} onChange={(e) => setLiveAllowRecording(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                      <span>Allow Recording</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input type="checkbox" checked={liveAllowChat} onChange={(e) => setLiveAllowChat(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                      <span>Allow Live Chat</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input type="checkbox" checked={liveAllowScreenShare} onChange={(e) => setLiveAllowScreenShare(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                      <span>Screen Sharing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input type="checkbox" checked={liveAllowQuestions} onChange={(e) => setLiveAllowQuestions(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                      <span>Raise Hand & Q&A</span>
                    </label>
                  </div>
                </div>

                {/* FORM BUTTONS */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
                  <Button
                    type="button"
                    onClick={(e) => handleVideoSubmit(e, true)}
                    disabled={uploading}
                    variant="outline"
                    className="rounded-2xl border-slate-300 dark:border-slate-700 font-bold text-xs h-11 px-5"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-8 shadow-lg"
                  >
                    {uploading ? "Publishing Class..." : "🚀 Publish Live Class"}
                  </Button>
                </div>

              </form>
            </div>

            {/* LIVE CLASSES MANAGEMENT TABLE & FILTERS */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Live Classes Directory</h4>
                  <p className="text-xs text-slate-400">Total {enterpriseLiveClasses.length} Scheduled & Archived Live Classes</p>
                </div>

                {/* SEARCH BAR */}
                <div className="w-full md:w-64">
                  <Input
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Search by class name or teacher..."
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-black">
                    <tr>
                      <th className="p-3">Class Title</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Teacher</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Platform</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enterpriseLiveClasses.map((lc) => (
                      <tr key={lc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">{lc.title}</td>
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{lc.subject}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{lc.teacherName}</td>
                        <td className="p-3 text-slate-500">{lc.date} • {lc.startTime}</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-200">{lc.meetingPlatform}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            lc.status === "Live"
                              ? "bg-rose-500 text-white animate-pulse"
                              : lc.status === "Published" || lc.status === "Upcoming"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
                                  setUploadSuccess(`Published Live Class: "${lc.title}" & sent notice to students!`);
                                  refreshData();
                                  setTimeout(() => setUploadSuccess(null), 3000);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] transition shadow-xs flex items-center gap-1 shrink-0"
                              title="Publish Live Class & Alert Students"
                            >
                              <Sparkles className="h-3 w-3" /> Publish
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm(`Permanently delete live class "${lc.title}" from MongoDB?`)) {
                                await deleteEnterpriseLiveClass(lc.id);
                                setUploadSuccess(`Deleted live class: "${lc.title}"`);
                                refreshData();
                                setTimeout(() => setUploadSuccess(null), 3000);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                            title="Permanently Delete Live Class"
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

          </div>
        )}

        {/* ========================================================= */}
        {/* UPLOAD PDF NOTE TAB */}
        {/* ========================================================= */}

        {/* ========================================================= */}
        {/* UPLOAD PDF NOTE TAB */}
        {/* ========================================================= */}
        {activeTab === "Upload PDF Note" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload PDF Study Note</h3>
              <p className="text-xs text-slate-400">Class notes will be made accessible instantly to enrolled students.</p>
            </div>

            <form onSubmit={handlePdfSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Target Class</Label>
                  <select
                    value={pdfGrade}
                    onChange={(e) => setPdfGrade(e.target.value as Grade)}
                    className="w-full mt-1.5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                    <option value="12th">12th Class</option>
                  </select>
                </div>
                <div>
                  <Label className="font-bold">Stream</Label>
                  <select
                    value={pdfStream}
                    onChange={(e) => setPdfStream(e.target.value as Stream)}
                    className="w-full mt-1.5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
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
                <Label className="font-bold">Subject</Label>
                <select
                  value={pdfSubject}
                  onChange={(e) => setPdfSubject(e.target.value)}
                  className="w-full mt-1.5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                >
                  <option value="Biology">Biology</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <Label className="font-bold">Note Title</Label>
                <Input
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g. Chapter 5 Genetics & Chromosomes Detailed Notes"
                  required
                  className="mt-1.5 h-10 rounded-xl"
                />
              </div>

              <div>
                <Label className="font-bold">Total Pages</Label>
                <Input
                  type="number"
                  min={1}
                  value={pdfPages}
                  onChange={(e) => setPdfPages(Number(e.target.value))}
                  required
                  className="mt-1.5 h-10 rounded-xl"
                />
              </div>

              <div>
                <Label className="font-bold">PDF File Upload</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  required
                  className="mt-1.5 h-10 rounded-xl pt-2 bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>

              <Button type="submit" disabled={uploading} className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                {uploading ? "Uploading PDF..." : "Publish PDF Note"}
              </Button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* UPLOAD BOARD PAPER TAB */}
        {/* ========================================================= */}
        {activeTab === "Upload Board Paper" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Board Solved Paper</h3>
              <p className="text-xs text-slate-400">Board papers will be made accessible instantly to students.</p>
            </div>

            <form onSubmit={handlePaperSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Target Class</Label>
                  <select
                    value={paperGrade}
                    onChange={(e) => setPaperGrade(e.target.value as Grade)}
                    className="w-full mt-1.5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                  >
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                    <option value="12th">12th Class</option>
                  </select>
                </div>
                <div>
                  <Label className="font-bold">Year</Label>
                  <Input
                    value={paperYear}
                    onChange={(e) => setPaperYear(e.target.value)}
                    placeholder="2025"
                    className="mt-1.5 h-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label className="font-bold">Paper Title</Label>
                <Input
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  placeholder="e.g. 2025 Board Physics Solved Question Paper"
                  required
                  className="mt-1.5 h-10 rounded-xl"
                />
              </div>

              <div>
                <Label className="font-bold">PDF File Upload</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                  required
                  className="mt-1.5 h-10 rounded-xl pt-2 bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>

              <Button type="submit" disabled={uploading} className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                {uploading ? "Uploading Paper..." : "Publish Board Paper"}
              </Button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* PUBLISH NOTICE TAB */}
        {/* ========================================================= */}
        {activeTab === "Publish Notice" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish Official Notice</h3>
              <p className="text-xs text-slate-400">Notices appear on student dashboards and official notice board.</p>
            </div>

            <form onSubmit={handleNoticeSubmit} className="space-y-4 text-xs">
              <div>
                <Label className="font-bold">Notice Category</Label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                  className="w-full mt-1.5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold"
                >
                  <option value="Latest Announcements">Latest Announcements</option>
                  <option value="Exam Updates">Exam Updates</option>
                  <option value="Holiday Notices">Holiday Notices</option>
                  <option value="Class Schedule">Class Schedule</option>
                </select>
              </div>

              <div>
                <Label className="font-bold">Notice Headline / Title</Label>
                <Input
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Examination Datesheet Uploaded"
                  required
                  className="mt-1.5 h-10 rounded-xl"
                />
              </div>

              <div>
                <Label className="font-bold">Notice Detailed Body</Label>
                <textarea
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  placeholder="Write notice details..."
                  rows={4}
                  required
                  className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" disabled={uploading} className="w-full h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
                {uploading ? "Publishing..." : "Publish Official Notice"}
              </Button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* INSTRUCTOR APPLICATIONS TAB */}
        {/* ========================================================= */}
        {activeTab === "Instructor Applications" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Instructor Approvals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review applications submitted from the instructor registration form. Approved applicants get an active
                teacher account and can sign in to the instructor dashboard; rejected applicants are notified by email.
              </p>
            </div>
            <InstructorApprovalsTab />
          </div>
        )}

        {/* ========================================================= */}
        {/* COURSES OVERSIGHT TAB */}
        {/* ========================================================= */}
        {activeTab === "Courses" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Course Oversight</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every course created by instructors — including unpublished drafts. Enrollment and rating data comes
                live from MongoDB so you can monitor quality before students see a course.
              </p>
            </div>

            {/* COURSE SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Courses", value: adminCourses.length, icon: Layers, color: "text-blue-600" },
                { label: "Published", value: adminCourses.filter(c => c.status === "Published").length, icon: CheckCircle2, color: "text-emerald-600" },
                { label: "Drafts", value: adminCourses.filter(c => c.status === "Draft").length, icon: BookOpen, color: "text-amber-600" },
                { label: "Total Students Enrolled", value: adminCourses.reduce((s, c) => s + c.enrolledCount, 0), icon: Users, color: "text-indigo-600" }
              ].map((card) => {
                const IconComp = card.icon;
                return (
                  <div key={card.label} className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                    <IconComp className={`h-6 w-6 ${card.color}`} />
                    <p className="mt-2 text-2xl font-black">{card.value}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">{card.label}</p>
                  </div>
                );
              })}
            </div>

            {/* COURSES DIRECTORY TABLE */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                  <tr>
                    <th className="p-3">Course</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Lessons</th>
                    <th className="p-3">Enrolled</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminCourses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 font-semibold">No courses have been created by instructors yet.</td>
                    </tr>
                  ) : adminCourses.map((c) => (
                    <Fragment key={c.id}>
                    <tr>
                      <td className="p-3">
                        <p className="font-bold">{c.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{c.level} · {c.language}</p>
                        <p className="text-[10px] text-violet-500 font-bold">{c.grade === "All" ? "All Classes" : c.grade}{c.stream !== "All" ? ` · ${c.stream}` : ""}</p>
                      </td>
                      <td className="p-3 font-semibold">{c.instructorName}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${c.status === "Published" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600" : "bg-amber-100 dark:bg-amber-950 text-amber-600"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{c.category}</td>
                      <td className="p-3 font-semibold">{c.lessonCount} ({c.moduleCount} modules)</td>
                      <td className="p-3 font-black text-indigo-600">{c.enrolledCount}</td>
                      <td className="p-3 font-bold">{c.price > 0 ? `₹${c.price}` : "Free"}</td>
                      <td className="p-3 font-semibold">
                        {c.ratingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-black">
                            <Award className="h-3.5 w-3.5" /> {c.ratingAvg.toFixed(1)} ({c.ratingCount})
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const res = await setBackendCourseStatus(c.id, c.status === "Published" ? "Draft" : "Published");
                              setUploadSuccess(res.ok ? `Course "${c.title}" is now ${c.status === "Published" ? "draft" : "published"}.` : res.message || "Action failed.");
                              refreshData();
                            }}
                            className="px-2 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                            title="Publish or unpublish course"
                          >
                            <Sparkles className="h-3 w-3" /> {c.status === "Published" ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => setAdminAnalyticsCourseId(adminAnalyticsCourseId === c.id ? null : c.id)}
                            className="p-2 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition"
                            title="Views, likes, shares & comments per video"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setAdminEditCourseId(c.id); setActiveTab("Create Course"); }}
                            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                            title="Edit course (same builder as instructors)"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <Link href={`/courses/${c.id}`} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Open student course view">
                            <BookOpen className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete course "${c.title}"? This removes its enrollments and reviews too.`)) return;
                              const res = await deleteBackendCourse(c.id);
                              setUploadSuccess(res.ok ? `Course "${c.title}" deleted.` : res.message || "Delete failed.");
                              refreshData();
                            }}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                            title="Delete course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {adminAnalyticsCourseId === c.id && (
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

        {/* ========================================================= */}
        {/* CREATE / EDIT COURSE TAB (same builder as instructors)     */}
        {/* ========================================================= */}
        {activeTab === "Create Course" && (
          <InstructorCourseBuilder
            editCourseId={adminEditCourseId}
            onMessage={(m) => { setUploadSuccess(m); setTimeout(() => setUploadSuccess(null), 4000); }}
            onSaved={() => {
              refreshData();
              if (adminEditCourseId) {
                setAdminEditCourseId(null);
                setActiveTab("Courses");
              }
            }}
          />
        )}

      </div>
    </SiteShell>
  );
}
