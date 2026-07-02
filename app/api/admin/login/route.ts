import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/auth";
import { adminSessionCookie, createAdminSessionToken } from "@/lib/admin-session";
import { cleanEmail, cleanString, rateLimit, readJson, requireSameOrigin, jsonError } from "@/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "admin-login", 8, 60_000);
  if (limited) return limited;

  let payload: Record<string, unknown>;
  try {
    payload = await readJson<Record<string, unknown>>(request, 4_000);
  } catch (error) {
    return jsonError(error);
  }

  const email = cleanEmail(payload.email);
  const password = cleanString(payload.password, 256);
  const admin = await verifyAdminCredentials(email, password);

  if (!admin) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: admin });
  response.headers.set("Set-Cookie", adminSessionCookie(createAdminSessionToken(admin.email)));
  return response;
}
