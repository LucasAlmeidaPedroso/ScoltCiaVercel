import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { createReservation, updateReservation } from "@/lib/data";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "reservations", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const payload = await request.json();
  const reservation = await createReservation(payload, "Confirmada");
  return NextResponse.json(reservation, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "reservations", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const { id, ...payload } = await request.json();
  if (!id) return NextResponse.json({ error: "Reserva nao informada" }, { status: 400 });

  const allowedFields = ["status", "expected_time", "exit_time", "notes", "exit_date", "entry_date", "service", "pet_name", "breed", "size", "tutor_name", "phone", "email"] as const;
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
  );

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const reservation = await updateReservation(Number(id), updates);
  return NextResponse.json(reservation);
}
