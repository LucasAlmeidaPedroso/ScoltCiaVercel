import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateReservationStatus } from "@/lib/data";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { id } = await request.json();
  const reservation = await updateReservationStatus(Number(id), "Confirmada");
  return NextResponse.json(reservation);
}
