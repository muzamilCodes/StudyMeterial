"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ALL_CLASSES_OPTIONS,
  ALL_SUBJECTS_OPTIONS,
  COURSE_LANGUAGE_OPTIONS,
  fetchCourseDetail,
  createBackendCourse,
  updateBackendCourse,
  uploadBackendFile,
  fetchInstructorProfile,
  type CourseLevel,
  type CourseGrade,
  type CourseStream,
  type CoursePayload,
  type CourseStatus
} from "@/lib/store";
import { getStoredSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, Trash2, Upload, Loader2, Video, ImagePlus, FileText,
  X, ArrowUp, ArrowDown, ShieldAlert, Sparkles, Layers, BookOpen, AlertCircle
} from "lucide-react";

type ResourceDraft = { name: string; url: string };

type LessonDraft = {
  title: string;
  description: string;
  videoUrl: string;
  videoSource: "upload" | "url";
  duration: string;
  allowDownload: boolean;
  freePreview: boolean;
  resources: ResourceDraft[];
  existingLessonId?: string;
};

type ModuleDraft = { title: string; lessons: LessonDraft[] };

const emptyLesson = (): LessonDraft => ({
  title: "",
  description: "",
  videoUrl: "",
  videoSource: "upload",
  duration: "0:00",
  allowDownload: true,
  freePreview: false,
  resources: []
});

const emptyModule = (): ModuleDraft => ({ title: "", lessons: [emptyLesson()] });

const toPayload = (
  base: {
    title: string;
    thumbnail: string;
    description: string;
    academicLevel: string;
    subject: string;
    category: string;
    grade: CourseGrade;
    stream: CourseStream;
    level: CourseLevel;
    language: string;
    price: number;
    outcomes: string[];
    requirements: string[];
  },
  modules: ModuleDraft[],
  status: CourseStatus
): CoursePayload => ({
  ...base,
  status,
  modules: modules.map((m) => ({
    title: m.title,
    lessons: m.lessons.map((l, idx) => ({ ...l, order: idx }))
  }))
});

