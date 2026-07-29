"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { fetchBackendNotes, logDownload, type RealNoteItem } from "@/lib/store";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { type Grade, type Stream } from "@/lib/platform-data";
import { FileText, Download, Eye, Search, Sparkles, CheckCircle2, X, Maximize2, Minimize2 } from "lucide-react";

export default function NotesPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [notes, setNotes] = useState<RealNoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [previewNote, setPreviewNote] = useState<RealNoteItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    const userGrade = s?.grade || "11th";
    const userStream = s?.stream || "Medical";
    fetchBackendNotes(userGrade, userStream).then((data) => setNotes(data));
  }, []);

  const subjects = ["All", ...Array.from(new Set(notes.map((n) => n.subject)))];

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubject === "All" || n.subject === selectedSubject;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleDownload = (note: RealNoteItem) => {
    const targetUrl = note.pdfUrl || note.fileUrl || "#";
    logDownload(note.title, note.subject, "PDF Note", note.fileSize, targetUrl);

    const a = document.createElement("a");
    a.href = targetUrl;
    a.download = `${note.title}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadNotice(`Logged download: "${note.title}"`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const getTargetUrl = (note: RealNoteItem) => note.pdfUrl || note.fileUrl || "";

  const isImageFile = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase();
    return (
      cleanUrl.includes(".jpg") ||
      cleanUrl.includes(".jpeg") ||
      cleanUrl.includes(".png") ||
      cleanUrl.includes(".webp") ||
      cleanUrl.startsWith("data:image/") ||
      cleanUrl.includes("uploads/")
    );
  };

  return (
    <SiteShell
      title="Curated Study Notes & PDF Documents"
      description="Access, preview full screen, and download subject-wise study material and revision guides."
    >
      <div className="space-y-6">
        
        {downloadNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title or subject..."
              className="w-full h-10 rounded-2xl pl-10 pr-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* SUBJECT FILTER PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedSubject === sub
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* NOTES GRID */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Notes Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No notes matched your search query. Select another subject or reset your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-xl transition duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {note.subject}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{note.fileSize}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition leading-snug">
                    {note.title}
                  </h3>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>{note.pages} Pages</span>
                    <span>•</span>
                    <span>Added {note.uploadDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPreviewNote(note)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-600" /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FULL SCREEN RESPONSIVE PDF / IMAGE PREVIEW MODAL */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col transition-all duration-300 ${
              isFullscreen ? "h-[98vh] max-w-[98vw]" : "h-[88vh] max-w-5xl"
            }`}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="rounded-md bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                    {previewNote.subject} Document Viewer
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight">{previewNote.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => {
                    setPreviewNote(null);
                    setIsFullscreen(false);
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* FULL SCREEN VIEWER VIEWPORT */}
            <div className="flex-1 w-full bg-slate-950 overflow-hidden relative flex items-center justify-center p-2">
              {getTargetUrl(previewNote) ? (
                isImageFile(getTargetUrl(previewNote)) ? (
                  <img
                    src={getTargetUrl(previewNote)}
                    alt={previewNote.title}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <iframe
                    src={`${getTargetUrl(previewNote)}#toolbar=1`}
                    className="w-full h-full rounded-xl border-none"
                    title={previewNote.title}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <FileText className="h-16 w-16 text-blue-500 animate-pulse" />
                  <p className="text-base font-bold text-white">Full Screen Document Preview Ready</p>
                  <p className="text-xs text-slate-400">Class study note for {previewNote.subject}.</p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/90 rounded-b-3xl shrink-0">
              <span className="text-xs font-bold text-slate-400">
                File Size: {previewNote.fileSize} • {previewNote.pages} Pages
              </span>
              <button
                onClick={() => {
                  handleDownload(previewNote);
                  setPreviewNote(null);
                  setIsFullscreen(false);
                }}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
              >
                <Download className="h-4 w-4" /> Download PDF Document
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
