import { NextResponse } from "next/server";
import { createUser, listUsers, requireAdmin, updateUser } from "@/lib/auth";

function requireOwnerAdmin(admin: Awaited<ReturnType<typeof requireAdmin>>) {
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });
  return null;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  const denied = requireOwnerAdmin(admin);
  if (denied) return denied;

  const users = await listUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  const denied = requireOwnerAdmin(admin);
  if (denied) return denied;

  const payload = await request.json();
  const user = await createUser(payload);
  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  const denied = requireOwnerAdmin(admin);
  if (denied) return denied;

  const { id, ...payload } = await request.json();
  if (!id) return NextResponse.json({ error: "Usuario nao informado" }, { status: 400 });

  const user = await updateUser(Number(id), payload);
  return NextResponse.json(user);
}
