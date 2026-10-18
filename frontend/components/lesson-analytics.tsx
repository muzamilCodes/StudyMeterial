"use client";

import { useEffect, useState } from "react";
import { fetchLessonAnalytics, type LessonAnalyticsRow } from "@/lib/store";
import { Eye, Loader2, MessageSquare, Share2, ThumbsUp } from "lucide-react";

export function LessonAnalytics({ courseId }: { courseId: string }) {
  const [rows, setRows] = useState<LessonAnalyticsRow[] | null>(null);

  useEffect(() => {
    let live = true;
    setRows(null);
    fetchLessonAnalytics(courseId).then((r) => { if (live) setRows(r); });
    return () => { live = false; };
  }, [courseId]);

  if (!rows) {
    return (
      <div className="flex items-center gap-2 p-4 text-xs font-bold text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading lesson analytics…
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="p-4 text-xs font-semibold text-slate-400">This course has no video lessons yet.</p>;
  }

  const totals = rows.reduce(
    (t, r) => ({ views: t.views + r.views, likes: t.likes + r.likes, shares: t.shares + r.shares, comments: t.comments + r.comments }),
    { views: 0, likes: 0, shares: 0, comments: 0 }
  );

  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-xs font-black text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {totals.views} total views</span>
        <span className="inline-flex items-center gap-1 text-blue-600"><ThumbsUp className="h-4 w-4" /> {totals.likes} likes</span>
        <span className="inline-flex items-center gap-1 text-emerald-600"><Share2 className="h-4 w-4" /> {totals.shares} shares</span>
        <span className="inline-flex items-center gap-1 text-indigo-600"><MessageSquare className="h-4 w-4" /> {totals.comments} comments</span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
          <tr>
            <th className="p-2.5">Module</th>
            <th className="p-2.5">Video Lesson</th>
            <th className="p-2.5">Views</th>
            <th className="p-2.5">Likes</th>
            <th className="p-2.5">Shares</th>
            <th className="p-2.5">Comments</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((r) => (
            <tr key={r.lessonId}>
              <td className="p-2.5 text-slate-500 font-semibold">{r.moduleTitle}</td>
              <td className="p-2.5 font-bold">{r.title}</td>
              <td className="p-2.5 font-black text-slate-700 dark:text-slate-200">{r.views}</td>
              <td className="p-2.5 font-bold text-blue-600">{r.likes}</td>
              <td className="p-2.5 font-bold text-emerald-600">{r.shares}</td>
              <td className="p-2.5 font-bold text-indigo-600">{r.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
