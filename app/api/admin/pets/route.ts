import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updatePet } from "@/lib/data";

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { id, ...payload } = await request.json();
  if (!id) return NextResponse.json({ error: "Pet nao informado" }, { status: 400 });

  const allowedFields = ["name", "breed", "size", "sex", "weight", "birth_date", "behavior", "food_restrictions", "medications", "important_notes", "veterinarian", "photo_url"] as const;
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
  );

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const pet = await updatePet(Number(id), updates);
  return NextResponse.json(pet);
}
