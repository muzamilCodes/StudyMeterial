import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      {children}
      <PublicFooter />
      <CookieConsentBanner />
    </div>
  );
}
