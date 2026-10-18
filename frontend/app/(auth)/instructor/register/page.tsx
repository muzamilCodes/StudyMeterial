"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  User, Briefcase, GraduationCap, FileUp, ClipboardCheck,
  ChevronLeft, ChevronRight, Check, Loader2, AlertCircle, CheckCircle2, X
} from "lucide-react";
import {
  SUBJECT_EXPERTISE_OPTIONS, TEACHING_EXPERIENCE_OPTIONS, CURRENT_OCCUPATION_OPTIONS,
  HIGHEST_QUALIFICATION_OPTIONS, COUNTRY_OPTIONS, STATE_OPTIONS, passingYearOptions,
  submitInstructorApplication,
  type InstructorApplicationForm,
  type InstructorApplicationFiles
} from "@/lib/store";

const STEPS = [
  { title: "Personal Information",  icon: User },
  { title: "Professional Details",  icon: Briefcase },
  { title: "Education",             icon: GraduationCap },
  { title: "Documents",             icon: FileUp },
  { title: "Review & Submit",       icon: ClipboardCheck }
];

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const RESUME_TYPES  = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const IMAGE_TYPES   = ["image/jpeg", "image/jpg", "image/png"];
const CERT_TYPES    = [...RESUME_TYPES, ...IMAGE_TYPES];
const VIDEO_TYPES   = ["video/mp4", "video/webm"];

