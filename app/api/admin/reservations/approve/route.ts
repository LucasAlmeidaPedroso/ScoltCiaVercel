import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { updateReservationStatus } from "@/lib/data";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "reservations", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const { id } = await request.json();
  const reservation = await updateReservationStatus(Number(id), "Confirmada");
  return NextResponse.json(reservation);
}
