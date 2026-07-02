import { NextResponse } from "next/server";
import { createReservation } from "@/lib/data";
import { cleanDate, cleanEmail, cleanNullableString, cleanString, cleanTime, rateLimit, readJson, requireSameOrigin, jsonError } from "@/lib/security";
import type { ReservationPayload } from "@/lib/types";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "public-reservation", 12, 60_000);
  if (limited) return limited;

  try {
    const payload = await readJson<Record<string, unknown>>(request);
    const reservationPayload: ReservationPayload = {
      pet_id: null,
      tutor_name: cleanString(payload.tutor_name, 120),
      phone: cleanString(payload.phone, 40),
      email: cleanEmail(payload.email),
      pet_name: cleanString(payload.pet_name, 120),
      breed: cleanString(payload.breed, 80),
      size: cleanString(payload.size, 40),
      service: cleanString(payload.service, 80) || "Day Care",
      entry_date: cleanDate(payload.entry_date),
      exit_date: cleanDate(payload.exit_date) || null,
      expected_time: cleanTime(payload.expected_time),
      exit_time: cleanTime(payload.exit_time),
      notes: cleanNullableString(payload.notes, 1000) || ""
    };

    if (!reservationPayload.tutor_name || !reservationPayload.phone || !reservationPayload.pet_name || !reservationPayload.entry_date) {
      return NextResponse.json({ error: "Dados obrigatorios ausentes" }, { status: 400 });
    }

    const reservation = await createReservation(reservationPayload, "Aguardando aprovacao");
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
