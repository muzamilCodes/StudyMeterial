"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Inbox, CheckCircle2, XCircle, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchInstructorApplications,
  resolveInstructorApplication,
  type InstructorApplicationSummary
} from "@/lib/store";

const FILTERS = [
  { id: "pending",  label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all",      label: "All" }
];

const statusCls: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700"
};

export function InstructorApprovalsTab() {
  const [filter, setFilter] = useState("pending");
  const [items, setItems] = useState<InstructorApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchInstructorApplications(filter);
    setItems(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusyId(id);
    setFlash(null);
    const res = await resolveInstructorApplication(id, decision, notes[id] ?? "");
    setBusyId(null);
    setFlash(res.message);
    if (res.ok) await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${filter === f.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={load} variant="outline" className="h-9 rounded-xl text-xs font-bold">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {flash && <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">{flash}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading applications...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
          <Inbox className="h-10 w-10" />
          <p className="text-sm font-bold">No {filter === "all" ? "" : filter} applications</p>
          <p className="text-xs">New instructor applications will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((app) => (
            <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">{app.fullName}</h4>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${statusCls[app.status]}`}>{app.status}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{app.email} • {app.phone}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{app.headline}</p>
                </div>
                <p className="text-[11px] text-slate-400">Submitted {new Date(app.submittedAt).toLocaleDateString()}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {app.subjects.map((s) => (
                  <span key={s} className="rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">{s}</span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Experience: {app.experience}</p>

              {app.status === "pending" ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={notes[app.id] ?? ""}
                    onChange={(e) => setNotes((p) => ({ ...p, [app.id]: e.target.value }))}
                    placeholder="Optional reviewer note (sent to the applicant by email)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => decide(app.id, "approved")} disabled={busyId === app.id}
                      className="h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700">
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve &amp; activate account
                    </Button>
                    <Button onClick={() => decide(app.id, "rejected")} disabled={busyId === app.id}
                      variant="outline" className="h-9 rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50">
                      <XCircle className="mr-1.5 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <FileText className="h-4 w-4" />
                  Reviewed {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : "—"}
                  {app.reviewNote && <span className="font-semibold">— {app.reviewNote}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
