import { getStoredSession, type StudentSession } from "./session";
import { type Grade, type Stream, type QuizItem } from "./platform-data";
import { apiUrl } from "./api";

export type { Grade, Stream };

export type LiveClassLifecycle =
  | "Draft"
  | "Published"
  | "Upcoming"
  | "Starting Soon"
  | "Live"
  | "Completed"
  | "Recording Available"
  | "Archived";

export type EnterpriseLiveClassItem = {
  id: string;
  title: string;
  subject: string;
  category: string;
  description: string;
  teacherName: string;
  teacherPhoto?: string;
  teacherBio?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  timeZone?: string;
  meetingPlatform: "Google Meet" | "Zoom" | "Jitsi" | "LiveKit" | "Custom";
  meetingLink: string;
  meetingId?: string;
  meetingPassword?: string;
  maxStudents: number;
  enrolledStudentsCount: number;
  language: string;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  bannerUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  status: LiveClassLifecycle;
  allowRecording: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowStudentQuestions: boolean;
  attachments?: Array<{ title: string; type: string; url: string; size?: string }>;
  prerequisites?: string[];
  learningOutcomes?: string[];
  recordingUrl?: string;
  homeworkUrl?: string;
  grade: Grade;
  stream: Stream;
};

export type RealNoteItem = {
  id: string;
  subject: string;
  title: string;
  grade: Grade;
  stream: Stream;
  uploadDate: string;
  fileSize: string;
  pages: number;
  pdfUrl?: string;
  fileUrl?: string;
};

export type RealPaperItem = {
  id: string;
  subject: string;
  title: string;
  year: string;
  term: string;
  grade: Grade;
  stream: Stream;
  fileSize: string;
  fileUrl?: string;
};

export type RealVideoItem = {
  id: string;
  subject: string;
  title: string;
  instructor: string;
  duration: string;
  grade: Grade;
  stream: Stream;
  thumbnail: string;
  videoUrl?: string;
  views?: number;
};

export type RealNoticeItem = {
  id: string;
  title: string;
  body: string;
  category: string;
  date?: string;
  createdAt?: string;
};

export type DownloadRecord = {
  id: string;
  title: string;
  subject: string;
  category: "PDF Note" | "Previous Paper" | "Video Lecture";
  downloadedAt: string;
  fileSize: string;
  fileUrl?: string;
};

export type QuizResultRecord = {
  id: string;
  quizTitle: string;
  subject: string;
  grade: Grade;
  stream: Stream;
  score: number;
  totalQuestions: number;
  accuracy: number;
  completedAt: string;
};

export type RegisteredUserItem = {
  id: string;
  username: string;
  email: string;
  role: string;
  grade: Grade;
  stream: Stream;
  createdAt: string;
  joinedTs: number;
};

const DOWNLOADS_KEY = "study-material-real-downloads";
const ASSIGNMENTS_KEY = "study-material-teacher-assignments";

export type TeacherAssignmentItem = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  deadline: string;
  marks: number;
};

export function getTeacherAssignments(): TeacherAssignmentItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) || "[]"); } catch { return []; }
}

export function addTeacherAssignment(a: TeacherAssignmentItem): TeacherAssignmentItem[] {
  const list = [a, ...getTeacherAssignments()];
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
  return list;
}

