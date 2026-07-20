import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getNotes() {
  try {
    const response = await fetch(apiUrl("/api/content/notes?grade=11th&stream=Medical"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function NotesPage() {
  const notes = await getNotes();

  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes uploaded yet"
        description="Subject-wise PDF notes will appear here after admin uploads them."
        action="Go to Admin"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {notes.map((note: any) => (
        <Card key={note._id ?? note.title}>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-blue-600">Subject Wise PDF Notes</p>
              <h3 className="text-xl font-semibold">{note.title ?? note.subject}</h3>
              <p className="text-sm text-slate-600">Upload Date: {note.uploadDate ?? note.createdAt ?? "-"}</p>
            </div>
            <Button>Download Button</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
