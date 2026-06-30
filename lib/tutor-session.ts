import crypto from "node:crypto";

// Sessao do tutor: cookie httpOnly assinado (HMAC-SHA256).
// Nao guarda segredo do usuario, apenas e-mail + expiracao assinados.

export const TUTOR_COOKIE = "scoltcia_tutor";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSecret() {
  return process.env.TUTOR_SESSION_SECRET || "scoltcia-tutor-session-fallback-2026";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(email: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.email || typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.email as string;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return `${TUTOR_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearCookie() {
  return `${TUTOR_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