export function removeTeacherAssignment(id: string): TeacherAssignmentItem[] {
  const list = getTeacherAssignments().filter(a => a.id !== id);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(list));
  return list;
}
const RESULTS_KEY = "study-material-real-results";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("study-material-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ----------------------------------------------------------------------------
// ENTERPRISE LIVE CLASSES API CLIENT
// ----------------------------------------------------------------------------

export type AttendanceRecord = {
  id: string;
  classId: string;
  studentName: string;
  email: string;
  joinTime: string;
  status: string;
};

export async function fetchBackendAttendance(): Promise<AttendanceRecord[]> {
  try {
    const res = await fetch(apiUrl("/api/content/attendance"), { headers: getAuthHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((a: any) => ({
      id: a._id || a.id,
      classId: a.classId,
      studentName: a.studentName,
      email: a.email,
      joinTime: a.joinTime,
      status: a.status
    }));
  } catch (error) {
    console.error("fetchBackendAttendance error:", error);
    return [];
  }
}

export async function fetchEnterpriseLiveClasses(params?: {  grade?: Grade;
  stream?: Stream;
  subject?: string;
  status?: string;
  category?: string;
  teacherName?: string;
  search?: string;
}): Promise<EnterpriseLiveClassItem[]> {
  try {
    const q = new URLSearchParams();
    if (params?.grade) q.append("grade", params.grade);
    if (params?.stream) q.append("stream", params.stream);
    if (params?.subject) q.append("subject", params.subject);
    if (params?.status) q.append("status", params.status);
    if (params?.category) q.append("category", params.category);
    if (params?.teacherName) q.append("teacherName", params.teacherName);
    if (params?.search) q.append("search", params.search);

    const res = await fetch(apiUrl(`/api/content/live-classes?${q.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch live classes");
    const json = await res.json();
    const dbItems: EnterpriseLiveClassItem[] = (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      subject: item.subject,
      category: item.category || "General Lecture",
      description: item.description || "",
      teacherName: item.teacherName || item.instructor || "Faculty Teacher",
      teacherPhoto: item.teacherPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      teacherBio: item.teacherBio || "",
      date: item.date || "TBD",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      duration: item.duration || "",
      timeZone: item.timeZone || "IST",
      meetingPlatform: item.meetingPlatform || "Google Meet",
      meetingLink: item.meetingLink || "",
      meetingId: item.meetingId || "",
      meetingPassword: item.meetingPassword || "",
      maxStudents: item.maxStudents || 0,
      enrolledStudentsCount: item.enrolledStudentsCount || 0,
      language: item.language || "English",
      difficultyLevel: item.difficultyLevel || "Intermediate",
      bannerUrl: item.bannerUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80",
      thumbnailUrl: item.thumbnailUrl || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
      tags: item.tags || [item.subject],
      status: item.status || "Published",
      allowRecording: item.allowRecording !== false,
      allowChat: item.allowChat !== false,
      allowScreenShare: item.allowScreenShare !== false,
      allowStudentQuestions: item.allowStudentQuestions !== false,
      attachments: item.attachments || [],
      prerequisites: item.prerequisites || [],
      learningOutcomes: item.learningOutcomes || [],
      recordingUrl: item.recordingUrl || item.videoUrl,
      homeworkUrl: item.homeworkUrl,
      grade: item.grade || "11th",
      stream: item.stream || "Medical"
    }));

    return dbItems;
  } catch {
    // Backend offline — silently return empty list
    return [];
  }
}

export async function createEnterpriseLiveClass(liveClass: Omit<EnterpriseLiveClassItem, "id" | "enrolledStudentsCount">): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/content/live-classes"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(liveClass)
    });
    return res.ok;
  } catch (error) {
    console.error("createEnterpriseLiveClass error:", error);
    return false;
  }
}

export async function updateEnterpriseLiveClass(id: string, updates: Partial<EnterpriseLiveClassItem>): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/content/live-classes/${id}`), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.ok;
  } catch (error) {
    console.error("updateEnterpriseLiveClass error:", error);
    return false;
  }
}

export async function deleteEnterpriseLiveClass(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/content/live-classes/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error("deleteEnterpriseLiveClass error:", error);
    return false;
  }
}

export async function logLiveClassAttendance(classId: string, studentName: string, email: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/content/live-classes/${classId}/attendance`), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        classId,
        studentName,
        email,
        joinTime: new Date().toLocaleTimeString(),
        status: "Present"
      })
    });
    return res.ok;
  } catch (error) {
    console.error("logLiveClassAttendance error:", error);
    return false;
  }
}

// ----------------------------------------------------------------------------
// NOTES, PAPERS, VIDEOS & QUIZZES API CLIENTS
// ----------------------------------------------------------------------------

export async function fetchBackendNotes(grade?: Grade, stream?: Stream, subject?: string): Promise<RealNoteItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    const res = await fetch(apiUrl(`/api/content/notes?${q.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load notes from backend");
    const json = await res.json();
    
    const dbNotes = (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      subject: item.subject,
      title: item.title,
      grade: item.grade,
      stream: item.stream,
      uploadDate: item.uploadDate || (item.createdAt ? item.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
      fileSize: item.fileSize || "",
      pages: item.pages || 0,
      pdfUrl: item.fileUrl || item.pdfUrl
    }));

    return dbNotes;
  } catch (error) {
    console.warn("fetchBackendNotes offline:", error);
    return [];
  }
}

export async function createBackendNote(note: Omit<RealNoteItem, "id" | "uploadDate">): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/content/notes"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...note, fileUrl: note.pdfUrl ?? note.fileUrl })
    });
    return res.ok;
  } catch (error) {
    console.error("createBackendNote error:", error);
    return false;
  }
}

