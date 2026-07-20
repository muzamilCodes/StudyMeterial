export type StudentSession = {
  id: string;
  email: string;
  username?: string;
  role: "student" | "admin";
  isAdmin?: boolean;
  grade?: "10th" | "11th" | "12th";
  stream?: "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts";
};

export function getStoredSession(): StudentSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem("study-material-user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StudentSession;
  } catch {
    return null;
  }
}
