import { getSupabaseAdmin, hasSupabaseEnv } from "./supabase";
import type { AdminRecord, AdminRecordPayload, DaycareSettings, PetOption, PetPayload, Reservation, ReservationPayload, Tutor, TutorPayload } from "./types";

export async function listPets(): Promise<PetOption[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("pet_options")
      .select("*")
      .order("name");

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("listPets: Supabase indisponivel.", error);
    return [];
  }
}

export async function listReservations(): Promise<Reservation[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("entry_date", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("listReservations: Supabase indisponivel.", error);
    return [];
  }
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

async function syncPetTutors(petId: number, tutorIds: number[]) {
  if (!hasSupabaseEnv()) return;

  const supabase = getSupabaseAdmin();
  await supabase.from("pet_tutors").delete().eq("pet_id", petId);

  if (tutorIds.length > 0) {
    const { error } = await supabase
      .from("pet_tutors")
      .insert(tutorIds.map((tutor_id) => ({ pet_id: petId, tutor_id })));

    if (error) throw error;
  }
}

async function getPetOption(id: number): Promise<PetOption> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pet_options")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPet(payload: PetPayload) {
  const tutor_ids = Array.from(new Set((payload.tutor_ids || []).filter(Boolean).map(Number)));
  const petPayload = {
    name: payload.name,
    tutor_id: tutor_ids[0] || null,
    breed: payload.breed || null,
    size: payload.size || null,
    sex: payload.sex || null,
    weight: payload.weight ?? null,
    birth_date: payload.birth_date || null,
    behavior: payload.behavior || null,
    food_restrictions: payload.food_restrictions || null,
    medications: payload.medications || null,
    important_notes: payload.important_notes || null,
    veterinarian: payload.veterinarian || null,
    photo_url: payload.photo_url || null,
    service_prices: payload.service_prices || null
  };

  if (!hasSupabaseEnv()) {
    return { id: Date.now(), ...petPayload, tutor_ids } as PetOption;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pets")
    .insert(petPayload)
    .select("id")
    .single();

  if (error) throw error;
  await syncPetTutors(Number(data.id), tutor_ids);
  return getPetOption(Number(data.id));
}

export async function updatePetWithTutors(id: number, payload: Partial<PetPayload>) {
  const { tutor_ids, ...petPayload } = payload;
  const cleanPetPayload = Object.fromEntries(
    Object.entries({
      ...petPayload,
      tutor_id: tutor_ids ? (tutor_ids[0] || null) : undefined
    }).filter(([, value]) => value !== undefined)
  );

  if (!hasSupabaseEnv()) {
    return { id, ...cleanPetPayload, tutor_ids: tutor_ids || [] } as PetOption;
  }

  if (Object.keys(cleanPetPayload).length > 0) {
    await updatePet(id, cleanPetPayload as Partial<PetOption>);
  }
  if (tutor_ids) await syncPetTutors(id, Array.from(new Set(tutor_ids.filter(Boolean).map(Number))));

  return getPetOption(id);
}

export async function listTutors(): Promise<Tutor[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tutors")
    .select("*")
    .order("full_name");

  if (error) throw error;
  return data || [];
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

export async function closeTutorLgpd(tutorId: number) {
  const now = new Date().toISOString();
  const anonymizedName = `Cliente encerrado LGPD #${tutorId}`;
  const anonymizedPetName = "Pet encerrado LGPD";

  if (!hasSupabaseEnv()) {
    return { tutor_id: tutorId, pet_ids: [], reservation_ids: [], closed_at: now };
  }

  const supabase = getSupabaseAdmin();
  const { data: tutor, error: tutorError } = await supabase
    .from("tutors")
    .select("id,full_name,phone,whatsapp,email")
    .eq("id", tutorId)
    .single();

  if (tutorError || !tutor) throw tutorError || new Error("Tutor nao encontrado");

  const { data: directPets, error: directPetsError } = await supabase
    .from("pets")
    .select("id")
    .eq("tutor_id", tutorId);
  if (directPetsError) throw directPetsError;

  const { data: linkedPets, error: linkedPetsError } = await supabase
    .from("pet_tutors")
    .select("pet_id")
    .eq("tutor_id", tutorId);
  if (linkedPetsError) throw linkedPetsError;

  const petIds = Array.from(new Set([
    ...(directPets || []).map((item) => Number(item.id)),
    ...(linkedPets || []).map((item) => Number(item.pet_id))
  ].filter(Boolean)));

  const reservationIds = new Set<number>();
  if (petIds.length > 0) {
    const { data: reservationsByPet, error } = await supabase
      .from("reservations")
      .select("id")
      .in("pet_id", petIds);
    if (error) throw error;
    (reservationsByPet || []).forEach((item) => reservationIds.add(Number(item.id)));
  }

  const identityFilters = [
    ["email", tutor.email],
    ["phone", tutor.phone],
    ["phone", tutor.whatsapp],
    ["tutor_name", tutor.full_name]
  ] as const;

  for (const [field, value] of identityFilters) {
    if (!value) continue;
    const { data, error } = await supabase
      .from("reservations")
      .select("id")
      .eq(field, value);
    if (error) throw error;
    (data || []).forEach((item) => reservationIds.add(Number(item.id)));
  }

  const reservationIdList = Array.from(reservationIds);
  if (reservationIdList.length > 0) {
    const { error } = await supabase
      .from("reservations")
      .update({
        tutor_name: anonymizedName,
        phone: "",
        email: null,
        pet_name: anonymizedPetName,
        breed: null,
        size: null,
        notes: null
      })
      .in("id", reservationIdList);
    if (error) throw error;
  }

  if (petIds.length > 0) {
    const dependentTables = [
      "pet_presence",
      "pet_traits",
      "timeline_events",
      "pet_photos",
      "pet_videos",
      "vaccines",
      "pet_messages",
      "daily_reports",
      "pet_achievements",
      "life_moments",
      "pet_weights",
      "ai_insights"
    ];

    for (const table of dependentTables) {
      const { error } = await supabase.from(table).delete().in("pet_id", petIds);
      if (error) throw error;
    }

    const { error: deleteLinksError } = await supabase.from("pet_tutors").delete().eq("tutor_id", tutorId);
    if (deleteLinksError) throw deleteLinksError;

    const { error: deletePetsError } = await supabase.from("pets").delete().in("id", petIds);
    if (deletePetsError) throw deletePetsError;
  }

  await supabase.from("tutor_notifications").delete().eq("tutor_id", tutorId);
  await supabase.from("tutor_billing").delete().eq("tutor_id", tutorId);
  await supabase.from("invoices").delete().eq("tutor_id", tutorId);

  const { error: userError } = await supabase
    .from("app_users")
    .update({
      name: anonymizedName,
      email: `lgpd-${tutorId}-${Date.now()}@deleted.local`,
      tutor_id: null,
      is_active: false,
      permissions: null
    })
    .eq("tutor_id", tutorId);
  if (userError) throw userError;

  const { error: tutorDeleteError } = await supabase.from("tutors").delete().eq("id", tutorId);
  if (tutorDeleteError) throw tutorDeleteError;

  return { tutor_id: tutorId, pet_ids: petIds, reservation_ids: reservationIdList, closed_at: now };
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

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("daycare_settings")
      .select("max_capacity")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return data ?? { max_capacity: 20 };
  } catch (error) {
    console.error("getDaycareSettings: Supabase indisponivel, usando padrao.", error);
    return { max_capacity: 20 };
  }
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
