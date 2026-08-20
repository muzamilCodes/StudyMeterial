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
    <html lang="en" suppressHydrationWarning className="scroll-smooth bg-background">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground" suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="study-material-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