export async function deleteBackendNote(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/content/notes/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error("deleteBackendNote error:", error);
    return false;
  }
}

export async function fetchBackendPapers(grade?: Grade, stream?: Stream, subject?: string): Promise<RealPaperItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    const res = await fetch(apiUrl(`/api/content/papers?${q.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load papers from backend");
    const json = await res.json();
    
    const dbPapers = (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      subject: item.subject,
      title: item.title,
      year: item.year || "2025",
      term: item.term || "Board Exam",
      grade: item.grade,
      stream: item.stream,
      fileSize: item.fileSize || "",
      fileUrl: item.fileUrl
    }));

    return dbPapers;
  } catch (error) {
    console.warn("fetchBackendPapers offline:", error);
    return [];
  }
}

export async function createBackendPaper(paper: Omit<RealPaperItem, "id">): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/content/papers"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(paper)
    });
    return res.ok;
  } catch (error) {
    console.error("createBackendPaper error:", error);
    return false;
  }
}

export async function deleteBackendPaper(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/content/papers/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error("deleteBackendPaper error:", error);
    return false;
  }
}

export async function fetchBackendVideos(grade?: Grade, stream?: Stream, subject?: string): Promise<RealVideoItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    // Send the auth token so the server can hard-scope a student to their own class.
    const res = await fetch(apiUrl(`/api/content/videos?${q.toString()}`), { cache: "no-store", headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to load videos from backend");
    const json = await res.json();

    const dbVideos = (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      subject: item.subject,
      title: item.title,
      instructor: item.instructor || "Faculty member",
      duration: item.duration || "20:00",
      grade: item.grade,
      stream: item.stream,
      thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
      videoUrl: item.videoUrl,
      views: item.views ?? 0
    }));

    return dbVideos;
  } catch (error) {
    console.error("fetchBackendVideos failed:", error);
    return [];
  }
}

/** Fetch the most-viewed videos for a class (server hard-scopes logged-in students). */
export async function fetchTrendingVideos(grade?: Grade, stream?: Stream, limit = 6): Promise<RealVideoItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    q.append("sort", "trending");
    q.append("limit", String(limit));

    const res = await fetch(apiUrl(`/api/content/videos?${q.toString()}`), { cache: "no-store", headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to load trending videos");
    const json = await res.json();
    return (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      subject: item.subject,
      title: item.title,
      instructor: item.instructor || "Faculty member",
      duration: item.duration || "20:00",
      grade: item.grade,
      stream: item.stream,
      thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
      videoUrl: item.videoUrl,
      views: item.views ?? 0
    }));
  } catch (error) {
    console.warn("fetchTrendingVideos offline:", error);
    return [];
  }
}

/** Record a view when a student opens a video (drives the trending ranking). */
export async function incrementVideoView(id: string): Promise<void> {
  try {
    await fetch(apiUrl(`/api/content/videos/${id}/view`), { method: "POST", headers: getAuthHeaders() });
  } catch (error) {
    console.warn("incrementVideoView offline:", error);
  }
}

export async function createBackendVideo(video: Omit<RealVideoItem, "id">): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/content/videos"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(video)
    });
    return res.ok;
  } catch (error) {
    console.error("createBackendVideo error:", error);
    return false;
  }
}

export async function deleteBackendVideo(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/content/videos/${id}`), {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error("deleteBackendVideo error:", error);
    return false;
  }
}

export async function fetchBackendQuizzes(grade?: Grade, stream?: Stream, subject?: string): Promise<QuizItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    const res = await fetch(apiUrl(`/api/content/quizzes?${q.toString()}`), { cache: "no-store" });
    let dbQuizzes: QuizItem[] = [];
    if (res.ok) {
      const json = await res.json();
      dbQuizzes = (json.data || []).map((item: any) => {
        const mappedQuestions = (item.questions || []).map((q: any, qIdx: number) => {
          let correctIndex = typeof q.correctIndex === "number" ? q.correctIndex : 0;
          if (typeof q.answer === "string" && Array.isArray(q.options)) {
            const idx = q.options.indexOf(q.answer);
            if (idx !== -1) {
              correctIndex = idx;
            }
          }
          return {
            id: qIdx + 1,
            question: q.question,
            options: q.options || [],
            correctIndex: correctIndex,
            explanation: q.explanation || `The correct option is option ${correctIndex + 1}.`
          };
        });

        return {
          id: item._id || item.id,
          subject: item.subject,
          topic: item.topic || item.title || "Subject Test",
          title: item.title,
          grade: item.grade,
          stream: item.stream,
          durationMinutes: item.durationMinutes || 15,
          questions: mappedQuestions,
          totalQuestions: mappedQuestions.length
        };
      });
    }

    // Only return genuine, backend-stored quizzes (teacher/admin created).
    // No auto-generated placeholder bank is injected.
    return dbQuizzes;
  } catch (error) {
    console.warn("fetchBackendQuizzes offline:", error);
    return [];
  }
}

