import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { databaseCollections, flowSteps, mainFeatures, techStack } from "@/lib/platform-data";
import { SectionHeading } from "@/components/section-heading";
import { PublicShell } from "@/components/public-shell";

const pageBlocks = [
  "Login / Registration",
  "Student Dashboard",
  "Subjects",
  "Notes",
  "Previous Papers",
  "Quiz",
  "Video Lectures",
  "Notices",
  "Downloads",
  "Results",
  "Progress",
  "Forgot Password",
  "Reset Password",
  "Edit Profile",
  "Admin Dashboard"
];

const classStreams = [
  { title: "10th Class", detail: "Only 10th class study material appears after login." },
  { title: "11th Medical", detail: "Biology, Physics, Chemistry, English" },
  { title: "11th Non-Medical", detail: "Physics, Chemistry, Mathematics, English" },
  { title: "11th Commerce", detail: "Accountancy, Business Studies, Economics, English" },
  { title: "11th Arts", detail: "History, Political Science, Sociology, English" },
  { title: "12th Medical", detail: "Biology, Physics, Chemistry" },
  { title: "12th Non-Medical", detail: "Mathematics, Physics, Chemistry" },
  { title: "12th Commerce", detail: "Accountancy, Economics, Business Studies" },
  { title: "12th Arts", detail: "History, Geography, Political Science" }
];

