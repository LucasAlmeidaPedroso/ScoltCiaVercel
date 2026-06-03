import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDaycareSettings, updateDaycareSettings } from "@/lib/data";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const settings = await getDaycareSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { max_capacity } = await request.json();
  const settings = await updateDaycareSettings(Number(max_capacity));
  return NextResponse.json(settings);
}
