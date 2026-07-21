import { SiteShell } from "@/components/site-shell";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      title="Admin Dashboard"
      description="Manage users, subjects, notes, previous papers, videos, quizzes, results, notices, uploads, reports and settings."
    >
      {children}
    </SiteShell>
  );
}
