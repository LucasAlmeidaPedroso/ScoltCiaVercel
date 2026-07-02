import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { createTutor, listTutors, updateTutor } from "@/lib/data";
import { cleanEmail, cleanNullableString, cleanString, jsonError, readJson, requireSameOrigin } from "@/lib/security";

const allowedFields = ["full_name", "phone", "whatsapp", "email", "address", "emergency_contact"] as const;

function cleanPayload(payload: Record<string, unknown>) {
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
  );
  if ("full_name" in clean) clean.full_name = cleanString(clean.full_name, 120);
  if ("phone" in clean) clean.phone = cleanNullableString(clean.phone, 40);
  if ("whatsapp" in clean) clean.whatsapp = cleanNullableString(clean.whatsapp, 40);
  if ("email" in clean) clean.email = cleanEmail(clean.email) || null;
  if ("address" in clean) clean.address = cleanNullableString(clean.address, 300);
  if ("emergency_contact" in clean) clean.emergency_contact = cleanNullableString(clean.emergency_contact, 160);
  return clean;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "clients", "read")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const tutors = await listTutors();
  return NextResponse.json(tutors);
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "clients", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  try {
    const payload = cleanPayload(await readJson<Record<string, unknown>>(request));
    if (!payload.full_name) return NextResponse.json({ error: "Nome do tutor obrigatorio" }, { status: 400 });

    const tutor = await createTutor(payload as { full_name: string });
    return NextResponse.json(tutor, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "clients", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  try {
    const { id, ...payload } = await readJson<Record<string, unknown>>(request);
    if (!id) return NextResponse.json({ error: "Tutor nao informado" }, { status: 400 });

    const updates = cleanPayload(payload);
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const tutor = await updateTutor(Number(id), updates);
    return NextResponse.json(tutor);
  } catch (error) {
    return jsonError(error);
  }
}
