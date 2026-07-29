"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { fetchBackendNotices, type RealNoticeItem } from "@/lib/store";
import { Sparkles, Search, Calendar, Tag, Bell, Paperclip, ChevronRight, X } from "lucide-react";

export default function NoticesPage() {
  const [notices, setNotices] = useState<RealNoticeItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedNotice, setSelectedNotice] = useState<RealNoticeItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackendNotices().then((data) => {
      setNotices(data);
      setLoading(false);
    });
  }, []);

  const categories = ["All", "Latest Announcements", "Exam Updates", "Holiday Notices"];

  const filteredNotices = notices.filter((n) => {
    const matchesCat = activeCategory === "All" || n.category === activeCategory;
    const matchesSearch = search.trim() === "" || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SiteShell
      title="Official Notice Board"
      description="Important announcements, datesheets, exam schedule updates, and holiday notices."
    >
      <div className="space-y-6">
        
        {/* TOP CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices..."
              className="w-full h-9 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* NOTICES LIST */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <Bell className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching notices found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search filter or category selection.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-orange-100 dark:bg-orange-950 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-600 dark:text-orange-400">
                      {notice.category || "Notice"}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> {notice.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.body}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  <span>Read Full Notice</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* DETAIL NOTICE DIALOG */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="rounded-full bg-orange-100 dark:bg-orange-950 px-3 py-1 text-xs font-extrabold text-orange-600 dark:text-orange-400">
                {selectedNotice.category}
              </span>
              <button onClick={() => setSelectedNotice(null)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedNotice.title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                <Calendar className="h-3.5 w-3.5" /> Published on {selectedNotice.date}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {selectedNotice.body}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
