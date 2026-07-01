import { NextResponse } from "next/server";
import { requireTutor } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Sem Supabase configurado: modo demo, libera a area com o tutor de exemplo.
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ demoMode: true, user: { name: "Mariana Alves", email: "mariana@email.com" } });
  }

  const tutor = await requireTutor(request);
  if (!tutor) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: { name: tutor.name, email: tutor.email } });
}
