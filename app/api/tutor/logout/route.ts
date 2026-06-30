import { NextResponse } from "next/server";
import { clearCookie } from "@/lib/tutor-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", clearCookie());
  return response;
}
