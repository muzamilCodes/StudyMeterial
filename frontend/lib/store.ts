import { DEFAULT_STUDENT_SESSION, getStoredSession, type StudentSession } from "./session";
import {
  generateAutoQuizBank,
  type Grade,
  type Stream,
  type QuizItem
} from "./platform-data";

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

export type DownloadRecord = {
  id: string;
  title: string;
  subject: string;
  category: "PDF Note" | "Previous Paper";
  downloadedAt: string;
  fileSize: string;
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

const NOTES_KEY = "study-material-real-notes";
const PAPERS_KEY = "study-material-real-papers";
const VIDEOS_KEY = "study-material-real-videos";
const QUIZZES_KEY = "study-material-real-quizzes";
const DOWNLOADS_KEY = "study-material-real-downloads";
const RESULTS_KEY = "study-material-real-results";

// 1. NOTES STORE
export function getRealNotes(): RealNoteItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RealNoteItem[];
  } catch {
    return [];
  }
}

export function addRealNote(note: Omit<RealNoteItem, "id" | "uploadDate">): RealNoteItem[] {
  if (typeof window === "undefined") return [];
  const current = getRealNotes();
  const newNote: RealNoteItem = {
    ...note,
    id: `note-${Date.now()}`,
    uploadDate: new Date().toISOString().split("T")[0]
  };
  const updated = [newNote, ...current];
  localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  return updated;
}

// 2. PAPERS STORE
export function getRealPapers(): RealPaperItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PAPERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RealPaperItem[];
  } catch {
    return [];
  }
}

export function addRealPaper(paper: Omit<RealPaperItem, "id">): RealPaperItem[] {
  if (typeof window === "undefined") return [];
  const current = getRealPapers();
  const newPaper: RealPaperItem = {
    ...paper,
    id: `paper-${Date.now()}`
  };
  const updated = [newPaper, ...current];
  localStorage.setItem(PAPERS_KEY, JSON.stringify(updated));
  return updated;
}

// 3. VIDEOS STORE
export function getRealVideos(): RealVideoItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(VIDEOS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RealVideoItem[];
  } catch {
    return [];
  }
}

export function addRealVideo(video: Omit<RealVideoItem, "id">): RealVideoItem[] {
  if (typeof window === "undefined") return [];
  const current = getRealVideos();
  const newVid: RealVideoItem = {
    ...video,
    id: `vid-${Date.now()}`
  };
  const updated = [newVid, ...current];
  localStorage.setItem(VIDEOS_KEY, JSON.stringify(updated));
  return updated;
}

// 4. QUIZZES STORE (AUTO-GENERATED + ADMIN CREATED)
export function getRealQuizzes(): QuizItem[] {
  const autoBank = generateAutoQuizBank();
  if (typeof window === "undefined") return autoBank;
  const raw = localStorage.getItem(QUIZZES_KEY);
  if (!raw) return autoBank;
  try {
    const custom = JSON.parse(raw) as QuizItem[];
    return [...custom, ...autoBank];
  } catch {
    return autoBank;
  }
}

export function addRealQuiz(quiz: Omit<QuizItem, "id">): QuizItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(QUIZZES_KEY);
  const currentCustom: QuizItem[] = raw ? JSON.parse(raw) : [];
  const newQuiz: QuizItem = {
    ...quiz,
    id: `quiz-custom-${Date.now()}`
  };
  const updatedCustom = [newQuiz, ...currentCustom];
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(updatedCustom));
  return [...updatedCustom, ...generateAutoQuizBank()];
}

// 5. DOWNLOADS STORE
export function getDownloadedFiles(): DownloadRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DOWNLOADS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DownloadRecord[];
  } catch {
    return [];
  }
}

export function logDownload(title: string, subject: string, category: "PDF Note" | "Previous Paper", fileSize: string): DownloadRecord[] {
  if (typeof window === "undefined") return [];
  const current = getDownloadedFiles();
  const newRecord: DownloadRecord = {
    id: `dl-${Date.now()}`,
    title,
    subject,
    category,
    downloadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    fileSize
  };
  const updated = [newRecord, ...current];
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  return updated;
}

// 6. RESULTS STORE
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

// 7. REAL STATS CALCULATOR FOR ADMIN & STUDENT DASHBOARDS
export function getRealAdminStats() {
  const notes = getRealNotes();
  const papers = getRealPapers();
  const videos = getRealVideos();
  const quizzes = getRealQuizzes();
  const downloads = getDownloadedFiles();
  const results = getQuizResults();

  // Calculate real average score
  let avgScore = "0%";
  if (results.length > 0) {
    const totalAccuracySum = results.reduce((acc, r) => acc + r.accuracy, 0);
    avgScore = `${Math.round(totalAccuracySum / results.length)}%`;
  }

  return {
    totalUsers: 1, // Current active logged in student/admin
    totalNotes: notes.length,
    totalPapers: papers.length,
    totalVideos: videos.length,
    totalQuizzes: quizzes.length,
    totalDownloads: downloads.length,
    averageScore: avgScore
  };
}
