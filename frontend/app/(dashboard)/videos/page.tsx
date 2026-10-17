"use client";

import { useEffect, useState, useRef } from "react";
import { SiteShell } from "@/components/site-shell";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { 
  fetchEnterpriseLiveClasses, 
  logLiveClassAttendance, 
  logDownload,
  type EnterpriseLiveClassItem, 
  type LiveClassLifecycle 
} from "@/lib/store";
import { 
  PlayCircle, 
  Clock, 
  User, 
  X, 
  Video, 
  Download, 
  CheckCircle2, 
  Radio, 
  Send, 
  MessageSquare,
  Sparkles,
  Maximize2,
  Users,
  Bell,
  Calendar,
  Volume2,
  Tv,
  Share2,
  Mic,
  MicOff,
  VideoOff,
  Hand,
  BarChart2,
  Edit3,
  HelpCircle,
  FileText,
  BookOpen,
  Award,
  Star,
  Search,
  Filter,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ChatMessage = {
  id: string;
  senderName: string;
  senderRole: "student" | "teacher" | "admin";
  text: string;
  time: string;
};

export default function VideosPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [liveClasses, setLiveClasses] = useState<EnterpriseLiveClassItem[]>([]);
  const [activeTabFilter, setActiveTabFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Active Room / Active Details states
  const [activeRoomClass, setActiveRoomClass] = useState<EnterpriseLiveClassItem | null>(null);
  const [activeDetailsClass, setActiveDetailsClass] = useState<EnterpriseLiveClassItem | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [remindersSet, setRemindersSet] = useState<Record<string, boolean>>({});

  // Teacher / Student In-Room Control States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [activePoll, setActivePoll] = useState<{ question: string; options: string[]; votes: number[] } | null>(null);
  const [attendanceLogged, setAttendanceLogged] = useState(false);

  // Live stream session timer (starts when room is opened)
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    if (!activeRoomClass) {
      setLiveSeconds(0);
      return;
    }
    const id = setInterval(() => setLiveSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [activeRoomClass]);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState("");
  const [asTeacher, setAsTeacher] = useState(false);

  // Comments / Discussion State for Details View (persisted per browser)
  const [classComments, setClassComments] = useState<Array<{ id: string; name: string; text: string; date: string }>>([]);
  const [newCommentInput, setNewCommentInput] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("live-class-comments");
      if (saved) setClassComments(JSON.parse(saved));
    } catch { /* ignore malformed cache */ }
  }, []);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    fetchEnterpriseLiveClasses({ grade, stream }).then((data) => {
      setLiveClasses(data);
    });
  }, []);

  // Real WebRTC Camera & Mic Stream Ref
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeRoomClass && isCamOn) {
      if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn })
          .then((mediaStream) => {
            stream = mediaStream;
            setIsWebcamActive(true);
            if (webcamVideoRef.current) {
              webcamVideoRef.current.srcObject = mediaStream;
            }
          })
          .catch((err) => {
            console.warn("Webcam camera access not granted or unavailable:", err);
            setIsWebcamActive(false);
          });
      }
    } else {
      setIsWebcamActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeRoomClass, isCamOn, isMicOn]);

  // Log attendance automatically on entering live room
  useEffect(() => {
    if (activeRoomClass && session && !attendanceLogged) {
      logLiveClassAttendance(activeRoomClass.id, session.name || "Student", session.email || "student@studymaterial.com");
      setAttendanceLogged(true);
    }
  }, [activeRoomClass, session, attendanceLogged]);

  // Load chat messages for active video room
  useEffect(() => {
    if (!activeRoomClass) return;
    const key = `live-classroom-chat-${activeRoomClass.id}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setChatMessages(JSON.parse(raw));
      } catch {
        setChatMessages([]);
      }
    } else {
      setChatMessages([]);
    }
  }, [activeRoomClass]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeRoomClass) return;

    const senderName = asTeacher
      ? activeRoomClass.teacherName || "Teacher"
      : session?.name || "Student";
    const senderRole = asTeacher ? "teacher" : "student";

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName,
      senderRole,
      text: newMsgText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    setNewMsgText("");

    const key = `live-classroom-chat-${activeRoomClass.id}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;

    const newCm = {
      id: `cm-${Date.now()}`,
      name: session?.name || "Enrolled Student",
      text: newCommentInput.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };

    const updated = [newCm, ...classComments];
    setClassComments(updated);
    localStorage.setItem("live-class-comments", JSON.stringify(updated));
    setNewCommentInput("");
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  const handleSetReminder = (sessionTitle: string, dateStr: string) => {
    setRemindersSet((prev) => ({ ...prev, [sessionTitle]: true }));
    setNotificationToast(`🔔 Live Class Alert Set for "${sessionTitle}" (${dateStr})`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const formatLiveDuration = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, "0") + ":" : ""}${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";

  // Filter classes based on active Tab Filter & Search Query
  const filteredClasses = liveClasses.filter((lc) => {
    const matchesSearch =
      lc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lc.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lc.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTabFilter === "Live Now") return lc.status === "Live";
    if (activeTabFilter === "Today's Classes") return lc.date.toLowerCase().includes("today");
    if (activeTabFilter === "Upcoming") return lc.status === "Upcoming" || lc.status === "Published";
    if (activeTabFilter === "Completed") return lc.status === "Completed";
    if (activeTabFilter === "Recorded") return Boolean(lc.recordingUrl);

    return true; // "All"
  });

  return (
    <SiteShell
      title="Enterprise Live Classes & Interactive Room"
      description={`Google Classroom & Zoom-styled live lectures for Class ${grade} (${stream})`}
    >
      <div className="space-y-8 max-w-[1600px] mx-auto">
        
        {/* NOTIFICATION ALERT TOAST */}
        {notificationToast && (
          <div className="p-4 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in fade-in">
            <Bell className="h-4 w-4 animate-bounce" />
            <span>{notificationToast}</span>
          </div>
        )}

        {/* HERO LIVE BROADCAST FEATURED BANNER */}
        {!liveClasses[0] ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
            <Radio className="h-8 w-8 mx-auto text-slate-300" />
            <h2 className="text-lg font-black text-slate-700 dark:text-slate-200">No live classes published yet</h2>
            <p className="text-xs text-slate-400 font-medium">Live classrooms scheduled by your teachers will appear here once published.</p>
          </div>
        ) : (
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-lg animate-pulse">
                  <Radio className="h-4 w-4" /> LIVE BROADCAST
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-md">
                  Class {liveClasses[0].grade} {liveClasses[0].stream}
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {liveClasses[0].enrolledStudentsCount} Enrolled Students
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                {liveClasses[0].title}
              </h2>

              <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                <strong>{liveClasses[0].teacherName}</strong> — interactive student chat, screen sharing, and doubt clearing inside the classroom room.
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-rose-400">
                  <Calendar className="h-4 w-4" /> {liveClasses[0].date} • {liveClasses[0].startTime}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveRoomClass(liveClasses[0])}
                className="shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3.5 text-xs font-black text-white shadow-xl hover:from-rose-700 transition"
              >
                <Radio className="h-5 w-5 animate-pulse" />
                <span>Join Live Classroom Room</span>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* SEARCH & CATEGORY FILTER TABS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search class title, subject or teacher..."
              className="w-full h-10 rounded-2xl pl-10 pr-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              "All",
              "Live Now",
              "Today's Classes",
              "Upcoming",
              "Completed",
              "Recorded"
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeTabFilter === tab
                    ? "bg-rose-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* LIVE CLASSES GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tv className="h-4 w-4 text-rose-600" />
              Showing {filteredClasses.length} Live Classes
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Real-Time Database Sync</span>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
              <Video className="h-12 w-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Live Classes Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No classes match the selected filter. Switch tabs or reset your search query.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((item) => {
                const isReminder = remindersSet[item.title];
                return (
                  <div
                    key={item.id}
                    className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-xl transition duration-300 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      
                      {/* BANNER THUMBNAIL WITH STATUS BADGE & PLATFORM */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
                        <img
                          src={item.thumbnailUrl || item.bannerUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80"}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg group-hover:scale-110 transition">
                            <PlayCircle className="h-7 w-7" />
                          </div>
                        </div>
                        
                        {/* STATUS BADGE */}
                        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase backdrop-blur-md text-white ${
                          item.status === "Live" ? "bg-rose-600 animate-pulse shadow-lg" : "bg-black/60"
                        }`}>
                          {item.status === "Live" ? "🔴 Live Now" : item.status}
                        </span>

                        {/* PLATFORM BADGE */}
                        <span className="absolute right-3 bottom-3 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                          {item.meetingPlatform || "Google Meet"}
                        </span>
                      </div>

                      {/* TITLE & TEACHER */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[10px] font-bold">
                            {item.subject}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {item.enrolledStudentsCount} / {item.maxStudents} Enrolled
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-rose-600 transition">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="h-7 w-7 rounded-full overflow-hidden bg-blue-600 font-bold text-white text-xs flex items-center justify-center shrink-0">
                            {item.teacherPhoto ? (
                              <img src={item.teacherPhoto} alt={item.teacherName} className="h-full w-full object-cover" />
                            ) : (
                              <span>{item.teacherName ? item.teacherName[0] : "T"}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.teacherName}</p>
                            <p className="text-[10px] text-slate-400">{item.date} • {item.startTime}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setActiveRoomClass(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition shadow-xs"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> Join Room
                      </button>
                      <button
                        onClick={() => setActiveDetailsClass(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                      >
                        <Info className="h-3.5 w-3.5 text-blue-600" /> Details
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 1. IN-CLASSROOM INTERACTIVE ROOM MODAL WITH TEACHER & STUDENT CONTROLS */}
      {/* ==================================================================== */}
      {activeRoomClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-7xl h-[94vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* ROOM HEADER */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-lg animate-pulse">
                  <Radio className="h-4 w-4" /> LIVE BROADCAST
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {formatLiveDuration(liveSeconds)}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {activeRoomClass.enrolledStudentsCount} Enrolled Students
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">{activeRoomClass.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setActiveRoomClass(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MAIN ROOM CONTENT: VIDEO BROADCAST & SCREEN SHARE VS LIVE CHAT */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950">
              
              {/* LEFT VIDEO VIEWPORT + TOOLBAR CONTROLS */}
              <div className="lg:col-span-8 flex flex-col justify-between bg-black p-2 relative">
                
                <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  {isWhiteboardActive ? (
                    <div className="w-full h-full bg-slate-900 p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <Edit3 className="h-12 w-12 text-rose-500 animate-bounce" />
                      <h3 className="text-xl font-bold text-white">Interactive Live Whiteboard Active</h3>
                      <p className="text-xs text-slate-400 max-w-md">Teacher is demonstrating DNA replication diagram and solving equations live.</p>
                      <div className="p-4 rounded-2xl bg-white/10 text-xs text-rose-300 border border-white/20">
                        Equation: 2^n = 16 chromosome divisions
                      </div>
                    </div>
                  ) : isCamOn ? (
                    <video
                      ref={webcamVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-xl">
                        {activeRoomClass.teacherName ? activeRoomClass.teacherName[0] : "T"}
                      </div>
                      <h4 className="text-sm font-bold text-white">{activeRoomClass.teacherName} (Camera Paused)</h4>
                      <p className="text-xs text-slate-400">Click "Cam On" in toolbar below to activate your live camera feed.</p>
                    </div>
                  )}

                  {/* OVERLAY BADGES & DIRECT PLATFORM LAUNCH LINK */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="bg-slate-950/80 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg pointer-events-auto">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <span>🔴 LIVE {activeRoomClass.meetingPlatform || "Google Meet"} Stream</span>
                    </div>

                    {activeRoomClass.meetingLink && (
                      <a
                        href={activeRoomClass.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg backdrop-blur-md border border-blue-400 pointer-events-auto flex items-center gap-1.5 transition"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Launch {activeRoomClass.meetingPlatform || "Meeting"} Link 🚀</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* TEACHER & STUDENT INTERACTIVE CONTROLS TOOLBAR */}
                <div className="p-3 bg-slate-900/90 text-white flex flex-wrap items-center justify-between rounded-xl mt-2 text-xs gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`p-2.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                        isMicOn ? "bg-slate-800 text-white" : "bg-rose-600 text-white"
                      }`}
                    >
                      {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      <span>{isMicOn ? "Mute" : "Unmuted"}</span>
                    </button>

                    <button
                      onClick={() => setIsCamOn(!isCamOn)}
                      className={`p-2.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                        isCamOn ? "bg-slate-800 text-white" : "bg-rose-600 text-white"
                      }`}
                    >
                      {isCamOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      <span>{isCamOn ? "Cam On" : "Cam Off"}</span>
                    </button>

                    <button
                      onClick={() => setIsHandRaised(!isHandRaised)}
                      className={`p-2.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                        isHandRaised ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-white"
                      }`}
                    >
                      <Hand className="h-4 w-4" />
                      <span>{isHandRaised ? "Hand Raised" : "Raise Hand"}</span>
                    </button>

                    <button
                      onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
                      className="p-2.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition flex items-center gap-1.5"
                    >
                      <Edit3 className="h-4 w-4 text-blue-400" />
                      <span>Whiteboard</span>
                    </button>
                  </div>

                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-[10px] font-bold border border-emerald-500/30">
                    Attendance Logged
                  </span>
                </div>

              </div>

              {/* RIGHT LIVE CLASSROOM CHAT BOX */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-rose-500" />
                    <span className="text-xs font-bold text-white">Live Classroom Chat</span>
                  </div>

                  <button
                    onClick={() => setAsTeacher(!asTeacher)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border ${
                      asTeacher
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-blue-600 text-white border-blue-500"
                    }`}
                  >
                    Role: {asTeacher ? "Teacher / Faculty" : "Student"}
                  </button>
                </div>

                {/* MESSAGES LIST */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl space-y-1 ${
                        msg.senderRole === "teacher"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-200"
                          : "bg-slate-800/80 text-slate-200 border border-slate-700/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center gap-1.5 ${msg.senderRole === "teacher" ? "text-amber-400" : "text-blue-400"}`}>
                          {msg.senderName}
                          {msg.senderRole === "teacher" && (
                            <span className="rounded bg-amber-500 text-slate-950 px-1 py-0.2 text-[9px] font-black uppercase">
                              Faculty
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-slate-100 leading-snug">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* CHAT INPUT FORM */}
                <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
                  <input
                    type="text"
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    placeholder={asTeacher ? "Reply as Faculty Teacher..." : "Ask doubt in live class..."}
                    className="flex-1 h-10 rounded-xl px-3 bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. LIVE CLASS DETAILS MODAL (OUTCOMES, PREREQUISITES, ATTACHMENTS, DISCUSSIONS) */}
      {/* ==================================================================== */}
      {activeDetailsClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6 border border-slate-200 dark:border-slate-800">
            
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-xs font-bold">
                    {activeDetailsClass.subject} • {activeDetailsClass.category}
                  </span>
                  <span className="rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 text-xs font-bold">
                    {activeDetailsClass.meetingPlatform || "Google Meet"}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeDetailsClass.title}</h2>
                <p className="text-xs text-slate-400 mt-1">Instructor: {activeDetailsClass.teacherName}</p>
              </div>

              <button
                onClick={() => setActiveDetailsClass(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BANNER */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
              <img
                src={activeDetailsClass.bannerUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80"}
                alt={activeDetailsClass.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* TEACHER BIO & DETAILS */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 overflow-hidden text-white font-bold flex items-center justify-center shrink-0">
                {activeDetailsClass.teacherPhoto ? (
                  <img src={activeDetailsClass.teacherPhoto} alt={activeDetailsClass.teacherName} className="h-full w-full object-cover" />
                ) : (
                  <span>{activeDetailsClass.teacherName[0]}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{activeDetailsClass.teacherName}</p>
                <p className="text-xs text-slate-400">{activeDetailsClass.teacherBio || "Senior Faculty Member"}</p>
              </div>
            </div>

            {/* DESCRIPTION & OUTCOMES */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-1">Session Overview</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeDetailsClass.description || "Interactive live session covering core board curriculum topics, numerical solving, and doubt clearance."}
                </p>
              </div>

              {activeDetailsClass.learningOutcomes && activeDetailsClass.learningOutcomes.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-2">Learning Outcomes</h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {activeDetailsClass.learningOutcomes.map((out, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ATTACHMENTS */}
              {activeDetailsClass.attachments && activeDetailsClass.attachments.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-2">Class Attachments & Notes</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeDetailsClass.attachments.map((att, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{att.title}</p>
                            <p className="text-[10px] text-slate-400">{att.size || "PDF Document"}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => logDownload(att.title, activeDetailsClass.subject, "PDF Note", att.size || "3.5 MB", att.url)}
                          className="p-2 rounded-xl bg-blue-600 text-white font-bold text-[10px]"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DISCUSSION & REVIEWS SECTION */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="font-black text-slate-900 dark:text-white text-sm">Student Discussion & Reviews ({classComments.length})</h4>

              {feedbackSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500 text-white text-xs font-bold">
                  Thank you! Your discussion feedback has been posted.
                </div>
              )}

              <form onSubmit={handleAddComment} className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={newCommentInput}
                  onChange={(e) => setNewCommentInput(e.target.value)}
                  placeholder="Ask a question or leave feedback for instructor..."
                  className="flex-1 h-10 rounded-xl px-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                />
                <button type="submit" className="px-5 h-10 rounded-xl bg-rose-600 text-white font-bold">
                  Post
                </button>
              </form>

              <div className="space-y-3">
                {classComments.map((cm) => (
                  <div key={cm.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>{cm.name}</span>
                      <span className="text-[10px] text-slate-400">{cm.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{cm.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </SiteShell>
  );
}