export async function createBackendQuiz(quiz: {
  subject: string;
  topic?: string;
  title: string;
  grade: Grade;
  stream: Stream;
  durationMinutes: number;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
}): Promise<boolean> {
  try {
    const backendQuestions = quiz.questions.map((q) => ({
      question: q.question,
      options: q.options,
      answer: q.options[q.correctIndex] || q.options[0]
    }));

    const payload = {
      subject: quiz.subject,
      topic: quiz.topic || quiz.title,
      title: quiz.title,
      grade: quiz.grade,
      stream: quiz.stream,
      durationMinutes: quiz.durationMinutes,
      questions: backendQuestions
    };

    const res = await fetch(apiUrl("/api/content/quizzes"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (error) {
    console.error("createBackendQuiz error:", error);
    return false;
  }
}

export async function fetchBackendNotices(): Promise<RealNoticeItem[]> {
  try {
    const res = await fetch(apiUrl("/api/content/notices"), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load notices");
    const json = await res.json();
    
    const dbNotices = (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      body: item.body || item.content || "",
      category: item.category || item.tag || "Announcements",
      date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString())
    }));

    return dbNotices;
  } catch {
    // Backend offline — silently return empty list
    return [];
  }
}

export async function createBackendNotice(notice: { title: string; body: string; category: string }): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/content/notices"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(notice)
    });
    return res.ok;
  } catch (error) {
    console.error("createBackendNotice error:", error);
    return false;
  }
}

function getDownloadsKey(): string {
  const session = getStoredSession();
  const userId = session?.id || "guest";
  return `${DOWNLOADS_KEY}-${userId}`;
}

export function getDownloadedFiles(): DownloadRecord[] {
  if (typeof window === "undefined") return [];
  const key = getDownloadsKey();
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DownloadRecord[];
  } catch {
    return [];
  }
}

export function logDownload(title: string, subject: string, category: "PDF Note" | "Previous Paper" | "Video Lecture", fileSize: string, fileUrl?: string): DownloadRecord[] {
  if (typeof window === "undefined") return [];
  const current = getDownloadedFiles();
  const newRecord: DownloadRecord = {
    id: `dl-${Date.now()}`,
    title,
    subject,
    category,
    downloadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    fileSize,
    fileUrl
  };
  const updated = [newRecord, ...current];
  const key = getDownloadsKey();
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteDownloadRecord(id: string): DownloadRecord[] {
  if (typeof window === "undefined") return [];
  const current = getDownloadedFiles();
  const updated = current.filter(item => item.id !== id);
  const key = getDownloadsKey();
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function getQuizResults(): QuizResultRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RESULTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QuizResultRecord[];
  } catch {
    return [];
  }
}

export function recordQuizResult(result: Omit<QuizResultRecord, "id" | "completedAt">): QuizResultRecord[] {
  if (typeof window === "undefined") return [];
  const current = getQuizResults();
  const newRecord: QuizResultRecord = {
    ...result,
    id: `res-${Date.now()}`,
    completedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
  };
  const updated = [newRecord, ...current];
  localStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
  return updated;
}

