import { NextResponse } from "next/server";
import { getTutorData } from "@/lib/tutor-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getTutorData();
  return NextResponse.json({
    pet: { name: data.pet.name, photo: data.pet.photo },
    petStatus: data.petStatus,
    notifications: data.notifications,
    avatar: data.tutor.avatar
  });
}
