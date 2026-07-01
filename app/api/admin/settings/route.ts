import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { getDaycareSettings, updateDaycareSettings } from "@/lib/data";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "settings", "read")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const settings = await getDaycareSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "settings", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const { max_capacity } = await request.json();
  const settings = await updateDaycareSettings(Number(max_capacity));
  return NextResponse.json(settings);
}