export async function publishEnterpriseLiveClass(id: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/content/live-classes/${id}/publish`), {
      method: "POST",
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error("publishEnterpriseLiveClass error:", error);
    return false;
  }
}

export async function fetchBackendAdminDashboard() {
  try {
    const res = await fetch(apiUrl("/api/admin/dashboard"), {
      headers: getAuthHeaders(),
      cache: "no-store"
    });

    if (res.ok) {
      const json = await res.json();
      const summary = json.summary || {};
      const statsArray = summary.stats || [];
      
      const usersCount = statsArray.find((s: any) => s.label === "Users")?.value || 0;
      const studentsCount = statsArray.find((s: any) => s.label === "Students")?.value || 0;
      const teachersCount = statsArray.find((s: any) => s.label === "Teachers")?.value || 0;
      const adminsCount = statsArray.find((s: any) => s.label === "Admins")?.value || 0;
      const notesCount = statsArray.find((s: any) => s.label === "Notes")?.value || 0;
      const papersCount = statsArray.find((s: any) => s.label === "Papers")?.value || 0;
      const videosCount = statsArray.find((s: any) => s.label === "Videos")?.value || 0;
      const quizzesCount = statsArray.find((s: any) => s.label === "Quizzes")?.value || 0;
      const liveClassesCount = statsArray.find((s: any) => s.label === "Live Classes")?.value || 0;
      const noticesCount = statsArray.find((s: any) => s.label === "Notices")?.value || 0;

      const usersList: RegisteredUserItem[] = (json.users || []).map((u: any) => ({
        id: u._id || u.id,
        username: u.username || "—",
        email: u.email || "—",
        role: u.role || "student",
        grade: u.grade || "11th",
        stream: u.stream || "Medical",
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—",
        joinedTs: u.createdAt ? new Date(u.createdAt).getTime() : 0
      }));

      return {
        stats: {
          totalUsers: Number(usersCount),
          totalStudents: Number(studentsCount),
          totalTeachers: Number(teachersCount),
          totalAdmins: Number(adminsCount),
          totalNotes: Number(notesCount),
          totalPapers: Number(papersCount),
          totalVideos: Number(videosCount),
          totalLiveClasses: Number(liveClassesCount),
          totalQuizzes: Number(quizzesCount),
          totalNotices: Number(noticesCount),
          totalDownloads: getDownloadedFiles().length
        },
        usersList,
        distributions: summary.distributions || { medical: 0, nonMedical: 0, commerce: 0, arts: 0, general: 0 }
      };
    }

    // Backend unreachable or admin auth missing: return honest zeros instead of fabricated numbers
    return {
      stats: {
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
        totalDownloads: getDownloadedFiles().length
      },
      usersList: [],
      distributions: { medical: 0, nonMedical: 0, commerce: 0, arts: 0, general: 0 }
    };
  } catch (error) {
    return {
      stats: {
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
      },
      usersList: [],
      distributions: { medical: 0, nonMedical: 0, commerce: 0, arts: 0, general: 0 }
    };
  }
}

export async function uploadBackendFile(file: File): Promise<{ url: string; fileSize: string } | null> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("study-material-token") : null;
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(apiUrl("/api/content/upload"), {
      method: "POST",
      headers,
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status: ${res.status}`);
    }

    const data = await res.json();
    return {
      url: data.url,
      fileSize: data.fileSize
    };
  } catch (error) {
    console.error("uploadBackendFile error:", error);
    return null;
  }
}

// ----------------------------------------------------------------------------
// INSTRUCTOR APPLICATIONS (multi-step registration + admin approval)
// ----------------------------------------------------------------------------

export const SUBJECT_EXPERTISE_OPTIONS = [
  "Web Development", "Data Science", "Artificial Intelligence", "Machine Learning",
  "Cyber Security", "Java", "Python", "DSA", "DBMS",
  "Mathematics", "Physics", "Chemistry", "English", "Other"
];

export const TEACHING_EXPERIENCE_OPTIONS = ["Fresher", "Less than 1 year", "1-3 years", "3-5 years", "5+ years"];

export const CURRENT_OCCUPATION_OPTIONS = [
  "Student", "Teacher / Lecturer", "Software Developer", "Working Professional",
  "Freelancer", "Self-Employed", "Other"
];

export const HIGHEST_QUALIFICATION_OPTIONS = [
  "High School", "Higher Secondary (12th)", "Diploma",
  "Bachelor's (BA/BSc/BCA/BTech/BCom)", "Master's (MA/MSc/MCA/MTech/MBA)", "PhD", "Other"
];

export const COUNTRY_OPTIONS = [
  "India", "Pakistan", "Bangladesh", "Nepal", "Sri Lanka", "United States",
  "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Saudi Arabia", "Other"
];

export const STATE_OPTIONS = [
  "Jammu & Kashmir", "Delhi", "Uttar Pradesh", "Bihar", "Rajasthan", "Gujarat",
  "Maharashtra", "Madhya Pradesh", "West Bengal", "Punjab", "Haryana", "Kerala",
  "Karnataka", "Tamil Nadu", "Telangana", "Andhra Pradesh", "Odisha", "Assam",
  "Other"
];