export function InstructorCourseBuilder({ editCourseId, onMessage, onSaved }: {
  editCourseId: string | null;
  onMessage: (msg: string) => void;
  onSaved: () => void;
}) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [description, setDescription] = useState("");
  const [academicLevel, setAcademicLevel] = useState("Class 10");
  const [subject, setSubject] = useState("Mathematics");
  const [stream, setStream] = useState<CourseStream>("General");
  const [level, setLevel] = useState<CourseLevel>("Beginner");
  const [language, setLanguage] = useState("English & Hindi");
  const [price, setPrice] = useState(0);
  const [outcomes, setOutcomes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [modules, setModules] = useState<ModuleDraft[]>([emptyModule()]);

  const [busy, setBusy] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Load instructor profile for permission restrictions
  useEffect(() => {
    const session = getStoredSession();
    if (session?.role === "teacher") {
      fetchInstructorProfile().then((data) => {
        setProfile(data);
        if (data?.teachingPermissions?.classes?.length) {
          const firstClass = data.teachingPermissions.classes[0];
          setAcademicLevel(firstClass);
          const classObj = (data.teachingPermissions.classSubjects || []).find((cs: any) => cs.class === firstClass);
          const firstSubject = classObj?.subjects?.[0] || data.teachingPermissions.subjects?.[0] || "Mathematics";
          setSubject(firstSubject);
        }
        setLoadingProfile(false);
      });
    } else {
      setLoadingProfile(false);
    }
  }, []);

  // Compute allowed classes based on instructor's approved permissions
  const allowedClasses = useMemo(() => {
    if (!profile || !profile.teachingPermissions?.classes?.length) {
      return [...ALL_CLASSES_OPTIONS];
    }
    return profile.teachingPermissions.classes as string[];
  }, [profile]);

  // Compute allowed subjects based on the currently selected class
  const allowedSubjects = useMemo(() => {
    if (!profile) return [...ALL_SUBJECTS_OPTIONS];
    const perms = profile.teachingPermissions;
    if (!perms) return [...ALL_SUBJECTS_OPTIONS];

    const classObj = (perms.classSubjects || []).find((cs: any) => cs.class === academicLevel);
    if (classObj?.subjects?.length) {
      return classObj.subjects as string[];
    }
    if (perms.subjects?.length) {
      return perms.subjects as string[];
    }
    return [...ALL_SUBJECTS_OPTIONS];
  }, [profile, academicLevel]);

  // Handle class change: if current subject not allowed in newly selected class, pick the first allowed one
  const handleClassChange = (newClass: string) => {
    setAcademicLevel(newClass);
    if (profile?.teachingPermissions) {
      const classObj = (profile.teachingPermissions.classSubjects || []).find((cs: any) => cs.class === newClass);
      const available = classObj?.subjects?.length ? classObj.subjects : profile.teachingPermissions.subjects;
      if (available?.length && !available.includes(subject)) {
        setSubject(available[0]);
      }
    }
  };

  useEffect(() => {
    if (!editCourseId) return;
    setLoadingEdit(true);
    fetchCourseDetail(editCourseId).then(({ detail, message }) => {
      if (detail) {
        setTitle(detail.title);
        setThumbnail(detail.thumbnail);
        setDescription(detail.description);
        setAcademicLevel(detail.academicLevel || (detail.grade as string) || "Class 10");
        setSubject(detail.subject || detail.category || "Mathematics");
        setStream((detail.stream as CourseStream) || "All");
        setLevel(detail.level);
        setLanguage(detail.language);
        setPrice(detail.price);
        setOutcomes(detail.outcomes.join("\n"));
        setRequirements(detail.requirements.join("\n"));
        setModules(detail.modules.map((m) => ({
          title: m.title,
          lessons: m.lessons.map((l) => ({
            title: l.title,
            description: l.description,
            videoUrl: l.videoUrl,
            videoSource: "upload" as const,
            duration: l.duration,
            allowDownload: l.allowDownload,
            freePreview: l.freePreview,
            resources: l.resources,
            existingLessonId: l.id
          }))
        })));
      } else if (message) {
        onMessage(message);
      }
      setLoadingEdit(false);
    });
  }, [editCourseId]);

  const updateLesson = (mi: number, li: number, patch: Partial<LessonDraft>) => {
    setModules((prev) => prev.map((m, i) => i !== mi ? m : {
      ...m,
      lessons: m.lessons.map((l, j) => j !== li ? l : { ...l, ...patch })
    }));
  };

  const moveModule = (mi: number, dir: -1 | 1) => {
    setModules((prev) => {
      const j = mi + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[mi], copy[j]] = [copy[j], copy[mi]];
      return copy;
    });
  };

  const moveLesson = (mi: number, li: number, dir: -1 | 1) => {
    setModules((prev) => prev.map((m, i) => {
      if (i !== mi) return m;
      const j = li + dir;
      if (j < 0 || j >= m.lessons.length) return m;
      const lessons = [...m.lessons];
      [lessons[li], lessons[j]] = [lessons[j], lessons[li]];
      return { ...m, lessons };
    }));
  };

  const uploadFor = async (file: File, apply: (url: string) => void, key: string) => {
    setUploadingField(key);
    const res = await uploadBackendFile(file);
    setUploadingField(null);
    if (!res) {
      onMessage("Upload failed. Make sure you are signed in.");
      return;
    }
    apply(res.url);
  };

  const validate = (): string | null => {
    if (title.trim().length < 2) return "Course title is required.";
    if (description.trim().length < 10) return "Course description (min 10 characters) is required.";
    if (!academicLevel) return "Academic class level is required.";
    if (!subject) return "Course subject is required.";

    // Frontend validation of authorized class and subject
    if (profile?.teachingPermissions?.classes?.length) {
      if (!profile.teachingPermissions.classes.includes(academicLevel)) {
        return `You are not authorized to teach "${academicLevel}". Your approved classes are: ${profile.teachingPermissions.classes.join(", ")}.`;
      }
      const classObj = (profile.teachingPermissions.classSubjects || []).find((cs: any) => cs.class === academicLevel);
      const authSubs = classObj?.subjects?.length ? classObj.subjects : profile.teachingPermissions.subjects;
      if (authSubs?.length && !authSubs.includes(subject)) {
        return `You are not authorized to teach "${subject}" for "${academicLevel}". Your approved subjects for this class are: ${authSubs.join(", ")}.`;
      }
    }

    const cleanedModules = modules.filter((m) => m.title.trim());
    if (!cleanedModules.length) return "Add at least one module.";
    for (const m of cleanedModules) {
      const lessons = m.lessons.filter((l) => l.title.trim() && l.videoUrl.trim());
      if (!lessons.length) return `Module "${m.title}" needs at least one lesson with a title and a video.`;
      for (const l of m.lessons) {
        if (l.title.trim() && !l.videoUrl.trim()) return `Lesson "${l.title}" has no video yet (upload a file or paste a URL).`;
      }
    }
    return null;
  };

  const save = async (status: CourseStatus) => {
    const err = validate();
    if (err) { onMessage(err); return; }
    setBusy(true);

    const payload = toPayload(
      {
        title: title.trim(),
        thumbnail,
        description: description.trim(),
        academicLevel,
        subject,
        category: subject,
        grade: academicLevel as CourseGrade,
        stream,
        level,
        language,
        price: Number(price) || 0,
        outcomes: outcomes.split("\n").map((s) => s.trim()).filter(Boolean),
        requirements: requirements.split("\n").map((s) => s.trim()).filter(Boolean)
      },
      modules
        .filter((m) => m.title.trim())
        .map((m) => ({
          title: m.title.trim(),
          lessons: m.lessons
            .filter((l) => l.title.trim() && l.videoUrl.trim())
            .map((l) => ({ ...l, title: l.title.trim(), description: l.description.trim() }))
        })),
      status
    );

    const res = editCourseId
      ? await updateBackendCourse(editCourseId, payload)
      : await createBackendCourse(payload);
    setBusy(false);

    if (res.ok) {
      onMessage(
        status === "Published" ? `Course "${payload.title}" published to students!`
        : status === "Pending Approval" ? `Course "${payload.title}" submitted for admin approval.`
        : `Draft saved for "${payload.title}".`
      );
      onSaved();
    } else {
      onMessage(res.message || "Server rejected the course.");
    }
  };

  if (loadingEdit || loadingProfile) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm font-bold text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading course configuration…
      </div>
    );
  }

  const isTeacherWithPerms = profile?.teachingPermissions?.classes?.length > 0;

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {editCourseId ? "Edit Course" : "Create New Course"}
          </h3>
          <p className="text-xs text-slate-400">
            Publish video lectures, chapter notes and lessons directly to student library.
          </p>
        </div>
        {isTeacherWithPerms && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> Approved Category Authoring
          </span>
        )}
      </div>

      {/* PERMISSION NOTICE BANNER */}
      {isTeacherWithPerms && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-900 dark:border-blue-950 dark:bg-blue-950/40 dark:text-blue-200">
          <ShieldAlert className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Dynamic Teaching Permission Active: </span>
            The class and subject dropdowns are restricted to your approved teaching categories. If you want to teach another class or subject, submit a request from your <span className="font-bold underline">Profile</span> tab.
          </div>
        </div>
      )}

      {/* BASICS */}
      <div className="space-y-4 text-xs">
        <div>
          <Label className="font-bold">Course Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete Class 10 Mathematics — Real Numbers & Polynomials"
            className="mt-1.5 rounded-xl h-11 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DYNAMIC CLASS SELECTION */}
          <div>
            <Label className="font-bold flex items-center justify-between">
              <span>Class / Academic Level</span>
              {isTeacherWithPerms && <span className="text-[10px] text-emerald-600 font-bold">Authorized</span>}
            </Label>
            <select
              value={academicLevel}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold text-xs"
            >
              {allowedClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* DYNAMIC SUBJECT SELECTION RESTRICTED TO CHOSEN CLASS */}
          <div>
            <Label className="font-bold flex items-center justify-between">
              <span>Subject</span>
              {isTeacherWithPerms && <span className="text-[10px] text-emerald-600 font-bold">Authorized</span>}
            </Label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold text-xs"
            >
              {allowedSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="font-bold">Difficulty Level</Label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseLevel)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold text-xs"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <Label className="font-bold">Course Language</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold text-xs"
            >
              {COURSE_LANGUAGE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="font-bold">Course Price (₹, 0 = Free Access)</Label>
            <Input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1.5 rounded-xl h-11 text-xs"
            />
          </div>
          <div>
            <Label className="font-bold">Course Thumbnail</Label>
            <div className="mt-1.5 flex items-center gap-3">
              <label
                className={`inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 h-11 cursor-pointer font-bold text-xs ${
                  uploadingField === "thumb" ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {uploadingField === "thumb" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {thumbnail ? "Change image" : "Upload image"}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  disabled={uploadingField === "thumb"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFor(f, setThumbnail, "thumb");
                  }}
                />
              </label>
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Course thumbnail"
                  className="h-11 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <Label className="font-bold">Course Description</Label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive overview of topics covered, target audience, and exam relevance..."
            className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-xs outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="font-bold">Learning Outcomes (One per line)</Label>
            <textarea
              rows={3}
              value={outcomes}
              onChange={(e) => setOutcomes(e.target.value)}
              placeholder="Master fundamental theorems&#10;Solve board examination problems&#10;Gain speed & confidence"
              className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <Label className="font-bold">Course Requirements (One per line)</Label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Basic notebook & pencil&#10;NCERT textbook&#10;No prior advanced knowledge required"
              className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* CURRICULUM: MODULES & LECTURES */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">Curriculum Modules &amp; Lectures</h4>
            <p className="text-xs text-slate-400">Add chapters and upload video lessons with duration, free-preview options and PDF notes.</p>
          </div>
          <Button
            type="button"
            onClick={() => setModules((p) => [...p, emptyModule()])}
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 h-9"
          >
            <Plus className="h-3.5 w-3.5" /> Add Chapter / Module
          </Button>
        </div>

        {modules.map((mod, mi) => (
          <div key={mi} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
                {mi + 1}
              </span>
              <Input
                value={mod.title}
                onChange={(e) => setModules((p) => p.map((m, i) => i === mi ? { ...m, title: e.target.value } : m))}
                placeholder={`Chapter / Module ${mi + 1} Title (e.g. Chapter 1: Real Numbers)`}
                className="rounded-xl h-10 font-bold bg-white dark:bg-slate-900 text-xs flex-1"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveModule(mi, -1)}
                  disabled={mi === 0}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveModule(mi, 1)}
                  disabled={mi === modules.length - 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                {modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setModules((p) => p.filter((_, i) => i !== mi))}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* LECTURES IN THIS MODULE */}
            {mod.lessons.map((les, li) => (
              <div key={li} className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="sm:col-span-3">
                    <Label className="font-bold">Lecture {li + 1} Title</Label>
                    <Input
                      value={les.title}
                      onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                      placeholder="e.g. Fundamental Theorem of Arithmetic"
                      className="mt-1 rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold">Duration</Label>
                    <Input
                      value={les.duration}
                      onChange={(e) => updateLesson(mi, li, { duration: e.target.value })}
                      placeholder="18:45"
                      className="mt-1 rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <Label className="font-bold">Lecture Description (Optional)</Label>
                  <Input
                    value={les.description}
                    onChange={(e) => updateLesson(mi, li, { description: e.target.value })}
                    placeholder="Key concepts, proofs and practice questions explained in this video..."
                    className="mt-1 rounded-xl h-9 text-xs"
                  />
                </div>

                {/* VIDEO UPLOAD OR URL */}
                <div className="text-xs space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Video Source:</span>
                    <label className="inline-flex items-center gap-1.5 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={les.videoSource === "upload"}
                        onChange={() => updateLesson(mi, li, { videoSource: "upload" })}
                        className="accent-blue-600"
                      />
                      Upload Video File
                    </label>
                    <label className="inline-flex items-center gap-1.5 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={les.videoSource === "url"}
                        onChange={() => updateLesson(mi, li, { videoSource: "url" })}
                        className="accent-blue-600"
                      />
                      External Video URL (MP4 / WebM / CDN)
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    {les.videoSource === "upload" ? (
                      <label className={`inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3.5 h-10 cursor-pointer font-bold ${
                        uploadingField === `v-${mi}-${li}` ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}>
                        {uploadingField === `v-${mi}-${li}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {les.videoUrl ? "Replace video file" : "Choose video (MP4/WebM)"}
                        <input
                          type="file"
                          accept=".mp4,.webm,.mov"
                          className="hidden"
                          disabled={uploadingField === `v-${mi}-${li}`}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadFor(f, (url) => updateLesson(mi, li, { videoUrl: url }), `v-${mi}-${li}`);
                          }}
                        />
                      </label>
                    ) : (
                      <Input
                        value={les.videoUrl}
                        onChange={(e) => updateLesson(mi, li, { videoUrl: e.target.value })}
                        placeholder="https://cdn.example.com/videos/lesson.mp4"
                        className="rounded-xl h-10 text-xs flex-1"
                      />
                    )}
                    {les.videoUrl && (
                      <span className="text-emerald-600 font-bold text-xs truncate max-w-xs">
                        Video ready ({les.videoUrl.slice(-25)})
                      </span>
                    )}
                  </div>
                </div>

                {/* PDF / STUDY NOTES */}
                <div className="text-xs">
                  <Label className="font-bold">PDF / Study Notes Attachment</Label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <label className={`inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 h-9 cursor-pointer font-bold ${
                      uploadingField === `r-${mi}-${li}` ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}>
                      {uploadingField === `r-${mi}-${li}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                      Add PDF / Notes
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        disabled={uploadingField === `r-${mi}-${li}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          uploadFor(f, (url) => updateLesson(mi, li, {
                            resources: [...les.resources, { name: f.name, url }]
                          }), `r-${mi}-${li}`);
                          e.target.value = "";
                        }}
                      />
                    </label>

                    {les.resources.map((r, ri) => (
                      <span key={ri} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 h-8 font-bold text-slate-600 dark:text-slate-300 max-w-[220px]">
                        <a href={r.url} target="_blank" rel="noreferrer" className="truncate hover:underline" title={r.name}>
                          {r.name}
                        </a>
                        <button
                          type="button"
                          onClick={() => updateLesson(mi, li, { resources: les.resources.filter((_, j) => j !== ri) })}
                          className="text-rose-500 hover:text-rose-700 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={les.freePreview}
                      onChange={(e) => updateLesson(mi, li, { freePreview: e.target.checked })}
                      className="accent-blue-600"
                    />
                    Free Preview (Visible to Non-Enrolled Students)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={les.allowDownload}
                      onChange={(e) => updateLesson(mi, li, { allowDownload: e.target.checked })}
                      className="accent-blue-600"
                    />
                    Allow Notes Download
                  </label>
                  <span className="text-slate-400">Lesson {li + 1} of {mod.lessons.length}</span>

                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveLesson(mi, li, -1)}
                      disabled={li === 0}
                      title="Move up"
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLesson(mi, li, 1)}
                      disabled={li === mod.lessons.length - 1}
                      title="Move down"
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    {mod.lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setModules((p) => p.map((m, i) => i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m))}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={() => setModules((p) => p.map((m, i) => i === mi ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m))}
              variant="outline"
              className="rounded-xl text-xs font-bold gap-1 h-9"
            >
              <Plus className="h-3.5 w-3.5" /> Add Lecture to Chapter {mi + 1}
            </Button>
          </div>
        ))}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          disabled={busy}
          onClick={() => save("Draft")}
          variant="outline"
          className="rounded-2xl font-bold h-11 text-xs px-6"
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={busy}
          onClick={() => save("Pending Approval")}
          variant="outline"
          className="rounded-2xl font-bold h-11 text-xs px-6 border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
        >
          Submit for Approval
        </Button>
        <Button
          type="button"
          disabled={busy}
          onClick={() => save("Published")}
          className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-xs px-8 gap-2 shadow-sm"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Saving…" : "Publish Course"}
        </Button>
      </div>
    </div>
  );
}
