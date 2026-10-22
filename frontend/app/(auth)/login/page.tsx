"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiUrl } from "@/lib/api";
import { saveSession, isAccountDeleted, type StudentSession } from "@/lib/session";
import { GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Only same-site paths like "/courses/…" are allowed; blocks "//host" and backslash open-redirect tricks.
  const [nextParam] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("next");
    return raw && /^\/(?!\/)/.test(raw) && !raw.includes("\\") ? raw : null;
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    // Check if account was deleted locally
    if (isAccountDeleted(email)) {
      setErrorMsg("🚫 This account has been permanently deleted. Access is revoked and you cannot log into this account again. Please register a new account.");
      setLoading(false);
      return;
    }

    try {
      // Send REAL HTTP POST request to Express & MongoDB backend
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message ?? "Invalid email or password. Please register if you don't have an account.");
        setLoading(false);
        return;
      }

      // Save token and user session returned from MongoDB
      if (data.token) {
        localStorage.setItem("study-material-token", data.token);
      }

      const serverRole = (data.user?.role ?? "student") as string;
      const isAdmin = serverRole === "admin" || serverRole === "superAdmin";
      const isTeacher = serverRole === "teacher";

      const userSession: StudentSession = {
        id: data.user?.id ?? `usr-${Date.now()}`,
        username: data.user?.username,
        name: data.user?.username ?? email.split("@")[0],
        email: data.user?.email ?? email,
        role: serverRole as StudentSession["role"],
        isAdmin: serverRole === "superAdmin" || serverRole === "admin",
        grade: data.user?.grade ?? "11th",
        stream: data.user?.stream ?? "Medical",
        avatar: data.user?.avatar ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: isAdmin ? "Platform Administrator" : isTeacher ? "Faculty Educator" : `Student - Class ${data.user?.grade ?? "11th"} (${data.user?.stream ?? "Medical"})`
      };

      saveSession(userSession);
      setSuccessMsg("✅ Authentication successful! Opening portal...");

      setTimeout(() => {
        setLoading(false);
        if (serverRole === "superAdmin") router.push("/super-admin");
        else if (serverRole === "admin") router.push("/admin");
        else if (isTeacher) router.push("/teacher");
        else router.push(nextParam ?? "/dashboard");
      }, 600);
    } catch {
      setErrorMsg("⚠️ Server is currently offline. Please start the backend server and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 p-4 lg:grid-cols-2 lg:p-8 text-slate-900">
      {/* Left Infographic Card */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-8 text-white shadow-2xl relative overflow-hidden hidden sm:block">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-md mb-6">
          <GraduationCap className="h-8 w-8 text-orange-400" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">STUDY MATERIAL PLATFORM</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Student & Faculty Sign In</h1>
        <p className="mt-4 text-sm leading-relaxed text-blue-100/90">
          Access your class-specific notes, previous year board papers, video lectures, MCQ quizzes, result analytics, and progress tracking directly from MongoDB database.
        </p>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Strict MongoDB Authentication (Only Registered Users Can Login)</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Class-wise isolation (10th, 11th & 12th Streams)</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Admin Panel access guarded by strict isAdmin role</p>
          </div>
        </div>
      </div>

      {/* Right Login Card */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/90 p-4 sm:p-6 shadow-glass backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 mb-1 text-xs font-bold">MongoDB Authenticated</Badge>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-950">Login to Account</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">Enter your registered email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold text-slate-800 text-xs sm:text-sm">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="student@studymaterial.com" required className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="font-bold text-slate-800 text-xs sm:text-sm">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm" />
            </div>

            <div className="flex items-center justify-end text-xs sm:text-sm">
              <Link href="/forgot-password" className="font-bold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-premium" type="submit" disabled={loading}>
                {loading ? "Authenticating..." : "Login to Account"}
              </Button>
              <Link
                href={nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : "/register"}
                className="inline-flex flex-1 h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-xs sm:text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Register Account
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 text-center text-xs text-slate-500 border border-slate-100">
              <p>
                Want to teach?{" "}
                <Link href="/instructor/register" className="font-bold text-blue-600 hover:underline">
                  Apply as an instructor
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
