import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { createPet, updatePetWithTutors } from "@/lib/data";
import { cleanNullableString, cleanNumber, cleanString, jsonError, readJson, requireSameOrigin } from "@/lib/security";

const allowedFields = ["name", "breed", "size", "sex", "weight", "birth_date", "behavior", "food_restrictions", "medications", "important_notes", "veterinarian", "photo_url", "service_prices", "tutor_ids"] as const;

function cleanPayload(payload: Record<string, unknown>) {
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
  );
  if ("name" in clean) clean.name = cleanString(clean.name, 120);
  if ("breed" in clean) clean.breed = cleanNullableString(clean.breed, 80);
  if ("size" in clean) clean.size = cleanNullableString(clean.size, 40);
  if ("sex" in clean) clean.sex = cleanNullableString(clean.sex, 30);
  if ("weight" in clean) clean.weight = cleanNumber(clean.weight, 200);
  if ("behavior" in clean) clean.behavior = cleanNullableString(clean.behavior, 1000);
  if ("food_restrictions" in clean) clean.food_restrictions = cleanNullableString(clean.food_restrictions, 1000);
  if ("medications" in clean) clean.medications = cleanNullableString(clean.medications, 1000);
  if ("important_notes" in clean) clean.important_notes = cleanNullableString(clean.important_notes, 1500);
  if ("veterinarian" in clean) clean.veterinarian = cleanNullableString(clean.veterinarian, 120);
  return clean;
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "pets", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  try {
    const payload = cleanPayload(await readJson<Record<string, unknown>>(request));
    if (!payload.name) return NextResponse.json({ error: "Nome do pet obrigatorio" }, { status: 400 });
    const pet = await createPet(payload as { name: string });
    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "pets", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  try {
    const { id, ...payload } = await readJson<Record<string, unknown>>(request);
    if (!id) return NextResponse.json({ error: "Pet nao informado" }, { status: 400 });

    const updates = cleanPayload(payload);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const pet = await updatePetWithTutors(Number(id), updates);
    return NextResponse.json(pet);
  } catch (error) {
    return jsonError(error);
  }
}
