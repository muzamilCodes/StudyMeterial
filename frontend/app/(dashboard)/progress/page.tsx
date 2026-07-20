import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getProgress() {
  try {
    const response = await fetch(apiUrl("/api/content/progress?grade=11th"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function ProgressPage() {
  const progress = await getProgress();

  if (!progress) {
    return (
      <EmptyState
        title="No progress data yet"
        description="Progress will appear after notes, papers and quizzes are uploaded and used."
        action="Go to Dashboard"
      />
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-600">Overall Progress Bar</p>
          <h3 className="text-xl font-semibold">My Progress</h3>
          <Progress value={85} />
          <div className="grid gap-2 text-sm">
            <div className="rounded-2xl bg-slate-50 p-3">Completed Quizzes: {progress.completedQuizzes ?? 0}</div>
            <div className="rounded-2xl bg-slate-50 p-3">Downloaded Notes: {progress.downloadedNotes ?? 0}</div>
            <div className="rounded-2xl bg-slate-50 p-3">Downloaded Papers: {progress.downloadedPapers ?? 0}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
