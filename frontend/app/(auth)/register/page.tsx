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
import { type Grade, type Stream } from "@/lib/platform-data";

export default function RegisterPage() {
  const router = useRouter();
  const [grade, setGrade] = useState<Grade>("11th");
  const [stream, setStream] = useState<Stream>("Medical");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "Student User");
    const email = String(formData.get("email") ?? "student@example.com");

    const session: StudentSession = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: "student",
      grade,
      stream: grade === "10th" ? "General" : stream,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: `Enrolled Student - Class ${grade} (${stream})`
    };

    saveSession(session);

    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 400);
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 p-4 lg:grid-cols-2 lg:p-8">
      {/* Left Details Card */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-md mb-6">
          <GraduationCap className="h-8 w-8 text-orange-400" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">JOIN PLATFORM</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Student Registration</h1>
        <p className="mt-4 text-sm leading-relaxed text-blue-100/90">
          Create your account to unlock class-wise study materials, PDF notes, previous year board papers, MCQ quizzes, and progress analytics.
        </p>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Select Class (10th, 11th, 12th)</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Select Stream (Medical, Non-Medical, Commerce, Arts)</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-xs font-medium text-white">Class-wise dashboard & isolated subjects load</p>
          </div>
        </div>
      </div>

      {/* Right Register Card */}
      <Card className="rounded-[2.5rem] border-white/60 bg-white/80 p-4 shadow-glass backdrop-blur-xl md:p-6">
        <CardHeader className="space-y-1">
          <Badge className="w-fit bg-orange-100 text-orange-700 hover:bg-orange-100 mb-1">New Account</Badge>
          <CardTitle className="text-2xl font-bold text-slate-950">Student Registration</CardTitle>
          <CardDescription className="text-sm text-slate-600">Enter your details, choose class and stream.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-semibold text-slate-800">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="Muzamil Ahmad" required className="rounded-xl border-slate-200 h-11" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="font-semibold text-slate-800">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="student@studymaterial.edu" required className="rounded-xl border-slate-200 h-11" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-semibold text-slate-800">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required className="rounded-xl border-slate-200 h-11" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="font-semibold text-slate-800">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required className="rounded-xl border-slate-200 h-11" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="font-semibold text-slate-800">Select Class</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="10th">10th Class</option>
                  <option value="11th">11th Class</option>
                  <option value="12th">12th Class</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold text-slate-800">Select Stream</Label>
                <select
                  value={stream}
                  disabled={grade === "10th"}
                  onChange={(e) => setStream(e.target.value as Stream)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
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

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-premium" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Register Button"}
              </Button>
              <Link
                href="/login"
                className="inline-flex flex-1 h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Login Button
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
