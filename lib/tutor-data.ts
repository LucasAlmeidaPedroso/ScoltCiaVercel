import { cookies } from "next/headers";
import { getSupabaseAdmin, hasSupabaseEnv } from "./supabase";
import { getTutorByEmail } from "./auth";
import { readSessionToken, TUTOR_COOKIE } from "./tutor-session";
import * as demo from "./tutor-demo";

// =====================================================================
// Camada de dados da Area do Tutor (real-or-demo).
// Resolve o tutor logado pelo cookie de sessao, busca tudo do Supabase
// (via service role) e mapeia para as MESMAS formas de lib/tutor-demo.
// Sem Supabase configurado (ou sem dados), cai no demo automaticamente.
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
  const token = cookies().get(TUTOR_COOKIE)?.value;
  const email = readSessionToken(token);
  if (!email) return null;
  return getTutorByEmail(email);
}

export type TutorData = {
  demoMode: boolean;
  tutor: typeof demo.tutor;
  pet: typeof demo.pet;
  petStatus: typeof demo.petStatus;
  health: typeof demo.health;
  personality: typeof demo.personality;
  timeline: typeof demo.timeline;
  photos: typeof demo.photos;
  videos: typeof demo.videos;
  vaccines: typeof demo.vaccines;
  financial: typeof demo.financial;
  messages: typeof demo.messages;
  quickReplies: typeof demo.quickReplies;
  notifications: typeof demo.notifications;
  agenda: typeof demo.agenda;
  nextReservation: typeof demo.nextReservation;
  dailyReport: typeof demo.dailyReport;
  achievements: typeof demo.achievements;
  lifeTimeline: typeof demo.lifeTimeline;
  indicators: typeof demo.indicators;
  weightHistory: typeof demo.weightHistory;
  aiInsights: typeof demo.aiInsights;
  dashboardAvisos: typeof demo.dashboardAvisos;
};

function demoBundle(demoMode: boolean): TutorData {
  return {
    demoMode,
    tutor: demo.tutor,
    pet: demo.pet,
    petStatus: demo.petStatus,
    health: demo.health,
    personality: demo.personality,
    timeline: demo.timeline,
    photos: demo.photos,
    videos: demo.videos,
    vaccines: demo.vaccines,
    financial: demo.financial,
    messages: demo.messages,
    quickReplies: demo.quickReplies,
    notifications: demo.notifications,
    agenda: demo.agenda,
    nextReservation: demo.nextReservation,
    dailyReport: demo.dailyReport,
    achievements: demo.achievements,
    lifeTimeline: demo.lifeTimeline,
    indicators: demo.indicators,
    weightHistory: demo.weightHistory,
    aiInsights: demo.aiInsights,
    dashboardAvisos: demo.dashboardAvisos
  };
}

