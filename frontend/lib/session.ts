export type StudentSession = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role: "student" | "admin";
  isAdmin?: boolean;
  grade?: "10th" | "11th" | "12th";
  stream?: "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts";
  avatar?: string;
  bio?: string;
};

export const DEFAULT_STUDENT_SESSION: StudentSession = {
  id: "student-101",
  name: "Muzamil Ahmad",
  email: "student@studymaterial.edu",
  role: "student",
  grade: "11th",
  stream: "Medical",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  bio: "Medical Stream Aspirant | Class 11th"
};

export function getStoredSession(): StudentSession {
  if (typeof window === "undefined") return DEFAULT_STUDENT_SESSION;

  const raw = window.localStorage.getItem("study-material-user");
  if (!raw) return DEFAULT_STUDENT_SESSION;

  try {
    const parsed = JSON.parse(raw) as StudentSession;
    return { ...DEFAULT_STUDENT_SESSION, ...parsed };
  } catch {
    return DEFAULT_STUDENT_SESSION;
  }
}

export function saveSession(session: StudentSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("study-material-user", JSON.stringify(session));
}
