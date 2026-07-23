"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  NotebookTabs, 
  Download, 
  Video, 
  Award, 
  CheckCircle2,
  Users,
  ShieldCheck,
  Flame,
  Clock,
  Trophy,
  Check,
  X,
  Compass,
  Star,
  Search
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicShell } from "@/components/public-shell";
import { gradeConfig, classSubjects, Grade, Stream } from "@/lib/platform-data";

// Daily questions for the streak hook
const dailyQuestions = [
  {
    subject: "Chemistry",
    question: "Which of the following non-metals remains in liquid state at room temperature?",
    options: ["Phosphorus", "Bromine", "Chlorine", "Helium"],
    correct: 1,
    explanation: "Bromine is the only non-metallic element that exists as a liquid at standard temperature and pressure."
  },
  {
    subject: "Physics",
    question: "The value of acceleration due to gravity (g) is maximum at which point of Earth?",
    options: ["The Equator", "The Poles", "Center of Earth", "Mount Everest summit"],
    correct: 1,
    explanation: "Acceleration due to gravity is maximum at the poles because the polar radius of the Earth is slightly smaller than the equatorial radius."
  }
];

// Leaderboard Top Scores
const topStudents = [
  { rank: 1, name: "Rohit K. (Class 12)", points: 1420, stream: "Non-Medical" },
  { rank: 2, name: "Neha S. (Class 12)", points: 1380, stream: "Medical" },
  { rank: 3, name: "Amit V. (Class 11)", points: 1250, stream: "Commerce" },
  { rank: 4, name: "Priyanjali R. (Class 11)", points: 1190, stream: "Commerce" }
];