export async function getTutorData(): Promise<TutorData> {
  // Le o cookie de sessao -> garante render dinamico por requisicao
  // (cada tutor ve apenas os proprios dados; nunca cacheia entre usuarios).
  cookies();

  if (!hasSupabaseEnv()) return demoBundle(true);

  try {
  const account = await resolveAccount();
  if (!account || !account.tutor_id) return demoBundle(true);

  const supabase = getSupabaseAdmin();
  const tutorId = account.tutor_id;

  const { data: tutorRow } = await supabase.from("tutors").select("*").eq("id", tutorId).single();
  const { data: petRows } = await supabase.from("pets").select("*").eq("tutor_id", tutorId).order("id").limit(1);
  const petRow = petRows?.[0];

  if (!petRow) return demoBundle(true);
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

  const tutor: typeof demo.tutor = {
    ...demo.tutor,
    name: tutorRow?.full_name || account.name || demo.tutor.name,
    firstName: (tutorRow?.full_name || account.name || demo.tutor.firstName).split(" ")[0],
    email: tutorRow?.email || account.email || demo.tutor.email,
    phone: tutorRow?.phone || demo.tutor.phone,
    address: tutorRow?.address || demo.tutor.address
  };

  const pet: typeof demo.pet = {
    ...demo.pet,
    name: petRow.name,
    photo: petRow.photo_url || demo.pet.photo,
    cover: petRow.cover_url || demo.pet.cover,
    breed: petRow.breed || demo.pet.breed,
    age: ageFrom(petRow.birth_date) || demo.pet.age,
    birthDate: fmtDate(petRow.birth_date) || demo.pet.birthDate,
    weight: petRow.weight != null ? `${String(petRow.weight).replace(".", ",")} kg` : demo.pet.weight,
    sex: petRow.sex || demo.pet.sex,
    size: petRow.size || demo.pet.size,
    microchip: petRow.microchip || demo.pet.microchip,
    neutered: petRow.neutered ?? demo.pet.neutered
  };

  const petStatus: typeof demo.petStatus = presenceRow
    ? {
        present: presenceRow.present,
        location: presenceRow.location || "",
        activity: presenceRow.activity || "",
        lastUpdate: fmtTime(presenceRow.updated_at),
        lastVisit: presenceRow.last_visit || ""
      }
    : demo.petStatus;

  const health: typeof demo.health = {
    allergies: nonEmpty(splitList(petRow.allergies), demo.health.allergies),
    restrictions: nonEmpty(splitList(petRow.food_restrictions), demo.health.restrictions),
    medications: nonEmpty(splitList(petRow.medications), demo.health.medications),
    notes: petRow.important_notes || demo.health.notes,
    vet: petRow.veterinarian || demo.health.vet,
    emergencyContact: tutorRow?.emergency_contact || demo.health.emergencyContact
  };

  const personality = nonEmpty(
    (traits.data || []).map((t) => ({ emoji: t.emoji || "🐾", text: t.label })),
    demo.personality
  );

  const timeline = nonEmpty(
    (events.data || []).map((e) => ({ time: e.event_time, icon: e.icon || "🐾", title: e.title, detail: e.detail || undefined, type: e.type })),
    demo.timeline
  ) as typeof demo.timeline;

  const photos = nonEmpty(
    (photoRows.data || []).map((p) => ({
      id: p.id, src: p.url, caption: p.caption || "", time: p.period === "Hoje" ? fmtTime(p.taken_at) : fmtShort(p.taken_at),
      by: p.registered_by || "Equipe Scolt", place: p.place || "", period: p.period || "Todas", favorite: p.favorite
    })),
    demo.photos
  ) as typeof demo.photos;

  const videos = nonEmpty(
    (videoRows.data || []).map((v) => ({ id: v.id, thumb: v.thumb_url || "", caption: v.caption || "", date: fmtShort(v.recorded_at), duration: v.duration || "" })),
    demo.videos
  );

  const vaccines = nonEmpty(
    (vaccineRows.data || []).map((v) => ({
      name: v.name, applied: fmtDate(v.applied_date), valid: fmtDate(v.valid_until),
      status: vaccineStatus(v.valid_until), required: v.required
    })),
    demo.vaccines
  ) as typeof demo.vaccines;

  const invoices = (invoiceRows.data || []).map((i) => ({
    date: fmtDate(i.invoice_date), description: i.description, method: i.method, value: Number(i.value), status: i.status
  }));
  const financial: typeof demo.financial = billingRow
    ? {
        monthlyValue: Number(billingRow.monthly_value),
        plan: billingRow.plan || demo.financial.plan,
        packagesLeft: billingRow.packages_left,
        packageTotal: billingRow.package_total,
        nextDue: fmtDate(billingRow.next_due),
        invoices: nonEmpty(invoices, demo.financial.invoices) as typeof demo.financial.invoices
      }
    : demo.financial;

  const messages = nonEmpty(
    (messageRows.data || []).map((m) => ({ id: m.id, from: m.sender, author: m.author || "", text: m.body, time: fmtTime(m.created_at) })),
    demo.messages
  ) as typeof demo.messages;

  const notifications = nonEmpty(
    (notifRows.data || []).map((n) => ({ id: n.id, icon: n.icon || "🔔", text: n.body, time: fmtTime(n.created_at), read: n.read })),
    demo.notifications
  );

  const agenda = nonEmpty(
    (reservationRows.data || []).map((r) => ({
      date: fmtDate(r.entry_date).slice(0, 5), weekday: weekday(r.entry_date),
      time: r.expected_time || "07:30", service: r.service,
      status: (r.status === "Confirmada" ? "Confirmada" : r.status === "Concluida" ? "Concluida" : "Aguardando")
    })),
    demo.agenda
  ) as typeof demo.agenda;

  const dailyReport: typeof demo.dailyReport = reportData
    ? {
        date: new Date(reportData.report_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
        summary: reportData.summary || "", food: reportData.food || "", hydration: reportData.hydration || "",
        rest: reportData.rest || "", social: reportData.social || "", mood: reportData.mood || "",
        occurrences: reportData.occurrences || "", responsible: reportData.responsible || ""
      }
    : demo.dailyReport;

  const achievements = nonEmpty(
    (achievementRows.data || []).map((a) => ({ icon: a.icon || "🏅", title: a.title, desc: a.description || "", earned: a.earned })),
    demo.achievements
  );

  const lifeTimeline = nonEmpty(
    (lifeRows.data || []).map((l) => ({ icon: l.icon || "🐾", title: l.title, date: l.moment_date || "", desc: l.description || "" })),
    demo.lifeTimeline
  );

  const weightHistory = nonEmpty(
    (weightRows.data || []).map((w) => ({ label: w.label, value: Number(w.weight) })),
    demo.weightHistory
  );

  const aiInsights = nonEmpty(
    (insightRows.data || []).map((a) => ({ period: a.period, text: a.body })),
    demo.aiInsights
  );

  const dashboardAvisos = nonEmpty(
    (announceRows.data || []).map((a) => ({ icon: a.icon || "📢", title: a.title, text: a.body || "", date: fmtDate(a.published_at) })),
    demo.dashboardAvisos
  );

  // Indicadores: enriquecidos com dados reais quando disponiveis.
  const indicators = demo.indicators.map((ind) => {
    if (ind.label === "Peso atual") return { ...ind, value: pet.weight };
    if (ind.label === "Fotos no album" && photos.length) return { ...ind, value: String(photos.length) };
    if (ind.label === "Videos no album" && videos.length) return { ...ind, value: String(videos.length) };
    return ind;
  });

  return {
    demoMode: false, tutor, pet, petStatus, health, personality, timeline, photos, videos,
    vaccines, financial, messages, quickReplies: demo.quickReplies, notifications, agenda,
    nextReservation: agenda[0] ?? demo.nextReservation, dailyReport, achievements, lifeTimeline,
    indicators, weightHistory, aiInsights, dashboardAvisos
  };
  } catch (error) {
    console.error("getTutorData: Supabase indisponivel, usando dados demo.", error);
    return demoBundle(true);
  }
}
