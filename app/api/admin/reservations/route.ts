import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createReservation } from "@/lib/data";

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const payload = await request.json();
  const reservation = await createReservation(payload, "Confirmada");
  return NextResponse.json(reservation, { status: 201 });
}
