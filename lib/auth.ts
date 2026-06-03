import crypto from "node:crypto";
import { getSupabaseAdmin, hasSupabaseEnv } from "./supabase";
import type { AppUser, UserPayload } from "./types";

const fallbackAdmin = {
  id: 1,
  name: "Lucas Pedroso",
  email: "lucasalmeidapedroso@gmail.com",
  role: "admin" as const,
  is_active: true,
  created_at: new Date().toISOString()
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!hasSupabaseEnv()) {
    const fallbackPassword = process.env.ADMIN_PASSWORD || "!Levi@2023";
    return normalizedEmail === fallbackAdmin.email && password === fallbackPassword ? fallbackAdmin : null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .single();

  if (error || !data || data.role !== "admin") return null;

  const attemptedHash = hashPassword(password, data.password_salt);
  if (!safeEqual(attemptedHash, data.password_hash)) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    is_active: data.is_active,
    created_at: data.created_at
  } satisfies AppUser;
}

export async function verifyAdminEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!hasSupabaseEnv()) {
    return normalizedEmail === fallbackAdmin.email ? fallbackAdmin : null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("id,name,email,role,is_active,created_at")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .single();

  if (error || !data || data.role !== "admin") return null;
  return data satisfies AppUser;
}

export async function verifyAdminAccessToken(accessToken: string) {
  if (!hasSupabaseEnv() || !accessToken) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(accessToken);
  const email = data.user?.email;

  if (error || !email) return null;
  return verifyAdminEmail(email);
}

export async function listUsers(): Promise<AppUser[]> {
  if (!hasSupabaseEnv()) return [fallbackAdmin];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("id,name,email,role,is_active,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createUser(payload: UserPayload): Promise<AppUser> {
  const salt = makeSalt();
  const password_hash = hashPassword(payload.password, salt);
  const email = normalizeEmail(payload.email);

  if (!hasSupabaseEnv()) {
    return {
      id: Date.now(),
      name: payload.name,
      email,
      role: payload.role,
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .insert({
      name: payload.name,
      email,
      role: payload.role,
      password_salt: salt,
      password_hash,
      is_active: true
    })
    .select("id,name,email,role,is_active,created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (accessToken) {
    return verifyAdminAccessToken(accessToken);
  }

  const email = request.headers.get("x-admin-email") || "";
  const password = request.headers.get("x-admin-password") || "";
  const admin = await verifyAdminCredentials(email, password);
  return admin;
}
