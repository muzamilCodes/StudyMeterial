import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  // Generic auth routes duplicate the role-specific /student/login etc. pages — keep them out of the index.
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
