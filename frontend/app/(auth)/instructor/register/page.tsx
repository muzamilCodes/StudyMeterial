"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  User, Layers, BookOpen, Briefcase, FileUp, ClipboardCheck,
  ChevronLeft, ChevronRight, Check, Loader2, AlertCircle, CheckCircle2,
  X, Sparkles, Video, FileText, ArrowRight
} from "lucide-react";
import {
  ALL_CLASSES_OPTIONS,
  ALL_SUBJECTS_OPTIONS,
  getSubjectOptionsForClasses,
  TEACHING_EXPERIENCE_OPTIONS,
  CURRENT_OCCUPATION_OPTIONS,
  HIGHEST_QUALIFICATION_OPTIONS,
  COUNTRY_OPTIONS,
  STATE_OPTIONS,
  TEACHING_LANGUAGES_OPTIONS,
  passingYearOptions,
  submitInstructorApplication,
  type InstructorApplicationForm,
  type InstructorApplicationFiles
} from "@/lib/store";

const STEPS = [
  { title: "Personal Information",      icon: User },
  { title: "Select Classes to Teach",   icon: Layers },
  { title: "Select Subjects to Teach",  icon: BookOpen },
  { title: "Professional Details",      icon: Briefcase },
  { title: "Documents & Media",         icon: FileUp },
  { title: "Review & Submit",           icon: ClipboardCheck }
];

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const RESUME_TYPES  = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const IMAGE_TYPES   = ["image/jpeg", "image/jpg", "image/png"];
const CERT_TYPES    = [...RESUME_TYPES, ...IMAGE_TYPES];
const VIDEO_TYPES   = ["video/mp4", "video/webm"];

