"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Loader2, Search } from "lucide-react";
import { fetchInstructorApplicationStatus, type InstructorApplicationSummary } from "@/lib/store";

const STATUS_META = {
  pending:  { label: "Pending Approval", icon: Clock,     cls: "border-amber-200 bg-amber-50 text-amber-700" },
  approved: { label: "Approved",         icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected",         icon: XCircle,   cls: "border-rose-200 bg-rose-50 text-rose-700" }
} as const;

export default function InstructorStatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [app, setApp] = useState<InstructorApplicationSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function check() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage("Enter a valid email address."); setApp(null); return; }
    setLoading(true); setMessage(null); setApp(null);
    const res = await fetchInstructorApplicationStatus(email.trim());
    setLoading(false);
    if (res.found && res.application) setApp(res.application);
    else setMessage(res.message ?? "No application found for this email.");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-center text-3xl font-black text-slate-900">Application Status</h1>
      <p className="mt-1 text-center text-sm text-slate-500">Enter the email you used to apply to see your instructor application status.</p>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <button onClick={check} disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Check
          </button>
        </div>

        {message && <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600">{message}</p>}

        {app && (() => {
          const meta = STATUS_META[app.status];
          const Icon = meta.icon;
          return (
            <div className={`mt-5 rounded-2xl border p-5 ${meta.cls}`}>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-black uppercase tracking-wide">{meta.label}</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{app.fullName}</p>
              <p className="text-xs opacity-80">{app.headline}</p>
              <p className="mt-3 text-xs">Submitted: {new Date(app.submittedAt).toLocaleString()}</p>
              {app.reviewedAt && <p className="text-xs">Reviewed: {new Date(app.reviewedAt).toLocaleString()}</p>}
              {app.reviewNote && <p className="mt-2 text-xs font-semibold">Reviewer note: {app.reviewNote}</p>}

              {app.status === "approved" && (
                <Link href="/teacher/login" className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                  Sign in to your instructor dashboard
                </Link>
              )}
              {app.status === "rejected" && (
                <Link href="/instructor/register" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
                  Submit a new application
                </Link>
              )}
            </div>
          );
        })()}
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Not applied yet?{" "}
        <Link href="/instructor/register" className="font-bold text-blue-600 hover:underline">Register as an instructor</Link>
      </p>
    </div>
  );
}
