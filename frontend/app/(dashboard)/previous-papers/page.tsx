"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { fetchBackendPapers, logDownload, type RealPaperItem } from "@/lib/store";
import { ScrollText, Download, Calendar, HardDrive, CheckCircle2 } from "lucide-react";

export default function PreviousPapersPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [papersList, setPapersList] = useState<RealPaperItem[]>([]);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    fetchBackendPapers(grade, stream).then((data) => {
      setPapersList(data);
    });
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";

  const handleDownload = (paper: RealPaperItem) => {
    logDownload(paper.title, paper.subject, "Previous Paper", paper.fileSize);
    setDownloadMsg(`Downloaded "${paper.title}". Saved in Downloads history!`);
    setTimeout(() => setDownloadMsg(null), 3500);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-orange-600 via-amber-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-1.5 text-xs font-bold">Previous Papers Archive</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold">Year-Wise Board Papers – Class {grade} ({stream})</h2>
            <p className="mt-1 text-xs md:text-sm text-amber-100/90 max-w-2xl">
              Board question papers uploaded by admin for Class {grade} {stream}.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">Uploaded Papers</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{papersList.length}</p>
          </div>
        </div>
      </div>

      {downloadMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 p-4 text-white font-bold text-xs shadow-lg animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>{downloadMsg}</p>
        </div>
      )}

      {/* Papers Grid */}
      {papersList.length === 0 ? (
        <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-8 shadow-glass text-center space-y-3">
          <ScrollText className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Previous Papers Uploaded Yet for Class {grade}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Admin can upload previous year question papers for Class {grade} from the Admin Panel. Uploaded papers will appear here dynamically.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {papersList.map((paper) => (
            <Card key={paper.id} className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl hover:shadow-xl transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-700 font-bold text-xs">{paper.subject}</Badge>
                    <Badge className="bg-slate-100 text-slate-700 text-xs font-semibold">{paper.year}</Badge>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {paper.term}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-950 leading-snug">{paper.title}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-orange-500" /> Year: {paper.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-blue-600" /> Size: {paper.fileSize}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                <Button
                  onClick={() => handleDownload(paper)}
                  className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF ({paper.fileSize})
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
