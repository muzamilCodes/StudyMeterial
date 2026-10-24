"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2, Inbox, CheckCircle2, XCircle, FileText, FileBadge,
  RefreshCw, ChevronDown, ChevronUp, ExternalLink, Layers, BookOpen,
  Video, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchInstructorApplications,
  resolveInstructorApplication,
  fetchTeachingPermissionRequests,
  resolveTeachingPermissionRequest,
  type InstructorApplicationSummary,
  type InstructorFileRef
} from "@/lib/store";

const FILTERS = [
  { id: "pending",  label: "Pending Review" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all",      label: "All Applications" }
];

const statusCls: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
};

export function InstructorApprovalsTab() {
  const [activeSection, setActiveSection] = useState<"registrations" | "permission_requests">("registrations");
  const [filter, setFilter] = useState("pending");
  const [items, setItems] = useState<InstructorApplicationSummary[]>([]);
  const [permRequests, setPermRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    if (activeSection === "registrations") {
      const data = await fetchInstructorApplications(filter);
      setItems(data);
    } else {
      const data = await fetchTeachingPermissionRequests(filter);
      setPermRequests(data);
    }
    setLoading(false);
  }, [activeSection, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusyId(id);
    setFlash(null);
    const res = await resolveInstructorApplication(id, decision, notes[id] ?? "");
    setBusyId(null);
    setFlash(res.message);
    if (res.ok) await load();
  }

  async function decidePermission(id: string, decision: "approved" | "rejected") {
    setBusyId(id);
    setFlash(null);
    const res = await resolveTeachingPermissionRequest(id, decision, notes[id] ?? "");
    setBusyId(null);
    setFlash(res.message);
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      {/* SECTION SELECTOR & FILTERS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveSection("registrations"); setFilter("pending"); }}
            className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
              activeSection === "registrations"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            New Instructor Registrations
          </button>
          <button
            onClick={() => { setActiveSection("permission_requests"); setFilter("pending"); }}
            className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
              activeSection === "permission_requests"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Category Expansion Requests
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  filter === f.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button onClick={load} variant="outline" className="h-9 rounded-xl text-xs font-bold">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {flash && (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          {flash}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading data...
        </div>
      ) : activeSection === "registrations" ? (
        items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <Inbox className="h-10 w-10" />
            <p className="text-sm font-bold">No {filter === "all" ? "" : filter} applications</p>
            <p className="text-xs">New instructor registration applications will appear here for review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((app) => {
              const isOpen = !!expanded[app.id];
              const certs = app.education?.certificates ?? [];
              const selectedClasses = app.selectedClasses?.length ? app.selectedClasses : [];
              const selectedSubjects = app.selectedSubjects?.length ? app.selectedSubjects : app.subjects;

              return (
                <div key={app.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {app.profilePhotoUrl ? (
                        <img
                          src={app.profilePhotoUrl}
                          alt={app.fullName}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-base font-black text-blue-600 dark:text-blue-300 shadow-2xs">
                          {app.fullName[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900 dark:text-white">{app.fullName}</h4>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusCls[app.status]}`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {app.email} • {app.phone} • {app.state}, {app.country}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300">{app.headline}</p>
                        {app.preferredLanguage && (
                          <span className="inline-block mt-1 text-[11px] font-semibold text-slate-400">
                            Teaching Language: <span className="text-blue-600 font-bold">{app.preferredLanguage}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Submitted {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* CLASSES & SUBJECTS DISPLAY */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                        <Layers className="h-3.5 w-3.5 text-blue-500" />
                        Selected Classes to Teach ({selectedClasses.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedClasses.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">None specified</span>
                        ) : (
                          selectedClasses.map((cls) => (
                            <span key={cls} className="rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                              {cls}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                        Selected Subjects ({selectedSubjects.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSubjects.map((s) => (
                          <span key={s} className="rounded-lg bg-slate-200/70 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* DYNAMIC TEACHING CATEGORIES PREVIEW */}
                    {selectedClasses.length > 0 && selectedSubjects.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                          Generated Teaching Categories (Ready to Author Upon Approval)
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {selectedClasses.flatMap((cls) =>
                            selectedSubjects.map((sbj) => (
                              <span key={`${cls}-${sbj}`} className="rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                {cls} → {sbj}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOGGLE EXPAND DETAILS */}
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [app.id]: !p[app.id] }))}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {isOpen ? "Hide full credentials & media" : "View full bio, resume, videos & degrees"}
                  </button>

                  {isOpen && (
                    <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                      <Field label="Professional Bio" value={app.bio} />
                      {app.message && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Message to Admin</p>
                          <p className="mt-1 whitespace-pre-wrap rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
                            {app.message}
                          </p>
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Teaching Experience" value={app.experience} />
                        <Field label="Current Occupation" value={app.occupation} />
                        <Field label="Highest Qualification" value={app.education.qualification} />
                        <Field label="Degree & Specialization" value={`${app.education.degree}${app.education.specialization ? ` (${app.education.specialization})` : ""}`} />
                        <Field label="College / University" value={app.education.college} />
                        <Field label="Passing Year" value={app.education.passingYear} />
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Uploaded Documents &amp; Media</p>
                        <div className="space-y-2">
                          <FileLink file={app.documents.resume} label="Resume / CV" />
                          <FileLink file={app.documents.teachingCertificate} label="Teaching Certificate" />

                          {app.documents.sampleVideo && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1.5 dark:border-slate-700 dark:bg-slate-900">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <Video className="h-4 w-4 text-indigo-500" />
                                Sample Teaching Video
                              </p>
                              <video src={app.documents.sampleVideo.url} controls preload="metadata" className="w-full max-h-80 rounded-xl bg-black" />
                            </div>
                          )}

                          {app.documents.introVideo && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1.5 dark:border-slate-700 dark:bg-slate-900">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <Video className="h-4 w-4 text-blue-500" />
                                Introduction Video
                              </p>
                              <video src={app.documents.introVideo.url} controls preload="metadata" className="w-full max-h-80 rounded-xl bg-black" />
                            </div>
                          )}

                          {certs.map((c, i) => (
                            <a
                              key={i}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                              <FileBadge className="h-4 w-4 text-slate-400" />
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-[10px] text-slate-400">{c.size}</span>
                              <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APPROVE / REJECT ACTIONS */}
                  {app.status === "pending" ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <input
                        value={notes[app.id] ?? ""}
                        onChange={(e) => setNotes((p) => ({ ...p, [app.id]: e.target.value }))}
                        placeholder="Optional reviewer note (sent to the instructor by email)..."
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => decide(app.id, "approved")}
                          disabled={busyId === app.id}
                          className="h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          Approve Classes &amp; Activate Account
                        </Button>
                        <Button
                          onClick={() => decide(app.id, "rejected")}
                          disabled={busyId === app.id}
                          variant="outline"
                          className="h-9 rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/50"
                        >
                          <XCircle className="mr-1.5 h-4 w-4" /> Reject Application
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <FileText className="h-4 w-4" />
                      Reviewed on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : "—"}
                      {app.reviewNote && <span className="font-semibold text-slate-700 dark:text-slate-300">— Note: {app.reviewNote}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* CATEGORY EXPANSION PERMISSION REQUESTS */
        permRequests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <Inbox className="h-10 w-10" />
            <p className="text-sm font-bold">No {filter === "all" ? "" : filter} category expansion requests</p>
            <p className="text-xs">When approved instructors request to teach additional classes or subjects, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {permRequests.map((req) => (
              <div key={req.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{req.instructorName}</h4>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusCls[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{req.instructorEmail}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Requested Classes:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {req.requestedClasses.map((c: string) => (
                        <span key={c} className="rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Requested Subjects:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {req.requestedSubjects.map((s: string) => (
                        <span key={s} className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {req.reason && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reason / Justification:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{req.reason}</p>
                    </div>
                  )}
                </div>

                {req.status === "pending" ? (
                  <div className="space-y-3 pt-2">
                    <input
                      value={notes[req.id] ?? ""}
                      onChange={(e) => setNotes((p) => ({ ...p, [req.id]: e.target.value }))}
                      placeholder="Optional admin review note..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => decidePermission(req.id, "approved")}
                        disabled={busyId === req.id}
                        className="h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve Categories
                      </Button>
                      <Button
                        onClick={() => decidePermission(req.id, "rejected")}
                        disabled={busyId === req.id}
                        variant="outline"
                        className="h-9 rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <XCircle className="mr-1.5 h-4 w-4" /> Reject Request
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Reviewed on {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : "—"}{req.reviewNote ? ` (${req.reviewNote})` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{value || "—"}</p>
    </div>
  );
}

function FileLink({ file, label }: { file: InstructorFileRef; label: string }) {
  if (!file) return <p className="text-xs text-slate-400">{label}: Not uploaded.</p>;
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <FileText className="h-4 w-4 text-blue-500" />
      <span className="text-slate-400 font-medium">{label}:</span>
      <span className="flex-1 truncate">{file.name}</span>
      <span className="text-[10px] text-slate-400">{file.size}</span>
      <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
    </a>
  );
}
