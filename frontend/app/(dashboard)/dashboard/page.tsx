import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { SectionHeading } from "@/components/section-heading";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

type DashboardSummary = {
  stats: Array<{ label: string; value: string; accent: "blue" | "orange" | "indigo" | "emerald" }>;
  notices: Array<{ title: string; date?: string }>;
};

async function getSummary() {
  try {
    const response = await fetch(apiUrl("/api/dashboard/summary"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    return (await response.json()) as DashboardSummary;
  } catch {
    return { stats: [], notices: [] } satisfies DashboardSummary;
  }
}

export default async function DashboardPage() {
  const summary = await getSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="mb-3">Welcome Student</Badge>
            <h2 className="text-2xl font-semibold">Search Bar, Notification, Profile</h2>
            <p className="text-sm text-slate-600">Quick access to every learning module.</p>
          </div>
          <div className="flex w-full gap-3 md:max-w-md">
            <Input placeholder="Search notes, papers, quizzes..." />
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.stats.length > 0 ? summary.stats.map((stat) => <StatCard key={stat.label} {...stat} />) : (
          <Card className="md:col-span-2 xl:col-span-4">
            <CardContent className="py-10 text-center text-sm text-slate-600">
              No uploads yet. When admin adds notes, papers and quizzes, dashboard stats will appear here.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent>
            <SectionHeading eyebrow="Dashboard Cards" title="All learning modules" />
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {["Notes", "Previous Papers", "Quizzes", "Videos", "Downloads", "Results", "Notices", "Bookmarks", "My Progress"].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 font-medium text-slate-700">{item}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <SectionHeading eyebrow="Notifications" title="Recent activity" />
            <div className="mt-5 space-y-3">
              {summary.notices.length > 0 ? summary.notices.map((notice) => (
                <div key={notice.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium">{notice.title}</p>
                  <p className="text-sm text-slate-600">{notice.date ?? ""}</p>
                </div>
              )) : (
                <EmptyState
                  title="No notices uploaded yet"
                  description="Admin notices will show here after upload."
                  action="Check Back Later"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
