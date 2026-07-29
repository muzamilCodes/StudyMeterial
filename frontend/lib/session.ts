export type StudentSession = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role: "superadmin" | "admin" | "teacher" | "student";
  isAdmin?: boolean;
  grade?: "10th" | "11th" | "12th";
  stream?: "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts";
  avatar?: string;
  bio?: string;
};

export const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
];

export function getDeletedAccountEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("study-material-deleted-emails");
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isAccountDeleted(email: string): boolean {
  if (!email) return false;
  const deleted = getDeletedAccountEmails();
  return deleted.includes(email.trim().toLowerCase());
}

export function getStoredSession(): StudentSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem("study-material-user");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StudentSession;
    if (parsed.email && isAccountDeleted(parsed.email)) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: StudentSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("study-material-user", JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("study-material-user");
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("study-material-token");
  window.sessionStorage.clear();
}

export function deleteAccountData(targetEmail?: string): void {
  if (typeof window === "undefined") return;

  let emailToDelete = targetEmail;
  if (!emailToDelete) {
    const current = getStoredSession();
    emailToDelete = current?.email;
  }

  if (emailToDelete) {
    const normalized = emailToDelete.trim().toLowerCase();
    const existingDeleted = getDeletedAccountEmails();
    if (!existingDeleted.includes(normalized)) {
      existingDeleted.push(normalized);
      window.localStorage.setItem("study-material-deleted-emails", JSON.stringify(existingDeleted));
    }
  }

  window.localStorage.removeItem("study-material-user");
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("study-material-token");
  window.sessionStorage.clear();
}
