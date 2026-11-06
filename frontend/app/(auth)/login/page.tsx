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
import { GraduationCap, CheckCircle2, AlertCircle, ShieldCheck, User, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Only same-site paths like "/courses/…" are allowed; blocks "//host" and backslash open-redirect tricks.
  const [nextParam] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("next");
    return raw && /^\/(?!\/)/.test(raw) && !raw.includes("\\") ? raw : null;
  });

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  async function performLogin(targetEmail: string, targetPass: string) {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Check if account was deleted locally
    if (isAccountDeleted(targetEmail)) {
      setErrorMsg("🚫 This account has been permanently deleted. Access is revoked and you cannot log into this account again. Please register a new account.");
      setLoading(false);
      return;
    }

    try {
      // Send REAL HTTP POST request to Express & MongoDB backend
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass })
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
        email: data.user?.email ?? targetEmail,
        username: data.user?.username ?? targetEmail.split("@")[0],
        name: data.user?.username ?? targetEmail.split("@")[0],
        role: serverRole as StudentSession["role"],
        isAdmin: isAdmin,
        grade: (data.user?.grade ?? "11th") as StudentSession["grade"],
        stream: (data.user?.stream ?? "Medical") as StudentSession["stream"],
        avatar: data.user?.avatar ?? ""
      };

      saveSession(userSession);
      setSuccessMsg(`Login verified! Welcome back, ${userSession.name || "Student"}.`);

      setTimeout(() => {
        if (serverRole === "superAdmin") router.push("/super-admin");
        else if (serverRole === "admin") router.push("/admin");
        else if (isTeacher) router.push("/teacher");
        else router.push(nextParam ?? "/dashboard");
      }, 500);
    } catch {
      setErrorMsg("⚠️ Unable to reach the authentication server. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await performLogin(email.trim(), password);
  }

  return (
    <div className="grid min-h-[calc(100vh-80px)] w-full grid-cols-1 lg:grid-cols-2 items-center justify-center gap-6 p-4 sm:p-6 md:p-12">
      
      {/* Left Marketing Box */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            StudyMaterial Portal Access
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-md">
            Sign in to access your synchronized learning history, downloaded PDF notes, MCQ test results, and live classroom streams.
          </p>
        </div>

        {/* Feature List */}
        <div className="my-8 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-medium text-white">Full access to 10th, 11th & 12th Board Notes and Solved Papers</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
            <p className="text-xs font-medium text-white">Interactive MCQ test engine with instant score report</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Instructor & Admin Consoles for curriculum and course management</p>
          </div>
        </div>
      </div>

      {/* Right Login Card */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/90 p-4 sm:p-6 shadow-glass backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 mb-1 text-xs font-bold">MongoDB Authenticated</Badge>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-950">Login to Account</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">Enter your credentials or choose a 1-click demo role below.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Demo Fill Buttons */}
          <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              ⚡ 1-Click Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("student@studymaterial.com", "Student@12345")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-center text-[11px] font-bold text-slate-700 shadow-xs hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition"
              >
                <User className="mb-1 h-3.5 w-3.5 text-blue-500" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("instructor@studymaterial.com", "Teacher@12345")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-center text-[11px] font-bold text-slate-700 shadow-xs hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition"
              >
                <GraduationCap className="mb-1 h-3.5 w-3.5 text-indigo-500" />
                <span>Instructor</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin@studymaterial.com", "Admin@12345")}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-center text-[11px] font-bold text-slate-700 shadow-xs hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-600 transition"
              >
                <ShieldCheck className="mb-1 h-3.5 w-3.5 text-amber-500" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold text-slate-800 text-xs sm:text-sm">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="font-bold text-slate-800 text-xs sm:text-sm">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm"
              />
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
