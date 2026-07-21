import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      {children}
      <PublicFooter />
    </div>
  );
}
