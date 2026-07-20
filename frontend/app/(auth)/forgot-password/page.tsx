"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    const response = await fetch(apiUrl("/api/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(formData.get("email") ?? "") })
    });
    const data = await response.json();
    setMessage(response.ok ? `Reset token generated: ${data.token}` : data.message ?? "Request failed");
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-4xl items-center">
      <Card>
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="student@example.com" />
            </div>
            <Button className="w-full" type="submit">
              Send Reset Link
            </Button>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
