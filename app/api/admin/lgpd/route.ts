import { NextResponse } from "next/server";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { closeTutorLgpd } from "@/lib/data";
import { cleanNumber, jsonError, rateLimit, readJson, requireSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "admin-lgpd", 10, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  if (!hasPermission(admin, "clients", "write")) return NextResponse.json({ error: "Permissao insuficiente" }, { status: 403 });

  try {
    const payload = await readJson<Record<string, unknown>>(request, 4_000);
    const tutorId = cleanNumber(payload.tutor_id, 999_999_999);
    const confirmation = String(payload.confirmation || "").trim().toUpperCase();

    if (!tutorId) return NextResponse.json({ error: "Tutor nao informado" }, { status: 400 });
    if (confirmation !== "ENCERRAR LGPD") {
      return NextResponse.json({ error: "Confirmacao LGPD invalida" }, { status: 400 });
    }

    const result = await closeTutorLgpd(tutorId);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

