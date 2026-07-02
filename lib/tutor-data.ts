import { cookies } from "next/headers";
import { getSupabaseAdmin, hasSupabaseEnv } from "./supabase";
import { getTutorByEmail } from "./auth";
import { readSessionToken, TUTOR_COOKIE } from "./tutor-session";
import * as empty from "./tutor-empty";

// =====================================================================
// Camada de dados da Area do Tutor.
// Resolve o tutor logado pelo cookie de sessao, busca tudo do Supabase
// (via service role) e mapeia para as mesmas formas usadas pelas telas.
// Sem Supabase configurado (ou sem dados), retorna estruturas vazias.
// =====================================================================

const MS_YEAR = 1000 * 60 * 60 * 24 * 365.25;

function fmtDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtShort(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + ", " + fmtTime(value);
}

function ageFrom(birth: string | null | undefined): string {
  if (!birth) return "";
  const years = Math.floor((Date.now() - new Date(birth).getTime()) / MS_YEAR);
  return years > 0 ? `${years} ano${years > 1 ? "s" : ""}` : "Filhote";
}

function weekday(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function splitList(value: string | null | undefined): string[] {
  return (value || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function vaccineStatus(validUntil: string | null): "em-dia" | "proxima" | "vencida" {
  if (!validUntil) return "em-dia";
  const days = (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "vencida";
  if (days <= 60) return "proxima";
  return "em-dia";
}

function nonEmpty<T>(rows: unknown[] | null | undefined, fallback: T[]): T[] {
  return rows && rows.length > 0 ? (rows as T[]) : fallback;
}

async function resolveAccount() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TUTOR_COOKIE)?.value;
  const email = readSessionToken(token);
  if (!email) return null;
  return getTutorByEmail(email);
}

export type TutorData = {
  tutor: typeof empty.tutor;
  pet: typeof empty.pet;
  petStatus: typeof empty.petStatus;
  health: typeof empty.health;
  personality: typeof empty.personality;
  timeline: typeof empty.timeline;
  photos: typeof empty.photos;
  videos: typeof empty.videos;
  vaccines: typeof empty.vaccines;
  financial: typeof empty.financial;
  messages: typeof empty.messages;
  quickReplies: typeof empty.quickReplies;
  notifications: typeof empty.notifications;
  agenda: typeof empty.agenda;
  nextReservation: typeof empty.nextReservation;
  dailyReport: typeof empty.dailyReport;
  achievements: typeof empty.achievements;
  lifeTimeline: typeof empty.lifeTimeline;
  indicators: typeof empty.indicators;
  weightHistory: typeof empty.weightHistory;
  aiInsights: typeof empty.aiInsights;
  dashboardAvisos: typeof empty.dashboardAvisos;
};

function emptyBundle(): TutorData {
  return {
    tutor: empty.tutor,
    pet: empty.pet,
    petStatus: empty.petStatus,
    health: empty.health,
    personality: empty.personality,
    timeline: empty.timeline,
    photos: empty.photos,
    videos: empty.videos,
    vaccines: empty.vaccines,
    financial: empty.financial,
    messages: empty.messages,
    quickReplies: empty.quickReplies,
    notifications: empty.notifications,
    agenda: empty.agenda,
    nextReservation: empty.nextReservation,
    dailyReport: empty.dailyReport,
    achievements: empty.achievements,
    lifeTimeline: empty.lifeTimeline,
    indicators: empty.indicators,
    weightHistory: empty.weightHistory,
    aiInsights: empty.aiInsights,
    dashboardAvisos: empty.dashboardAvisos
  };
}

export async function getTutorData(): Promise<TutorData> {
  // Le o cookie de sessao -> garante render dinamico por requisicao
  // (cada tutor ve apenas os proprios dados; nunca cacheia entre usuarios).
  await cookies();

  if (!hasSupabaseEnv()) return emptyBundle();

  try {
  const account = await resolveAccount();
  if (!account || !account.tutor_id) return emptyBundle();

  const supabase = getSupabaseAdmin();
  const tutorId = account.tutor_id;

  const { data: tutorRow } = await supabase.from("tutors").select("*").eq("id", tutorId).single();
  const { data: petRows } = await supabase.from("pets").select("*").eq("tutor_id", tutorId).order("id").limit(1);
  const petRow = petRows?.[0];

  if (!petRow) return emptyBundle();
  const petId = petRow.id;

  const [
    presence, traits, events, photoRows, videoRows, vaccineRows,
    billing, invoiceRows, messageRows, notifRows, reservationRows,
    reportRow, achievementRows, lifeRows, weightRows, insightRows, announceRows
  ] = await Promise.all([
    supabase.from("pet_presence").select("*").eq("pet_id", petId).maybeSingle(),
    supabase.from("pet_traits").select("*").eq("pet_id", petId).order("id"),
    supabase.from("timeline_events").select("*").eq("pet_id", petId).order("event_time"),
    supabase.from("pet_photos").select("*").eq("pet_id", petId).order("taken_at", { ascending: false }),
    supabase.from("pet_videos").select("*").eq("pet_id", petId).order("recorded_at", { ascending: false }),
    supabase.from("vaccines").select("*").eq("pet_id", petId).order("valid_until"),
    supabase.from("tutor_billing").select("*").eq("tutor_id", tutorId).maybeSingle(),
    supabase.from("invoices").select("*").eq("tutor_id", tutorId).order("invoice_date", { ascending: false }),
    supabase.from("pet_messages").select("*").eq("pet_id", petId).order("created_at"),
    supabase.from("tutor_notifications").select("*").eq("tutor_id", tutorId).order("created_at", { ascending: false }),
    supabase.from("reservations").select("*").eq("pet_id", petId).order("entry_date"),
    supabase.from("daily_reports").select("*").eq("pet_id", petId).order("report_date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("pet_achievements").select("*").eq("pet_id", petId).order("id"),
    supabase.from("life_moments").select("*").eq("pet_id", petId).order("sort_order"),
    supabase.from("pet_weights").select("*").eq("pet_id", petId).order("id"),
    supabase.from("ai_insights").select("*").eq("pet_id", petId).order("created_at", { ascending: false }),
    supabase.from("announcements").select("*").order("published_at", { ascending: false })
  ]);

  const presenceRow = presence.data;
  const billingRow = billing.data;
  const reportData = reportRow.data;

  const tutor: typeof empty.tutor = {
    ...empty.tutor,
    name: tutorRow?.full_name || account.name || empty.tutor.name,
    firstName: (tutorRow?.full_name || account.name || empty.tutor.firstName).split(" ")[0],
    email: tutorRow?.email || account.email || empty.tutor.email,
    phone: tutorRow?.phone || empty.tutor.phone,
    address: tutorRow?.address || empty.tutor.address
  };

  const pet: typeof empty.pet = {
    ...empty.pet,
    name: petRow.name,
    photo: petRow.photo_url || empty.pet.photo,
    cover: petRow.cover_url || empty.pet.cover,
    breed: petRow.breed || empty.pet.breed,
    age: ageFrom(petRow.birth_date) || empty.pet.age,
    birthDate: fmtDate(petRow.birth_date) || empty.pet.birthDate,
    weight: petRow.weight != null ? `${String(petRow.weight).replace(".", ",")} kg` : empty.pet.weight,
    sex: petRow.sex || empty.pet.sex,
    size: petRow.size || empty.pet.size,
    microchip: petRow.microchip || empty.pet.microchip,
    neutered: petRow.neutered ?? empty.pet.neutered
  };

  const petStatus: typeof empty.petStatus = presenceRow
    ? {
        present: presenceRow.present,
        location: presenceRow.location || "",
        activity: presenceRow.activity || "",
        lastUpdate: fmtTime(presenceRow.updated_at),
        lastVisit: presenceRow.last_visit || ""
      }
    : empty.petStatus;

  const health: typeof empty.health = {
    allergies: nonEmpty(splitList(petRow.allergies), empty.health.allergies),
    restrictions: nonEmpty(splitList(petRow.food_restrictions), empty.health.restrictions),
    medications: nonEmpty(splitList(petRow.medications), empty.health.medications),
    notes: petRow.important_notes || empty.health.notes,
    vet: petRow.veterinarian || empty.health.vet,
    emergencyContact: tutorRow?.emergency_contact || empty.health.emergencyContact
  };

  const personality = nonEmpty(
    (traits.data || []).map((t) => ({ emoji: t.emoji || "ðŸ¾", text: t.label })),
    empty.personality
  );

  const timeline = nonEmpty(
    (events.data || []).map((e) => ({ time: e.event_time, icon: e.icon || "ðŸ¾", title: e.title, detail: e.detail || undefined, type: e.type })),
    empty.timeline
  ) as typeof empty.timeline;

  const photos = nonEmpty(
    (photoRows.data || []).map((p) => ({
      id: p.id, src: p.url, caption: p.caption || "", time: p.period === "Hoje" ? fmtTime(p.taken_at) : fmtShort(p.taken_at),
      by: p.registered_by || "Equipe Scolt", place: p.place || "", period: p.period || "Todas", favorite: p.favorite
    })),
    empty.photos
  ) as typeof empty.photos;

  const videos = nonEmpty(
    (videoRows.data || []).map((v) => ({ id: v.id, thumb: v.thumb_url || "", caption: v.caption || "", date: fmtShort(v.recorded_at), duration: v.duration || "" })),
    empty.videos
  );

  const vaccines = nonEmpty(
    (vaccineRows.data || []).map((v) => ({
      name: v.name, applied: fmtDate(v.applied_date), valid: fmtDate(v.valid_until),
      status: vaccineStatus(v.valid_until), required: v.required
    })),
    empty.vaccines
  ) as typeof empty.vaccines;

  const invoices = (invoiceRows.data || []).map((i) => ({
    date: fmtDate(i.invoice_date), description: i.description, method: i.method, value: Number(i.value), status: i.status
  }));
  const financial: typeof empty.financial = billingRow
    ? {
        monthlyValue: Number(billingRow.monthly_value),
        plan: billingRow.plan || empty.financial.plan,
        packagesLeft: billingRow.packages_left,
        packageTotal: billingRow.package_total,
        nextDue: fmtDate(billingRow.next_due),
        invoices: nonEmpty(invoices, empty.financial.invoices) as typeof empty.financial.invoices
      }
    : empty.financial;

  const messages = nonEmpty(
    (messageRows.data || []).map((m) => ({ id: m.id, from: m.sender, author: m.author || "", text: m.body, time: fmtTime(m.created_at) })),
    empty.messages
  ) as typeof empty.messages;

  const notifications = nonEmpty(
    (notifRows.data || []).map((n) => ({ id: n.id, icon: n.icon || "ðŸ””", text: n.body, time: fmtTime(n.created_at), read: n.read })),
    empty.notifications
  );

  const agenda = nonEmpty(
    (reservationRows.data || []).map((r) => ({
      date: fmtDate(r.entry_date).slice(0, 5), weekday: weekday(r.entry_date),
      time: r.expected_time || "07:30", service: r.service,
      status: (r.status === "Confirmada" ? "Confirmada" : r.status === "Concluida" ? "Concluida" : "Aguardando")
    })),
    empty.agenda
  ) as typeof empty.agenda;

  const dailyReport: typeof empty.dailyReport = reportData
    ? {
        date: new Date(reportData.report_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
        summary: reportData.summary || "", food: reportData.food || "", hydration: reportData.hydration || "",
        rest: reportData.rest || "", social: reportData.social || "", mood: reportData.mood || "",
        occurrences: reportData.occurrences || "", responsible: reportData.responsible || ""
      }
    : empty.dailyReport;

  const achievements = nonEmpty(
    (achievementRows.data || []).map((a) => ({ icon: a.icon || "ðŸ…", title: a.title, desc: a.description || "", earned: a.earned })),
    empty.achievements
  );

  const lifeTimeline = nonEmpty(
    (lifeRows.data || []).map((l) => ({ icon: l.icon || "ðŸ¾", title: l.title, date: l.moment_date || "", desc: l.description || "" })),
    empty.lifeTimeline
  );

  const weightHistory = nonEmpty(
    (weightRows.data || []).map((w) => ({ label: w.label, value: Number(w.weight) })),
    empty.weightHistory
  );

  const aiInsights = nonEmpty(
    (insightRows.data || []).map((a) => ({ period: a.period, text: a.body })),
    empty.aiInsights
  );

  const dashboardAvisos = nonEmpty(
    (announceRows.data || []).map((a) => ({ icon: a.icon || "ðŸ“¢", title: a.title, text: a.body || "", date: fmtDate(a.published_at) })),
    empty.dashboardAvisos
  );

  // Indicadores: enriquecidos com dados reais quando disponiveis.
  const indicators = empty.indicators.map((ind) => {
    if (ind.label === "Peso atual") return { ...ind, value: pet.weight };
    if (ind.label === "Fotos no album" && photos.length) return { ...ind, value: String(photos.length) };
    if (ind.label === "Videos no album" && videos.length) return { ...ind, value: String(videos.length) };
    return ind;
  });

  return {
    tutor, pet, petStatus, health, personality, timeline, photos, videos,
    vaccines, financial, messages, quickReplies: empty.quickReplies, notifications, agenda,
    nextReservation: agenda[0] ?? empty.nextReservation, dailyReport, achievements, lifeTimeline,
    indicators, weightHistory, aiInsights, dashboardAvisos
  };
  } catch (error) {
    console.error("getTutorData: Supabase indisponivel.", error);
    return emptyBundle();
  }
}

