import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { createTutor, listTutors, updateTutor } from "@/lib/data";

const allowedFields = ["full_name", "phone", "whatsapp", "email", "address", "emergency_contact"] as const;

function cleanPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
  );
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "clients", "read")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const tutors = await listTutors();
  return NextResponse.json(tutors);
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "clients", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const payload = cleanPayload(await request.json());
  if (!payload.full_name) return NextResponse.json({ error: "Nome do tutor obrigatorio" }, { status: 400 });

  const tutor = await createTutor(payload as { full_name: string });
  return NextResponse.json(tutor, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "clients", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const { id, ...payload } = await request.json();
  if (!id) return NextResponse.json({ error: "Tutor nao informado" }, { status: 400 });

  const updates = cleanPayload(payload);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const tutor = await updateTutor(Number(id), updates);
  return NextResponse.json(tutor);
}
