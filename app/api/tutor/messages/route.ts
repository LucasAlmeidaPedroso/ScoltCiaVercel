import { NextResponse } from "next/server";
import { requireTutor } from "@/lib/auth";
import { getSupabaseAdmin, hasSupabaseEnv } from "@/lib/supabase";

export async function POST(request: Request) {
  const { body } = await request.json();
  const message = String(body || "").trim();

  if (!message) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Servico indisponivel" }, { status: 503 });
    }
    return NextResponse.json({ ok: true, demoMode: true });
  }

  const tutor = await requireTutor(request);
  if (!tutor?.tutor_id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("id")
    .eq("tutor_id", tutor.tutor_id)
    .order("id")
    .limit(1)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet nao encontrado" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("pet_messages")
    .insert({
      pet_id: pet.id,
      sender: "tutor",
      author: tutor.name,
      body: message
    })
    .select("id,body,created_at")
    .single();

  if (error) throw error;
  return NextResponse.json({ id: data.id, text: data.body, created_at: data.created_at });
}