export function passingYearOptions() {
  const current = new Date().getFullYear();
  const years: string[] = [];
  for (let y = current; y >= current - 40; y--) years.push(String(y));
  return years;
}

export type InstructorApplicationForm = {
  password: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    addressLine: string;
    messageToAdmin: string;
  };
  professional: {
    headline: string;
    bio: string;
    subjectExpertise: string[];
    teachingExperience: string;
    currentOccupation: string;
  };
  education: {
    highestQualification: string;
    degreeName: string;
    specialization?: string;
    collegeUniversity: string;
    passingYear: string;
  };
};

export type InstructorApplicationFiles = {
  profilePhoto?:        File;
  resume:               File;
  teachingCertificate?: File;
  introVideo?:          File;
  certificates?:        File[];
};

export type InstructorFileRef = { name: string; url: string; size: string; mimeType?: string } | null;

export type InstructorApplicationSummary = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  addressLine: string;
  message: string;
  profilePhotoUrl: string | null;
  headline: string;
  bio: string;
  subjects: string[];
  experience: string;
  occupation: string;
  education: {
    qualification: string;
    degree: string;
    specialization: string;
    college: string;
    passingYear: string;
    certificates: Array<{ name: string; url: string; size: string }>;
  };
  documents: {
    resume: InstructorFileRef;
    teachingCertificate: InstructorFileRef;
    introVideo?: InstructorFileRef;
  };
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export async function submitInstructorApplication(
  form: InstructorApplicationForm,
  files: InstructorApplicationFiles
): Promise<{ ok: boolean; message: string }> {
  const fd = new FormData();
  fd.append("application", JSON.stringify(form));
  if (files.profilePhoto) fd.append("profilePhoto", files.profilePhoto);
  fd.append("resume", files.resume);
  if (files.teachingCertificate) fd.append("teachingCertificate", files.teachingCertificate);
  if (files.introVideo) fd.append("introVideo", files.introVideo);
  (files.certificates ?? []).forEach((f) => fd.append("certificates", f));

  try {
    const res = await fetch(apiUrl("/api/instructors/applications"), { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data?.message ?? (res.ok ? "Application submitted" : "Submission failed") };
  } catch {
    return { ok: false, message: "Network error while submitting your application. Please try again." };
  }
}

export async function fetchInstructorApplicationStatus(
  email: string
): Promise<{ found: boolean; application?: InstructorApplicationSummary; message?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/instructors/applications/status?email=${encodeURIComponent(email)}`));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { found: false, message: data?.message ?? "No application found." };
    return { found: true, application: data.application as InstructorApplicationSummary };
  } catch {
    return { found: false, message: "Network error while checking your application status." };
  }
}

export async function fetchInstructorApplications(status = "all"): Promise<InstructorApplicationSummary[]> {
  try {
    const res = await fetch(apiUrl(`/api/instructors/applications?status=${encodeURIComponent(status)}`), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []) as InstructorApplicationSummary[];
  } catch {
    return [];
  }
}

export async function resolveInstructorApplication(
  id: string,
  decision: "approved" | "rejected",
  note: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(apiUrl(`/api/instructors/applications/${id}/decision`), {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ decision, note: note || undefined })
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data?.message ?? (res.ok ? "Decision saved" : "Action failed") };
  } catch {
    return { ok: false, message: "Network error while saving the decision." };
  }
}


// ----------------------------------------------------------------------------
// COURSES API CLIENT (instructor courses, enrollment, progress, reviews)
// ----------------------------------------------------------------------------

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseGrade = "10th" | "11th" | "12th" | "All";
export type CourseStream = "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts" | "All";

export type CourseLessonInput = {
  title: string;
  description: string;
  videoUrl: string;
  videoSource: "upload" | "url";
  duration: string;
  allowDownload: boolean;
  freePreview: boolean;
  order: number;
  resources?: Array<{ name: string; url: string }>;
  existingLessonId?: string;
};

export type CourseModuleInput = { title: string; lessons: CourseLessonInput[] };

export type CourseStatus = "Draft" | "Pending Approval" | "Published";

export type CoursePayload = {
  title: string;
  thumbnail: string;
  description: string;
  category: string;
  grade: CourseGrade;
  stream: CourseStream;
  level: CourseLevel;
  language: string;
  price: number;
  outcomes: string[];
  requirements: string[];
  modules: CourseModuleInput[];
  status: CourseStatus;
};

export type CourseCard = {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  instructorBio: string;
  title: string;
  thumbnail: string;
  description: string;
  category: string;
  grade: CourseGrade;
  stream: CourseStream;
  level: CourseLevel;
  language: string;
  price: number;
  outcomes: string[];
  requirements: string[];
  status: CourseStatus;
  ratingAvg: number;
  ratingCount: number;
  moduleCount: number;
  lessonCount: number;
  enrolledCount: number;
  createdAt: string;
};

export type CourseLessonView = {
  id: string;
  title: string;
  description: string;
  duration: string;
  freePreview: boolean;
  allowDownload: boolean;
  videoUrl: string;
  locked: boolean;
  resources: Array<{ name: string; url: string }>;
  views: number;
  shares: number;
  likeCount: number;
  likedByViewer: boolean;
  comments: LessonCommentItem[];
};

export type LessonCommentItem = { id: string; name: string; text: string; createdAt: string };
export type LessonAnalyticsRow = { lessonId: string; moduleTitle: string; title: string; views: number; likes: number; shares: number; comments: number };

export type CourseModuleView = { id: string; title: string; lessons: CourseLessonView[] };

export type CourseDetail = CourseCard & {
  isOwner: boolean;
  viewer: { enrolled: boolean; completedLessons: string[]; progressPct: number };
  modules: CourseModuleView[];
};

export type CourseReviewItem = { id: string; studentName: string; rating: number; comment: string; createdAt: string; courseTitle?: string };
export type CourseEnrollmentRow = { id: string; courseTitle: string; courseId: string; studentName: string; email: string; completed: number; totalLessons: number; progressPct: number; enrolledAt: string };
export type InstructorCourseStats = { courses: number; published: number; drafts: number; videoLessons: number; students: number; earnings: number; ratings: number };

export async function fetchCourses(params?: { mine?: boolean; all?: boolean; category?: string; level?: string; search?: string }): Promise<CourseCard[]> {
  try {
    const q = new URLSearchParams();
    if (params?.mine) q.append("mine", "1");
    if (params?.all) q.append("all", "1");
    if (params?.category) q.append("category", params.category);
    if (params?.level) q.append("level", params.level);
    if (params?.search) q.append("search", params.search);
    const res = await fetch(apiUrl(`/api/courses?${q.toString()}`), { headers: getAuthHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export type HomepageLessonVideo = {
  lessonId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  freePreview: boolean;
  duration: string;
  views: number;
  likeCount: number;
  instructorName: string;
  category: string;
  level: string;
  grade: string;
  stream: string;
};

export async function fetchHomepageLessonVideos(): Promise<HomepageLessonVideo[]> {
  try {
    const res = await fetch(apiUrl("/api/courses/lessons/feed"), { cache: "no-store", headers: getAuthHeaders() });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export async function fetchCourseDetail(id: string): Promise<{ detail?: CourseDetail; message?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/courses/${id}`), { headers: getAuthHeaders(), cache: "no-store" });
    const json = await res.json();
    if (!res.ok) return { message: json.message || "Failed to load course." };
    return { detail: json.data };
  } catch {
    return { message: "Network error while loading the course." };
  }
}

