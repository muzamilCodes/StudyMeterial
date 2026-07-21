import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUrl } from "@/lib/api";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  const response = await fetch(apiUrl("/api/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data)
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
