import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/auth";
import { adminSessionCookie, createAdminSessionToken } from "@/lib/admin-session";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const admin = await verifyAdminCredentials(email, password);

  if (!admin) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: admin });
  response.headers.set("Set-Cookie", adminSessionCookie(createAdminSessionToken(admin.email)));
  return response;
}
