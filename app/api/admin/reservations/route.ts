import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { createReservation, updateReservation } from "@/lib/data";
import { cleanDate, cleanEmail, cleanNullableString, cleanNumber, cleanString, cleanTime, jsonError, readJson, requireSameOrigin } from "@/lib/security";

function cleanReservationPayload(payload: Record<string, unknown>) {
  return {
    pet_id: cleanNumber(payload.pet_id, 999_999_999),
    tutor_name: cleanString(payload.tutor_name, 120),
    phone: cleanString(payload.phone, 40),
    email: cleanEmail(payload.email),
    pet_name: cleanString(payload.pet_name, 120),
    breed: cleanNullableString(payload.breed, 80) || undefined,
    size: cleanNullableString(payload.size, 40) || undefined,
    service: cleanString(payload.service, 80) || "Day Care",
    entry_date: cleanDate(payload.entry_date),
    exit_date: cleanDate(payload.exit_date) || null,
    expected_time: cleanTime(payload.expected_time),
    exit_time: cleanTime(payload.exit_time),
    daily_rate: cleanNumber(payload.daily_rate),
    notes: cleanNullableString(payload.notes, 1000) || ""
  };
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "reservations", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  try {
    const payload = cleanReservationPayload(await readJson<Record<string, unknown>>(request));
    if (!payload.tutor_name || !payload.phone || !payload.pet_name || !payload.entry_date) {
      return NextResponse.json({ error: "Dados obrigatorios ausentes" }, { status: 400 });
    }
    const reservation = await createReservation(payload, "Confirmada");
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "reservations", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const { id, ...payload } = await readJson<Record<string, unknown>>(request);
  if (!id) return NextResponse.json({ error: "Reserva nao informada" }, { status: 400 });

  const allowedFields = ["status", "expected_time", "exit_time", "daily_rate", "notes", "exit_date", "entry_date", "service", "pet_name", "breed", "size", "tutor_name", "phone", "email"] as const;
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
  );

  if ("daily_rate" in updates) updates.daily_rate = cleanNumber(updates.daily_rate);
  if ("notes" in updates) updates.notes = cleanNullableString(updates.notes, 1000);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const reservation = await updateReservation(Number(id), updates);
  return NextResponse.json(reservation);
}
