"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { fetchBackendNotes, logDownload, type RealNoteItem } from "@/lib/store";
import { FileText, Download, Eye, Calendar, HardDrive, CheckCircle2, X, PlusCircle } from "lucide-react";

export default function NotesPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [previewNote, setPreviewNote] = useState<RealNoteItem | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [notesList, setNotesList] = useState<RealNoteItem[]>([]);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    fetchBackendNotes(grade, stream).then((realNotes) => {
      setNotesList(realNotes);
    });
  }, []);

  const grade = session?.grade ?? "11th";
  const stream = session?.stream ?? "Medical";

  const handleDownload = (note: RealNoteItem) => {
    logDownload(note.title, note.subject, "PDF Note", note.fileSize);
    setDownloadMsg(`Downloaded "${note.title}" (${note.fileSize}). Recorded in Downloads history!`);
    setTimeout(() => setDownloadMsg(null), 3500);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-1.5 text-xs font-bold">PDF Notes Repository</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold">Subject Wise PDF Notes – Class {grade} ({stream})</h2>
            <p className="mt-1 text-xs md:text-sm text-blue-100/90 max-w-2xl">
              Verified PDF study notes uploaded by faculty for Class {grade} {stream} syllabus.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Uploaded Notes</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{notesList.length}</p>
          </div>
        </div>
      </div>

      {downloadMsg && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 p-4 text-white font-bold text-xs shadow-lg animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>{downloadMsg}</p>
        </div>
      )}

      {/* Real Uploaded Notes Grid */}
      {notesList.length === 0 ? (
        <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-8 shadow-glass text-center space-y-3">
          <FileText className="h-12 w-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No PDF Notes Uploaded Yet for Class {grade} {stream}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Admin can upload subject notes for Class {grade} from the Admin Panel. Uploaded notes will appear here dynamically.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notesList.map((note) => (
            <Card key={note.id} className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl hover:shadow-xl transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-700 font-bold text-xs">{note.subject}</Badge>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5" /> Uploaded: {note.uploadDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-950 leading-snug">{note.title}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-blue-600" /> Size: {note.fileSize}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-orange-500" /> Pages: {note.pages} Pages
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-3 border-t border-slate-100">
                <Button
                  onClick={() => setPreviewNote(note)}
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-slate-200 hover:bg-slate-50 text-xs font-bold"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5 text-blue-600" /> Preview PDF
                </Button>
                <Button
                  onClick={() => handleDownload(note)}
                  className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <Badge className="bg-blue-100 text-blue-700 mb-1 text-xs">{previewNote.subject} PDF Notes</Badge>
                <h3 className="text-lg font-bold text-slate-900">{previewNote.title}</h3>
              </div>
              <button onClick={() => setPreviewNote(null)} className="rounded-full bg-slate-100 p-2 hover:bg-slate-200">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="h-72 rounded-2xl bg-slate-900 p-6 text-white flex flex-col items-center justify-center text-center space-y-3">
              <FileText className="h-14 w-14 text-blue-400 animate-pulse" />
              <div>
                <p className="text-base font-bold">PDF Reader Document Viewer</p>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Previewing {previewNote.pages} pages of verified faculty notes for Class {previewNote.grade} ({previewNote.stream}).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPreviewNote(null)} className="rounded-xl text-xs">
                Close Preview
              </Button>
              <Button onClick={() => { handleDownload(previewNote); setPreviewNote(null); }} className="rounded-xl bg-blue-600 text-white font-bold text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF ({previewNote.fileSize})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
