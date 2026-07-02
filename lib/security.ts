import { NextResponse } from "next/server";

type RateEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateEntry>();

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${clientIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return NextResponse.json(
    { error: "Muitas tentativas. Aguarde um instante e tente novamente." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const expected = host ? `${protocol}://${host}` : "";

  if (expected && origin !== expected) {
    return NextResponse.json({ error: "Origem invalida" }, { status: 403 });
  }

  return null;
}

export async function readJson<T extends Record<string, unknown>>(request: Request, maxBytes = 20_000): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) throw new Error("Payload muito grande");

  const text = await request.text();
  if (text.length > maxBytes) throw new Error("Payload muito grande");
  if (!text.trim()) return {} as T;

  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("JSON invalido");
  return parsed as T;
}

export function jsonError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Requisicao invalida";
  return NextResponse.json({ error: message }, { status });
}

export function cleanString(value: unknown, max = 255) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanNullableString(value: unknown, max = 255) {
  const cleaned = cleanString(value, max);
  return cleaned || null;
}

export function cleanEmail(value: unknown) {
  const email = cleanString(value, 254).toLowerCase();
  if (!email) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function cleanDate(value: unknown) {
  const text = cleanString(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

export function cleanTime(value: unknown) {
  const text = cleanString(value, 5);
  return /^\d{2}:\d{2}$/.test(text) ? text : "";
}

export function cleanNumber(value: unknown, max = 999_999) {
  if (value === null || value === "" || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.min(number, max);
}

