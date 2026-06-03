import { NextResponse } from "next/server";
import { createUser, listUsers, requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const users = await listUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const payload = await request.json();
  const user = await createUser(payload);
  return NextResponse.json(user, { status: 201 });
}