export default function UniqueAnimatedHomePage() {
  // Class & Stream selection state
  const [selectedGrade, setSelectedGrade] = useState<Grade>("11th");
  const [selectedStream, setSelectedStream] = useState<Stream>("Medical");

  // Streak hooks stored in localStorage
  const [streak, setStreak] = useState(0);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Board Exam Countdown
  const [daysLeft, setDaysLeft] = useState(220);

  useEffect(() => {
    // 1. Calculate Countdown Days (Target March 1, 2027)
    const targetDate = new Date("2027-03-01T00:00:00");
    const diff = targetDate.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) setDaysLeft(days);

    // 2. Load Streak from localstorage
    if (typeof window !== "undefined") {
      const savedStreak = localStorage.getItem("study_streak");
      const answeredToday = localStorage.getItem("answered_today");
      
      if (savedStreak) setStreak(parseInt(savedStreak, 10));
      if (answeredToday === new Date().toDateString()) {
        setHasAnsweredToday(true);
        const savedCorrect = localStorage.getItem("last_correct") === "true";
        const savedOpt = localStorage.getItem("last_opt");
        setIsCorrect(savedCorrect);
        if (savedOpt !== null) setSelectedOpt(parseInt(savedOpt, 10));
        setShowExplanation(true);
      }
      
      setQuestionIndex(new Date().getDate() % dailyQuestions.length);
    }
  }, []);

  const handleStreakSubmit = (optIndex: number) => {
    if (hasAnsweredToday) return;

    setSelectedOpt(optIndex);
    const correctOpt = dailyQuestions[questionIndex].correct;
    const answerCorrect = optIndex === correctOpt;
    
    setIsCorrect(answerCorrect);
    setShowExplanation(true);
    setHasAnsweredToday(true);

    let newStreak = streak;
    if (answerCorrect) {
      newStreak = streak + 1;
      setStreak(newStreak);
    } else {
      newStreak = 0;
      setStreak(0);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("study_streak", newStreak.toString());
      localStorage.setItem("answered_today", new Date().toDateString());
      localStorage.setItem("last_correct", answerCorrect.toString());
      localStorage.setItem("last_opt", optIndex.toString());
    }
  };

  // Subject filtering
  const availableStreams = gradeConfig[selectedGrade]?.streams || [];
  const currentStream = availableStreams.includes(selectedStream) ? selectedStream : (availableStreams[0] || "General");
  const subjects = classSubjects[selectedGrade]?.[currentStream] || [];
  const currentQ = dailyQuestions[questionIndex];

  return (
    <PublicShell>
      <div className="relative overflow-hidden min-h-screen bg-slate-50/40">
        
        {/* Animated Glow Particles */}
        <div className="absolute top-[-10%] left-[-15%] w-[650px] h-[650px] rounded-full bg-blue-500/15 blur-[140px] animate-pulse-glow pointer-events-none" />
        <div className="absolute top-[35%] right-[-15%] w-[750px] h-[750px] rounded-full bg-orange-500/10 blur-[170px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

        <div className="page-shell px-6 py-12 md:px-8 md:py-20 space-y-36 max-w-[1400px] relative z-10">
          
          {/* HERO SECTION WITH DUAL 3D IMAGE COLLAGE & FLOATING BADGES */}
          <section className="grid lg:grid-cols-12 gap-12 items-center pt-4">
            <div className="lg:col-span-7 space-y-8 text-left">
              
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-white/80 px-4.5 py-2 shadow-sm backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">Class 10, 11 & 12 Educational Portal</span>
              </div>

              <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl text-slate-900 leading-[1.1]">
                Master Board Exams <br />
                With <span className="shimmer-text">Class-Isolated Notes</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-semibold max-w-2xl">
                Access comprehensive handwritten PDF notes, 5-year solved board papers, video lectures, and daily streak tests. Custom-isolated for Medical, Non-Medical, Commerce, and Arts.
              </p>

              {/* Countdown Alert Widget */}
              <div className="flex items-center gap-4 bg-white/90 border border-orange-200/80 rounded-2xl p-4 max-w-lg shadow-md backdrop-blur-md">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                  <Clock className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest">2027 CBSE Board Exams</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">Only <span className="text-orange-500 text-lg font-black">{daysLeft} Days</span> Remaining! Start Practicing Today.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/dashboard">
                  <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-500/25 flex items-center gap-3 text-base transition-all hover:scale-[1.03]">
                    Explore Student App <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-slate-700 font-extrabold hover:bg-white text-base shadow-sm">
                    Student Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* DUAL 3D FLOATING IMAGE COLLAGE */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              
              {/* Primary 3D Student Illustration */}
              <div className="relative rounded-[2.5rem] border border-white bg-white/60 p-3 shadow-2xl backdrop-blur-md animate-float-slow">
                <img 
                  src="/hero_student.png" 
                  alt="3D Student Learning" 
                  className="rounded-[2rem] w-full h-auto object-cover border border-slate-100 shadow-md"
                />
              </div>

              {/* Floating Badge 1: Dashboard Preview */}
              <div className="absolute top-[-10%] right-[-5%] w-48 sm:w-56 rounded-2xl border border-white/80 bg-white/90 p-2.5 shadow-2xl backdrop-blur-md animate-float-reverse hidden sm:block">
                <img 
                  src="/dashboard_graphic.png" 
                  alt="Dashboard Preview" 
                  className="rounded-xl w-full h-24 object-cover border border-slate-100"
                />
                <p className="text-[10px] font-black text-slate-800 text-center mt-2 uppercase tracking-wider">Live Student Workspace</p>
              </div>

              {/* Floating Badge 2: Pass Metric Pill */}
              <div className="absolute bottom-[-5%] left-[-8%] rounded-2xl border border-white/80 bg-white/95 px-5 py-3 shadow-xl backdrop-blur-md flex items-center gap-3 animate-float-slow">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">98.4% Top Score</p>
                  <p className="text-[10px] text-slate-500 font-bold">CBSE Board Exam Toppers</p>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 2: CURATED SYLLABUS & STREAM MATRICES */}
          <section className="space-y-12 relative">
            <div className="text-center space-y-3">
              <Badge className="bg-blue-100 text-blue-700 border-none font-bold px-4 py-1.5 text-xs">Curated Matrix</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Interactive Stream Selector</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium">
                Click your class and stream below to unlock subject resources, handwritten PDF notes, and test metrics.
              </p>
            </div>

            {/* Selector matrix panel */}
            <div className="max-w-4xl mx-auto bg-white/80 border border-slate-200/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
              
              {/* Class Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest min-w-[110px]">Select Class:</span>
                <div className="flex flex-wrap gap-2.5">
                  {(["10th", "11th", "12th"] as Grade[]).map((grade) => (
                    <button
                      key={grade}
                      onClick={() => {
                        setSelectedGrade(grade);
                        const avStreams = gradeConfig[grade]?.streams || [];
                        if (!avStreams.includes(selectedStream)) {
                          setSelectedStream(avStreams[0] || "General");
                        }
                      }}
                      className={`rounded-2xl px-6 py-3 text-xs font-black transition-all duration-300 ${
                        selectedGrade === grade 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {grade} Class
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest min-w-[110px]">Select Stream:</span>
                <div className="flex flex-wrap gap-2.5">
                  {availableStreams.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStream(st)}
                      className={`rounded-2xl px-6 py-3 text-xs font-black transition-all duration-300 ${
                        selectedStream === st 
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto pt-4">
              {subjects.map((sub, idx) => (
                <Card 
                  key={idx} 
                  className="card-3d-effect rounded-[2rem] border-slate-100/90 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 font-bold border-none text-[9px] px-2.5 py-0.5">{selectedGrade} {selectedStream}</Badge>
                    </div>

                    <h3 className="font-extrabold text-slate-800 text-lg">{sub.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">{sub.description || "Comprehensive syllabus topics compiled according to CBSE board."}</p>
                  </div>

                  <div className="pt-5 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span className="flex items-center gap-1.5"><NotebookTabs className="h-4 w-4 text-blue-500" /> 12 Notes</span>
                    <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-orange-500" /> {sub.quizzes || 5} Quizzes</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* SECTION 3: GAMIFIED HOOKS (DAILY STREAK & LEADERBOARD) */}
          <section className="grid md:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Daily Streak Challenge */}
            <div className="md:col-span-7 relative">
              <Card className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(59,130,246,0.06)] space-y-6">
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white animate-pulse">
                      <Flame className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">Daily Streak Challenge</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{currentQ.subject} Practice</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2 text-center flex items-center gap-1.5 shrink-0">
                    <span className="text-orange-500 text-lg">⚡</span>
                    <span className="text-xs font-black text-slate-800">{streak} Day Streak</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                    {currentQ.question}
                  </p>

                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, idx) => {
                      let style = "border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-700";
                      
                      if (hasAnsweredToday) {
                        if (idx === currentQ.correct) {
                          style = "border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold";
                        } else if (selectedOpt === idx) {
                          style = "border-rose-500 bg-rose-50 text-rose-800 font-extrabold";
                        } else {
                          style = "border-slate-100 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasAnsweredToday}
                          onClick={() => handleStreakSubmit(idx)}
                          className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left text-xs sm:text-sm font-bold transition duration-200 ${style}`}
                        >
                          <span>{opt}</span>
                          {hasAnsweredToday && idx === currentQ.correct && <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />}
                          {hasAnsweredToday && selectedOpt === idx && idx !== currentQ.correct && <X className="h-4.5 w-4.5 text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <div className="rounded-2xl bg-slate-50 border p-4 text-xs sm:text-sm text-slate-600 space-y-1.5 animate-in fade-in">
                      <p className="font-extrabold text-slate-800">
                        {isCorrect ? (
                          <span className="text-emerald-600">✓ Correct Answer! (+1 Streak Point)</span>
                        ) : (
                          <span className="text-rose-600">✗ Incorrect. Streak Reset to 0.</span>
                        )}
                      </p>
                      <p className="leading-relaxed font-semibold">{currentQ.explanation}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Weekly Leaderboard */}
            <div className="md:col-span-5 relative">
              <Card className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(249,115,22,0.04)] flex flex-col justify-between min-h-full">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b pb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">Weekly Leaderboard</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Student Rank</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {topStudents.map((stud) => (
                      <div key={stud.rank} className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/40 p-3.5 hover:border-slate-100 transition">
                        <div className="flex items-center gap-3">
                          <span className={`h-7 w-7 rounded-full flex items-center justify-center font-black text-xs ${
                            stud.rank === 1 ? "bg-amber-100 text-amber-700" :
                            stud.rank === 2 ? "bg-slate-200 text-slate-700" :
                            stud.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                          }`}>{stud.rank}</span>
                          <div>
                            <p className="text-xs font-black text-slate-800">{stud.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stud.stream}</p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-blue-600">{stud.points} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Link href="/dashboard">
                    <Button className="w-full h-12 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 flex items-center justify-center gap-2">
                      Join Leaderboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

              </Card>
            </div>
          </section>

          {/* SECTION 4: FEATURE GRAPHICS SHOWCASE WITH 3D IMAGE */}
          <section className="grid lg:grid-cols-12 gap-12 items-center bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-xl">
            <div className="lg:col-span-6 space-y-6">
              <Badge className="bg-orange-100 text-orange-700 border-none font-bold px-4 py-1.5 text-xs">All-In-One Toolkit</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Everything You Need For Board Exams
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                Our learning platform is engineered specifically for secondary board students. Get access to verified question sets, handwritten notes, and instant online practice.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  "Handwritten PDF Notes by expert faculty",
                  "Previous 5-year solved board exam papers",
                  "Interactive chapter MCQ practice tests",
                  "Isolated subject streams (Medical, Non-Medical, Commerce, Arts)"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl animate-float-slow">
                <img 
                  src="/subject_materials.png" 
                  alt="3D Study Materials" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </section>

          {/* SECTION 5: FINAL HIGH-NEON CTA BANNER */}
          <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-950 p-8 md:p-14 text-white text-center shadow-2xl border border-white/10 max-w-5xl mx-auto">
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none animate-pulse-glow" />
            <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Ready to Supercharge Your Preparation?
              </h2>
              <p className="text-sm md:text-base text-blue-100/90 leading-relaxed font-medium">
                Register a free profile today to isolate your target syllabus notes, solved question bundles, timed quizzes, and start tracking results accuracy!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
                <Link href="/login">
                  <Button className="h-13 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02]">
                    Register Free Account
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="h-13 px-8 rounded-xl border-white/20 text-white hover:bg-white/5 font-black">
                    Explore Learning Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </PublicShell>
  );
}
