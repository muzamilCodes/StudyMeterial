import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">404</p>
        <h1 className="mt-4 text-4xl font-black">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">The page you are looking for does not exist.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
            Back home
          </Link>
          <Link href="/roadmap" className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white">
            Study Roadmap
          </Link>
          <Link href="/student" className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white">
            Student Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
