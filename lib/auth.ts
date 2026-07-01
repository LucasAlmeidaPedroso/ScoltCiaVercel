import crypto from "node:crypto";
import { getSupabaseAdmin, hasSupabaseEnv } from "./supabase";
import type { AppUser, BusinessEntity, PermissionKey, PermissionLevel, UserPayload, UserPermissions } from "./types";

const fallbackAdmin = {
  id: 1,
  name: "Lucas Pedroso",
  email: "lucasalmeidapedroso@gmail.com",
  role: "admin" as const,
  is_active: true,
  entities: ["creche", "hotel"] as BusinessEntity[],
  permissions: null,
  created_at: new Date().toISOString()
};

const permissionKeys: PermissionKey[] = [
  "dashboard",
  "reservations",
  "agenda",
  "checkin",
  "pets",
  "clients",
  "services",
  "packages",
  "daily_reports",
  "activities",
  "feeding",
  "grooming",
  "reports",
  "users",
  "settings"
];

const permissionLevels: PermissionLevel[] = ["none", "read", "write"];

const defaultEmployeePermissions: UserPermissions = {
  dashboard: "read",
  reservations: "write",
  agenda: "write",
  checkin: "write",
  pets: "read",
  clients: "read",
  services: "read",
  packages: "read",
  daily_reports: "write",
  activities: "write",
  feeding: "write",
  grooming: "write",
  reports: "read",
  users: "none",
  settings: "none"
};

function normalizeEntities(value: unknown): BusinessEntity[] {
  const source = Array.isArray(value) ? value : ["creche"];
  const entities = source.filter((item): item is BusinessEntity => item === "creche" || item === "hotel");
  return entities.length ? Array.from(new Set(entities)) : ["creche"];
}

function normalizePermissions(value: unknown, role: AppUser["role"]): UserPermissions | null {
  if (role === "admin") return null;
  const source = typeof value === "object" && value ? value as Record<string, unknown> : defaultEmployeePermissions;
  return Object.fromEntries(permissionKeys.map((key) => {
    const level = source[key];
    return [key, permissionLevels.includes(level as PermissionLevel) ? level : defaultEmployeePermissions[key] || "none"];
  })) as UserPermissions;
}

export function hasPermission(user: AppUser, key: PermissionKey, level: PermissionLevel = "read") {
  if (user.role === "admin") return true;
  if (user.role !== "equipe") return false;

  const current = normalizePermissions(user.permissions, user.role)?.[key] || "none";
  if (level === "read") return current === "read" || current === "write";
  if (level === "write") return current === "write";
  return current !== "none";
}

function mapAppUser(data: Record<string, any>): AppUser {
  return {
    id: Number(data.id),
    name: data.name,
    email: data.email,
    role: data.role,
    is_active: data.is_active,
    entities: normalizeEntities(data.entities),
    permissions: normalizePermissions(data.permissions, data.role),
    created_at: data.created_at
  };
}

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
    const fallbackPassword = process.env.ADMIN_PASSWORD;
    if (!fallbackPassword) return null;
    return normalizedEmail === fallbackAdmin.email && password === fallbackPassword ? fallbackAdmin : null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .single();

  if (error || !data || !["admin", "equipe"].includes(data.role)) return null;

  const attemptedHash = hashPassword(password, data.password_salt);
  if (!safeEqual(attemptedHash, data.password_hash)) return null;

  return mapAppUser(data);
}

export async function verifyAdminEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!hasSupabaseEnv()) {
    return normalizedEmail === fallbackAdmin.email ? fallbackAdmin : null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("id,name,email,role,is_active,entities,permissions,created_at")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .single();

  if (error || !data || !["admin", "equipe"].includes(data.role)) return null;
  return mapAppUser(data);
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
    .select("id,name,email,role,is_active,entities,permissions,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAppUser);
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
      entities: normalizeEntities(payload.entities),
      permissions: normalizePermissions(payload.permissions, payload.role),
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
      entities: normalizeEntities(payload.entities),
      permissions: normalizePermissions(payload.permissions, payload.role),
      password_salt: salt,
      password_hash,
      is_active: true
    })
    .select("id,name,email,role,is_active,entities,permissions,created_at")
    .single();

  if (error) throw error;
  return mapAppUser(data);
}

export async function updateUser(id: number, payload: Partial<Pick<AppUser, "name" | "role" | "is_active" | "entities" | "permissions">>): Promise<AppUser> {
  const cleanPayload = {
    ...payload,
    entities: payload.entities ? normalizeEntities(payload.entities) : undefined,
    permissions: payload.permissions || payload.role ? normalizePermissions(payload.permissions, payload.role || "equipe") : undefined
  };

  if (!hasSupabaseEnv()) {
    return {
      id,
      name: cleanPayload.name || fallbackAdmin.name,
      email: fallbackAdmin.email,
      role: cleanPayload.role || fallbackAdmin.role,
      is_active: cleanPayload.is_active ?? fallbackAdmin.is_active,
      entities: cleanPayload.entities || fallbackAdmin.entities,
      permissions: cleanPayload.permissions || fallbackAdmin.permissions,
      created_at: fallbackAdmin.created_at
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .update(Object.fromEntries(Object.entries(cleanPayload).filter(([, value]) => value !== undefined)))
    .eq("id", id)
    .select("id,name,email,role,is_active,entities,permissions,created_at")
    .single();

  if (error) throw error;
  return mapAppUser(data);
}

export type TutorAccount = AppUser & { tutor_id: number | null };

export async function verifyTutorCredentials(email: string, password: string): Promise<TutorAccount | null> {
  const normalizedEmail = normalizeEmail(email);

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .single();

  if (error || !data || data.role !== "tutor") return null;

  const attemptedHash = hashPassword(password, data.password_salt);
  if (!safeEqual(attemptedHash, data.password_hash)) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    is_active: data.is_active,
    tutor_id: data.tutor_id ?? null,
    created_at: data.created_at
  };
}

export async function getTutorByEmail(email: string): Promise<TutorAccount | null> {
  const normalizedEmail = normalizeEmail(email);

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_users")
    .select("id,name,email,role,is_active,tutor_id,created_at")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .single();

  if (error || !data || data.role !== "tutor") return null;
  return { ...data, tutor_id: data.tutor_id ?? null };
}

export async function requireTutor(request: Request) {
  const { readSessionToken } = await import("./tutor-session");
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/scoltcia_tutor=([^;]+)/);
  const email = readSessionToken(match ? decodeURIComponent(match[1]) : null);
  if (!email) return null;
  return getTutorByEmail(email);
}

export async function requireAdmin(request: Request) {
  const { readAdminSessionToken, ADMIN_COOKIE } = await import("./admin-session");
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`));
  const sessionEmail = readAdminSessionToken(match ? decodeURIComponent(match[1]) : null);
  if (sessionEmail) return verifyAdminEmail(sessionEmail);

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (accessToken) {
    return verifyAdminAccessToken(accessToken);
  }

  return null;
}
