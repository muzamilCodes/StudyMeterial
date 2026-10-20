"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiUrl } from "@/lib/api";
import { saveSession, type StudentSession } from "@/lib/session";
import { enrollInCourse, fetchCourseDetail } from "@/lib/store";
import { GraduationCap, CheckCircle2, AlertCircle, Mail, Loader2 } from "lucide-react";
import { type Grade, type Stream } from "@/lib/platform-data";

export default function RegisterPage() {
  const router = useRouter();
  // Only same-site paths like "/courses/…" are allowed; blocks "//host" and backslash open-redirect tricks.
  const [nextParam] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("next");
    return raw && /^\/(?!\/)/.test(raw) && !raw.includes("\\") ? raw : null;
  });
  const [grade, setGrade] = useState<Grade>("11th");
  const [stream, setStream] = useState<Stream>("Medical");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpChannels, setOtpChannels] = useState<string[]>([]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  async function handleSendOtp() {
    setErrorMsg(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Enter a valid email address first.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Enter a valid phone number (it can only be used for one account).");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(apiUrl("/api/auth/send-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: phone.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message ?? "Could not send the verification code.");
        setSendingOtp(false);
        return;
      }
      setOtpSent(true);
      setOtpChannels(data.channels ?? []);
      setResendIn(60);
    } catch {
      setErrorMsg("Network error while sending the code. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otpSent) {
      setErrorMsg("Please verify your email first by sending a code.");
      return;
    }
    if (otp.trim().length < 4) {
      setErrorMsg("Enter the verification code you received.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password,
          grade,
          stream: grade === "10th" ? "General" : stream,
          otp: otp.trim(),
          phone: phone.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message ?? "Registration failed. Please check your details and try again.");
        setLoading(false);
        return;
      }

      if (data.token) localStorage.setItem("study-material-token", data.token);

      const userSession: StudentSession = {
        id: data.user?.id ?? `usr-${Date.now()}`,
        username: data.user?.username ?? name,
        name: data.user?.username ?? name,
        email: data.user?.email ?? email,
        role: data.user?.role ?? "student",
        isAdmin: false,
        grade,
        stream: grade === "10th" ? "General" : stream,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: `Enrolled Student - Class ${grade} (${stream})`
      };

      saveSession(userSession);

      let message = nextParam
        ? "Email verified and account created! Opening your lesson..."
        : "Email verified and account created! Redirecting to your dashboard...";

      // Came from a specific course/lecture → auto-enroll when the course is free, then return there.
      const courseMatch = nextParam?.match(/^\/courses\/([a-f0-9]{24})(?:[?/]|$)/i);
      if (courseMatch) {
        const { detail } = await fetchCourseDetail(courseMatch[1]);
        if (detail && detail.price === 0) {
          message = "Account created! Enrolling you in the course...";
          const res = await enrollInCourse(courseMatch[1]);
          message = res.ok
            ? "Account created and you're enrolled! Opening your lesson..."
            : "Email verified and account created! Opening the course...";
        } else if (detail && detail.price > 0) {
          message = "Account created! Complete the enrollment on the course page to continue.";
        }
      }
      setSuccessMsg(message);

      setTimeout(() => {
        setLoading(false);
        router.push(nextParam ?? "/dashboard");
      }, 1000);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 p-4 lg:grid-cols-2 lg:p-8 text-slate-900">
      {/* Left Details Card */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-8 text-white shadow-2xl relative overflow-hidden hidden sm:block">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-md mb-6">
          <GraduationCap className="h-8 w-8 text-orange-400" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">JOIN PLATFORM</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Student Registration</h1>
        <p className="mt-4 text-sm leading-relaxed text-blue-100/90">
          Create your account to unlock class-wise study materials, PDF notes, previous board papers, MCQ quizzes, and progress analytics.
        </p>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Email OTP Verification (No Fake Accounts)</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Secure Account &amp; Data Protection</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Mobile Responsive &amp; Tablet Ready UI</p>
          </div>
        </div>
      </div>

      {/* Right Register Card */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/90 p-4 sm:p-6 shadow-glass backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <Badge className="w-fit bg-orange-100 text-orange-700 hover:bg-orange-100 mb-1 text-xs font-bold">Free Registration</Badge>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-950">Student Registration</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">Verify your email with a one-time code, then set up your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold text-slate-800 text-xs sm:text-sm">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="Muzamil Ahmad" required className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm" />
            </div>

            {/* Email + Send OTP */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold text-slate-800 text-xs sm:text-sm">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  value={email}
                  disabled={otpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl border-slate-200 h-11 text-xs sm:text-sm disabled:opacity-60"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || (otpSent && resendIn > 0)}
                  className="h-11 shrink-0 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm font-bold px-4 disabled:opacity-60"
                >
                  {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? (resendIn > 0 ? `${resendIn}s` : "Resend") : "Send Code"}
                </Button>
              </div>
            </div>

            {/* Phone number — required, one account per number */}
            <div className="grid gap-2">
              <Label htmlFor="phone" className="font-bold text-slate-800 text-xs sm:text-sm">
                Phone Number <span className="font-normal text-slate-400">(required — one account per number, OTP can also be sent here if WhatsApp is enabled)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 90000 00000"
                required
                value={phone}
                disabled={otpSent}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm disabled:opacity-60"
              />
            </div>

            {/* OTP input (after sent) */}
            {otpSent && (
              <div className="grid gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                <Label htmlFor="otp" className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Enter verification code
                </Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="6-digit code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="rounded-xl border-slate-200 h-11 text-sm font-bold tracking-[0.4em] text-center"
                />
                <p className="text-[11px] text-slate-500">
                  Sent via {otpChannels.join(" and ") || "email"}. Code expires in 10 minutes.
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-bold text-slate-800 text-xs sm:text-sm">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="font-bold text-slate-800 text-xs sm:text-sm">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs sm:text-sm">Select Class</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="10th">10th Class</option>
                  <option value="11th">11th Class</option>
                  <option value="12th">12th Class</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label className="font-bold text-slate-800 text-xs sm:text-sm">Select Stream</Label>
                <select
                  value={stream}
                  disabled={grade === "10th"}
                  onChange={(e) => setStream(e.target.value as Stream)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  {grade === "10th" ? (
                    <option value="General">General (All Subjects)</option>
                  ) : (
                    <>
                      <option value="Medical">Medical (Bio, Phys, Chem, Eng)</option>
                      <option value="Non-Medical">Non-Medical (Phys, Chem, Math, Eng)</option>
                      <option value="Commerce">Commerce (Acc, BSt, Eco, Eng)</option>
                      <option value="Arts">Arts (Hist, PolSci, Soc/Geo, Eng)</option>
                    </>
                  )}
                </select>
              </div>
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

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-premium" type="submit" disabled={loading || !otpSent}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
              <Link
                href={nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}
                className="inline-flex flex-1 h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-xs sm:text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Login Page
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
