import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getResults() {
  try {
    const response = await fetch(apiUrl("/api/content/results?grade=11th"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ResultsPage() {
  const results = await getResults();

  if (results.length === 0) {
    return (
      <EmptyState
        title="No results uploaded yet"
        description="Quiz results and overall performance will appear after admin uploads quizzes and students attempt them."
        action="Go to Admin"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-600">Quiz Results</p>
          <h3 className="text-xl font-semibold">{(results[0] as any).title ?? "Quiz Result"}</h3>
          <Progress value={88} />
          <div className="grid gap-2 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-3">Score: {(results[0] as any).score ?? "0 / 0"}</div>
            <div className="rounded-2xl bg-slate-50 p-3">Accuracy: {(results[0] as any).accuracy ?? "0%"}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-600">Overall Performance</p>
          <h3 className="text-xl font-semibold">Performance Snapshot</h3>
          <div className="grid gap-2">
            <div className="rounded-2xl bg-slate-50 p-3">Notes Completion: 0%</div>
            <div className="rounded-2xl bg-slate-50 p-3">Paper Practice: 0%</div>
            <div className="rounded-2xl bg-slate-50 p-3">Quiz Accuracy: 0%</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
