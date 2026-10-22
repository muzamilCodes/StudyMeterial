"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { apiUrl } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const emailParam = searchParams.get("email") ?? "";
  const tokenParam = searchParams.get("token") ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const token = String(formData.get("token") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // FIX: Use apiUrl() to call Express backend, not a relative Next.js route
      const response = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password, confirmPassword })
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message ?? "Password reset failed. Please try again.");
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setErrorMsg("Unable to reach the backend server. Please make sure it is running.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center p-4 sm:p-6">
      <Card className="w-full rounded-[2.5rem] border-white/60 bg-white/80 p-4 sm:p-6 shadow-glass backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <Badge className="mx-auto bg-orange-50 text-orange-700 text-xs font-bold">Security Reset</Badge>
          <CardTitle className="text-xl sm:text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter your email, the reset token you received, and your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Password reset successful!</p>
              <p className="text-xs text-slate-600">Redirecting to Login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold text-slate-800 text-xs sm:text-sm">Registered Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={emailParam}
                  placeholder="you@example.com"
                  required
                  className="h-11 rounded-xl border-slate-200 text-xs sm:text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="token" className="font-bold text-slate-800 text-xs sm:text-sm">Reset Token</Label>
                <Input
                  id="token"
                  name="token"
                  defaultValue={tokenParam}
                  placeholder="Paste the token from the forgot-password step"
                  required
                  className="h-11 rounded-xl border-slate-200 font-mono text-xs"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pass" className="font-bold text-slate-800 text-xs sm:text-sm">New Password</Label>
                  <Input
                    id="pass"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="h-11 rounded-xl border-slate-200 text-xs sm:text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm" className="font-bold text-slate-800 text-xs sm:text-sm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="h-11 rounded-xl border-slate-200 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold shadow text-white text-xs sm:text-sm"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
              <div className="text-center pt-1">
                <Link href="/forgot-password" className="text-xs font-semibold text-slate-600 hover:underline">
                  Request a new token
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center p-4">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
