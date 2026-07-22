"use client";
 
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDownloadedFiles, type DownloadRecord, logDownload, deleteDownloadRecord } from "@/lib/store";
import { Download, FileText, ScrollText, CheckCircle2, Clock, Trash2, Eye, Video } from "lucide-react";
 
export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
 
  useEffect(() => {
    setDownloads(getDownloadedFiles());
  }, []);
 
  const handleViewFile = (item: DownloadRecord) => {
    if (item.fileUrl) {
      window.open(item.fileUrl, "_blank");
    } else {
      window.open("http://localhost:4000/uploads/dummy.pdf", "_blank");
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from your download history?`)) return;
    const updated = deleteDownloadRecord(id);
    setDownloads(updated);
    setDownloadMsg(`Removed "${title}" from download history.`);
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-2">Saved History</Badge>
            <h2 className="text-3xl font-extrabold">Downloaded Files History</h2>
            <p className="mt-1 text-sm text-emerald-100/90 max-w-2xl">
              Track all your downloaded PDF study notes and previous year question papers.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-xs uppercase tracking-wider text-emerald-200 font-bold">Total Saved Files</p>
            <p className="text-3xl font-extrabold text-white mt-1">{downloads.length}</p>
          </div>
        </div>
      </div>

      {downloadMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 p-4 text-white font-medium shadow-lg animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm">{downloadMsg}</p>
        </div>
      )}

      {/* Downloads Table / Cards */}
      <div className="space-y-4">
        {downloads.map((item) => (
          <Card key={item.id} className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl hover:shadow-lg transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md ${
                  item.category === "PDF Note" 
                    ? "bg-blue-600" 
                    : item.category === "Video Lecture" 
                    ? "bg-rose-600" 
                    : "bg-orange-500"
                }`}>
                  {item.category === "PDF Note" ? (
                    <FileText className="h-6 w-6" />
                  ) : item.category === "Video Lecture" ? (
                    <Video className="h-6 w-6" />
                  ) : (
                    <ScrollText className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={
                      item.category === "PDF Note" 
                        ? "bg-blue-100 text-blue-700" 
                        : item.category === "Video Lecture" 
                        ? "bg-rose-100 text-rose-700" 
                        : "bg-orange-100 text-orange-700"
                    }>
                      {item.category}
                    </Badge>
                    <Badge className="border border-slate-200 bg-slate-100 text-slate-700">{item.subject}</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Downloaded: {item.downloadedAt}</span>
                    <span>•</span>
                    <span>Size: {item.fileSize}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => handleViewFile(item)}
                  variant="outline"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 text-xs font-semibold"
                >
                  <Eye className="mr-2 h-4 w-4 text-blue-600" /> View
                </Button>
                <Button
                  onClick={() => handleDelete(item.id, item.title)}
                  variant="outline"
                  className="rounded-xl border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-xs font-semibold text-rose-600"
                  title="Remove from history"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
