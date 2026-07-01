import { NextResponse } from "next/server";
import { requireTutor } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const tutor = await requireTutor(request);
  if (!tutor) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: { name: tutor.name, email: tutor.email } });
}