function fileError(file: File, allowed: string[], label: string): string | null {
  if (!allowed.includes(file.type)) return `${label}: unsupported format. Allowed: ${allowed.includes("image/png") ? "PDF, DOC, DOCX, JPG, PNG" : "PDF, DOC, DOCX"}.`;
  if (file.size > MAX_BYTES) return `${label}: file is larger than 5 MB.`;
  return null;
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelCls = "block text-xs font-bold text-slate-700 mb-1.5";

export default function InstructorRegisterPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<InstructorApplicationForm>({
    password: "",
    personal: { fullName: "", email: "", phone: "", country: "India", state: "Jammu & Kashmir" },
    professional: { headline: "", bio: "", subjectExpertise: [], teachingExperience: "", currentOccupation: "" },
    education: { highestQualification: "", degreeName: "", specialization: "", collegeUniversity: "", passingYear: "" }
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [files, setFiles] = useState<InstructorApplicationFiles>({ resume: undefined as unknown as File });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const years = useMemo(() => passingYearOptions(), []);

  const set = <K extends keyof InstructorApplicationForm>(key: K, value: InstructorApplicationForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  function toggleSubject(subject: string) {
    setForm((p) => {
      const has = p.professional.subjectExpertise.includes(subject);
      return {
        ...p,
        professional: {
          ...p.professional,
          subjectExpertise: has ? p.professional.subjectExpertise.filter((s) => s !== subject) : [...p.professional.subjectExpertise, subject]
        }
      };
    });
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      const { fullName, email, phone } = form.personal;
      if (fullName.trim().length < 2) return "Enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
      if (phone.replace(/\D/g, "").length < 7) return "Enter a valid phone number.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
      if (form.password !== confirmPassword) return "Passwords do not match.";
      if (files.profilePhoto) { const e = fileError(files.profilePhoto, IMAGE_TYPES, "Profile photo"); if (e) return e; }
      return null;
    }
    if (index === 1) {
      if (form.professional.headline.trim().length < 4) return "Enter an instructor headline.";
      if (form.professional.bio.trim().length < 20) return "Your bio should be at least 20 characters.";
      if (form.professional.subjectExpertise.length === 0) return "Select at least one subject you can teach.";
      if (!form.professional.teachingExperience) return "Select your teaching experience.";
      if (!form.professional.currentOccupation) return "Select your current occupation.";
      return null;
    }
    if (index === 2) {
      if (!form.education.highestQualification) return "Select your highest qualification.";
      if (form.education.degreeName.trim().length < 2) return "Enter your degree name.";
      if (form.education.collegeUniversity.trim().length < 2) return "Enter your college or university.";
      if (!form.education.passingYear) return "Select your passing year.";
      for (const f of files.certificates ?? []) { const e = fileError(f, CERT_TYPES, "Certificate"); if (e) return e; }
      return null;
    }
    if (index === 3) {
      if (!files.resume) return "Resume / CV upload is required.";
      const e = fileError(files.resume, RESUME_TYPES, "Resume");
      if (e) return e;
      if (files.teachingCertificate) { const te = fileError(files.teachingCertificate, CERT_TYPES, "Teaching certificate"); if (te) return te; }
      if (files.introVideo) {
        if (!VIDEO_TYPES.includes(files.introVideo.type)) return "Introduction video must be an MP4 or WebM file.";
        if (files.introVideo.size > MAX_VIDEO_BYTES) return "Introduction video must be 25 MB or smaller.";
      }
      return null;
    }
    if (index === 4) {
      if (!agreeTerms) return "Please accept the Terms & Conditions.";
      if (!agreePrivacy) return "Please accept the Privacy Policy.";
      return null;
    }
    return null;
  }

  function next() {
    const e = validateStep(step);
    setError(e);
    if (!e) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() { setError(null); setStep((s) => Math.max(s - 1, 0)); }

  async function handleSubmit() {
    const e = validateStep(4);
    setError(e);
    if (e) return;
    setSubmitting(true);
    const result = await submitInstructorApplication(form, files);
    setSubmitting(false);
    if (!result.ok) { setError(result.message); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-black text-emerald-800">Application Submitted</h1>
          <p className="mt-2 text-sm font-semibold text-emerald-700">Your status is <span className="uppercase">Pending Approval</span>.</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            An administrator will review your application. Once it is approved you will receive an email and can sign in to the
            instructor dashboard using <span className="font-semibold">{form.personal.email}</span> and the password you just set.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/instructor/status" className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              Check application status
            </Link>
            <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black text-slate-900">Instructor Registration</h1>
        <p className="mt-1 text-sm text-slate-500">Apply to teach on StudyMaterial. Complete all five steps; an admin will review your application.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.title} className="flex flex-1 flex-col items-center gap-1.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black transition ${
                done ? "border-emerald-500 bg-emerald-500 text-white"
                : active ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-400"}`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`hidden text-[10px] font-bold sm:block ${active ? "text-blue-600" : done ? "text-emerald-600" : "text-slate-400"}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-5 text-lg font-black text-slate-900">
          Step {step + 1} of {STEPS.length}: {STEPS[step].title}
        </h2>

        {/* STEP 1 — PERSONAL */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Full Name</label><input className={inputCls} value={form.personal.fullName} onChange={(e) => set("personal", { ...form.personal, fullName: e.target.value })} placeholder="Muzamil Ahmad" /></div>
              <div><label className={labelCls}>Email Address</label><input type="email" className={inputCls} value={form.personal.email} onChange={(e) => set("personal", { ...form.personal, email: e.target.value })} placeholder="you@example.com" /></div>
              <div><label className={labelCls}>Phone Number</label><input className={inputCls} value={form.personal.phone} onChange={(e) => set("personal", { ...form.personal, phone: e.target.value })} placeholder="+91 90000 00000" /></div>
              <div>
                <label className={labelCls}>Profile Photo (optional)</label>
                <PhotoInput file={files.profilePhoto} onChange={(f) => setFiles((p) => ({ ...p, profilePhoto: f }))} />
              </div>
              <div><label className={labelCls}>Password</label><input type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 6 characters" /></div>
              <div><label className={labelCls}>Confirm Password</label><input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" /></div>
              <div>
                <label className={labelCls}>Country</label>
                <select className={inputCls} value={form.personal.country} onChange={(e) => set("personal", { ...form.personal, country: e.target.value })}>
                  {COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>State</label>
                <select className={inputCls} value={form.personal.state} onChange={(e) => set("personal", { ...form.personal, state: e.target.value })}>
                  {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — PROFESSIONAL */}
        {step === 1 && (
          <div className="space-y-4">
            <div><label className={labelCls}>Instructor Headline</label><input className={inputCls} value={form.professional.headline} onChange={(e) => set("professional", { ...form.professional, headline: e.target.value })} placeholder="Physics faculty for 11th & 12th, 6+ yrs experience" /></div>
            <div>
              <label className={labelCls}>Short Bio</label>
              <textarea rows={4} className={inputCls} value={form.professional.bio} onChange={(e) => set("professional", { ...form.professional, bio: e.target.value })} placeholder="Tell students about your teaching style, achievements and specialisation." />
            </div>
            <div>
              <label className={labelCls}>Subject Expertise (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_EXPERTISE_OPTIONS.map((subject) => {
                  const active = form.professional.subjectExpertise.includes(subject);
                  return (
                    <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Teaching Experience</label>
                <select className={inputCls} value={form.professional.teachingExperience} onChange={(e) => set("professional", { ...form.professional, teachingExperience: e.target.value })}>
                  <option value="">Select...</option>
                  {TEACHING_EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Current Occupation</label>
                <select className={inputCls} value={form.professional.currentOccupation} onChange={(e) => set("professional", { ...form.professional, currentOccupation: e.target.value })}>
                  <option value="">Select...</option>
                  {CURRENT_OCCUPATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — EDUCATION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Highest Qualification</label>
                <select className={inputCls} value={form.education.highestQualification} onChange={(e) => set("education", { ...form.education, highestQualification: e.target.value })}>
                  <option value="">Select...</option>
                  {HIGHEST_QUALIFICATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Degree Name</label><input className={inputCls} value={form.education.degreeName} onChange={(e) => set("education", { ...form.education, degreeName: e.target.value })} placeholder="B.Tech / M.Sc / ..." /></div>
              <div><label className={labelCls}>Specialization</label><input className={inputCls} value={form.education.specialization} onChange={(e) => set("education", { ...form.education, specialization: e.target.value })} placeholder="e.g. Computer Science" /></div>
              <div><label className={labelCls}>College / University</label><input className={inputCls} value={form.education.collegeUniversity} onChange={(e) => set("education", { ...form.education, collegeUniversity: e.target.value })} placeholder="University name" /></div>
              <div>
                <label className={labelCls}>Passing Year</label>
                <select className={inputCls} value={form.education.passingYear} onChange={(e) => set("education", { ...form.education, passingYear: e.target.value })}>
                  <option value="">Select...</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Certificates (optional, PDF/JPG/PNG, max 5 MB each)</label>
              <MultiFileInput files={files.certificates ?? []} onChange={(f) => setFiles((p) => ({ ...p, certificates: f }))} />
            </div>
          </div>
        )}

        {/* STEP 4 — DOCUMENTS */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Upload Resume / CV <span className="text-rose-500">*</span> (PDF/DOC/DOCX, max 5 MB)</label>
              <FileSlot file={files.resume} onChange={(f) => setFiles((p) => ({ ...p, resume: f as File }))} />
            </div>
            <div>
              <label className={labelCls}>Upload Teaching Certificate (optional, PDF/JPG/PNG)</label>
              <FileSlot file={files.teachingCertificate} onChange={(f) => setFiles((p) => ({ ...p, teachingCertificate: f }))} />
            </div>
            <div>
              <label className={labelCls}>Introduction / Demo Video (optional, MP4/WebM, max 25 MB)</label>
              <p className="-mt-1 mb-1.5 text-[11px] font-semibold text-slate-400">
                A short clip introducing yourself to students. This is separate from course lesson videos, which you upload later inside the course builder.
              </p>
              <FileSlot accept="video/mp4,video/webm" file={files.introVideo} onChange={(f) => setFiles((p) => ({ ...p, introVideo: f }))} />
            </div>
          </div>
        )}

        {/* STEP 5 — REVIEW */}
        {step === 4 && (
          <div className="space-y-5">
            <ReviewBlock label="Name" value={form.personal.fullName} />
            <ReviewBlock label="Email" value={form.personal.email} />
            <ReviewBlock label="Phone" value={`${form.personal.phone} • ${form.personal.state}, ${form.personal.country}`} />
            <ReviewBlock label="Headline" value={form.professional.headline} />
            <ReviewBlock label="Subjects" value={form.professional.subjectExpertise.join(", ")} />
            <ReviewBlock label="Experience" value={`${form.professional.teachingExperience} • ${form.professional.currentOccupation}`} />
            <ReviewBlock label="Qualification" value={`${form.education.highestQualification} — ${form.education.degreeName}, ${form.education.collegeUniversity} (${form.education.passingYear})`} />
            <ReviewBlock label="Resume" value={files.resume ? `${files.resume.name} (${Math.ceil(files.resume.size / 1024)} KB)` : "Not uploaded"} />
            <ReviewBlock label="Certificates" value={`${(files.certificates ?? []).length + (files.teachingCertificate ? 1 : 0)} attached`} />
            <ReviewBlock label="Intro Video" value={files.introVideo ? `${files.introVideo.name} (${Math.ceil(files.introVideo.size / 1024 / 1024)} MB)` : "Not uploaded (optional)"} />

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Checkbox checked={agreeTerms} onChange={setAgreeTerms} label={<>I agree to the <Link href="/terms" className="font-bold text-blue-600 underline">Terms &amp; Conditions</Link>.</>} />
              <Checkbox checked={agreePrivacy} onChange={setAgreePrivacy} label={<>I have read and accept the <Link href="/privacy-policy" className="font-bold text-blue-600 underline">Privacy Policy</Link>.</>} />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" /><p>{error}</p>
          </div>
        )}

        {/* NAV */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <button type="button" onClick={back} disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next}
              className="inline-flex items-center gap-1 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs font-medium text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600" />
      <span>{label}</span>
    </label>
  );
}

function ReviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value || "—"}</span>
    </div>
  );
}

function PhotoInput({ file, onChange }: { file?: File; onChange: (f?: File) => void }) {
  const [url, setLocal] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
        {url ? <img src={url} alt="preview" className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
      </div>
      <input type="file" accept="image/jpeg,image/png" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) { setLocal(URL.createObjectURL(f)); onChange(f); } else { setLocal(null); onChange(undefined); }
      }} className="text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-600" />
      {file && <span className="text-[11px] text-slate-400">{Math.ceil(file.size / 1024)} KB</span>}
    </div>
  );
}

function FileSlot({ file, onChange, accept }: { file?: File; onChange: (f?: File) => void; accept?: string }) {
  return file ? (
    <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
        <FileUp className="h-4 w-4" />
        <span>{file.name} <span className="font-normal text-blue-500">({Math.ceil(file.size / 1024)} KB)</span></span>
      </div>
      <button type="button" onClick={() => onChange(undefined)} className="rounded-lg p-1 text-blue-500 hover:bg-blue-100"><X className="h-4 w-4" /></button>
    </div>
  ) : (
    <input type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0] ?? undefined)}
      className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200" />
  );
}

function MultiFileInput({ files, onChange }: { files: File[]; onChange: (f: File[]) => void }) {
  return (
    <div className="space-y-2">
      <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200" />
      {files.map((f, i) => (
        <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
          <span className="font-semibold text-slate-700">{f.name}</span>
          <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
    </div>
  );
}
