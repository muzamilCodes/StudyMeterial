import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUrl } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  grade: z.enum(["10th", "11th", "12th"]),
  stream: z.enum(["Medical", "Non-Medical", "Commerce", "Arts"])
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) {
    return NextResponse.json({ message: "Invalid registration payload" }, { status: 400 });
  }

  try {
    const response = await fetch(apiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