function fileError(file: File, allowed: string[], label: string, maxBytes = MAX_BYTES): string | null {
  if (!allowed.includes(file.type)) {
    return `${label}: unsupported format.`;
  }
  if (file.size > maxBytes) {
    return `${label}: file is larger than ${Math.round(maxBytes / (1024 * 1024))} MB.`;
  }
  return null;
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100";
const labelCls = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5";

export default function InstructorRegisterPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<InstructorApplicationForm>({
    password: "",
    personal: {
      fullName: "",
      email: "",
      phone: "",
      country: "India",
      state: "Jammu & Kashmir",
      city: "",
      addressLine: "",
      messageToAdmin: ""
    },
    selectedClasses: [],
    selectedSubjects: [],
    professional: {
      headline: "",
      bio: "",
      subjectExpertise: [],
      teachingExperience: "",
      currentOccupation: "",
      preferredLanguage: "English & Hindi"
    },
    education: {
      highestQualification: "",
      degreeName: "",
      specialization: "",
      collegeUniversity: "",
      passingYear: ""
    }
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [files, setFiles] = useState<InstructorApplicationFiles>({ resume: undefined as unknown as File });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const years = useMemo(() => passingYearOptions(), []);

  // Compute dynamic subject options and stream groupings based on selected classes
  const dynamicSubjectData = useMemo(() => {
    return getSubjectOptionsForClasses(form.selectedClasses);
  }, [form.selectedClasses]);

  const set = <K extends keyof InstructorApplicationForm>(key: K, value: InstructorApplicationForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  function toggleClass(className: string) {
    setForm((p) => {
      const has = p.selectedClasses.includes(className);
      const updatedClasses = has
        ? p.selectedClasses.filter((c) => c !== className)
        : [...p.selectedClasses, className];
      return { ...p, selectedClasses: updatedClasses };
    });
  }

  function toggleSubject(subjectName: string) {
    setForm((p) => {
      const has = p.selectedSubjects.includes(subjectName);
      const updated = has
        ? p.selectedSubjects.filter((s) => s !== subjectName)
        : [...p.selectedSubjects, subjectName];
      return {
        ...p,
        selectedSubjects: updated,
        professional: {
          ...p.professional,
          subjectExpertise: updated
        }
      };
    });
  }

  // Pre-generate dynamic teaching categories for preview (Class X -> Subject Y)
  const generatedTeachingCategories = useMemo(() => {
    const list: Array<{ class: string; subject: string }> = [];
    for (const c of form.selectedClasses) {
      for (const s of form.selectedSubjects) {
        list.push({ class: c, subject: s });
      }
    }
    return list;
  }, [form.selectedClasses, form.selectedSubjects]);

  function validateStep(index: number): string | null {
    if (index === 0) {
      const { fullName, email, phone } = form.personal;
      if (fullName.trim().length < 2) return "Enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
      if (phone.replace(/\D/g, "").length < 7) return "Enter a valid phone number.";
      if (form.personal.city.trim().length < 2) return "Enter your city or district.";
      if (form.personal.addressLine.trim().length < 6) return "Enter your complete address.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
      if (form.password !== confirmPassword) return "Passwords do not match.";
      if (files.profilePhoto) {
        const e = fileError(files.profilePhoto, IMAGE_TYPES, "Profile photo");
        if (e) return e;
      }
      return null;
    }
    if (index === 1) {
      if (!form.selectedClasses.length) {
        return "Select at least one class you want to teach.";
      }
      return null;
    }
    if (index === 2) {
      if (!form.selectedSubjects.length) {
        return "Select at least one subject you can teach.";
      }
      return null;
    }
    if (index === 3) {
      if (form.professional.headline.trim().length < 4) return "Enter your instructor headline.";
      if (form.professional.bio.trim().length < 20) return "Your bio should be at least 20 characters.";
      if (!form.professional.teachingExperience) return "Select your teaching experience.";
      if (!form.professional.currentOccupation) return "Select your current occupation.";
      if (!form.education.highestQualification) return "Select your highest qualification.";
      if (form.education.degreeName.trim().length < 2) return "Enter your degree name.";
      if (form.education.collegeUniversity.trim().length < 2) return "Enter your college or university.";
      if (!form.education.passingYear) return "Select your passing year.";
      return null;
    }
    if (index === 4) {
      if (!files.resume) return "Resume / CV upload is required (PDF, DOC, DOCX).";
      const e = fileError(files.resume, RESUME_TYPES, "Resume");
      if (e) return e;
      if (files.teachingCertificate) {
        const te = fileError(files.teachingCertificate, CERT_TYPES, "Teaching certificate");
        if (te) return te;
      }
      if (files.introVideo) {
        const ve = fileError(files.introVideo, VIDEO_TYPES, "Introduction video", MAX_VIDEO_BYTES);
        if (ve) return ve;
      }
      if (files.sampleVideo) {
        const sve = fileError(files.sampleVideo, VIDEO_TYPES, "Sample teaching video", MAX_VIDEO_BYTES);
        if (sve) return sve;
      }
      for (const f of files.certificates ?? []) {
        const ce = fileError(f, CERT_TYPES, "Certificate");
        if (ce) return ce;
      }
      return null;
    }
    if (index === 5) {
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

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    const e = validateStep(5);
    setError(e);
    if (e) return;
    setSubmitting(true);

    // Prepare classSubjects mapping payload
    const classSubjects = form.selectedClasses.map((cls) => ({
      class: cls,
      subjects: form.selectedSubjects
    }));

    const finalForm: InstructorApplicationForm = {
      ...form,
      classSubjects
    };

    const result = await submitInstructorApplication(finalForm, files);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-lg dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-black text-emerald-900 dark:text-emerald-200">Application Submitted!</h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Status: Pending Admin Approval
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            An administrator will review your selected classes, subjects, qualifications and documents. Once approved, you will receive an email and can log in with <span className="font-bold text-slate-900 dark:text-white">{form.personal.email}</span>.
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-white/80 p-4 text-left dark:border-emerald-900/50 dark:bg-slate-900/80">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Approved Categories Pending</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {generatedTeachingCategories.slice(0, 8).map((cat, i) => (
                <span key={i} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {cat.class} → {cat.subject}
                </span>
              ))}
              {generatedTeachingCategories.length > 8 && (
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                  +{generatedTeachingCategories.length - 8} more
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/instructor/status" className="rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
              Check Application Status
            </Link>
            <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5" /> Faculty Instructor Onboarding
        </span>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Instructor Registration</h1>
        <p className="mt-1 text-xs text-slate-500 max-w-xl mx-auto">
          Join our verified teaching faculty. Choose your classes, subjects, and credentials. Our administrative team reviews every application before course authoring is enabled.
        </p>
      </div>

      {/* STEP PROGRESS TRACKER */}
      <div className="mb-8 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div
              key={s.title}
              onClick={() => { if (i < step) setStep(i); }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border text-center transition cursor-pointer ${
                active
                  ? "border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300"
                  : done
                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-slate-100 bg-white/60 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                done ? "bg-emerald-600 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className="text-[10px] font-bold leading-tight line-clamp-1">{s.title}</span>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Step {step + 1} of {STEPS.length}: {STEPS[step].title}
            </h2>
            <p className="text-xs text-slate-400">
              {step === 0 && "Provide your contact details and secure password for your instructor profile."}
              {step === 1 && "Choose all academic levels and classes you are qualified and ready to teach."}
              {step === 2 && "Subject options dynamically adapt to your selected classes."}
              {step === 3 && "Tell students and administrators about your educational background and experience."}
              {step === 4 && "Upload your Resume / CV (required) and optional video introductions."}
              {step === 5 && "Review your information and dynamically generated teaching categories."}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {step + 1}/{STEPS.length}
          </span>
        </div>

        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full Name <span className="text-rose-500">*</span></label>
                <input className={inputCls} value={form.personal.fullName} onChange={(e) => set("personal", { ...form.personal, fullName: e.target.value })} placeholder="e.g. Dr. Muzamil Ahmad" />
              </div>
              <div>
                <label className={labelCls}>Email Address <span className="text-rose-500">*</span></label>
                <input type="email" className={inputCls} value={form.personal.email} onChange={(e) => set("personal", { ...form.personal, email: e.target.value })} placeholder="instructor@example.com" />
              </div>
              <div>
                <label className={labelCls}>Phone Number <span className="text-rose-500">*</span></label>
                <input className={inputCls} value={form.personal.phone} onChange={(e) => set("personal", { ...form.personal, phone: e.target.value })} placeholder="+91 90000 00000" />
              </div>
              <div>
                <label className={labelCls}>Profile Photo (Optional)</label>
                <PhotoInput file={files.profilePhoto} onChange={(f) => setFiles((p) => ({ ...p, profilePhoto: f }))} />
              </div>
              <div>
                <label className={labelCls}>Password <span className="text-rose-500">*</span></label>
                <input type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Minimum 6 characters" />
              </div>
              <div>
                <label className={labelCls}>Confirm Password <span className="text-rose-500">*</span></label>
                <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
              </div>
              <div>
                <label className={labelCls}>Country <span className="text-rose-500">*</span></label>
                <select className={inputCls} value={form.personal.country} onChange={(e) => set("personal", { ...form.personal, country: e.target.value })}>
                  {COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>State <span className="text-rose-500">*</span></label>
                <select className={inputCls} value={form.personal.state} onChange={(e) => set("personal", { ...form.personal, state: e.target.value })}>
                  {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>City / District <span className="text-rose-500">*</span></label>
                <input className={inputCls} value={form.personal.city} onChange={(e) => set("personal", { ...form.personal, city: e.target.value })} placeholder="e.g. Srinagar" />
              </div>
              <div>
                <label className={labelCls}>Complete Address <span className="text-rose-500">*</span></label>
                <input className={inputCls} value={form.personal.addressLine} onChange={(e) => set("personal", { ...form.personal, addressLine: e.target.value })} placeholder="House / Street / Area" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT CLASSES TO TEACH */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  Which Classes Do You Want to Teach?
                </h3>
                <p className="text-xs text-slate-400">
                  You can select multiple classes. For example: Classes 6, 7, 8, 9 and 10.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => set("selectedClasses", ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"])}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Quick: Classes 6–10
                </button>
                <button
                  type="button"
                  onClick={() => set("selectedClasses", ["Class 11", "Class 12"])}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Quick: Classes 11–12
                </button>
                {form.selectedClasses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => set("selectedClasses", [])}
                    className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {ALL_CLASSES_OPTIONS.map((cls) => {
                const isSelected = form.selectedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xs font-bold leading-snug">{cls}</span>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950 dark:bg-blue-950/30">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                Selected Classes ({form.selectedClasses.length}):
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.selectedClasses.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No class selected yet. Choose at least one class above.</span>
                ) : (
                  form.selectedClasses.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-blue-700 shadow-2xs border border-blue-200 dark:bg-slate-900 dark:border-blue-800 dark:text-blue-200">
                      {c}
                      <button type="button" onClick={() => toggleClass(c)} className="hover:text-rose-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT SUBJECTS (DYNAMIC ADAPTIVE SELECTION) */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                Which Subjects Can You Teach?
              </h3>
              <p className="text-xs text-slate-400">
                The subjects below are dynamically tailored to your selected classes ({form.selectedClasses.join(", ") || "None"}). Select only the subjects you are qualified to teach.
              </p>
            </div>

            {/* Render grouped streams based on selected classes */}
            <div className="space-y-4">
              {dynamicSubjectData.streamGroups.map((group, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {group.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = group.subjects.every((s) => form.selectedSubjects.includes(s));
                        if (allSelected) {
                          set("selectedSubjects", form.selectedSubjects.filter((s) => !group.subjects.includes(s)));
                        } else {
                          const union = Array.from(new Set([...form.selectedSubjects, ...group.subjects]));
                          set("selectedSubjects", union);
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      {group.subjects.every((s) => form.selectedSubjects.includes(s)) ? "Deselect Group" : "Select Group"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.subjects.map((sub) => {
                      const active = form.selectedSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubject(sub)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                            active
                              ? "border-blue-600 bg-blue-600 text-white shadow-2xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          }`}
                        >
                          {active && <Check className="h-3 w-3 stroke-[3]" />}
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* DYNAMIC TEACHING CATEGORIES GENERATION PREVIEW */}
            {generatedTeachingCategories.length > 0 && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Automatically Generated Teaching Categories ({generatedTeachingCategories.length})
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    Derived from your classes &amp; subjects
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  After approval, your instructor dashboard will be configured with these categories:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                  {generatedTeachingCategories.map((item, i) => (
                    <span key={i} className="rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      {item.class} → {item.subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: PROFESSIONAL & EDUCATIONAL DETAILS */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Instructor Headline <span className="text-rose-500">*</span></label>
              <input
                className={inputCls}
                value={form.professional.headline}
                onChange={(e) => set("professional", { ...form.professional, headline: e.target.value })}
                placeholder="e.g. Senior Faculty for Class 9–10 Mathematics & Physics (8+ Yrs Experience)"
              />
            </div>

            <div>
              <label className={labelCls}>Professional Bio <span className="text-rose-500">*</span></label>
              <textarea
                rows={4}
                className={inputCls}
                value={form.professional.bio}
                onChange={(e) => set("professional", { ...form.professional, bio: e.target.value })}
                placeholder="Detail your teaching methodology, experience, achievements, and why students should learn with you."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Teaching Experience <span className="text-rose-500">*</span></label>
                <select
                  className={inputCls}
                  value={form.professional.teachingExperience}
                  onChange={(e) => set("professional", { ...form.professional, teachingExperience: e.target.value })}
                >
                  <option value="">Select experience...</option>
                  {TEACHING_EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Current Occupation <span className="text-rose-500">*</span></label>
                <select
                  className={inputCls}
                  value={form.professional.currentOccupation}
                  onChange={(e) => set("professional", { ...form.professional, currentOccupation: e.target.value })}
                >
                  <option value="">Select occupation...</option>
                  {CURRENT_OCCUPATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Preferred Teaching Language <span className="text-rose-500">*</span></label>
                <select
                  className={inputCls}
                  value={form.professional.preferredLanguage}
                  onChange={(e) => set("professional", { ...form.professional, preferredLanguage: e.target.value })}
                >
                  {TEACHING_LANGUAGES_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Academic Qualifications</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Highest Qualification <span className="text-rose-500">*</span></label>
                  <select
                    className={inputCls}
                    value={form.education.highestQualification}
                    onChange={(e) => set("education", { ...form.education, highestQualification: e.target.value })}
                  >
                    <option value="">Select qualification...</option>
                    {HIGHEST_QUALIFICATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Degree / Qualification Name <span className="text-rose-500">*</span></label>
                  <input
                    className={inputCls}
                    value={form.education.degreeName}
                    onChange={(e) => set("education", { ...form.education, degreeName: e.target.value })}
                    placeholder="e.g. M.Sc / B.Tech / B.Ed"
                  />
                </div>
                <div>
                  <label className={labelCls}>Specialization</label>
                  <input
                    className={inputCls}
                    value={form.education.specialization}
                    onChange={(e) => set("education", { ...form.education, specialization: e.target.value })}
                    placeholder="e.g. Theoretical Physics / Applied Mathematics"
                  />
                </div>
                <div>
                  <label className={labelCls}>College / University Name <span className="text-rose-500">*</span></label>
                  <input
                    className={inputCls}
                    value={form.education.collegeUniversity}
                    onChange={(e) => set("education", { ...form.education, collegeUniversity: e.target.value })}
                    placeholder="University of Kashmir / Delhi University / ..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Passing Year <span className="text-rose-500">*</span></label>
                  <select
                    className={inputCls}
                    value={form.education.passingYear}
                    onChange={(e) => set("education", { ...form.education, passingYear: e.target.value })}
                  >
                    <option value="">Select year...</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENTS & MEDIA */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>
                Resume / CV Upload <span className="text-rose-500">*</span> (PDF, DOC, DOCX, Max 5 MB)
              </label>
              <FileSlot file={files.resume} onChange={(f) => setFiles((p) => ({ ...p, resume: f as File }))} />
            </div>

            <div>
              <label className={labelCls}>
                Sample Teaching Video (Optional, MP4/WebM, Max 25 MB)
              </label>
              <p className="-mt-1 mb-1.5 text-[11px] text-slate-400">
                A 2–5 minute sample demonstrating how you explain a concept to students on a whiteboard or screen share.
              </p>
              <FileSlot accept="video/mp4,video/webm" file={files.sampleVideo} onChange={(f) => setFiles((p) => ({ ...p, sampleVideo: f }))} />
            </div>

            <div>
              <label className={labelCls}>
                Introduction Video (Optional, MP4/WebM, Max 25 MB)
              </label>
              <p className="-mt-1 mb-1.5 text-[11px] text-slate-400">
                A short self-introduction clip to welcome students on your profile.
              </p>
              <FileSlot accept="video/mp4,video/webm" file={files.introVideo} onChange={(f) => setFiles((p) => ({ ...p, introVideo: f }))} />
            </div>

            <div>
              <label className={labelCls}>
                Teaching Certificate / Degree Certificates (Optional, PDF/JPG/PNG)
              </label>
              <MultiFileInput files={files.certificates ?? []} onChange={(f) => setFiles((p) => ({ ...p, certificates: f }))} />
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <ReviewBlock label="Full Name" value={form.personal.fullName} />
              <ReviewBlock label="Email" value={form.personal.email} />
              <ReviewBlock label="Phone & Location" value={`${form.personal.phone} • ${form.personal.city}, ${form.personal.state}, ${form.personal.country}`} />
              <ReviewBlock label="Headline" value={form.professional.headline} />
              <ReviewBlock label="Teaching Experience" value={`${form.professional.teachingExperience} • ${form.professional.currentOccupation}`} />
              <ReviewBlock label="Preferred Language" value={form.professional.preferredLanguage} />
              <ReviewBlock label="Selected Classes" value={form.selectedClasses.join(", ")} />
              <ReviewBlock label="Selected Subjects" value={form.selectedSubjects.join(", ")} />
              <ReviewBlock
                label="Qualifications"
                value={`${form.education.highestQualification} in ${form.education.degreeName} (${form.education.collegeUniversity}, ${form.education.passingYear})`}
              />
              <ReviewBlock label="Resume / CV" value={files.resume ? `${files.resume.name} (${Math.ceil(files.resume.size / 1024)} KB)` : "Missing"} />
              <ReviewBlock label="Sample Teaching Video" value={files.sampleVideo ? files.sampleVideo.name : "Not provided (optional)"} />
              <ReviewBlock label="Introduction Video" value={files.introVideo ? files.introVideo.name : "Not provided (optional)"} />
            </div>

            <div>
              <label className={labelCls}>Message for the Admin (Optional)</label>
              <textarea
                rows={3}
                className={inputCls}
                value={form.personal.messageToAdmin}
                onChange={(e) => set("personal", { ...form.personal, messageToAdmin: e.target.value })}
                placeholder="Mention any specific certifications, coaching affiliations, or instructions for the administrator..."
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <Checkbox checked={agreeTerms} onChange={setAgreeTerms} label={<>I agree to the <Link href="/terms" className="font-bold text-blue-600 underline">Terms &amp; Conditions</Link> for teaching on this platform.</>} />
              <Checkbox checked={agreePrivacy} onChange={setAgreePrivacy} label={<>I acknowledge and agree to the <Link href="/privacy-policy" className="font-bold text-blue-600 underline">Privacy Policy</Link>.</>} />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Application...
                </>
              ) : (
                <>
                  Submit Application <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span>{label}</span>
    </label>
  );
}

function ReviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-200/60 pb-2 dark:border-slate-700/60">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{value || "—"}</span>
    </div>
  );
}

function PhotoInput({ file, onChange }: { file?: File; onChange: (f?: File) => void }) {
  const [url, setLocal] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800">
        {url ? <img src={url} alt="preview" className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setLocal(URL.createObjectURL(f)); onChange(f); } else { setLocal(null); onChange(undefined); }
        }}
        className="text-xs text-slate-500 file:mr-2.5 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-blue-600 hover:file:bg-blue-100"
      />
    </div>
  );
}

function FileSlot({ file, onChange, accept }: { file?: File; onChange: (f?: File) => void; accept?: string }) {
  return file ? (
    <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/40">
      <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
        <FileUp className="h-4 w-4" />
        <span className="truncate max-w-xs">{file.name}</span>
        <span className="font-normal text-blue-500">({Math.ceil(file.size / 1024)} KB)</span>
      </div>
      <button type="button" onClick={() => onChange(undefined)} className="rounded-lg p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900">
        <X className="h-4 w-4" />
      </button>
    </div>
  ) : (
    <input
      type="file"
      accept={accept}
      onChange={(e) => onChange(e.target.files?.[0] ?? undefined)}
      className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300"
    />
  );
}

function MultiFileInput({ files, onChange }: { files: File[]; onChange: (f: File[]) => void }) {
  return (
    <div className="space-y-2">
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300"
      />
      {files.map((f, i) => (
        <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-850">
          <span className="font-bold text-slate-700 truncate dark:text-slate-300">{f.name}</span>
          <button type="button" onClick={() => onChange(files.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
