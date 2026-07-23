import { getStoredSession, type StudentSession } from "./session";
import { type Grade, type Stream, type QuizItem } from "./platform-data";
import { apiUrl } from "./api";

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
};

const DOWNLOADS_KEY = "study-material-real-downloads";
const RESULTS_KEY = "study-material-real-results";

// Auth Header helper for Admin POST requests
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("study-material-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// 1. NOTES STORE
export async function fetchBackendNotes(grade?: Grade, stream?: Stream, subject?: string): Promise<RealNoteItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    const res = await fetch(apiUrl(`/api/content/notes?${q.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load notes from backend");
    const json = await res.json();
    
    return (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      subject: item.subject,
      title: item.title,
      grade: item.grade,
      stream: item.stream,
      uploadDate: item.uploadDate || (item.createdAt ? item.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
      fileSize: item.fileSize || "2.8 MB",
      pages: item.pages || 12,
      pdfUrl: item.fileUrl || item.pdfUrl
    }));
  } catch (error) {
    console.error("fetchBackendNotes error:", error);
    return [];
  }
}

export async function createBackendNote(note: Omit<RealNoteItem, "id" | "uploadDate">): Promise<boolean> {
  try {
    const payload = {
      ...note,
      fileUrl: note.pdfUrl || "http://localhost:4000/uploads/dummy.pdf"
    };
    const res = await fetch(apiUrl("/api/content/notes"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("createBackendNote failed:", res.status, err);
    }
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

// 2. PAPERS STORE
export async function fetchBackendPapers(grade?: Grade, stream?: Stream, subject?: string): Promise<RealPaperItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    const res = await fetch(apiUrl(`/api/content/papers?${q.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load papers from backend");
    const json = await res.json();
    
    return (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      subject: item.subject,
      title: item.title,
      year: item.year || "2025",
      term: item.term || "Board Exam",
      grade: item.grade,
      stream: item.stream,
      fileSize: item.fileSize || "3.1 MB",
      fileUrl: item.fileUrl
    }));
  } catch (error) {
    console.error("fetchBackendPapers error:", error);
    return [];
  }
}

export async function createBackendPaper(paper: Omit<RealPaperItem, "id">): Promise<boolean> {
  try {
    const payload = {
      ...paper,
      fileUrl: paper.fileUrl || "http://localhost:4000/uploads/dummy.pdf"
    };
    const res = await fetch(apiUrl("/api/content/papers"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("createBackendPaper failed:", res.status, err);
    }
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

// 3. VIDEOS STORE
export async function fetchBackendVideos(grade?: Grade, stream?: Stream, subject?: string): Promise<RealVideoItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    const res = await fetch(apiUrl(`/api/content/videos?${q.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load videos from backend");
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
      videoUrl: item.videoUrl
    }));
  } catch (error) {
    console.error("fetchBackendVideos error:", error);
    return [];
  }
}

export async function createBackendVideo(video: Omit<RealVideoItem, "id">): Promise<boolean> {
  try {
    const payload = {
      ...video,
      videoUrl: video.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"
    };
    const res = await fetch(apiUrl("/api/content/videos"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("createBackendVideo failed:", res.status, err);
    }
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

// 4. QUIZZES STORE
export async function fetchBackendQuizzes(grade?: Grade, stream?: Stream, subject?: string): Promise<QuizItem[]> {
  try {
    const q = new URLSearchParams();
    if (grade) q.append("grade", grade);
    if (stream) q.append("stream", stream);
    if (subject) q.append("subject", subject);

    const res = await fetch(apiUrl(`/api/content/quizzes?${q.toString()}`), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load quizzes from backend");
    const json = await res.json();
    
    return (json.data || []).map((item: any) => {
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
  } catch (error) {
    console.error("fetchBackendQuizzes error:", error);
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("createBackendQuiz failed:", res.status, err);
    }
    return res.ok;
  } catch (error) {
    console.error("createBackendQuiz error:", error);
    return false;
  }
}

// 5. NOTICES STORE
export async function fetchBackendNotices(): Promise<RealNoticeItem[]> {
  try {
    const res = await fetch(apiUrl("/api/content/notices"), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load notices");
    const json = await res.json();
    
    return (json.data || []).map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      body: item.body,
      category: item.category,
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }));
  } catch (error) {
    console.error("fetchBackendNotices error:", error);
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

// 6. DOWNLOADS STORE (User-specific Local Storage logging)
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

// 7. RESULTS STORE (Local Storage quiz tracking)
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

// 8. BACKEND ADMIN STATS & USERS LIST
export async function fetchBackendAdminDashboard() {
  try {
    const res = await fetch(apiUrl("/api/admin/dashboard"), {
      headers: getAuthHeaders(),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to load dashboard data");
    const json = await res.json();
    
    const summary = json.summary || {};
    const statsArray = summary.stats || [];
    
    const usersCount = statsArray.find((s: any) => s.label === "Users")?.value || "0";
    const notesCount = statsArray.find((s: any) => s.label === "Notes")?.value || "0";
    const papersCount = statsArray.find((s: any) => s.label === "Papers")?.value || "0";
    const quizzesCount = statsArray.find((s: any) => s.label === "Quizzes")?.value || "0";

    const usersList: RegisteredUserItem[] = (json.users || []).map((u: any) => ({
      id: u._id || u.id,
      username: u.username || "Anonymous",
      email: u.email || "",
      role: u.role || "student",
      grade: u.grade || "11th",
      stream: u.stream || "General",
      createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"
    }));

    return {
      stats: {
        totalUsers: Number(usersCount),
        totalNotes: Number(notesCount),
        totalPapers: Number(papersCount),
        totalVideos: 0,
        totalQuizzes: Number(quizzesCount),
        totalDownloads: getDownloadedFiles().length,
        averageScore: "85%"
      },
      usersList
    };
  } catch (error) {
    console.error("fetchBackendAdminDashboard error:", error);
    return {
      stats: {
        totalUsers: 0,
        totalNotes: 0,
        totalPapers: 0,
        totalVideos: 0,
        totalQuizzes: 0,
        totalDownloads: 0,
        averageScore: "0%"
      },
      usersList: []
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
