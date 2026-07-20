import { Card, CardContent } from "@/components/ui/card";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getDownloads() {
  try {
    const response = await fetch(apiUrl("/api/content/downloads?grade=11th"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function DownloadsPage() {
  const downloads = await getDownloads();

  if (downloads.length === 0) {
    return (
      <EmptyState
        title="No downloads yet"
        description="Downloaded file history will show here once students start downloading uploaded content."
        action="Go to Dashboard"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {downloads.map((file: any) => (
        <Card key={file._id ?? file.title}>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-blue-600">Downloaded Files History</p>
              <h3 className="text-xl font-semibold">{file.title ?? file.name}</h3>
              <p className="text-sm text-slate-600">{file.createdAt ?? file.date ?? "-"}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm">Downloaded</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
