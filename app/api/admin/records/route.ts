import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminRecord, deleteAdminRecord, listAdminRecords, updateAdminRecord } from "@/lib/data";
import type { AdminRecordPayload } from "@/lib/types";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const moduleKey = searchParams.get("module") || undefined;
  const records = await listAdminRecords(moduleKey);
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const payload = await request.json() as AdminRecordPayload;
  if (!payload.module_key || !payload.title) {
    return NextResponse.json({ error: "Modulo e titulo sao obrigatorios" }, { status: 400 });
  }

  const record = await createAdminRecord(payload);
  return NextResponse.json(record, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { id, ...payload } = await request.json();
  if (!id) return NextResponse.json({ error: "Registro nao informado" }, { status: 400 });

  const record = await updateAdminRecord(Number(id), payload);
  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Registro nao informado" }, { status: 400 });

  await deleteAdminRecord(Number(id));
  return NextResponse.json({ ok: true });
}
