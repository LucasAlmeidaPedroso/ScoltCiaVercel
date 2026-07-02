import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { updateReservation } from "@/lib/data";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "reservations", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const { id, daily_rate } = await request.json();
  const payload: { status: string; daily_rate?: number | null } = { status: "Confirmada" };
  if (daily_rate !== undefined) payload.daily_rate = daily_rate === null || daily_rate === "" ? null : Number(daily_rate);
  const reservation = await updateReservation(Number(id), payload);
  return NextResponse.json(reservation);
}
