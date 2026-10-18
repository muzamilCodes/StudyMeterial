"use client";

import { useEffect, useState } from "react";
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
  getTeacherAssignments,
  addTeacherAssignment,
  removeTeacherAssignment,
  type TeacherAssignmentItem,
  type AttendanceRecord,
  type EnterpriseLiveClassItem,
  type Grade,
  type Stream
} from "@/lib/store";
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
  FolderPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [assignments, setAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignSubject, setAssignSubject] = useState("Biology");
  const [assignGrade, setAssignGrade] = useState<Grade>("11th");
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignMarks, setAssignMarks] = useState(50);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    setAssignments(getTeacherAssignments());
    refreshData();
  }, []);

  const refreshData = () => {
    fetchEnterpriseLiveClasses().then((data) => setLiveClasses(data));
    fetchBackendNotes().then((data) => setPlatformNotes(data));
    fetchBackendAttendance().then((data) => setAttendanceLogs(data));
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

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle) return;
    const newAs = {
      id: `as-${Date.now()}`,
      title: assignTitle,
      subject: assignSubject,
      grade: assignGrade,
      deadline: assignDeadline,
      marks: Number(assignMarks)
    };
    setAssignments(addTeacherAssignment(newAs));
    setAssignTitle("");
    setSuccessMsg(`Published Assignment: "${assignTitle}"!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(removeTeacherAssignment(id));
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
                { label: "Total Live Classes Scheduled", val: String(liveClasses.length), icon: Radio, col: "from-rose-600 to-pink-600" },
                { label: "Enrolled Students Count", val: String(liveClasses.reduce((sum, c) => sum + (c.enrolledStudentsCount || 0), 0)), icon: Users, col: "from-blue-600 to-indigo-600" },
                { label: "Published Chapter Notes", val: String(platformNotes.length), icon: FileText, col: "from-amber-500 to-orange-600" },
                { label: "Active Student Assignments", val: String(assignments.length), icon: FolderPlus, col: "from-emerald-600 to-teal-600" }
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
                  { tab: "Schedule Live Class", label: "Schedule a Live Class", desc: "Go live on Google Meet / Zoom", icon: Video, accent: "bg-blue-600 hover:bg-blue-700" },
                  { tab: "My Live Classes", label: "Manage My Classes", desc: "Publish drafts, delete sessions", icon: Radio, accent: "bg-rose-600 hover:bg-rose-700" },
                  { tab: "Upload Notes", label: "Upload Study Note", desc: "Add a PDF chapter / formula sheet", icon: Upload, accent: "bg-amber-600 hover:bg-amber-700" },
                  { tab: "Assignments", label: "Publish Assignment", desc: "Set homework with a deadline", icon: FolderPlus, accent: "bg-emerald-600 hover:bg-emerald-700" },
                  { tab: "Attendance Logs", label: "Attendance Logs", desc: "Review live room attendance", icon: Users, accent: "bg-indigo-600 hover:bg-indigo-700" }
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

                <Button type="submit" className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs px-8">
                  Publish Student Assignment
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
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-semibold">No assignments published yet. Use the form above to publish one.</td>
                    </tr>
                  ) : assignments.map((as) => (
                    <tr key={as.id}>
                      <td className="p-3 font-bold">{as.title}</td>
                      <td className="p-3 text-blue-600 font-bold">{as.subject}</td>
                      <td className="p-3 text-slate-500">Class {as.grade}</td>
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
