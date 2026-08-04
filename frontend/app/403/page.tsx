import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-300">403</p>
        <h1 className="mt-4 text-4xl font-black">Access denied</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">You do not have permission to open this page.</p>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
          Back home
        </Link>
      </div>
    </main>
  );
}
