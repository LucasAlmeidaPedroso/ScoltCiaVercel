import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const name = process.env.ADMIN_NAME || "Administrador";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error("Missing required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const password_hash = crypto.scryptSync(password, salt, 64).toString("hex");
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { error } = await supabase
  .from("app_users")
  .upsert({
    name,
    email,
    role: "admin",
    entities: ["creche", "hotel"],
    permissions: null,
    password_salt: salt,
    password_hash,
    is_active: true
  }, { onConflict: "email" });

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Admin user ready: ${email}`);