export default function HomePage() {
  return (
    <PublicShell>
      <div className="page-shell px-4 py-4 md:px-6 md:py-6">
        <section className="glass relative overflow-hidden rounded-[2rem] p-5 md:p-8 xl:p-10">
          <div className="absolute inset-0 subtle-grid opacity-35" />
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative space-y-8 xl:space-y-10">
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-5">
                <Badge className="bg-white/80 text-blue-700">Premium Educational SaaS / React + Next.js / MongoDB</Badge>
                <div className="space-y-3">
                  <p className="text-sm font-semibold tracking-[0.4em] text-blue-600">STUDY MATERIAL</p>
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl xl:text-6xl">
                    EDUCATIONAL PLATFORM
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                    One platform for 10th, 11th & 12th students across Medical, Non-Medical, Commerce and Arts.
                    Built as a real product with class-wise filtering, admin control, auth flow, uploads, and dashboard sections.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Live Flow</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Student → Class → Stream → Dashboard</p>
                  </div>
                  <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Class Wise</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Only uploaded content appears</p>
                  </div>
                  <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Responsive</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Laptop, tablet, mobile ready</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-base font-medium text-white shadow-premium transition hover:bg-blue-700">
                    Open Student Login
                  </Link>
                  <Link href="/admin" className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-medium text-slate-900 transition hover:bg-slate-50">
                    Open Admin Dashboard
                  </Link>
                  <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-500 px-6 text-base font-medium text-white shadow-premium transition hover:bg-orange-600">
                    View Full Board
                  </Link>
                </div>
              </div>

              <Card className="bg-slate-950 text-white shadow-glass">
                <CardContent className="space-y-5 p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-300">Upload-Driven Content</p>
                      <p className="text-2xl font-semibold">No demo data</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <GraduationCap className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Flow</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {flowSteps.map((step) => (
                        <span key={step} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Backend</span>
                      <span>Connected</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-200">
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Express.js API</span>
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">JWT Authentication</span>
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">MongoDB Atlas Collections</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <CardContent className="space-y-6 p-0">
                  <div className="border-b border-slate-200/70 p-6">
                    <SectionHeading
                      eyebrow="Class-wise Study Material"
                      title="Only uploaded content appears for the selected class"
                      description="Students choose class and stream first. The backend filters subjects, notes, papers, videos, quizzes and notices for that exact class combination."
                    />
                  </div>
                  <div className="grid gap-4 p-6 md:grid-cols-2">
                    {[
                      "10th Class",
                      "11th Medical",
                      "11th Non-Medical",
                      "11th Commerce",
                      "11th Arts",
                      "12th Medical",
                      "12th Non-Medical",
                      "12th Commerce"
                    ].map((item) => (
                      <div key={item} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-blue-600">Class Mapping</p>
                            <h3 className="text-xl font-semibold">{item}</h3>
                          </div>
                          <BookOpen className="h-5 w-5 text-orange-500" />
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          The dashboard, notes, papers and quizzes shown here will be limited to this selected class and stream only.
                        </p>
                        <div className="mt-4">
                          <Button className="w-full" variant="outline">
                            View only uploaded material
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-5">
                  <SectionHeading eyebrow="Student Dashboard" title="Core modules" />
                  <div className="grid grid-cols-2 gap-3">
                    {["Notes", "Previous Papers", "Quizzes", "Videos", "Downloads", "Results", "Notices", "Bookmarks", "My Progress"].map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <span className="font-medium text-slate-700">{item}</span>
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-slate-900 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-100">Dashboard Statistics</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white/10 p-3">Uploads appear after admin action</div>
                      <div className="rounded-2xl bg-white/10 p-3">No sample content preloaded</div>
                      <div className="rounded-2xl bg-white/10 p-3">Real data from MongoDB</div>
                      <div className="rounded-2xl bg-white/10 p-3">JWT protected access</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card>
                <CardContent>
                  <SectionHeading
                    eyebrow="Login / Registration"
                    title="Authentication layer"
                    description="Student login, registration, forgot password, reset password and profile editing."
                  />
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    {["Email", "Password", "Confirm Password", "Select Class", "Select Stream", "Remember Me", "Forgot Password", "Login Button", "Register Button"].map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <SectionHeading
                    eyebrow="Admin Dashboard"
                    title="Management panel"
                    description="Manage users, subjects, notes, papers, videos, quizzes, results, notices, uploads, reports and settings."
                  />
                  <div className="mt-5 grid gap-3">
                    {["Manage Users", "Manage Subjects", "Manage Notes", "Manage Previous Papers", "Manage Videos", "Manage Quizzes", "Manage Results", "Manage Notices", "Upload PDF", "Upload Videos", "Reports", "Settings"].map((item) => (
                      <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <ShieldCheck className="h-4 w-4 text-orange-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <SectionHeading eyebrow="Tech Stack" title="Production-ready foundation" />
                  <div className="mt-5 flex flex-wrap gap-2">
                    {techStack.map((item) => (
                      <Badge key={item} className="bg-white text-slate-700">{item}</Badge>
                    ))}
                  </div>
                  <div className="mt-6 rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">Database Collections</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {databaseCollections.map((item) => (
                        <span key={item} className="rounded-full bg-white px-3 py-2 text-xs text-slate-600">{item}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardContent>
                  <SectionHeading eyebrow="Main Features" title="Complete feature coverage" />
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {mainFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 rounded-2xl bg-white/80 p-4 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-5">
                  <SectionHeading eyebrow="Class Mapping" title="Examples by stream" />
                  <div className="grid gap-3 text-sm">
                    {classStreams.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="mt-1 text-slate-600">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-sm font-semibold text-blue-700">Responsive Design</p>
                    <p className="mt-2 text-sm text-blue-700/80">Optimized for laptop screens with wider grid sections and compact cards.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardContent>
                  <SectionHeading eyebrow="Admin Snapshot" title="Cards + activity + analytics" />
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {["Manage Users", "Manage Subjects", "Manage Notes", "Manage Previous Papers", "Manage Videos", "Manage Quizzes", "Manage Results", "Manage Notices", "Upload PDF", "Upload Videos", "Reports", "Settings"].map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Admin Module</p>
                        <p className="mt-1 text-xl font-semibold">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {["Recent Activities Panel", "Monthly Analytics Charts", "Student Performance Charts"].map((item) => (
                      <div key={item} className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm font-medium text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <SectionHeading eyebrow="Student Performance" title="Results and progress" />
                  <div className="mt-5 space-y-4">
                    {[
                      "Completed Quizzes",
                      "Downloaded Notes",
                      "Downloaded Papers"
                    ].map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 p-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-600">{item}</span>
                          <span className="font-medium">Managed by admin uploads</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200">
                          <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-blue-600 to-orange-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Notices</p>
                    <div className="mt-4 grid gap-3">
                      {["Latest Announcements", "Exam Updates", "Holiday Notices"].map((notice) => (
                        <div key={notice} className="rounded-2xl bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">{notice}</span>
                            <Badge className="border-white/10 bg-white/10 text-white">Admin</Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-300">Appears only after admin uploads content.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <CardContent className="space-y-5">
                  <SectionHeading eyebrow="Student & Admin Access" title="Upload-ready project workflow" />
                  <div className="grid gap-3 text-sm text-slate-600">
                    {[
                      "Student registers and logs in",
                      "Student selects class and stream",
                      "Only matching subjects appear",
                      "Admin uploads PDF notes",
                      "Admin uploads previous papers",
                      "Admin uploads videos and quizzes",
                      "Admin manages reports and settings"
                    ].map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 p-4">{item}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-5">
                  <SectionHeading eyebrow="Board Summary" title="All screens in one place" />
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {pageBlocks.map((item) => (
                      <div key={item} className="rounded-2xl bg-white/80 p-4 text-sm font-medium text-slate-700 shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
