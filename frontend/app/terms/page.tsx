import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The rules for using StudyMaterial: accounts, acceptable use of study content, uploads, availability, and how to end your account.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    heading: "1. The service",
    body: "StudyMaterial provides Class 10-12 study materials: PDF notes, previous year papers, live classes, and self-assessment quizzes. The platform is run for students, teachers, and administrators of registered classes.",
  },
  {
    heading: "2. Your account",
    body: "You must register with a real email address and keep your password private. You are responsible for activity under your account. Report misuse to support@studymaterial.com.",
  },
  {
    heading: "3. Acceptable use",
    body: "Do not share your login, attempt to access other users' data, scrape content in bulk, upload unlawful or infringing material, or disrupt the service (including attacks on our API). Accounts used this way can be suspended or removed.",
  },
  {
    heading: "4. Content and ownership",
    body: "Notes, papers, and videos are uploaded by teachers and administrators of the platform for personal study use. Downloaded material may not be republished or sold. StudyMaterial does not claim ownership of school or board copyright in previous year papers.",
  },
  {
    heading: "5. No guarantee of results",
    body: "Materials are provided to support study. We do not guarantee exam scores, availability of every resource, or that content is error-free. Report wrong or broken content and we will fix it.",
  },
  {
    heading: "6. Availability and changes",
    body: "The service runs as-is and may be updated, paused, or discontinued. Features and content libraries change as teachers publish new material.",
  },
  {
    heading: "7. Ending your account",
    body: "You may delete your account at any time from the platform; deletion removes your personal data as described in the Privacy Policy.",
  },
  {
    heading: "8. These terms",
    body: "Using StudyMaterial means you accept these terms. If a part of these terms is unenforceable, the rest stays in effect.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-14 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Legal</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">Terms &amp; Conditions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: 17 October 2026</p>
        </header>
        <section className="space-y-6">
          {sections.map((s) => (
            <div key={s.heading} className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{s.heading}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{s.body}</p>
            </div>
          ))}
        </section>
        <footer className="flex items-center gap-4 text-sm font-bold">
          <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
          <Link href="/privacy-policy" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Read Privacy Policy</Link>
        </footer>
      </div>
    </main>
  );
}
