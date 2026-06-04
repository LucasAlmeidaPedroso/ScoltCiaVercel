import { demoPets, demoReservations } from "./demo-data";
import { getSupabaseAdmin, hasSupabaseEnv } from "./supabase";
import type { AdminRecord, AdminRecordPayload, DaycareSettings, PetOption, Reservation, ReservationPayload, TutorPayload } from "./types";

export async function listPets(): Promise<PetOption[]> {
  if (!hasSupabaseEnv()) return demoPets;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pet_options")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function listReservations(): Promise<Reservation[]> {
  if (!hasSupabaseEnv()) return demoReservations;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("entry_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createReservation(payload: ReservationPayload, status = "Aguardando aprovacao") {
  if (!hasSupabaseEnv()) {
    return { id: Date.now(), ...payload, status };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reservations")
    .insert({ ...payload, status })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReservationStatus(id: number, status: string) {
  if (!hasSupabaseEnv()) {
    return { id, status };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReservation(id: number, payload: Partial<Reservation>) {
  if (!hasSupabaseEnv()) {
    return { id, ...payload };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reservations")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePet(id: number, payload: Partial<PetOption>) {
  if (!hasSupabaseEnv()) {
    return { id, ...payload };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pets")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTutor(payload: TutorPayload) {
  if (!hasSupabaseEnv()) {
    return { id: Date.now(), ...payload, created_at: new Date().toISOString() };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tutors")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTutor(id: number, payload: Partial<TutorPayload>) {
  if (!hasSupabaseEnv()) {
    return { id, ...payload };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tutors")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listAdminRecords(moduleKey?: string): Promise<AdminRecord[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("admin_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (moduleKey) query = query.eq("module_key", moduleKey);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createAdminRecord(payload: AdminRecordPayload) {
  if (!hasSupabaseEnv()) {
    return {
      id: Date.now(),
      module_key: payload.module_key,
      title: payload.title,
      status: payload.status || "Ativo",
      payload: payload.payload || {},
      created_at: new Date().toISOString()
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_records")
    .insert({
      module_key: payload.module_key,
      title: payload.title,
      status: payload.status || "Ativo",
      payload: payload.payload || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdminRecord(id: number, payload: Partial<AdminRecordPayload>) {
  if (!hasSupabaseEnv()) {
    return { id, ...payload, updated_at: new Date().toISOString() };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_records")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAdminRecord(id: number) {
  if (!hasSupabaseEnv()) return true;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("admin_records")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export async function getDaycareSettings(): Promise<DaycareSettings> {
  if (!hasSupabaseEnv()) return { max_capacity: 20 };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("daycare_settings")
    .select("max_capacity")
    .eq("id", 1)
    .single();

  if (error) throw error;
  return data ?? { max_capacity: 20 };
}

export async function updateDaycareSettings(maxCapacity: number): Promise<DaycareSettings> {
  const max_capacity = Math.max(1, Math.floor(maxCapacity || 1));

  if (!hasSupabaseEnv()) return { max_capacity };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("daycare_settings")
    .upsert({ id: 1, max_capacity }, { onConflict: "id" })
    .select("max_capacity")
    .single();

  if (error) throw error;
  return data;
}
