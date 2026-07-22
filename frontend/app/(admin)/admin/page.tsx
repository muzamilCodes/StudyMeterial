"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredSession, type StudentSession } from "@/lib/session";
import {
  fetchBackendAdminDashboard,
  fetchBackendNotes,
  createBackendNote,
  deleteBackendNote,
  fetchBackendPapers,
  createBackendPaper,
  deleteBackendPaper,
  fetchBackendVideos,
  createBackendVideo,
  deleteBackendVideo,
  type RealNoteItem,
  type RealPaperItem,
  type RealVideoItem,
  type RegisteredUserItem
} from "@/lib/store";
import { type Grade, type Stream } from "@/lib/platform-data";
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
  Trash2
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("Upload PDF");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Form states for Upload PDF
  const [pdfGrade, setPdfGrade] = useState<Grade>("11th");
  const [pdfStream, setPdfStream] = useState<Stream>("Medical");
  const [pdfSubject, setPdfSubject] = useState("Biology");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfPages, setPdfPages] = useState(15);
  const [pdfSize, setPdfSize] = useState("3.5 MB");

  // Form states for Upload Paper
  const [paperGrade, setPaperGrade] = useState<Grade>("11th");
  const [paperStream, setPaperStream] = useState<Stream>("Medical");
  const [paperSubject, setPaperSubject] = useState("Biology");
  const [paperTitle, setPaperTitle] = useState("");
  const [paperYear, setPaperYear] = useState("2025");
  const [paperTerm, setPaperTerm] = useState("Board Exam");

  // Form states for Upload Video
  const [vidGrade, setVidGrade] = useState<Grade>("11th");
  const [vidStream, setVidStream] = useState<Stream>("Medical");
  const [vidSubject, setVidSubject] = useState("Biology");
  const [vidTitle, setVidTitle] = useState("");
  const [vidInstructor, setVidInstructor] = useState("Dr. Ananya Sharma");
  const [vidDuration, setVidDuration] = useState("25:00");

  // Live arrays
  const [realNotes, setRealNotes] = useState<RealNoteItem[]>([]);
  const [realPapers, setRealPapers] = useState<RealPaperItem[]>([]);
  const [realVideos, setRealVideos] = useState<RealVideoItem[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserItem[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalPapers: 0,
    totalVideos: 0,
    totalQuizzes: 0,
    totalDownloads: 0,
    averageScore: "85%"
  });

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    // STRICT ADMIN AUTHORIZATION CHECK
    if (!s || (!s.isAdmin && s.role !== "admin")) {
      router.replace("/dashboard");
      return;
    }

    setAuthorized(true);
    refreshData();
  }, [router]);

  const refreshData = () => {
    fetchBackendNotes().then(data => setRealNotes(data));
    fetchBackendPapers().then(data => setRealPapers(data));
    fetchBackendVideos().then(data => setRealVideos(data));
    fetchBackendAdminDashboard().then(res => {
      setAdminStats(res.stats);
      setRegisteredUsers(res.usersList);
    });
  };

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 animate-pulse" />
        <h2 className="text-2xl font-extrabold text-slate-900">Access Denied – Admin Authorization Required</h2>
        <p className="text-sm text-slate-600 max-w-md">
          Only users with <code className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">isAdmin: true</code> can view this page. Redirecting to Student Dashboard...
        </p>
        <Button onClick={() => router.push("/dashboard")} className="rounded-xl bg-blue-600 text-white">
          Go to Student Dashboard
        </Button>
      </div>
    );
  }

  // Handle Deletion Actions
  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    const ok = await deleteBackendNote(id);
    if (ok) {
      setUploadSuccess("PDF Note deleted successfully!");
      refreshData();
    } else {
      setUploadSuccess("❌ Failed to delete PDF Note.");
    }
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this previous year paper?")) return;
    const ok = await deleteBackendPaper(id);
    if (ok) {
      setUploadSuccess("Previous Paper deleted successfully!");
      refreshData();
    } else {
      setUploadSuccess("❌ Failed to delete Previous Paper.");
    }
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video lecture?")) return;
    const ok = await deleteBackendVideo(id);
    if (ok) {
      setUploadSuccess("Video Lecture deleted successfully!");
      refreshData();
    } else {
      setUploadSuccess("❌ Failed to delete Video Lecture.");
    }
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  // Handle PDF Upload Form
  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfTitle) return;

    const ok = await createBackendNote({
      subject: pdfSubject,
      title: pdfTitle,
      grade: pdfGrade,
      stream: pdfGrade === "10th" ? "General" : pdfStream,
      fileSize: pdfSize,
      pages: Number(pdfPages),
      pdfUrl: "http://localhost:4000/uploads/dummy.pdf"
    });

    if (ok) {
      setUploadSuccess(`Successfully uploaded PDF Note: "${pdfTitle}" for Class ${pdfGrade}!`);
      setPdfTitle("");
      refreshData();
    } else {
      setUploadSuccess("❌ Failed to upload note to MongoDB database");
    }
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  // Handle Paper Upload Form
  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperTitle) return;

    const ok = await createBackendPaper({
      subject: paperSubject,
      title: paperTitle,
      year: paperYear,
      term: paperTerm,
      grade: paperGrade,
      stream: paperGrade === "10th" ? "General" : paperStream,
      fileSize: "3.2 MB",
      fileUrl: "http://localhost:4000/uploads/dummy.pdf"
    });

    if (ok) {
      setUploadSuccess(`Successfully uploaded Previous Paper: "${paperTitle}" (${paperYear}) for Class ${paperGrade}!`);
      setPaperTitle("");
      refreshData();
    } else {
      setUploadSuccess("❌ Failed to upload board paper to MongoDB database");
    }
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  // Handle Video Upload Form
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitle) return;

    const ok = await createBackendVideo({
      subject: vidSubject,
      title: vidTitle,
      instructor: vidInstructor,
      duration: vidDuration,
      grade: vidGrade,
      stream: vidGrade === "10th" ? "General" : vidStream,
      thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    });

    if (ok) {
      setUploadSuccess(`Successfully uploaded Video Lecture: "${vidTitle}" for Class ${vidGrade}!`);
      setVidTitle("");
      refreshData();
    } else {
      setUploadSuccess("❌ Failed to upload video to MongoDB database");
    }
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  const adminCards = [
    { label: "Total Users", value: String(adminStats.totalUsers), icon: Users, color: "from-blue-600 to-blue-500" },
    { label: "Total Notes", value: String(adminStats.totalNotes), icon: FileText, color: "from-emerald-600 to-teal-500" },
    { label: "Total Papers", value: String(adminStats.totalPapers), icon: ScrollText, color: "from-orange-500 to-amber-500" },
    { label: "Total Quizzes", value: String(adminStats.totalQuizzes), icon: NotebookTabs, color: "from-indigo-600 to-purple-500" },
    { label: "Total Downloads", value: String(adminStats.totalDownloads), icon: Download, color: "from-rose-600 to-pink-500" }
  ];

  const tabs = ["Upload PDF", "Upload Previous Paper", "Upload Video", "Registered Users", "Manage Notes", "Manage Papers", "Manage Videos"];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 md:p-8 text-white shadow-premium relative overflow-hidden border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className="bg-emerald-600 text-white font-bold text-xs">Admin Access Verified</Badge>
              <Badge className="bg-white/10 text-slate-300 text-xs">Class-Wise Upload Controller</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Dashboard & CMS</h1>
            <p className="mt-1 text-xs md:text-sm text-slate-400 max-w-2xl">
              Upload PDF notes, previous board papers, video lectures, and MCQ quizzes class-wise. Real data appears live on student dashboards.
            </p>
          </div>
        </div>
      </div>

      {/* REAL ADMIN STATS CARDS (CALCULATED FROM STORE) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {adminCards.map((card) => (
          <Card key={card.label} className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">{card.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">Real Store Metric</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {uploadSuccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 p-4 text-white font-medium shadow-lg animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">{uploadSuccess}</p>
        </div>
      )}

      {/* Admin Action Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
              activeTab === t
                ? "bg-slate-950 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        {activeTab === "Upload PDF" && (
          <form onSubmit={handlePdfSubmit} className="space-y-4">
            <div className="border-b pb-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">Upload Class-Wise PDF Study Notes</h3>
              <p className="text-xs text-slate-500">Uploaded notes will appear on the Student Notes page for the selected class.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Target Class</Label>
                <select
                  value={pdfGrade}
                  onChange={(e) => setPdfGrade(e.target.value as Grade)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900"
                >
                  <option value="10th">10th Class</option>
                  <option value="11th">11th Class</option>
                  <option value="12th">12th Class</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Target Stream</Label>
                <select
                  value={pdfStream}
                  disabled={pdfGrade === "10th"}
                  onChange={(e) => setPdfStream(e.target.value as Stream)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 disabled:opacity-50"
                >
                  <option value="Medical">Medical</option>
                  <option value="Non-Medical">Non-Medical</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Subject</Label>
                <select
                  value={pdfSubject}
                  onChange={(e) => setPdfSubject(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900"
                >
                  <option value="Biology">Biology</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Accountancy">Accountancy</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                  <option value="Political Science">Political Science</option>
                  <option value="Sociology">Sociology</option>
                  <option value="Geography">Geography</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2 md:col-span-2">
                <Label className="font-bold text-slate-800 text-xs">PDF Document Title</Label>
                <Input
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Cell Cycle & Division Detailed Revision Notes"
                  required
                  className="h-11 rounded-xl text-xs"
                />
              </div>

              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">File Size & Pages</Label>
                <div className="flex gap-2">
                  <Input value={pdfSize} onChange={(e) => setPdfSize(e.target.value)} placeholder="3.5 MB" className="h-11 rounded-xl text-xs" />
                  <Input type="number" value={pdfPages} onChange={(e) => setPdfPages(Number(e.target.value))} placeholder="15" className="h-11 rounded-xl text-xs" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs shadow-premium">
              <Upload className="mr-2 h-4 w-4" /> Upload PDF Note to Platform
            </Button>
          </form>
        )}

        {activeTab === "Upload Previous Paper" && (
          <form onSubmit={handlePaperSubmit} className="space-y-4">
            <div className="border-b pb-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">Upload Board Question Paper</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Class</Label>
                <select value={paperGrade} onChange={(e) => setPaperGrade(e.target.value as Grade)} className="h-11 rounded-xl border bg-white px-3 text-xs font-semibold">
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Stream</Label>
                <select value={paperStream} onChange={(e) => setPaperStream(e.target.value as Stream)} className="h-11 rounded-xl border bg-white px-3 text-xs font-semibold">
                  <option value="Medical">Medical</option>
                  <option value="Non-Medical">Non-Medical</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Subject</Label>
                <Input value={paperSubject} onChange={(e) => setPaperSubject(e.target.value)} className="h-11 rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2 md:col-span-2">
                <Label className="font-bold text-slate-800 text-xs">Paper Title</Label>
                <Input value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} placeholder="e.g. 2025 Annual Board Exam Model Question Paper with Solutions" required className="h-11 rounded-xl text-xs" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Year & Term</Label>
                <div className="flex gap-2">
                  <Input value={paperYear} onChange={(e) => setPaperYear(e.target.value)} placeholder="2025" className="h-11 rounded-xl text-xs" />
                  <Input value={paperTerm} onChange={(e) => setPaperTerm(e.target.value)} placeholder="Board Exam" className="h-11 rounded-xl text-xs" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs shadow">
              <Upload className="mr-2 h-4 w-4" /> Upload Board Paper
            </Button>
          </form>
        )}

        {activeTab === "Upload Video" && (
          <form onSubmit={handleVideoSubmit} className="space-y-4">
            <div className="border-b pb-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">Upload Video Lecture</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Video Title</Label>
                <Input value={vidTitle} onChange={(e) => setVidTitle(e.target.value)} placeholder="e.g. Cell Division Mitosis Masterclass 1080p" required className="h-11 rounded-xl text-xs" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs">Instructor & Duration</Label>
                <div className="flex gap-2">
                  <Input value={vidInstructor} onChange={(e) => setVidInstructor(e.target.value)} placeholder="Dr. Ananya" className="h-11 rounded-xl text-xs" />
                  <Input value={vidDuration} onChange={(e) => setVidDuration(e.target.value)} placeholder="25:00" className="h-11 rounded-xl text-xs" />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs shadow">
              <Video className="mr-2 h-4 w-4" /> Upload Video Lecture
            </Button>
          </form>
        )}

        {activeTab === "Registered Users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Students & Accounts</h3>
                <p className="text-xs text-slate-500">List of all users registered on the platform with their grade and stream details.</p>
              </div>
              <Badge className="bg-blue-600 text-white font-bold px-3 py-1 text-xs">{registeredUsers.length} Users</Badge>
            </div>

            {/* Class & Stream Distribution Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class 10th Users</p>
                <p className="text-2xl font-black text-slate-950 mt-1">
                  {registeredUsers.filter(u => u.grade === "10th").length}
                </p>
              </Card>
              <Card className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class 11th Users</p>
                <p className="text-2xl font-black text-slate-950 mt-1">
                  {registeredUsers.filter(u => u.grade === "11th").length}
                </p>
              </Card>
              <Card className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class 12th Users</p>
                <p className="text-2xl font-black text-slate-950 mt-1">
                  {registeredUsers.filter(u => u.grade === "12th").length}
                </p>
              </Card>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b font-bold uppercase tracking-wider">
                    <th className="p-4 font-bold">User Name</th>
                    <th className="p-4 font-bold">Email Address</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Class & Stream</th>
                    <th className="p-4 font-bold">Joined On</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    registeredUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-950">{u.username}</td>
                        <td className="p-4 font-medium text-slate-600">{u.email}</td>
                        <td className="p-4">
                          <Badge className={u.role === "admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          Class {u.grade} ({u.stream})
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{u.createdAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Manage Notes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Uploaded PDF Notes ({realNotes.length})</h3>
              <Badge className="bg-blue-100 text-blue-700 font-bold">{realNotes.length} Items</Badge>
            </div>
            {realNotes.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No PDF notes uploaded yet. Use "Upload PDF" tab above to add notes for any class!</p>
            ) : (
              <div className="space-y-2">
                {realNotes.map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-[10px] text-slate-500">Class {n.grade} ({n.stream}) • {n.subject} • {n.fileSize}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNote(n.id)}
                      className="rounded-lg h-8 text-[11px] font-bold flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Manage Papers" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Uploaded Previous Papers ({realPapers.length})</h3>
              <Badge className="bg-blue-100 text-blue-700 font-bold">{realPapers.length} Items</Badge>
            </div>
            {realPapers.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No previous papers uploaded yet. Use "Upload Previous Paper" tab above to add papers!</p>
            ) : (
              <div className="space-y-2">
                {realPapers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{p.title}</p>
                      <p className="text-[10px] text-slate-500">Class {p.grade} ({p.stream}) • {p.subject} • {p.year} ({p.term})</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePaper(p.id)}
                      className="rounded-lg h-8 text-[11px] font-bold flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Manage Videos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Uploaded Videos ({realVideos.length})</h3>
              <Badge className="bg-blue-100 text-blue-700 font-bold">{realVideos.length} Items</Badge>
            </div>
            {realVideos.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No videos uploaded yet. Use "Upload Video" tab above to add videos!</p>
            ) : (
              <div className="space-y-2">
                {realVideos.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{v.title}</p>
                      <p className="text-[10px] text-slate-500">Class {v.grade} ({v.stream}) • {v.subject} • {v.instructor} ({v.duration})</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(v.id)}
                      className="rounded-lg h-8 text-[11px] font-bold flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
