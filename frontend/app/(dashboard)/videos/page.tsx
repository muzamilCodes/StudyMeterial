import { Card, CardContent } from "@/components/ui/card";
import { apiUrl } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";

async function getVideos() {
  try {
    const response = await fetch(apiUrl("/api/content/videos?grade=11th&stream=Medical"), { cache: "no-store" });
    if (!response.ok) throw new Error("Backend unavailable");
    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function VideosPage() {
  const videos = await getVideos();

  if (videos.length === 0) {
    return (
      <EmptyState
        title="No videos uploaded yet"
        description="Subject-wise video lectures will appear here after admin uploads them."
        action="Go to Admin"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {videos.map((video: any) => (
        <Card key={video._id ?? video.title}>
          <CardContent>
            <p className="text-sm text-blue-600">Subject Wise Videos</p>
            <h3 className="text-xl font-semibold">{video.title ?? video.subject}</h3>
            <p className="text-sm text-slate-600">Video URL: {video.videoUrl ?? "-"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
