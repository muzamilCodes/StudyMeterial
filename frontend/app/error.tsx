"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">500</p>
        <h1 className="mt-4 text-4xl font-black">Unexpected error</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">The app hit a recoverable error boundary.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={reset} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
            Try again
          </button>
          <Link href="/" className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
