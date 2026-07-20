import { SiteShell } from "@/components/site-shell";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell
      title="Student Dashboard"
      description="Welcome Student. Search your notes, access subjects, quizzes, results, downloads, notices, bookmarks, and progress."
    >
      {children}
    </SiteShell>
  );
}
