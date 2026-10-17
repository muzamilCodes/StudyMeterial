import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How StudyMaterial collects, stores, and protects your personal data — account info, study activity, uploads, and your rights including account deletion.",
  alternates: { canonical: "/privacy-policy" },
};

const sections = [
  {
    heading: "1. What we collect",
    body: "When you register, we collect your name, email address, password (stored only as a bcrypt hash — never in plain text), grade, and stream. As you study, we record quiz results, downloaded-file history, and newsletter subscriptions you explicitly submit.",
  },
  {
    heading: "2. How we store it",
    body: "Your account and study content are stored in our MongoDB database on our servers. Files uploaded by teachers and admins (notes, papers, recordings) are stored in our own uploads directory. We do not currently use third-party advertising or analytics trackers; if that changes, this policy will be updated.",
  },
  {
    heading: "3. Local storage on your device",
    body: "Your browser's localStorage keeps your session token (JWT), theme preference, download history, and quiz attempts so the app works smoothly between visits. Clearing browser storage removes this data from your device.",
  },
  {
    heading: "4. Cookies and consent",
    body: "We do not set tracking cookies. A consent banner informs you about the local storage described above; you can dismiss or accept it, and the choice is remembered on your device.",
  },
  {
    heading: "5. Who can see your data",
    body: "Teachers and admins can see class-level information needed to run the platform (for example, attendance and quiz participation for their classes). Your email and password hash are visible only to our authentication system.",
  },
  {
    heading: "6. Your rights",
    body: "You can update your profile from Settings, and you can permanently delete your account and associated personal data from the account section of the platform at any time. Deletion is carried out immediately by our backend.",
  },
  {
    heading: "7. Security",
    body: "All API access uses short-lived JWT bearer tokens, passwords are bcrypt-hashed, staff-only endpoints are role-guarded, and auth endpoints are rate-limited to slow down abuse. No system is perfectly secure — please use a strong, unique password.",
  },
  {
    heading: "8. Contact",
    body: "For privacy questions or data requests, email us at support@studymaterial.com.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-14 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Legal</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">Privacy Policy</h1>
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
          <Link href="/terms" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Read Terms &amp; Conditions</Link>
        </footer>
      </div>
    </main>
  );
}
