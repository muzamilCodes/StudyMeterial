import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyMaterial - Premium Smart Learning Platform",
  description: "Modern, interactive educational platform providing notes, previous year papers, live classes, and quizzes for 10th, 11th, and 12th grades.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
