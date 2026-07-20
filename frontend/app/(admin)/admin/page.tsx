"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { SectionHeading } from "@/components/section-heading";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type UploadType = "note" | "paper" | "video" | "quiz" | "notice";

type AdminSummary = {
  summary?: {
    stats?: Array<{ label: string; value: string; accent: "blue" | "orange" | "indigo" | "emerald" }>;
    notices?: Array<{ title: string; date?: string; tag?: string }>;
  };
  admin?: { email: string; role: string };
};

type UploadState = {
  grade: "10th" | "11th" | "12th";
  stream: "Medical" | "Non-Medical" | "Commerce" | "Arts";
  subject: string;
  title: string;
  fileUrl: string;
  videoUrl: string;
  year: string;
  category: string;
  body: string;
  durationMinutes: string;
  questionsJson: string;
};

const uploadLabels: Record<UploadType, string> = {
  note: "Notes",
  paper: "Previous Papers",
  video: "Videos",
  quiz: "Quizzes",
  notice: "Notices"
};

const initialForm: UploadState = {
  grade: "11th",
  stream: "Medical",
  subject: "",
  title: "",
  fileUrl: "",
  videoUrl: "",
  year: "",
  category: "Exam Update",
  body: "",
  durationMinutes: "15",
  questionsJson: '[{"question":"Sample question","options":["A","B"],"answer":"A"}]'
};

export default function AdminPage() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("note");
  const [form, setForm] = useState<UploadState>(initialForm);

  useEffect(() => {
    const token = localStorage.getItem("study-material-token");

    if (!token) {
      setError("Admin token not found. Please login as admin first.");
      return;
    }

    fetch(apiUrl("/api/admin/dashboard"), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.message ?? "Unable to load admin dashboard");
        setData(json);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem("study-material-token");
      if (!token) throw new Error("Admin token not found.");

      const endpoint = {
        note: "/api/content/notes",
        paper: "/api/content/papers",
        video: "/api/content/videos",
        quiz: "/api/content/quizzes",
        notice: "/api/content/notices"
      }[uploadType];

      const payload =
        uploadType === "note"
          ? {
              grade: form.grade,
              stream: form.stream,
              subject: form.subject,
              title: form.title,
              fileUrl: form.fileUrl
            }
          : uploadType === "paper"
            ? {
                grade: form.grade,
                stream: form.stream,
                subject: form.subject,
                title: form.title,
                year: form.year,
                fileUrl: form.fileUrl
              }
            : uploadType === "video"
              ? {
                  grade: form.grade,
                  stream: form.stream,
                  subject: form.subject,
                  title: form.title,
                  videoUrl: form.videoUrl
                }
              : uploadType === "quiz"
                ? {
                    grade: form.grade,
                    stream: form.stream,
                    subject: form.subject,
                    title: form.title,
                    durationMinutes: Number(form.durationMinutes),
                    questions: JSON.parse(form.questionsJson)
                  }
                : {
                    title: form.title,
                    body: form.body,
                    category: form.category
                  };

      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? "Upload failed");

      setMessage(`${uploadLabels[uploadType]} uploaded successfully.`);
      setForm((current) => ({
        ...current,
        title: "",
        subject: uploadType === "notice" ? current.subject : "",
        fileUrl: "",
        videoUrl: "",
        year: "",
        body: "",
        questionsJson: current.questionsJson
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  if (error && !data) {
    return (
      <EmptyState
        title="Admin access required"
        description={error}
        action="Login as Admin"
      />
    );
  }

  const summary = data?.summary;
  const adminEmail = data?.admin?.email ?? "admin";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-blue-600">Admin Dashboard</p>
            <h2 className="text-2xl font-semibold">Welcome, {adminEmail}</h2>
            <p className="text-sm text-slate-600">Manage uploads for notes, papers, videos, quizzes and notices.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Protected by JWT middleware
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(summary?.stats ?? []).length > 0 ? (
          summary?.stats?.map((item) => <StatCard key={item.label} {...item} />)
        ) : (
          <Card className="md:col-span-2 xl:col-span-4">
            <CardContent className="py-10 text-center text-sm text-slate-600">
              No admin data yet. Upload content from the API or connected admin forms.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardContent className="space-y-5">
            <SectionHeading eyebrow="Upload Center" title="Admin can upload real content" />

            <form className="space-y-5" onSubmit={handleUpload}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={uploadType} onChange={(event) => setUploadType(event.target.value as UploadType)}>
                    <option value="note">Notes</option>
                    <option value="paper">Previous Papers</option>
                    <option value="video">Videos</option>
                    <option value="quiz">Quizzes</option>
                    <option value="notice">Notices</option>
                  </Select>
                </div>

                {uploadType !== "notice" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Select value={form.grade} onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value as UploadState["grade"] }))}>
                        <option value="10th">10th</option>
                        <option value="11th">11th</option>
                        <option value="12th">12th</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Stream</Label>
                      <Select value={form.stream} onChange={(event) => setForm((current) => ({ ...current, stream: event.target.value as UploadState["stream"] }))}>
                        <option value="Medical">Medical</option>
                        <option value="Non-Medical">Non-Medical</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                      </Select>
                    </div>
                  </>
                ) : null}
              </div>

              {uploadType !== "notice" ? (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    placeholder="Biology / Mathematics / Economics"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Upload title"
                />
              </div>

              {uploadType === "note" || uploadType === "paper" ? (
                <div className="space-y-2">
                  <Label>PDF URL</Label>
                  <Input
                    value={form.fileUrl}
                    onChange={(event) => setForm((current) => ({ ...current, fileUrl: event.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              ) : null}

              {uploadType === "paper" ? (
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={form.year}
                    onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
                    placeholder="2025 / 2026"
                  />
                </div>
              ) : null}

              {uploadType === "video" ? (
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={form.videoUrl}
                    onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              ) : null}

              {uploadType === "quiz" ? (
                <>
                  <div className="space-y-2">
                    <Label>Duration Minutes</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.durationMinutes}
                      onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Questions JSON</Label>
                    <Textarea
                      value={form.questionsJson}
                      onChange={(event) => setForm((current) => ({ ...current, questionsJson: event.target.value }))}
                    />
                  </div>
                </>
              ) : null}

              {uploadType === "notice" ? (
                <>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      placeholder="Exam Update / Holiday Notice / Announcement"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notice Body</Label>
                    <Textarea
                      value={form.body}
                      onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                      placeholder="Notice text"
                    />
                  </div>
                </>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Uploading..." : `Upload ${uploadLabels[uploadType]}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMessage(null);
                    setError(null);
                    setForm(initialForm);
                    setUploadType("note");
                  }}
                >
                  Reset Form
                </Button>
              </div>

              {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3">
              <SectionHeading eyebrow="Admin Features" title="Management tools" />
              {[
                "Manage Users",
                "Manage Subjects",
                "Manage Notes",
                "Manage Previous Papers",
                "Manage Videos",
                "Manage Quizzes",
                "Manage Results",
                "Manage Notices",
                "Upload PDF",
                "Upload Videos",
                "Reports",
                "Settings"
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-3 text-sm">{item}</div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <SectionHeading eyebrow="Recent Activities Panel" title="Live admin feed" />
              {(summary?.notices ?? []).length > 0 ? (
                summary?.notices?.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-slate-500">{item.tag ?? "Notice"}</span>
                    </div>
                    <p className="mt-1 text-slate-600">{item.date ?? ""}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No admin activity yet"
                  description="Recent uploads and actions will appear here after you start managing content."
                />
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
                  Monthly Analytics Charts
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
                  Student Performance Charts
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
