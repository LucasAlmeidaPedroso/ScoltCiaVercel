import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createPet, updatePetWithTutors } from "@/lib/data";

const allowedFields = ["name", "breed", "size", "sex", "weight", "birth_date", "behavior", "food_restrictions", "medications", "important_notes", "veterinarian", "photo_url", "tutor_ids"] as const;

function cleanPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
  );
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const payload = cleanPayload(await request.json());
  if (!payload.name) return NextResponse.json({ error: "Nome do pet obrigatorio" }, { status: 400 });

  const pet = await createPet(payload as { name: string });
  return NextResponse.json(pet, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { id, ...payload } = await request.json();
  if (!id) return NextResponse.json({ error: "Pet nao informado" }, { status: 400 });

  const updates = cleanPayload(payload);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const pet = await updatePetWithTutors(Number(id), updates);
  return NextResponse.json(pet);
}
