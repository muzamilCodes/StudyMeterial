"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center p-4">
      <Card className="w-full rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <Badge className="mx-auto bg-blue-50 text-blue-700">Account Recovery</Badge>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your registered email address. We will send a secure password reset link to your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Reset link sent successfully!</p>
              <p className="text-xs text-slate-600">Check your email inbox or proceed to reset password page.</p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/reset-password"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow"
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
                <Label htmlFor="email">Student Email Address</Label>
                <Input id="email" type="email" placeholder="student@studymaterial.edu" required className="h-11 rounded-xl" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold shadow">
                Send Reset Link
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
