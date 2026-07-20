import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET() {
  const response = await fetch(apiUrl("/api/classes"), { cache: "no-store" });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
