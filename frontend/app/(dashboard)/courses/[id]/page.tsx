"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import {
  addCourseReview,
  addLessonComment,
  enrollInCourse,
  fetchCourseDetail,
  fetchCourseReviews,
  recordLessonShare,
  recordLessonView,
  setLessonComplete,
  setLessonLike,
  type CourseDetail,
  type CourseLessonView,
  type CourseReviewItem
} from "@/lib/store";
import { getStoredSession } from "@/lib/session";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Download,
  Eye,
  Lock,
  Mail,
  Maximize,
  MessageSquare,
  PlayCircle,
  Send,
  Share2,
  Star,
  ThumbsUp,
  UserCircle2
} from "lucide-react";

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

function markEnrolledLocal(courseId: string) {
  try {
    const raw = window.localStorage.getItem("study-material-enrolled-courses");
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(courseId)) {
      list.push(courseId);
      window.localStorage.setItem("study-material-enrolled-courses", JSON.stringify(list));
    }
  } catch { /* ignore */ }
}

export default function CoursePlayerPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id ?? "";

  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [currentLesson, setCurrentLesson] = useState<CourseLessonView | null>(null);
  const [speed, setSpeed] = useState(1);
  const [reviews, setReviews] = useState<CourseReviewItem[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [commentText, setCommentText] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const viewedLessons = useRef<Set<string>>(new Set());

  useEffect(() => {
    setSignedIn(!!getStoredSession());
  }, []);

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const allLessons = useMemo(
    () => (detail ? detail.modules.flatMap((m) => m.lessons) : []),
    [detail]
  );

  const load = useCallback(async () => {
    const { detail: d, message } = await fetchCourseDetail(courseId);
    if (d) {
      setDetail(d);
      setLoadError(null);
      const firstPlayable =
        d.modules.flatMap((m) => m.lessons).find((l) => !l.locked) ??
        d.modules.flatMap((m) => m.lessons)[0] ??
        null;
      setCurrentLesson((prev) => {
        if (prev) {
          const refreshed = d.modules.flatMap((m) => m.lessons).find((l) => l.id === prev.id);
          if (refreshed) return refreshed;
        }
        return firstPlayable;
      });
    } else {
      setLoadError(message || "Course not found.");
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!courseId) return;
    fetchCourseReviews(courseId).then(setReviews);
  }, [courseId]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, currentLesson]);

  const isEnrolled = !!detail?.viewer.enrolled || !!detail?.isOwner;

  const handleEnroll = async () => {
    setBusy(true);
    const res = await enrollInCourse(courseId);
    setBusy(false);
    if (res.ok) {
      markEnrolledLocal(courseId);
      notify("You are enrolled! All lessons are now unlocked.");
      load();
    } else {
      notify(res.message || "Enrollment failed. Please sign in again.");
    }
  };

  const handleToggleComplete = async () => {
    if (!currentLesson || !detail) return;
    if (!isEnrolled) {
      notify("Enroll in this course to track your progress.");
      return;
    }
    const done = detail.viewer.completedLessons.includes(currentLesson.id);
    setBusy(true);
    const res = await setLessonComplete(courseId, currentLesson.id, !done);
    setBusy(false);
    if (res.ok) {
      setDetail({ ...detail, viewer: { ...detail.viewer, completedLessons: res.completedLessons ?? [], progressPct: res.progressPct ?? detail.viewer.progressPct } });
      notify(done ? "Lesson marked as not completed." : "Lesson marked as completed!");
    } else {
      notify(res.message || "Could not update progress.");
    }
  };

  const patchLesson = (lessonId: string, patch: (l: CourseLessonView) => Partial<CourseLessonView>) => {
    setDetail((prev) => {
      if (!prev) return prev;
      const modules = prev.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch(l) } : l))
      }));
      return { ...prev, modules };
    });
    setCurrentLesson((prev) => (prev && prev.id === lessonId ? { ...prev, ...patch(prev) } : prev));
  };

  const handleVideoPlay = () => {
    if (!currentLesson || viewedLessons.current.has(currentLesson.id)) return;
    const lesson = currentLesson;
    viewedLessons.current.add(lesson.id);
    recordLessonView(courseId, lesson.id).then((r) => {
      if (r.ok) patchLesson(lesson.id, (l) => ({ views: (l.views || 0) + 1 }));
    });
  };

  const handleLike = async () => {
    if (!currentLesson || !signedIn) {
      if (!signedIn) notify("Please sign in to like lessons.");
      return;
    }
    const lesson = currentLesson;
    const nextLiked = !lesson.likedByViewer;
    const res = await setLessonLike(courseId, lesson.id, nextLiked);
    if (res.ok) {
      patchLesson(lesson.id, (l) => ({
        likedByViewer: nextLiked,
        likeCount: Math.max(0, (l.likeCount || 0) + (nextLiked ? 1 : -1))
      }));
    } else {
      notify(res.message || "Could not save your like.");
    }
  };

  const handleShare = async () => {
    if (!currentLesson) return;
    const lesson = currentLesson;
    const shareUrl = `${window.location.origin}/courses/${courseId}?lesson=${lesson.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${detail?.title} — ${lesson.title}`, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        notify("Lesson link copied to clipboard!");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        notify("Lesson link copied to clipboard!");
      } catch { return; }
    }
    const r = await recordLessonShare(courseId, lesson.id);
    if (r.ok) patchLesson(lesson.id, (l) => ({ shares: (l.shares || 0) + 1 }));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson) return;
    const text = commentText.trim();
    if (!text) { notify("Write a comment first."); return; }
    setBusy(true);
    const res = await addLessonComment(courseId, currentLesson.id, text);
    setBusy(false);
    if (res.ok) {
      setCommentText("");
      load();
    } else {
      notify(res.message || "Only enrolled students can comment on this lesson.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await addCourseReview(courseId, reviewRating, reviewComment.trim());
    setBusy(false);
    if (res.ok) {
      setReviewComment("");
      notify("Review submitted!");
      fetchCourseReviews(courseId).then(setReviews);
      load();
    } else {
      notify(res.message || "Only enrolled students can review this course.");
    }
  };

  const lessonIndex = currentLesson ? allLessons.findIndex((l) => l.id === currentLesson.id) : -1;
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  const goTo = (l: CourseLessonView) => {
    if (l.locked) {
      notify("This lesson is locked. Enroll in the course to unlock it.");
      return;
    }
    setCurrentLesson(l);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const toggleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else v.requestFullscreen();
  };

  return (
    <SiteShell
      title={detail?.title || "Course"}
      description={detail ? `Taught by ${detail.instructorName}` : "Loading course…"}
    >
      <div className="space-y-6">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Course Library
        </Link>

        {notice && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> <span>{notice}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-96 animate-pulse" />
        ) : loadError || !detail ? (
          <div className="text-center py-16 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Lock className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Course Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">{loadError || "This course could not be loaded."}</p>
          </div>
        ) : (
          <>
            {/* PROGRESS + ENROLL BAR */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between text-xs font-black mb-1.5">
                  <span>Course Progress</span>
                  <span className="text-blue-600">{detail.viewer.progressPct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all" style={{ width: `${detail.viewer.progressPct}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 font-semibold">
                  {detail.viewer.completedLessons.length} of {allLessons.length} lessons completed
                </p>
              </div>
              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={busy}
                  className="w-full sm:w-auto rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold h-12 px-8 text-xs shadow-lg transition"
                >
                  {busy ? "Enrolling…" : detail.price > 0 ? `Enroll — ₹${detail.price}` : "Enroll for Free"}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 px-4 h-12 text-xs font-black text-emerald-600">
                  <BadgeCheck className="h-4 w-4" /> Enrolled
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MAIN: PLAYER + LESSON INFO */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                  <div className="bg-black aspect-video relative flex items-center justify-center">
                    {currentLesson && !currentLesson.locked && currentLesson.videoUrl ? (
                      <video
                        key={currentLesson.id}
                        ref={videoRef}
                        src={currentLesson.videoUrl}
                        controls
                        playsInline
                        className="w-full h-full"
                        onPlay={handleVideoPlay}
                        onEnded={() => {
                          if (
                            isEnrolled &&
                            currentLesson &&
                            !detail.viewer.completedLessons.includes(currentLesson.id)
                          ) {
                            handleToggleComplete();
                          } else if (nextLesson && !nextLesson.locked) {
                            goTo(nextLesson);
                          }
                        }}
                      />
                    ) : currentLesson?.locked ? (
                      <div className="text-center px-6 py-8 space-y-3">
                        <Lock className="mx-auto h-12 w-12 text-slate-500" />
                        <p className="text-sm font-black text-white">{currentLesson.title} is locked</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Free Preview lessons are watchable without enrolling. Enroll to unlock every lesson in this course.
                        </p>
                        <button onClick={handleEnroll} disabled={busy} className="rounded-2xl bg-blue-600 text-white font-bold px-6 h-10 text-xs">
                          {detail.price > 0 ? `Enroll — ₹${detail.price}` : "Enroll for Free"}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center px-6 py-8 space-y-3">
                        <PlayCircle className="mx-auto h-12 w-12 text-slate-500" />
                        <p className="text-xs text-slate-400 font-semibold">No lesson selected.</p>
                      </div>
                    )}
                  </div>

                  {/* PLAYER CONTROLS ROW */}
                  <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => prevLesson && goTo(prevLesson)}
                      disabled={!prevLesson}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 h-10 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 transition"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <button
                      onClick={() => nextLesson && goTo(nextLesson)}
                      disabled={!nextLesson}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 h-10 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 transition"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      Speed
                      <select
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2 font-bold"
                      >
                        {SPEED_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}x</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 h-10 text-xs font-bold hover:bg-slate-200 transition"
                    >
                      <Maximize className="h-4 w-4" /> Fullscreen
                    </button>
                    {currentLesson && (
                      <button
                        onClick={handleToggleComplete}
                        disabled={busy || !isEnrolled}
                        title={!isEnrolled ? "Enroll to track progress" : undefined}
                        className={`ml-auto inline-flex items-center gap-1.5 rounded-xl px-4 h-10 text-xs font-bold transition disabled:opacity-40 ${
                          detail.viewer.completedLessons.includes(currentLesson.id)
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        <CircleCheck className="h-4 w-4" />
                        {detail.viewer.completedLessons.includes(currentLesson.id) ? "Completed ✓" : "Mark as Completed"}
                      </button>
                    )}
                  </div>

                  {/* LESSON DETAILS */}
                  {currentLesson && (
                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-black">{currentLesson.title}</h3>
                        <span className="text-[11px] font-bold text-slate-400">Duration {currentLesson.duration}</span>
                      </div>
                      {currentLesson.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{currentLesson.description}</p>
                      )}

                      {/* ENGAGEMENT BAR: views / likes / shares / comments */}
                      {!currentLesson.locked && (
                        <div className="flex flex-wrap items-center gap-2 py-1">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 h-9 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <Eye className="h-4 w-4 text-slate-400" /> {currentLesson.views} {currentLesson.views === 1 ? "view" : "views"}
                          </span>
                          <button
                            onClick={handleLike}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 h-9 text-xs font-bold transition ${
                              currentLesson.likedByViewer
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            <ThumbsUp className={`h-4 w-4 ${currentLesson.likedByViewer ? "" : "text-blue-500"}`} />
                            {currentLesson.likeCount} {currentLesson.likeCount === 1 ? "like" : "likes"}
                          </button>
                          <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 h-9 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          >
                            <Share2 className="h-4 w-4 text-emerald-500" />
                            Share ({currentLesson.shares})
                          </button>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <MessageSquare className="h-4 w-4" /> {currentLesson.comments.length} comments
                          </span>
                        </div>
                      )}

                      {/* LESSON COMMENTS */}
                      {!currentLesson.locked && (
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
                          <h4 className="text-xs font-black">Student Comments ({currentLesson.comments.length})</h4>
                          {signedIn ? (
                            <form onSubmit={handleAddComment} className="flex gap-2">
                              <input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                maxLength={500}
                                placeholder={`Ask a doubt or share feedback on "${currentLesson.title}"…`}
                                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold"
                              />
                              <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-4 transition">
                                <Send className="h-3.5 w-3.5" /> Post
                              </button>
                            </form>
                          ) : (
                            <p className="text-[11px] text-slate-400 font-bold">Please sign in to comment on this lesson.</p>
                          )}
                          {currentLesson.comments.length === 0 ? (
                            <p className="text-[11px] text-slate-400 font-semibold py-2 text-center">No comments yet on this video.</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {[...currentLesson.comments].reverse().map((c) => (
                                <div key={c.id || c.createdAt} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px] font-black">{c.name}</p>
                                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">{new Date(c.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{c.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* RESOURCES */}
                      {currentLesson.resources.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-black mb-2">Lesson Resources</h4>
                          {currentLesson.locked ? (
                            <p className="text-[11px] text-slate-400 font-semibold inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Enroll to access lesson notes.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {currentLesson.resources.map((r, ri) =>
                                currentLesson.allowDownload ? (
                                  <a
                                    key={ri}
                                    href={r.url}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3.5 h-9 text-xs font-bold hover:bg-blue-100 transition"
                                  >
                                    <Download className="h-3.5 w-3.5" /> {r.name}
                                  </a>
                                ) : (
                                  <a
                                    key={ri}
                                    href={r.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 h-9 text-xs font-bold hover:bg-slate-200 transition"
                                  >
                                    <BookOpen className="h-3.5 w-3.5" /> {r.name} <span className="text-slate-400">(view only)</span>
                                  </a>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {!currentLesson.allowDownload && currentLesson.resources.length === 0 && currentLesson.freePreview && (
                        <p className="text-[10px] text-slate-400 font-semibold">Instructor disabled downloads for this lesson.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* INSTRUCTOR PROFILE */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                  <h4 className="text-sm font-black mb-4">Instructor Profile</h4>
                  <div className="flex items-start gap-4">
                    <UserCircle2 className="h-14 w-14 text-blue-500 shrink-0" />
                    <div className="space-y-1 text-xs">
                      <p className="text-sm font-black">{detail.instructorName}</p>
                      {detail.instructorBio && <p className="text-slate-500 font-semibold leading-relaxed">{detail.instructorBio}</p>}
                      <p className="text-slate-400 font-semibold inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {detail.instructorEmail}</p>
                      <p className="text-slate-400 font-semibold inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {detail.ratingCount > 0 ? `${detail.ratingAvg.toFixed(1)} avg rating from ${detail.ratingCount} students` : "Verified faculty"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* REVIEWS */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                  <h4 className="text-sm font-black">Reviews & Ratings ({reviews.length})</h4>

                  {isEnrolled && (
                    <form onSubmit={handleSubmitReview} className="space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => setReviewRating(n)} className="p-0.5">
                            <Star className={`h-6 w-6 transition ${n <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-black text-slate-500">{reviewRating} / 5</span>
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={2}
                        placeholder="Share how this course helped you…"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold"
                      />
                      <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-5 h-10 transition">
                        <Send className="h-3.5 w-3.5" /> Submit Review
                      </button>
                    </form>
                  )}

                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold py-4 text-center">No reviews yet. Be the first to rate this course{isEnrolled ? " below" : " after enrolling"}.</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black">{r.studentName}</p>
                            <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-black">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {r.rating}.0
                            </span>
                          </div>
                          {r.comment && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">{r.comment}</p>}
                          <p className="mt-1 text-[10px] text-slate-400 font-semibold">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SIDEBAR: CURRICULUM */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                  <h4 className="text-sm font-black">Course Curriculum</h4>
                  <div className="space-y-4">
                    {detail.modules.map((mod, mi) => (
                      <div key={mod.id} className="space-y-2">
                        <p className="text-[11px] font-black uppercase text-slate-400">Module {mi + 1} · {mod.title}</p>
                        {mod.lessons.map((l) => {
                          const active = currentLesson?.id === l.id;
                          const done = detail.viewer.completedLessons.includes(l.id);
                          return (
                            <button
                              key={l.id}
                              onClick={() => goTo(l)}
                              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                                active
                                  ? "bg-blue-600 text-white shadow"
                                  : l.locked
                                    ? "bg-slate-50 dark:bg-slate-800/50 text-slate-400"
                                    : "bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950"
                              }`}
                            >
                              {l.locked ? (
                                <Lock className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                              ) : done ? (
                                <CircleCheck className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-emerald-500"}`} />
                              ) : (
                                <PlayCircle className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-blue-500"}`} />
                              )}
                              <span className="flex-1 truncate">{l.title}</span>
                              <span className={`shrink-0 text-[10px] ${active ? "text-blue-100" : "text-slate-400"}`}>
                                {l.locked ? "Locked" : l.duration}
                              </span>
                              {l.freePreview && !l.locked && !active && (
                                <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-1.5 py-0.5 text-[9px] font-black">FREE</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ABOUT + OUTCOMES */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                  <div>
                    <h4 className="text-sm font-black mb-2">About this course</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{detail.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-black">
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1">{detail.level}</span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1">{detail.language}</span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1">{detail.category}</span>
                  </div>
                  {detail.outcomes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-black mb-2">What you'll learn</h4>
                      <ul className="space-y-1.5">
                        {detail.outcomes.map((o, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {detail.requirements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-black mb-2">Requirements</h4>
                      <ul className="space-y-1.5">
                        {detail.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SiteShell>
  );
}
