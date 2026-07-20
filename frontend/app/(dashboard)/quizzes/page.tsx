import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getQuizzes() {
  try {
    const response = await fetch(apiUrl("/api/content/quizzes?grade=11th&stream=Medical"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  if (quizzes.length === 0) {
    return (
      <EmptyState
        title="No quizzes uploaded yet"
        description="Admin can upload MCQ quizzes for your selected class and stream."
        action="Go to Admin"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-600">MCQ Quiz</p>
          <h3 className="text-xl font-semibold">{(quizzes[0] as any).title ?? "Quiz"}</h3>
          <p className="text-sm text-slate-600">Timer: {String((quizzes[0] as any).durationMinutes ?? 15)}:00</p>
          <Progress value={72} />
          <div className="grid gap-2">
            {(((quizzes[0] as any).questions?.[0]?.options ?? []) as string[]).map((opt) => (
              <div key={opt} className="rounded-2xl bg-slate-50 p-3 text-sm">{opt}</div>
            ))}
          </div>
          <Button>Submit Result</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-600">Result</p>
          <h3 className="text-xl font-semibold">Score Summary</h3>
          <div className="grid gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">Score: 0 / 0</div>
            <div className="rounded-2xl bg-slate-50 p-4">Accuracy: 0%</div>
            <div className="rounded-2xl bg-slate-50 p-4">Status: Awaiting quiz submission</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
