import Link from "next/link";

export default function ServerErrorRoutePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">500</p>
        <h1 className="mt-4 text-4xl font-black">Server error</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">Something went wrong on the server side.</p>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
          Back home
        </Link>
      </div>
    </main>
  );
}
