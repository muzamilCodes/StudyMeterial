import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUrl } from "@/lib/api";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) {
    return NextResponse.json({ message: "Invalid reset payload" }, { status: 400 });
  }

  try {
    const response = await fetch(apiUrl("/api/auth/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Reset failed" }, { status: 500 });
  }
}
