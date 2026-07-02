import crypto from "node:crypto";

export const ADMIN_COOKIE = "scoltcia_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }
  return secret || "scoltcia-admin-session-local-dev";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function cookieFlags() {
  return `Path=/; HttpOnly; SameSite=Lax; Priority=High; Max-Age=${MAX_AGE_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function createAdminSessionToken(email: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readAdminSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.email || typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.email as string;
  } catch {
    return null;
  }
}

export function adminSessionCookie(token: string) {
  return `${ADMIN_COOKIE}=${token}; ${cookieFlags()}`;
}

export function clearAdminCookie() {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Priority=High; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
