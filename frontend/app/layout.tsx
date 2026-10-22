import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100"),
  title: {
    default: "StudyMaterial – Notes, Papers, Live Classes & MCQ Quizzes",
    template: "%s | StudyMaterial",
  },
  description: "Modern, interactive educational platform providing notes, previous year papers, live classes, and quizzes for 10th, 11th, and 12th grades.",
  keywords: [
    "class 10 notes",
    "class 11 notes",
    "class 12 notes",
    "previous year papers",
    "MCQ quizzes",
    "live classes",
    "study material PDF",
  ],
  openGraph: {
    siteName: "StudyMaterial",
    type: "website",
    title: "StudyMaterial – Notes, Papers, Live Classes & MCQ Quizzes",
    description: "Free PDF notes, previous year board papers, live classes and quizzes for Class 10, 11 and 12.",
    images: [{ url: "/og-image.png", width: 1536, height: 1024, alt: "StudyMaterial – study notes, papers and quizzes platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyMaterial – Notes, Papers, Live Classes & MCQ Quizzes",
    description: "Free PDF notes, previous year board papers, live classes and quizzes for Class 10, 11 and 12.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white" suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="study-material-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
