"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { fetchBackendNotices, type RealNoticeItem } from "@/lib/store";
import { Sparkles, Calendar, Bell, Tag } from "lucide-react";

export default function NoticesPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [noticesList, setNoticesList] = useState<RealNoticeItem[]>([]);

  useEffect(() => {
    setSession(getStoredSession());
    fetchBackendNotices().then((data) => {
      setNoticesList(data);
    });
  }, []);

  const tags = ["All", "Latest Announcements", "Exam Updates", "Holiday Notices"];

  const filteredNotices = selectedTag === "All"
    ? noticesList
    : noticesList.filter((n) => n.category === selectedTag || n.category.toLowerCase().includes(selectedTag.toLowerCase().split(" ")[0]));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-purple-700 via-indigo-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-2">Notice Board</Badge>
            <h2 className="text-3xl font-extrabold">Official Notices & Announcements</h2>
            <p className="mt-1 text-sm text-purple-100/90 max-w-2xl">
              Stay updated with institute announcements, exam schedules, and holiday notices.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-xs uppercase tracking-wider text-purple-200 font-bold">Total Notices</p>
            <p className="text-3xl font-extrabold text-white mt-1">{noticesList.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              selectedTag === tag
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotices.map((notice) => (
          <Card key={notice.id} className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl hover:shadow-xl transition flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-700 font-bold">{notice.category}</Badge>
                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Calendar className="h-3.5 w-3.5" /> {notice.date}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-950 leading-snug">{notice.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{notice.body}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Bell className="h-3.5 w-3.5 text-purple-600" /> Published by Admin
              </span>
              <span className="font-bold text-purple-600">Active</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
