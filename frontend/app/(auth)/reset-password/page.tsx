"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center p-4">
      <Card className="w-full rounded-[2.5rem] border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <Badge className="mx-auto bg-orange-50 text-orange-700">Security Reset</Badge>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password to regain full student dashboard access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Password reset successful!</p>
              <p className="text-xs text-slate-600">Redirecting to Student Login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="pass">New Password</Label>
                <Input id="pass" type="password" placeholder="••••••••" required className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" type="password" placeholder="••••••••" required className="h-11 rounded-xl" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold shadow text-white">
                Save & Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
