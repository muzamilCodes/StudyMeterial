"use client";

import { useEffect, useState } from "react";
import {
  COURSE_CATEGORY_OPTIONS,
  COURSE_LANGUAGE_OPTIONS,
  fetchCourseDetail,
  createBackendCourse,
  updateBackendCourse,
  uploadBackendFile,
  type CourseLevel,
  type CourseGrade,
  type CourseStream,
  type CoursePayload
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, Loader2, GripVertical, Video, ImagePlus, FileText, X } from "lucide-react";

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
  base: { title: string; thumbnail: string; description: string; category: string; grade: CourseGrade; stream: CourseStream; level: CourseLevel; language: string; price: number; outcomes: string[]; requirements: string[] },
  modules: ModuleDraft[],
  status: "Draft" | "Published"
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
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Biology");
  const [grade, setGrade] = useState<CourseGrade>("11th");
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

  useEffect(() => {
    if (!editCourseId) return;
    setLoadingEdit(true);
    fetchCourseDetail(editCourseId).then(({ detail, message }) => {
      if (detail) {
        setTitle(detail.title);
        setThumbnail(detail.thumbnail);
        setDescription(detail.description);
        setCategory(detail.category);
        setGrade((detail.grade as CourseGrade) || "All");
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
    if (!category.trim()) return "Course category is required.";
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

  const save = async (status: "Draft" | "Published") => {
    const err = validate();
    if (err) { onMessage(err); return; }
    setBusy(true);
    const payload = toPayload(
      {
        title: title.trim(),
        thumbnail,
        description: description.trim(),
        category,
        grade,
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
      onMessage(status === "Published" ? `Course "${payload.title}" published to students!` : `Draft saved for "${payload.title}".`);
      onSaved();
    } else {
      onMessage(res.message || "Server rejected the course.");
    }
  };

  if (loadingEdit) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm font-bold text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading course…
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-6 max-w-4xl">
      <div>
        <h3 className="text-xl font-black">{editCourseId ? "Edit Course" : "Create New Course"}</h3>
        <p className="text-xs text-slate-400">Everything is saved directly into MongoDB. Students see the course only after you publish it.</p>
      </div>

      {/* BASICS */}
      <div className="space-y-4 text-xs">
        <div>
          <Label className="font-bold">Course Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Complete Genetics for NEET 2026" className="mt-1.5 rounded-xl h-11 text-xs" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label className="font-bold">Category / Subject</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
              {COURSE_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="font-bold">Class (Grade)</Label>
            <select value={grade} onChange={(e) => setGrade(e.target.value as CourseGrade)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
              <option value="All">All Classes</option>
            </select>
          </div>
          <div>
            <Label className="font-bold">Stream</Label>
            <select value={stream} onChange={(e) => setStream(e.target.value as CourseStream)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
              <option value="General">General</option>
              <option value="Medical">Medical</option>
              <option value="Non-Medical">Non-Medical</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="All">All Streams</option>
            </select>
          </div>
          <div>
            <Label className="font-bold">Level</Label>
            <select value={level} onChange={(e) => setLevel(e.target.value as CourseLevel)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <Label className="font-bold">Language</Label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="w-full mt-1.5 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 font-bold">
              {COURSE_LANGUAGE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="font-bold">Course Price (₹, 0 = Free)</Label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1.5 rounded-xl h-11 text-xs" />
          </div>
          <div>
            <Label className="font-bold">Course Thumbnail</Label>
            <div className="mt-1.5 flex items-center gap-3">
              <label className={`inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 h-11 cursor-pointer font-bold text-xs ${uploadingField === "thumb" ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                {uploadingField === "thumb" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {thumbnail ? "Change image" : "Upload image"}
                <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" disabled={uploadingField === "thumb"}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFor(f, setThumbnail, "thumb"); }} />
              </label>
              {thumbnail && <img src={thumbnail} alt="Course thumbnail" className="h-11 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />}
            </div>
          </div>
        </div>

        <div>
          <Label className="font-bold">Course Description</Label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder="What will this course cover?"
            className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-medium" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="font-bold">Learning Outcomes (one per line)</Label>
            <textarea value={outcomes} onChange={(e) => setOutcomes(e.target.value)} rows={3}
              placeholder={"Master DNA replication\nSolve pedigree problems in under 2 min"}
              className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-medium" />
          </div>
          <div>
            <Label className="font-bold">Requirements (one per line)</Label>
            <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3}
              placeholder={"Class 11 biology basics"}
              className="w-full mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-medium" />
          </div>
        </div>
      </div>

      {/* CURRICULUM */}
      <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-black">Course Curriculum</h4>
            <p className="text-xs text-slate-400">Organize modules and video lessons. Lessons with Free Preview are watchable without enrolling.</p>
          </div>
          <Button type="button" onClick={() => setModules((p) => [...p, emptyModule()])}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1">
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>

        {modules.map((mod, mi) => (
          <div key={mi} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-slate-300" />
              <Input value={mod.title} onChange={(e) => setModules((p) => p.map((m, i) => i === mi ? { ...m, title: e.target.value } : m))}
                placeholder={`Module ${mi + 1} title, e.g. DNA & Genetics`} className="h-10 text-xs font-bold max-w-md rounded-xl" />
              {modules.length > 1 && (
                <button type="button" onClick={() => setModules((p) => p.filter((_, i) => i !== mi))}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>

            {mod.lessons.map((les, li) => (
              <div key={li} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <Label className="font-bold">Lesson Title</Label>
                    <Input value={les.title} onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                      placeholder="e.g. DNA Structure & Helix" className="mt-1.5 rounded-xl h-10 text-xs" />
                  </div>
                  <div>
                    <Label className="font-bold">Video Duration</Label>
                    <Input value={les.duration} onChange={(e) => updateLesson(mi, li, { duration: e.target.value })}
                      placeholder="mm:ss" className="mt-1.5 rounded-xl h-10 text-xs" />
                  </div>
                  <div>
                    <Label className="font-bold">Lesson Description</Label>
                    <Input value={les.description} onChange={(e) => updateLesson(mi, li, { description: e.target.value })}
                      placeholder="Short summary" className="mt-1.5 rounded-xl h-10 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <Label className="font-bold">Video Upload</Label>
                    <label className={`mt-1.5 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 h-10 cursor-pointer font-bold ${uploadingField === `v-${mi}-${li}` ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                      {uploadingField === `v-${mi}-${li}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {les.videoUrl && les.videoSource === "upload" ? "Uploaded ✓ (replace)" : "Choose MP4 / WebM file"}
                      <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={uploadingField === `v-${mi}-${li}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadFor(f, (url) => updateLesson(mi, li, { videoUrl: url, videoSource: "upload" }), `v-${mi}-${li}`);
                        }} />
                    </label>
                  </div>
                  <div>
                    <Label className="font-bold">…or Video URL</Label>
                    <Input value={les.videoUrl} onChange={(e) => updateLesson(mi, li, { videoUrl: e.target.value, videoSource: "url" })}
                      placeholder="https://…/lesson.mp4" className="mt-1.5 rounded-xl h-10 text-xs" />
                  </div>
                </div>

                <div className="text-xs">
                  <Label className="font-bold">Lesson Resources (PDF / Notes)</Label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <label className={`inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 h-10 cursor-pointer font-bold ${uploadingField === `r-${mi}-${li}` ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                      {uploadingField === `r-${mi}-${li}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                      Add PDF / doc
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={uploadingField === `r-${mi}-${li}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          uploadFor(f, (url) => updateLesson(mi, li, {
                            resources: [...les.resources, { name: f.name, url }]
                          }), `r-${mi}-${li}`);
                          e.target.value = "";
                        }} />
                    </label>
                    {les.resources.map((r, ri) => (
                      <span key={ri} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 h-8 font-bold text-slate-600 dark:text-slate-300 max-w-[220px]">
                        <a href={r.url} target="_blank" rel="noreferrer" className="truncate hover:underline" title={r.name}>{r.name}</a>
                        <button type="button" onClick={() => updateLesson(mi, li, { resources: les.resources.filter((_, j) => j !== ri) })}
                          className="text-rose-500 hover:text-rose-700 shrink-0"><X className="h-3.5 w-3.5" /></button>
                      </span>
                    ))}
                  </div>
                  {les.resources.length === 0 && <p className="mt-1 text-[10px] text-slate-400 font-semibold">No resources attached. Students can download these when "Allow Notes Download" is on.</p>}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={les.freePreview} onChange={(e) => updateLesson(mi, li, { freePreview: e.target.checked })} className="accent-blue-600" />
                    Free Preview
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={les.allowDownload} onChange={(e) => updateLesson(mi, li, { allowDownload: e.target.checked })} className="accent-blue-600" />
                    Allow Notes Download
                  </label>
                  <span className="flex items-center gap-1 text-slate-400"><Video className="h-3.5 w-3.5" /> Lesson {li + 1} of {mod.lessons.length}</span>
                  {mod.lessons.length > 1 && (
                    <button type="button" onClick={() => setModules((p) => p.map((m, i) => i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m))}
                      className="ml-auto p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              </div>
            ))}

            <Button type="button" onClick={() => setModules((p) => p.map((m, i) => i === mi ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m))}
              variant="outline" className="rounded-xl text-xs font-bold gap-1 h-9">
              <Plus className="h-3.5 w-3.5" /> Add Video Lesson
            </Button>
          </div>
        ))}
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" disabled={busy} onClick={() => save("Draft")} variant="outline" className="rounded-2xl font-bold h-11 text-xs px-6">
          Save as Draft
        </Button>
        <Button type="button" disabled={busy} onClick={() => save("Published")} className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-xs px-8 gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Saving…" : "Publish Course"}
        </Button>
      </div>
    </div>
  );
}
