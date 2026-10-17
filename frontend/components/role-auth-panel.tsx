"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { saveSession, type StudentSession } from "@/lib/session";

type RoleName = "superAdmin" | "admin" | "teacher" | "student";

type RoleAuthPanelProps = {
  role: RoleName;
  mode: "login" | "register";
  title: string;
  description: string;
  accent: string;
  homeHref: string;
};

export function RoleAuthPanel({ role, mode, title, description, accent, homeHref }: RoleAuthPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "11th",
    stream: "Medical",
    adminEmail: "",
    adminPassword: ""
  });

  const privilegedRole = role === "superAdmin" || role === "admin" || role === "teacher";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              username: form.username,
              email: form.email,
              password: form.password,
              confirmPassword: form.confirmPassword,
              grade: form.grade,
              stream: form.stream,
              role,
              ...(privilegedRole ? { adminEmail: form.adminEmail, adminPassword: form.adminPassword } : {})
            };

      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Request failed");
      }

      if (mode === "login") {
        const serverRole = (data.user?.role ?? "student") as RoleName;
        if (serverRole !== role) {
          throw Error(`These credentials belong to a "${serverRole}" account, not a ${role} account.`);
        }
      }

      if (data?.token) {
        localStorage.setItem("study-material-token", data.token);
      }

      if (data?.user) {
        const session: StudentSession = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          name: data.user.username,
          role: data.user.role,
          isAdmin: data.user.role === "admin" || data.user.role === "superAdmin",
          grade: data.user.grade,
          stream: data.user.stream
        };
        saveSession(session);
      }

      setStatus(data?.message || "Success");
      router.push(homeHref);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_40%),linear-gradient(180deg,#f8fafc,#eef2ff)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_45%),linear-gradient(180deg,#020617,#0f172a)] px-6 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {title}
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
            {description}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Sign in with a role-specific account. The backend now accepts separate identities for super-admin, admin, teacher, and student flows.
          </p>

          <div className={`mt-8 rounded-[1.75rem] bg-gradient-to-br ${accent} p-1 shadow-2xl`}>
            <div className="rounded-[1.65rem] bg-slate-950 p-6 text-white md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">Role Access</p>
                  <h2 className="mt-1 text-2xl font-black">Enterprise control panel</h2>
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                  Secure login
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  "JWT Authentication",
                  "OTP Verification",
                  "Role-Based Permissions"
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/90">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={homeHref} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02]">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <ShieldCheck className="h-4 w-4" />
                  Secure by design
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 md:p-8">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {mode === "login" ? "Use your role account to continue." : "Set up a new role-specific account."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                    value={form.grade}
                    onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
                  >
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                  </select>
                  <select
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                    value={form.stream}
                    onChange={(e) => setForm((prev) => ({ ...prev, stream: e.target.value }))}
                  >
                    <option value="General">General</option>
                    <option value="Medical">Medical</option>
                    <option value="Non-Medical">Non-Medical</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
              </>
            )}

            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            {mode === "register" && (
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                placeholder="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
            )}

            {mode === "register" && privilegedRole && (
              <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Creating a {role} account requires authorization from an existing administrator.
                </p>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                  placeholder="Authorizing admin email"
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
                  placeholder="Authorizing admin password"
                  type="password"
                  value={form.adminPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {status && (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {status}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Need a different role?</span>
            <Link href="/student" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
              Back to portal
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
