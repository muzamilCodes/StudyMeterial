import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getPapers() {
  try {
    const response = await fetch(apiUrl("/api/content/papers?grade=11th&stream=Medical"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function PreviousPapersPage() {
  const papers = await getPapers();

  if (papers.length === 0) {
    return (
      <EmptyState
        title="No previous papers uploaded yet"
        description="Once admin uploads year-wise papers, they will appear here."
        action="Go to Admin"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {papers.map((paper: any) => (
        <Card key={paper._id ?? paper.title}>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-blue-600">Year Wise Papers</p>
              <h3 className="text-xl font-semibold">{paper.title ?? paper.subject}</h3>
              <p className="text-sm text-slate-600">Year: {paper.year ?? "-"}</p>
            </div>
            <Button variant="accent">Download PDF</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
