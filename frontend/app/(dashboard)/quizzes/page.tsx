"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { fetchBackendQuizzes, recordQuizResult } from "@/lib/store";
import { type QuizItem } from "@/lib/platform-data";
import { Clock, Award, RefreshCw, AlertCircle, CheckCircle2, Play, HelpCircle, ShieldCheck } from "lucide-react";

export default function QuizzesPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");
  
  // Quiz execution states
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(900);
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; accuracy: number } | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    fetchBackendQuizzes(grade, stream).then((classQ) => {
      setAvailableQuizzes(classQ);
      if (classQ.length > 0) {
        setActiveQuiz(classQ[0]);
      }
    });
  }, []);

  // Timer interval ONLY runs when isQuizStarted === true and not submitted
  useEffect(() => {
    if (!isQuizStarted || submitted || !activeQuiz) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isQuizStarted, submitted, activeQuiz]);

  if (!activeQuiz) {
    return (
      <SiteShell title="Interactive Quiz Engine" description="Loading class quizzes...">
        <div className="py-20 text-center space-y-3">
          <Clock className="h-12 w-12 text-indigo-500 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Loading Quizzes...</h3>
          <p className="text-xs text-slate-400">Fetching quizzes for your class and stream...</p>
        </div>
      </SiteShell>
    );
  }

  const filteredQuizList = selectedSubjectFilter === "All"
    ? availableQuizzes
    : availableQuizzes.filter(q => q.subject === selectedSubjectFilter);

  const subjectsInQuizzes = Array.from(new Set(availableQuizzes.map(q => q.subject)));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const currentQ = activeQuiz.questions[currentQuestion] || activeQuiz.questions[0];

  const handleOptionSelect = (optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion]: optionIdx }));
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
    setTimeLeft(activeQuiz.durationMinutes * 60);
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / activeQuiz.totalQuestions) * 100);
    setScoreResult({ score: correctCount, total: activeQuiz.totalQuestions, accuracy });
    setSubmitted(true);

    recordQuizResult({
      quizTitle: activeQuiz.title,
      subject: activeQuiz.subject,
      grade: session?.grade ?? "11th",
      stream: session?.stream ?? "Medical",
      score: correctCount,
      totalQuestions: activeQuiz.totalQuestions,
      accuracy
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setSubmitted(false);
    setScoreResult(null);
    setIsQuizStarted(false);
    setTimeLeft(900);
  };

  const handleSwitchQuiz = (q: QuizItem) => {
    setActiveQuiz(q);
    handleReset();
  };

  return (
    <SiteShell
      title="Interactive Quiz Engine"
      description={`Subject self-assessments & timed mock quizzes for Class ${session?.grade || "11th"}`}
    >
      <div className="space-y-6">
        
        {/* QUIZ BANNER */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-600/30">
          <div className="space-y-2">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-indigo-200">
              {activeQuiz.subject} MCQ Quiz
            </span>
            <h2 className="text-2xl md:text-3xl font-black">{activeQuiz.topic}</h2>
            <p className="text-xs text-indigo-100">{activeQuiz.totalQuestions} Questions • {activeQuiz.durationMinutes} Mins Duration</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/20">
              <Clock className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-[10px] font-bold text-indigo-200 uppercase">Timer Status</p>
                <p className="text-xl font-mono font-black text-white">{isQuizStarted ? timeFormatted : "Not Started"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SUBJECT FILTERS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSubjectFilter("All")}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              selectedSubjectFilter === "All"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            All Subjects ({availableQuizzes.length})
          </button>
          {subjectsInQuizzes.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubjectFilter(sub)}
              className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                selectedSubjectFilter === sub
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* QUIZ SWITCHER HORIZONTAL CAROUSEL */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filteredQuizList.map((quiz) => (
            <button
              key={quiz.id}
              onClick={() => handleSwitchQuiz(quiz)}
              className={`shrink-0 rounded-2xl p-4 text-left transition w-64 border ${
                activeQuiz.id === quiz.id
                  ? "bg-slate-900 text-white border-slate-800 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="rounded-full bg-indigo-500/20 text-indigo-400 px-2 py-0.5 text-[10px] font-bold">
                {quiz.subject}
              </span>
              <p className="font-bold text-xs mt-2 truncate">{quiz.topic}</p>
              <p className="text-[10px] text-slate-400 mt-1">{quiz.totalQuestions} Questions • {quiz.durationMinutes} Mins</p>
            </button>
          ))}
        </div>

        {/* START COVER SCREEN VS QUIZ PLAYER */}
        {!isQuizStarted ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-12 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            
            <div>
              <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {activeQuiz.subject} Official Assessment
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{activeQuiz.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Chapter topic: <strong>{activeQuiz.topic}</strong>. Review rules below before starting your timer.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Questions</p>
                <p className="text-base font-black text-slate-800 dark:text-slate-200">{activeQuiz.totalQuestions}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Time Limit</p>
                <p className="text-base font-black text-slate-800 dark:text-slate-200">{activeQuiz.durationMinutes} Mins</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">All Questions</p>
                <p className="text-base font-black text-emerald-600">Mandatory</p>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.01]"
            >
              <Play className="h-5 w-5 fill-current" /> Start Quiz Test Now
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            
            {/* Left Question Player */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 text-xs font-bold">
                  Question {currentQuestion + 1} of {activeQuiz.totalQuestions}
                </span>
                <span className="text-xs font-semibold text-slate-400">Topic: {activeQuiz.topic}</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / activeQuiz.totalQuestions) * 100}%` }}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug">{currentQ.question}</h3>

                <div className="grid gap-3 pt-2">
                  {currentQ.options.map((opt, optionIdx) => {
                    const isSelected = selectedAnswers[currentQuestion] === optionIdx;
                    const isCorrect = currentQ.correctIndex === optionIdx;

                    let btnStyle = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
                    if (isSelected) btnStyle = "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold ring-2 ring-indigo-600";
                    if (submitted) {
                      if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold";
                      else if (isSelected && !isCorrect) btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold";
                    }

                    return (
                      <button
                        key={optionIdx}
                        onClick={() => handleOptionSelect(optionIdx)}
                        disabled={submitted}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-xs font-semibold transition ${btnStyle}`}
                      >
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 dark:border-slate-700 text-slate-500"}`}>
                          {String.fromCharCode(65 + optionIdx)}
                        </div>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Correct Answer & Explanation:</p>
                      <p className="mt-0.5">{currentQ.explanation}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQuestion < activeQuiz.totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    Next Question
                  </button>
                ) : !submitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retake Test
                  </button>
                )}
              </div>
            </div>

            {/* Right Score Summary */}
            <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Performance Summary
              </h3>

              {submitted && scoreResult ? (
                <div className="space-y-4">
                  <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center shadow-lg">
                    <Award className="h-10 w-10 mx-auto mb-2 text-amber-300" />
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Final Score</p>
                    <p className="text-3xl font-black mt-1">{scoreResult.score} / {scoreResult.total}</p>
                    <span className="inline-block mt-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                      {scoreResult.accuracy}% Accuracy Rate
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400">Correct Answers:</span>
                      <span className="font-bold text-emerald-600">{scoreResult.score}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400">Incorrect Answers:</span>
                      <span className="font-bold text-rose-600">{scoreResult.total - scoreResult.score}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Clock className="h-10 w-10 text-indigo-400 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Timer Running</p>
                  <p className="text-xs text-slate-400">Select answers for all questions and submit when complete.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </SiteShell>
  );
}
