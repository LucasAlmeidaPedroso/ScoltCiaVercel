import { NextResponse } from "next/server";
import { updateReservationStatus } from "@/lib/data";

export async function POST(request: Request) {
  const { id } = await request.json();
  const reservation = await updateReservationStatus(Number(id), "Confirmada");
  return NextResponse.json(reservation);
}
