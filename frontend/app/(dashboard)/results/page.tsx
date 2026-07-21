"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getQuizResults, type QuizResultRecord } from "@/lib/store";
import { BarChart3, Award, CheckCircle2, TrendingUp, NotebookTabs } from "lucide-react";

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResultRecord[]>([]);

  useEffect(() => {
    setResults(getQuizResults());
  }, []);

  const totalScoreSum = results.reduce((acc, r) => acc + r.score, 0);
  const totalQuestionsSum = results.reduce((acc, r) => acc + r.totalQuestions, 0);
  const avgAccuracy = results.length > 0 ? Math.round((totalScoreSum / totalQuestionsSum) * 100) : 85;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-cyan-600 via-blue-600 to-slate-900 p-6 md:p-8 text-white shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-2">Performance Analytics</Badge>
            <h2 className="text-3xl font-extrabold">Quiz Results & Overall Performance</h2>
            <p className="mt-1 text-sm text-cyan-100/90 max-w-2xl">
              Detailed assessment analytics, accuracy stats, and subject performance metrics.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-md">
            <p className="text-xs uppercase tracking-wider text-cyan-200 font-bold">Average Score</p>
            <p className="text-3xl font-extrabold text-white mt-1">{avgAccuracy}%</p>
          </div>
        </div>
      </div>

      {/* Performance Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <NotebookTabs className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Quizzes Completed</p>
              <p className="text-2xl font-extrabold text-slate-900">{results.length} Tests</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Questions Correct</p>
              <p className="text-2xl font-extrabold text-slate-900">{totalScoreSum} / {totalQuestionsSum}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Overall Accuracy</p>
              <p className="text-2xl font-extrabold text-cyan-600">{avgAccuracy}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Results History List */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Completed Quiz Results</h3>

        <div className="space-y-3">
          {results.map((res) => (
            <div key={res.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 hover:bg-white transition">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-100 text-blue-700 font-bold">{res.subject}</Badge>
                  <span className="text-xs text-slate-500 font-medium">{res.grade} ({res.stream})</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{res.quizTitle}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Completed on: {res.completedAt}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900">{res.score} / {res.totalQuestions}</p>
                  <p className="text-xs text-slate-500">Correct Answers</p>
                </div>

                <div className="w-24 text-right">
                  <Badge className={res.accuracy >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}>
                    {res.accuracy}% Accuracy
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
