import { NextResponse } from "next/server";
import { createReservation } from "@/lib/data";

export async function POST(request: Request) {
  const payload = await request.json();
  const reservation = await createReservation(payload, "Aguardando aprovacao");
  return NextResponse.json(reservation, { status: 201 });
}
