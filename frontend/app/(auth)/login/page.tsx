"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveSession, type StudentSession } from "@/lib/session";
import { GraduationCap, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "student@studymaterial.edu");

    const userSession: StudentSession = {
      id: `usr-${Date.now()}`,
      name: email.split("@")[0].toUpperCase() || "Muzamil Ahmad",
      email: email,
      role: email.includes("admin") ? "admin" : "student",
      isAdmin: email.includes("admin"),
      grade: "11th",
      stream: "Medical",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Student - 11th Medical Stream"
    };

    saveSession(userSession);
    if (typeof window !== "undefined") {
      localStorage.setItem("study-material-token", "demo-jwt-token-12345");
    }

    setTimeout(() => {
      setLoading(false);
      router.push(userSession.isAdmin ? "/admin" : "/dashboard");
    }, 400);
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 p-4 lg:grid-cols-2 lg:p-8">
      {/* Left Infographic Card */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-md mb-6">
          <GraduationCap className="h-8 w-8 text-orange-400" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">STUDY MATERIAL PLATFORM</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Student & Faculty Sign In</h1>
        <p className="mt-4 text-sm leading-relaxed text-blue-100/90">
          Access your class-specific notes, previous year board papers, video lectures, MCQ quizzes, result analytics, and progress tracking.
        </p>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Class-wise isolation (10th, 11th & 12th Streams)</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Direct PDF Downloads & Progress sync</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Instant Quiz timer & Result performance score</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
          <span>Role: Student / Admin</span>
          <span>Apple-level UI / Ultra HD 4K</span>
        </div>
      </div>

      {/* Right Login Card */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-4 shadow-glass backdrop-blur-xl md:p-6">
        <CardHeader className="space-y-1">
          <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 mb-1">Step 1: Student Authentication</Badge>
          <CardTitle className="text-2xl font-bold text-slate-950">Login / Registration</CardTitle>
          <CardDescription className="text-sm text-slate-600">Enter email and password to access your student dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-semibold text-slate-800">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue="student@studymaterial.edu" placeholder="student@example.com" required className="rounded-xl border-slate-200 h-11" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="font-semibold text-slate-800">Password</Label>
              <Input id="password" name="password" type="password" defaultValue="password123" placeholder="Enter password" required className="rounded-xl border-slate-200 h-11" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                Remember Me
              </label>
              <Link href="/forgot-password" className="font-semibold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-premium" type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Login Button"}
              </Button>
              <Link
                href="/register"
                className="inline-flex flex-1 h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Register Button
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 text-center text-xs text-slate-500 border border-slate-100">
              <p>Demo Admin Login: <span className="font-bold text-slate-700">admin@studymaterial.edu</span></p>
            </div>

            {message ? <p className="text-sm font-medium text-emerald-600 text-center">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
