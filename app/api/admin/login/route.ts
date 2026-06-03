import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const admin = await verifyAdminCredentials(email, password);

  if (!admin) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: admin });
}
