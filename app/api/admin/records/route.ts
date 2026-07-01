import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { createAdminRecord, deleteAdminRecord, listAdminRecords, updateAdminRecord } from "@/lib/data";
import type { AdminRecordPayload, PermissionKey } from "@/lib/types";

function recordPermission(moduleKey?: string): PermissionKey {
  if (moduleKey === "unit" || moduleKey === "communications" || moduleKey === "general_settings") return "settings";
  if (moduleKey === "schedules") return "users";
  if (moduleKey === "services" || moduleKey === "packages" || moduleKey === "daily_reports" || moduleKey === "activities" || moduleKey === "feeding") return moduleKey;
  return "reports";
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const moduleKey = searchParams.get("module") || undefined;
  if (moduleKey && !hasPermission(admin, recordPermission(moduleKey), "read")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const records = await listAdminRecords(moduleKey);
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const payload = await request.json() as AdminRecordPayload;
  if (!hasPermission(admin, recordPermission(payload.module_key), "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });
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
  if (!hasPermission(admin, recordPermission(payload.module_key), "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  const record = await updateAdminRecord(Number(id), payload);
  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const moduleKey = searchParams.get("module") || undefined;
  if (!hasPermission(admin, recordPermission(moduleKey), "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });
  if (!id) return NextResponse.json({ error: "Registro nao informado" }, { status: 400 });

  await deleteAdminRecord(Number(id));
  return NextResponse.json({ ok: true });
}
