"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    const response = await fetch(apiUrl("/api/auth/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: String(formData.get("token") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? "")
      })
    });
    const data = await response.json();
    setMessage(response.ok ? "Password updated successfully" : data.message ?? "Reset failed");
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-4xl items-center">
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Create a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Reset Token</Label>
              <Input id="token" name="token" placeholder="Paste reset token" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter new password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>
            <Button className="w-full" type="submit">
              Update Password
            </Button>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
