import { NextResponse } from "next/server";
import { verifyTutorCredentials } from "@/lib/auth";
import { createSessionToken, sessionCookie } from "@/lib/tutor-session";
import { cleanEmail, cleanString, rateLimit, readJson, requireSameOrigin, jsonError } from "@/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "tutor-login", 8, 60_000);
  if (limited) return limited;

  let payload: Record<string, unknown>;
  try {
    payload = await readJson<Record<string, unknown>>(request, 4_000);
  } catch (error) {
    return jsonError(error);
  }

  const tutor = await verifyTutorCredentials(cleanEmail(payload.email), cleanString(payload.password, 256));

  if (!tutor) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: tutor });
  response.headers.set("Set-Cookie", sessionCookie(createSessionToken(tutor.email)));
  return response;
}
