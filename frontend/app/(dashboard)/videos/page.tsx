"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { fetchBackendVideos, logDownload, type RealVideoItem } from "@/lib/store";
import { PlayCircle, Clock, User, X, Video, Download, CheckCircle2 } from "lucide-react";

export default function VideosPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [activeVideo, setActiveVideo] = useState<RealVideoItem | null>(null);
  const [videosList, setVideosList] = useState<RealVideoItem[]>([]);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    fetchBackendVideos(grade, stream).then((data) => {
      setVideosList(data);
    });
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";

  const handleDownloadVideo = (vid: RealVideoItem) => {
    logDownload(vid.title, vid.subject, "Video Lecture", "12.4 MB", vid.videoUrl);
    setDownloadMsg(`Downloaded "${vid.title}" successfully. Recorded in Saved History!`);
    setTimeout(() => setDownloadMsg(null), 3500);

    if (vid.videoUrl) {
      window.open(vid.videoUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-rose-600 via-pink-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-1.5 text-xs font-bold">HD Video Library</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold">Subject Wise Video Lectures – Class {grade} ({stream})</h2>
            <p className="mt-1 text-xs md:text-sm text-rose-100/90 max-w-2xl">
              Video lectures uploaded by faculty for Class {grade} {stream} syllabus.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-wider text-rose-200 font-bold">Uploaded Videos</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{videosList.length}</p>
          </div>
        </div>
      </div>

      {downloadMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p>{downloadMsg}</p>
        </div>
      )}

      {/* Videos Grid */}
      {videosList.length === 0 ? (
        <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-8 shadow-glass text-center space-y-3">
          <Video className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Video Lectures Uploaded Yet for Class {grade}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Admin can upload video lectures for Class {grade} from the Admin Panel. Uploaded lectures will appear here dynamically.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {videosList.map((vid) => (
            <Card key={vid.id} className="group overflow-hidden rounded-[2.5rem] border-white/60 bg-white/80 p-4 shadow-glass backdrop-blur-xl hover:shadow-2xl transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
                  <img src={vid.thumbnail} alt={vid.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-300 opacity-90" />
                  <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg group-hover:scale-110 transition">
                      <PlayCircle className="h-7 w-7" />
                    </div>
                  </div>
                  <Badge className="absolute left-3 top-3 bg-black/60 text-white backdrop-blur-md text-[10px]">{vid.subject}</Badge>
                  <span className="absolute right-3 bottom-3 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur-md flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {vid.duration}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-950 text-sm line-clamp-2 group-hover:text-rose-600 transition">{vid.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <User className="h-3.5 w-3.5 text-blue-600" /> Instructor: {vid.instructor}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-3">
                <Button
                  onClick={() => setActiveVideo(vid)}
                  className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
                >
                  <PlayCircle className="mr-1.5 h-3.5 w-3.5" /> Watch
                </Button>
                <Button
                  onClick={() => handleDownloadVideo(vid)}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-slate-200 hover:bg-slate-50 text-xs font-bold"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5 text-rose-600" /> Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-[2.5rem] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <Badge className="bg-rose-100 text-rose-700 mb-1 text-xs">{activeVideo.subject} Video Lecture</Badge>
                <h3 className="text-lg font-bold text-slate-900">{activeVideo.title}</h3>
                <p className="text-xs text-slate-500">Instructor: {activeVideo.instructor} | Duration: {activeVideo.duration}</p>
              </div>
              <button onClick={() => setActiveVideo(null)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950">
              {activeVideo.videoUrl ? (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center space-y-3">
                  <PlayCircle className="h-14 w-14 text-rose-500 animate-pulse" />
                  <p className="font-bold">No Video Stream Available</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-slate-500">Class {activeVideo.grade} – {activeVideo.stream} Stream</p>
              <Button onClick={() => setActiveVideo(null)} className="rounded-xl bg-slate-900 text-white text-xs font-bold">
                Close Player
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
