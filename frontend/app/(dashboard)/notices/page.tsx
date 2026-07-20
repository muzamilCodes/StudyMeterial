import { Card, CardContent } from "@/components/ui/card";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getNotices() {
  try {
    const response = await fetch(apiUrl("/api/content/notices"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function NoticesPage() {
  const notices = await getNotices();

  if (notices.length === 0) {
    return (
      <EmptyState
        title="No notices uploaded yet"
        description="Latest announcements, exam updates and holiday notices will appear here."
        action="Go to Admin"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {notices.map((notice: any) => (
        <Card key={notice._id ?? notice.title}>
          <CardContent>
            <p className="text-sm text-orange-500">Latest Announcements</p>
            <h3 className="text-xl font-semibold">{notice.title}</h3>
            <p className="text-sm text-slate-600">{notice.body ?? notice.date ?? ""}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
