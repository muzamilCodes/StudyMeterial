"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { fetchBackendPapers, logDownload, type RealPaperItem } from "@/lib/store";
import { ScrollText, Download, Calendar, HardDrive, CheckCircle2, Search, Eye, X } from "lucide-react";

export default function PreviousPapersPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [papersList, setPapersList] = useState<RealPaperItem[]>([]);
  const [previewPaper, setPreviewPaper] = useState<RealPaperItem | null>(null);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

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

  const years = ["All", ...Array.from(new Set(papersList.map((p) => p.year)))];

  const filteredPapers = papersList.filter((paper) => {
    const matchesYear = selectedYear === "All" || paper.year === selectedYear;
    const matchesSearch = search.trim() === "" || paper.title.toLowerCase().includes(search.toLowerCase()) || paper.subject.toLowerCase().includes(search.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const handleDownload = (paper: RealPaperItem) => {
    logDownload(paper.title, paper.subject, "Previous Paper", paper.fileSize, paper.fileUrl);
    setDownloadMsg(`Downloaded "${paper.title}". Logged to Downloads history!`);
    setTimeout(() => setDownloadMsg(null), 3500);

    if (paper.fileUrl) {
      window.open(paper.fileUrl, "_blank");
    }
  };

  return (
    <SiteShell
      title="Previous Year Solved Board Papers"
      description={`Solved question papers & model tests for Class ${grade} (${stream})`}
    >
      <div className="space-y-6">
        
        {/* FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  selectedYear === y
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {y === "All" ? "All Years" : `${y} Exam`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search papers..."
              className="w-full h-9 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {downloadMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{downloadMsg}</span>
          </div>
        )}

        {/* PAPERS GRID */}
        {filteredPapers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
            <ScrollText className="h-12 w-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Solved Papers Found</h4>
            <p className="text-xs text-slate-400">Try adjusting your year or subject search filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-lg transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-3 py-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {paper.subject}
                    </span>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                      Year {paper.year}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{paper.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" /> {paper.term || "Board Exam"}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3.5 w-3.5 text-blue-500" /> {paper.fileSize}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPreviewPaper(paper)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                  >
                    <Eye className="h-3.5 w-3.5 text-indigo-600" /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(paper)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Paper
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* PAPER PREVIEW MODAL */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {previewPaper.subject} {previewPaper.year} Board Paper
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{previewPaper.title}</h3>
              </div>
              <button onClick={() => setPreviewPaper(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[450px] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <iframe
                src={`${previewPaper.fileUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}#toolbar=0`}
                className="w-full h-full rounded-2xl"
                title={previewPaper.title}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { handleDownload(previewPaper); setPreviewPaper(null); }}
                className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Download Solved Paper ({previewPaper.fileSize})
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
