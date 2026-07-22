"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getStoredSession, type StudentSession } from "@/lib/session";
import { fetchBackendQuizzes, recordQuizResult } from "@/lib/store";
import { type QuizItem } from "@/lib/platform-data";
import { Clock, Award, RefreshCw, AlertCircle, CheckCircle2, BookOpen } from "lucide-react";

export default function QuizzesPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15:00 timer
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; accuracy: number } | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);

    const grade = s?.grade ?? "11th";
    const stream = s?.stream ?? "Medical";

    // Get quizzes for this class and stream from backend
    fetchBackendQuizzes(grade, stream).then((classQ) => {
      setAvailableQuizzes(classQ);
      if (classQ.length > 0) {
        setActiveQuiz(classQ[0]);
      }
    });
  }, []);

  // Timer countdown
  useEffect(() => {
    if (submitted || !activeQuiz) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, activeQuiz]);

  if (!activeQuiz) {
    return (
      <div className="py-20 text-center space-y-3">
        <Clock className="h-12 w-12 text-indigo-400 mx-auto animate-pulse" />
        <h3 className="text-xl font-bold text-slate-900">Loading Quizzes...</h3>
        <p className="text-xs text-slate-500">Auto-generating class-wise topic quizzes...</p>
      </div>
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
    setTimeLeft(900);
  };

  const handleSwitchQuiz = (q: QuizItem) => {
    setActiveQuiz(q);
    handleReset();
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-purple-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-1.5 text-xs font-bold">Class-Wise MCQ Quiz Arena</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold">{activeQuiz.subject} MCQ Quiz – {activeQuiz.topic}</h2>
            <p className="mt-1 text-xs md:text-sm text-indigo-100/90 max-w-2xl">
              Class {session?.grade ?? "11th"} ({session?.stream ?? "Medical"}) Auto-Generated & Faculty Tests ({availableQuizzes.length} Quizzes Available).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
              <Clock className="h-5 w-5 text-orange-400 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-200">Timer Remaining</p>
                <p className="text-lg md:text-xl font-extrabold font-mono text-white">{timeFormatted}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSubjectFilter("All")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
            selectedSubjectFilter === "All" ? "bg-indigo-600 text-white" : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          All Subjects ({availableQuizzes.length})
        </button>
        {subjectsInQuizzes.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubjectFilter(sub)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
              selectedSubjectFilter === sub ? "bg-indigo-600 text-white" : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {sub} ({availableQuizzes.filter(q => q.subject === sub).length})
          </button>
        ))}
      </div>

      {/* Topic Quizzes Selector Grid */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filteredQuizList.map((quiz) => (
          <button
            key={quiz.id}
            onClick={() => handleSwitchQuiz(quiz)}
            className={`rounded-2xl p-3 text-left transition shrink-0 w-60 border ${
              activeQuiz.id === quiz.id
                ? "bg-slate-950 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-900 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Badge className={activeQuiz.id === quiz.id ? "bg-orange-500 text-white text-[10px] mb-1" : "bg-blue-100 text-blue-700 text-[10px] mb-1"}>
              {quiz.subject}
            </Badge>
            <p className="font-bold text-xs truncate">{quiz.topic}</p>
            <p className={`text-[10px] mt-0.5 ${activeQuiz.id === quiz.id ? "text-slate-300" : "text-slate-500"}`}>5 MCQs • 15 Mins</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Quiz Question Player */}
        <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <Badge className="bg-indigo-100 text-indigo-700 font-bold text-xs">Question {currentQuestion + 1} of {activeQuiz.totalQuestions}</Badge>
            <span className="text-xs font-bold text-slate-500">Topic: {activeQuiz.topic}</span>
          </div>

          <Progress value={((currentQuestion + 1) / activeQuiz.totalQuestions) * 100} className="h-2 rounded-full" />

          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">{currentQ.question}</h3>

            <div className="grid gap-3 pt-2">
              {currentQ.options.map((opt, optionIdx) => {
                const isSelected = selectedAnswers[currentQuestion] === optionIdx;
                const isCorrect = currentQ.correctIndex === optionIdx;

                let btnStyle = "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100";
                if (isSelected) btnStyle = "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-600";
                if (submitted) {
                  if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                  else if (isSelected && !isCorrect) btnStyle = "border-rose-500 bg-rose-50 text-rose-900 font-bold";
                }

                return (
                  <button
                    key={optionIdx}
                    onClick={() => handleOptionSelect(optionIdx)}
                    disabled={submitted}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left text-xs font-medium transition ${btnStyle}`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-500"}`}>
                      {String.fromCharCode(65 + optionIdx)}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="rounded-2xl bg-indigo-50 p-4 text-xs text-indigo-900 border border-indigo-100 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Explanation:</p>
                  <p className="mt-0.5 text-indigo-800">{currentQ.explanation}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              variant="outline"
              className="rounded-xl text-xs"
            >
              Previous Question
            </Button>

            {currentQuestion < activeQuiz.totalQuestions - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Next Question
              </Button>
            ) : !submitted ? (
              <Button
                onClick={handleSubmitQuiz}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
              >
                Submit Result
              </Button>
            ) : (
              <Button onClick={handleReset} variant="outline" className="rounded-xl text-xs">
                <RefreshCw className="mr-1.5 h-4 w-4" /> Retake Quiz
              </Button>
            )}
          </div>
        </Card>

        {/* Right Score Panel */}
        <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Score & Performance Summary</h3>

            {submitted && scoreResult ? (
              <div className="space-y-4 pt-4">
                <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white text-center shadow-lg">
                  <Award className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
                  <p className="text-xs uppercase tracking-wider text-emerald-100 font-bold">Your Score</p>
                  <p className="text-3xl font-extrabold mt-1">{scoreResult.score} / {scoreResult.total}</p>
                  <Badge className="bg-white/20 text-white mt-2 font-bold text-xs">{scoreResult.accuracy}% Accuracy Rate</Badge>
                </div>

                <div className="grid gap-2 text-xs font-semibold">
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-500">Correct Answers:</span>
                    <span className="text-emerald-600 font-bold">{scoreResult.score}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-500">Incorrect Answers:</span>
                    <span className="text-rose-600 font-bold">{scoreResult.total - scoreResult.score}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-blue-600 font-bold">{scoreResult.accuracy >= 60 ? "PASSED" : "PRACTICE REQUIRED"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Clock className="h-10 w-10 text-indigo-400 mx-auto animate-pulse" />
                <p className="text-sm font-bold text-slate-800">Quiz in progress</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Select your answers for all questions in <span className="font-bold text-slate-700">{activeQuiz.topic}</span> and submit.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs text-slate-500">
            <p className="font-bold text-slate-800">Class Quiz Engine:</p>
            <p className="mt-0.5">{availableQuizzes.length} Topic Quizzes Auto-Generated for Class {session?.grade ?? "11th"}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