async function courseJsonRequest(url: string, init: RequestInit): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(apiUrl(url), { ...init, headers: { ...getAuthHeaders(), ...(init.headers || {}) } });
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("study-material-token");
        localStorage.removeItem("study-material-user");
      }
      return { ok: false, message: "Your session has expired. Please log in again." };
    }
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, message: json.message };
  } catch {
    return { ok: false, message: "Network error." };
  }
}

export async function createBackendCourse(payload: CoursePayload): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest("/api/courses", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateBackendCourse(id: string, payload: CoursePayload): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function setBackendCourseStatus(id: string, status: CourseStatus): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
}

export type StudentEnrollmentItem = {
  id: string;
  courseId: string;
  courseTitle: string;
  thumbnail: string;
  instructorName: string;
  category: string;
  grade: string;
  stream: string;
  courseStatus: string;
  completedLessons: number;
  totalLessons: number;
  progressPct: number;
  lastWatchedLesson: string;
  lastWatchedTitle: string;
  resumeLessonId: string;
  enrolledAt: string;
};

export async function fetchMyEnrollments(): Promise<StudentEnrollmentItem[]> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("study-material-token") : null;
    if (!token) return [];
    const res = await fetch(apiUrl("/api/courses/my-enrollments"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export async function deleteBackendCourse(id: string): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/${id}`, { method: "DELETE" });
}

export async function enrollInCourse(id: string): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/${id}/enroll`, { method: "POST" });
}

