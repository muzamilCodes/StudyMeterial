"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "Login failed");
        return;
      }

      if (data.token) localStorage.setItem("study-material-token", data.token);
      if (data.user) localStorage.setItem("study-material-user", JSON.stringify(data.user));

      const isAdmin = data.user?.role === "admin" || data.user?.isAdmin === true || data.mode === "admin";
      router.push(isAdmin ? "/admin" : "/dashboard");
    } catch {
      setMessage("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center lg:grid-cols-2">
      <div className="p-4 text-slate-900">
        <p className="text-sm font-semibold tracking-[0.35em] text-blue-600">STUDY MATERIAL</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Student Login</h1>
        <p className="mt-4 max-w-lg text-slate-600">
          Secure sign-in for class-wise learning, personalized dashboard access, notes, quizzes, results, and progress tracking.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Login / Registration</CardTitle>
          <CardDescription>Sign in with email and password only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="student@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter password" required />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                Remember Me
              </label>
              <Link href="/forgot-password" className="text-blue-600">
                Forgot Password
              </Link>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Login Button"}
              </Button>
              <Link
                href="/register"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Register Button
              </Link>
            </div>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
