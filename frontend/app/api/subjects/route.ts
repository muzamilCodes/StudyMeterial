import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUrl } from "@/lib/api";

const querySchema = z.object({
  grade: z.enum(["10th", "11th", "12th"]),
  stream: z.enum(["Medical", "Non-Medical", "Commerce", "Arts"])
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    grade: url.searchParams.get("grade") ?? "11th",
    stream: url.searchParams.get("stream") ?? "Medical"
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid class selection" }, { status: 400 });
  }

  const response = await fetch(apiUrl(`/api/subjects?grade=${parsed.data.grade}&stream=${parsed.data.stream}`), {
    cache: "no-store"
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
