import { NextResponse } from "next/server";
import { verifyAdminAccessToken } from "@/lib/auth";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const admin = await verifyAdminAccessToken(accessToken);

  if (!admin) {
    return NextResponse.json({ error: "Google login sem permissao administrativa" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: admin });
}
