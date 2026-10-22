"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; token: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    try {
      // FIX: Use apiUrl() to call the Express backend, not a relative Next.js route
      const response = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message ?? "Could not find an account with that email.");
        return;
      }

      setResult({ email, token: data.resetToken });
    } catch {
      setErrorMsg("Unable to reach the backend server. Please make sure it is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center p-4 sm:p-6">
      <Card className="w-full rounded-[2.5rem] border-white/60 bg-white/80 p-4 sm:p-6 shadow-glass backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <Badge className="mx-auto bg-blue-50 text-blue-700 text-xs font-bold">Account Recovery</Badge>
          <CardTitle className="text-xl sm:text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter your registered email address to generate a secure, single-use reset token valid for 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Reset token generated for {result.email}</p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Reset Token</p>
                <p className="break-all font-mono text-xs font-bold text-slate-800">{result.token}</p>
              </div>
              <p className="text-xs text-slate-600">
                This token is also printed in the backend server log. Use it on the Reset Password page within 15 minutes.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href={`/reset-password?email=${encodeURIComponent(result.email)}&token=${encodeURIComponent(result.token)}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors w-full"
                >
                  Proceed to Reset Password
                </Link>
                <Link href="/login" className="text-xs font-semibold text-slate-600 hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold text-slate-800 text-xs sm:text-sm">Registered Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@studymaterial.com"
                  required
                  className="h-11 rounded-xl border-slate-200 text-xs sm:text-sm"
                />
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
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold shadow text-white text-xs sm:text-sm"
              >
                {loading ? "Generating token..." : "Generate Reset Token"}
              </Button>
              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
