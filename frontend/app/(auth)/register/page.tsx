"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiUrl } from "@/lib/api";

const streamOptions: Record<"10th" | "11th" | "12th", Array<"General" | "Medical" | "Non-Medical" | "Commerce" | "Arts">> = {
  "10th": ["General"],
  "11th": ["Medical", "Non-Medical", "Commerce", "Arts"],
  "12th": ["Medical", "Non-Medical", "Commerce", "Arts"]
};

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState<"10th" | "11th" | "12th">("11th");
  const [stream, setStream] = useState<"General" | "Medical" | "Non-Medical" | "Commerce" | "Arts">("Medical");

  const streamList = useMemo(() => streamOptions[grade], [grade]);

  useEffect(() => {
    if (!streamList.includes(stream)) {
      setStream(streamList[0]);
    }
  }, [grade, stream, streamList]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setMessage("Password and Confirm Password should match");
      setLoading(false);
      return;
    }

    const payload = {
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password,
      confirmPassword,
      grade,
      stream
    };

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "Registration failed");
        return;
      }

      if (data.token) localStorage.setItem("study-material-token", data.token);
      if (data.user) localStorage.setItem("study-material-user", JSON.stringify(data.user));

      setMessage("Registration successful. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch {
      setMessage("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center lg:grid-cols-2">
      <div className="p-4">
        <p className="text-sm font-semibold tracking-[0.35em] text-orange-500">Create Account</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Student Registration</h1>
        <p className="mt-4 max-w-lg text-slate-600">
          Register once, then the system automatically shows only your selected class and stream content.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Fill your details to create a student account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" placeholder="Your name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="student@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Create password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">Select Class</Label>
              <Select
                id="grade"
                name="grade"
                value={grade}
                onChange={(event) => setGrade(event.target.value as "10th" | "11th" | "12th")}
              >
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stream">Select Stream</Label>
              <Select
                id="stream"
                name="stream"
                value={stream}
                onChange={(event) => setStream(event.target.value as typeof stream)}
              >
                {streamList.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register Button"}
            </Button>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