export async function setLessonComplete(courseId: string, lessonId: string, completed: boolean): Promise<{ ok: boolean; progressPct?: number; completedLessons?: string[]; message?: string }> {
  try {
    const res = await fetch(apiUrl(`/api/courses/${courseId}/lessons/${lessonId}/complete`), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: json.message };
    return { ok: true, progressPct: json.data.progressPct, completedLessons: json.data.completedLessons };
  } catch {
    return { ok: false, message: "Network error." };
  }
}

export async function fetchCourseReviews(courseId: string): Promise<CourseReviewItem[]> {
  try {
    const res = await fetch(apiUrl(`/api/courses/${courseId}/reviews`), { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export async function addCourseReview(courseId: string, rating: number, comment: string): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/${courseId}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) });
}

export async function recordLessonView(courseId: string, lessonId: string): Promise<{ ok: boolean; views?: number }> {
  const res = await courseJsonRequest(`/api/courses/${courseId}/lessons/${lessonId}/view`, { method: "POST" });
  return { ok: res.ok };
}

export async function recordLessonShare(courseId: string, lessonId: string): Promise<{ ok: boolean; shares?: number }> {
  const res = await courseJsonRequest(`/api/courses/${courseId}/lessons/${lessonId}/share`, { method: "POST" });
  return { ok: res.ok };
}

export async function setLessonLike(courseId: string, lessonId: string, liked: boolean): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/${courseId}/lessons/${lessonId}/like`, { method: "POST", body: JSON.stringify({ liked }) });
}

export async function addLessonComment(courseId: string, lessonId: string, text: string): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/${courseId}/lessons/${lessonId}/comments`, { method: "POST", body: JSON.stringify({ text }) });
}

export async function fetchLessonAnalytics(courseId: string): Promise<LessonAnalyticsRow[]> {
  try {
    const res = await fetch(apiUrl(`/api/courses/${courseId}/analytics`), { headers: getAuthHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export async function fetchInstructorCourseStats(): Promise<InstructorCourseStats | null> {
  try {
    const res = await fetch(apiUrl("/api/courses/instructor/stats"), { headers: getAuthHeaders(), cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

export async function fetchInstructorEnrollments(): Promise<CourseEnrollmentRow[]> {
  try {
    const res = await fetch(apiUrl("/api/courses/instructor/enrollments"), { headers: getAuthHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export async function fetchInstructorCourseReviews(): Promise<CourseReviewItem[]> {
  try {
    const res = await fetch(apiUrl("/api/courses/instructor/reviews"), { headers: getAuthHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export const COURSE_CATEGORY_OPTIONS = [
  "Physics", "Chemistry", "Biology", "Mathematics", "English",
  "History", "Geography", "Economics", "Commerce", "Computer Science", "Other"
];

export const COURSE_LANGUAGE_OPTIONS = ["English", "Hindi", "Urdu", "Hinglish", "English & Hindi"];

// ─── Assignments (DB-backed) ─────────────────────────────────────────────────

export type AssignmentItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: Grade;
  stream: Stream;
  deadline: string;
  marks: number;
  instructorName: string;
  createdAt: string;
};

export async function fetchBackendAssignments(params?: { mine?: boolean; grade?: Grade; stream?: Stream }): Promise<AssignmentItem[]> {
  try {
    const q = new URLSearchParams();
    if (params?.mine) q.append("mine", "1");
    if (params?.grade) q.append("grade", params.grade);
    if (params?.stream) q.append("stream", params.stream);
    const res = await fetch(apiUrl(`/api/courses/assignments?${q.toString()}`), { headers: getAuthHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export async function createBackendAssignment(input: {
  title: string; description: string; subject: string; grade: Grade; stream: Stream; deadline: string; marks: number;
}): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest("/api/courses/assignments", { method: "POST", body: JSON.stringify(input) });
}

export async function deleteBackendAssignment(id: string): Promise<{ ok: boolean; message?: string }> {
  return courseJsonRequest(`/api/courses/assignments/${id}`, { method: "DELETE" });
}
