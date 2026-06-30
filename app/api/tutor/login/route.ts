import { NextResponse } from "next/server";
import { verifyTutorCredentials } from "@/lib/auth";
import { createSessionToken, sessionCookie } from "@/lib/tutor-session";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const tutor = await verifyTutorCredentials(email || "", password || "");

  if (!tutor) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: tutor });
  response.headers.set("Set-Cookie", sessionCookie(createSessionToken(tutor.email)));
  return response;
}
