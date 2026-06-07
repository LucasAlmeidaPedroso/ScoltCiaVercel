"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Activity, ArrowLeft, ArrowRight, Bell, CalendarCheck, CalendarDays, Cake, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock, CreditCard, Download, Edit3, Eye, EyeOff, Filter, Gamepad2, Heart, Home, LayoutDashboard, Lock, Mail, MoreVertical, Package, PawPrint, Plus, Scissors, Search, ShieldCheck, Star, Trash2, UserRound, Users, Utensils, X } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { AdminRecord, AdminRecordPayload, AppUser, DaycareSettings, PetOption, PetPayload, Reservation, ReservationPayload, Tutor, TutorPayload, UserPayload } from "@/lib/types";

type Props = {
  pets: PetOption[];
  reservations: Reservation[];
  settings: DaycareSettings;
};

type AdminModulePageKey = "services" | "packages" | "daily_reports" | "activities" | "feeding" | "schedules" | "unit" | "communications" | "general_settings";
type AdminPageKey = "dashboard" | "reservations" | "pets" | "clients" | "agenda" | "checkin" | "grooming" | "users" | AdminModulePageKey;

const statusTabs = [
  { label: "Todas", status: "all" },
  { label: "Aguardando aprovacao", status: "Aguardando aprovacao" },
  { label: "Confirmadas", status: "Confirmada" },
  { label: "Em andamento", status: "Em andamento" },
  { label: "Concluidas", status: "Concluida" },
  { label: "Canceladas", status: "Cancelada" }
];

const googleLoginEnabled = false;

type ModuleField = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "time" | "textarea" | "select";
  options?: string[];
};

type ModuleConfig = {
  key: AdminModulePageKey;
  title: string;
  description: string;
  newLabel: string;
  icon: typeof PawPrint;
  fields: ModuleField[];
  defaults: AdminRecordPayload[];
};

const moduleConfigs: Record<AdminModulePageKey, ModuleConfig> = {
  services: {
    key: "services",
    title: "Servicos",
    description: "Cadastre e acompanhe os servicos oferecidos pela Scolt&Cia.",
    newLabel: "Novo servico",
    icon: Scissors,
    fields: [
      { key: "price", label: "Preco", type: "number" },
      { key: "duration", label: "Duracao" },
      { key: "capacity", label: "Capacidade diaria", type: "number" },
      { key: "description", label: "Descricao", type: "textarea" }
    ],
    defaults: [
      { module_key: "services", title: "Creche / Day Care", status: "Ativo", payload: { price: 85, duration: "Diaria", capacity: 20, description: "Socializacao, recreacao e descanso supervisionado." } },
      { module_key: "services", title: "Hospedagem", status: "Ativo", payload: { price: 120, duration: "Diaria", capacity: 10, description: "Pernoite com rotina, carinho e acompanhamento." } },
      { module_key: "services", title: "Banho e Tosa", status: "Ativo", payload: { price: 120, duration: "2 horas", capacity: 8, description: "Higiene completa com cuidado e qualidade." } }
    ]
  },
  packages: {
    key: "packages",
    title: "Pacotes",
    description: "Monte pacotes comerciais para recorrencia, hospedagem e banho.",
    newLabel: "Novo pacote",
    icon: Package,
    fields: [
      { key: "service", label: "Servico", type: "select", options: ["Day Care", "Hospedagem", "Banho e Tosa", "Misto"] },
      { key: "sessions", label: "Sessoes/diarias", type: "number" },
      { key: "price", label: "Valor", type: "number" },
      { key: "validity", label: "Validade" }
    ],
    defaults: [
      { module_key: "packages", title: "Day Care 10 diarias", status: "Ativo", payload: { service: "Day Care", sessions: 10, price: 780, validity: "30 dias" } },
      { module_key: "packages", title: "Hospedagem Premium", status: "Ativo", payload: { service: "Hospedagem", sessions: 5, price: 560, validity: "60 dias" } }
    ]
  },
  daily_reports: {
    key: "daily_reports",
    title: "Relatorios diarios",
    description: "Registre humor, alimentacao, atividades e observacoes para tutores.",
    newLabel: "Novo relatorio",
    icon: ClipboardCheck,
    fields: [
      { key: "pet", label: "Pet" },
      { key: "date", label: "Data", type: "date" },
      { key: "mood", label: "Humor", type: "select", options: ["Feliz", "Calmo", "Agitado", "Sonolento"] },
      { key: "feeding", label: "Alimentacao" },
      { key: "notes", label: "Observacoes", type: "textarea" }
    ],
    defaults: []
  },
  activities: {
    key: "activities",
    title: "Atividades",
    description: "Planeje e registre as atividades recreativas dos grupos.",
    newLabel: "Nova atividade",
    icon: Activity,
    fields: [
      { key: "date", label: "Data", type: "date" },
      { key: "time", label: "Horario", type: "time" },
      { key: "group", label: "Grupo" },
      { key: "responsible", label: "Responsavel" },
      { key: "notes", label: "Observacoes", type: "textarea" }
    ],
    defaults: [
      { module_key: "activities", title: "Recreacao monitorada", status: "Planejada", payload: { date: localDateKey(), time: "09:00", group: "Todos os grupos", responsible: "Equipe", notes: "Brincadeiras e socializacao." } }
    ]
  },
  feeding: {
    key: "feeding",
    title: "Alimentacao",
    description: "Controle refeicoes, restricoes e confirmacoes de alimentacao.",
    newLabel: "Novo registro",
    icon: Utensils,
    fields: [
      { key: "pet", label: "Pet" },
      { key: "date", label: "Data", type: "date" },
      { key: "time", label: "Horario", type: "time" },
      { key: "meal", label: "Refeicao" },
      { key: "notes", label: "Observacoes", type: "textarea" }
    ],
    defaults: []
  },
  schedules: {
    key: "schedules",
    title: "Escalas",
    description: "Organize turnos, responsaveis e cobertura da equipe.",
    newLabel: "Nova escala",
    icon: CalendarCheck,
    fields: [
      { key: "date", label: "Data", type: "date" },
      { key: "shift", label: "Turno", type: "select", options: ["Manha", "Tarde", "Noite", "Integral"] },
      { key: "member", label: "Colaborador" },
      { key: "role", label: "Funcao" },
      { key: "notes", label: "Observacoes", type: "textarea" }
    ],
    defaults: []
  },
  unit: {
    key: "unit",
    title: "Unidade",
    description: "Mantenha dados da unidade, endereco e operacao.",
    newLabel: "Novo item",
    icon: Home,
    fields: [
      { key: "value", label: "Valor" },
      { key: "category", label: "Categoria", type: "select", options: ["Endereco", "Horario", "Operacao", "Contato"] },
      { key: "notes", label: "Observacoes", type: "textarea" }
    ],
    defaults: [
      { module_key: "unit", title: "Endereco", status: "Ativo", payload: { value: "Rua Engenheiro Ernesto Markgraf, 221 - Sao Paulo - SP", category: "Endereco", notes: "Endereco exibido no site e no rodape." } },
      { module_key: "unit", title: "Horario de funcionamento", status: "Ativo", payload: { value: "Seg a Sab: 7h as 19h", category: "Horario", notes: "Domingo mediante reserva." } }
    ]
  },
  communications: {
    key: "communications",
    title: "Comunicacoes",
    description: "Crie modelos de mensagens para tutores e rotina operacional.",
    newLabel: "Nova mensagem",
    icon: Mail,
    fields: [
      { key: "channel", label: "Canal", type: "select", options: ["WhatsApp", "E-mail", "Interno"] },
      { key: "audience", label: "Publico" },
      { key: "message", label: "Mensagem", type: "textarea" }
    ],
    defaults: [
      { module_key: "communications", title: "Confirmacao de reserva", status: "Ativo", payload: { channel: "WhatsApp", audience: "Tutores", message: "Reserva confirmada! Estamos esperando seu pet com carinho." } }
    ]
  },
  general_settings: {
    key: "general_settings",
    title: "Configuracoes gerais",
    description: "Centralize regras de atendimento, limites e preferencias internas.",
    newLabel: "Nova configuracao",
    icon: ShieldCheck,
    fields: [
      { key: "value", label: "Valor" },
      { key: "category", label: "Categoria", type: "select", options: ["Capacidade", "Reserva", "Financeiro", "Sistema"] },
      { key: "notes", label: "Observacoes", type: "textarea" }
    ],
    defaults: [
      { module_key: "general_settings", title: "Capacidade maxima", status: "Ativo", payload: { value: "20", category: "Capacidade", notes: "Controlada tambem pelo painel de capacidade." } }
    ]
  }
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function activeCapacityCount(reservations: Reservation[]) {
  return reservations.filter((item) => ["Aguardando aprovacao", "Pendente", "Confirmada", "Em andamento"].includes(item.status)).length;
}

const activeStatuses = ["Aguardando aprovacao", "Pendente", "Confirmada", "Em andamento"];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${value}T12:00:00`));
}

function fullDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function serviceKind(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("hosped")) return "Hospedagem";
  if (normalized.includes("banho") || normalized.includes("tosa")) return "Banho e Tosa";
  if (normalized.includes("ativ") || normalized.includes("passeio") || normalized.includes("recre")) return "Atividade";
  return "Day Care";
}

function isTodayReservation(item: Reservation, today: string) {
  return item.entry_date === today;
}

function isActiveHosting(item: Reservation, today: string) {
  if (serviceKind(item.service) !== "Hospedagem") return false;
  if (!activeStatuses.includes(item.status)) return false;
  const exit = item.exit_date || item.entry_date;
  return item.entry_date <= today && exit >= today;
}

function uniqueClientCount(reservations: Reservation[], pets: PetOption[]) {
  const clients = new Set<string>();
  reservations.forEach((item) => clients.add((item.email || item.phone || item.tutor_name).toLowerCase()));
  pets.forEach((pet) => clients.add((pet.tutor_email || pet.tutor_phone || pet.tutor_name || pet.name).toLowerCase()));
  clients.delete("");
  return clients.size;
}

function trendPoints(values: number[], width = 180, height = 44) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values.map((value, index) => {
    const x = Math.round(index * step);
    const y = Math.round(height - (value / max) * (height - 10) - 5);
    return `${x},${y}`;
  }).join(" ");
}

function linePoints(values: number[], width = 620, height = 220) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values.map((value, index) => {
    const x = Math.round(index * step);
    const y = Math.round(height - (value / max) * (height - 42) - 22);
    return `${x},${y}`;
  }).join(" ");
}

function reservationDays(item: Reservation) {
  const start = new Date(`${item.entry_date}T12:00:00`);
  const end = new Date(`${item.exit_date || item.entry_date}T12:00:00`);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

function reservationValue(item: Reservation) {
  const kind = serviceKind(item.service);
  const price = kind === "Hospedagem" ? 120 : kind === "Banho e Tosa" ? 120 : 85;
  return price * reservationDays(item);
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("confirm")) return "confirmed";
  if (normalized.includes("cancel") || normalized.includes("reprov")) return "canceled";
  if (normalized.includes("conclu")) return "done";
  return "pending";
}

function serviceIconClass(service: string) {
  const kind = serviceKind(service);
  if (kind === "Hospedagem") return "hosting";
  if (kind === "Banho e Tosa") return "grooming";
  if (kind === "Atividade") return "activity";
  return "daycare";
}

type ReservationPatch = Partial<Pick<Reservation, "status" | "expected_time" | "notes" | "exit_date" | "entry_date" | "service" | "pet_name" | "breed" | "size" | "tutor_name" | "phone" | "email">>;
type PetPatch = Partial<Pick<PetPayload, "name" | "breed" | "size" | "sex" | "weight" | "birth_date" | "behavior" | "food_restrictions" | "medications" | "important_notes" | "veterinarian" | "photo_url" | "tutor_ids">>;
type TutorPatch = Partial<TutorPayload>;

type TutorRecord = {
  key: string;
  id?: number | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at?: string | null;
  pets: PetOption[];
  reservations: Reservation[];
};

function tutorKeyFromPet(pet: PetOption) {
  return String(pet.tutor_id || pet.tutor_email || pet.tutor_phone || pet.tutor_name || pet.id);
}

function tutorRecordFromTutor(tutor: Tutor): TutorRecord {
  return {
    key: `tutor-${tutor.id}`,
    id: tutor.id,
    name: tutor.full_name,
    phone: tutor.phone || "",
    email: tutor.email || "",
    address: tutor.address || "",
    created_at: tutor.created_at,
    pets: [],
    reservations: []
  };
}

function buildTutors(pets: PetOption[], reservations: Reservation[], baseTutors: TutorRecord[] = []) {
  const map = new Map<string, TutorRecord>();
  baseTutors.forEach((tutor) => {
    map.set(tutor.key, { ...tutor, pets: [], reservations: [] });
  });
  pets.forEach((pet) => {
    const tutorIds = pet.tutor_ids?.length ? pet.tutor_ids : pet.tutor_id ? [pet.tutor_id] : [];
    if (tutorIds.length > 0) {
      tutorIds.forEach((id) => {
        const key = `tutor-${id}`;
        if (!map.has(key)) {
          map.set(key, {
            key,
            id,
            name: pet.tutor_name || "Tutor sem nome",
            phone: pet.tutor_phone || "",
            email: pet.tutor_email || "",
            address: pet.tutor_address || "",
            created_at: pet.created_at,
            pets: [],
            reservations: []
          });
        }
        map.get(key)?.pets.push(pet);
      });
      return;
    }

    const key = tutorKeyFromPet(pet);
    if (!map.has(key)) {
      map.set(key, {
        key,
        id: pet.tutor_id,
        name: pet.tutor_name || "Tutor sem nome",
        phone: pet.tutor_phone || "",
        email: pet.tutor_email || "",
        address: pet.tutor_address || "",
        created_at: pet.created_at,
        pets: [],
        reservations: []
      });
    }
    map.get(key)?.pets.push(pet);
  });
  reservations.forEach((reservation) => {
    const key = String(reservation.email || reservation.phone || reservation.tutor_name);
    const matched = [...map.values()].find((tutor) => tutor.email === reservation.email || tutor.phone === reservation.phone || tutor.name === reservation.tutor_name);
    const tutor = matched || map.get(key);
    if (tutor) {
      tutor.reservations.push(reservation);
    } else {
      map.set(key, {
        key,
        name: reservation.tutor_name,
        phone: reservation.phone,
        email: reservation.email || "",
        address: "",
        pets: [],
        reservations: [reservation]
      });
    }
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

type NotificationItem = {
  key: string;
  title: string;
  text: string;
  meta: string;
  tone: "pending" | "confirmed" | "done" | "canceled";
};

function buildAdminNotifications(reservations: Reservation[]) {
  const today = localDateKey();
  const pending = reservations
    .filter((item) => item.status === "Aguardando aprovacao" || item.status === "Pendente")
    .slice(0, 4)
    .map((item) => ({
      key: `pending-${item.id}`,
      title: "Reserva aguardando aprovacao",
      text: `${item.pet_name} - ${serviceKind(item.service)} com ${item.tutor_name}`,
      meta: `${dateLabel(item.entry_date)} ${item.expected_time || ""}`.trim(),
      tone: "pending" as const
    }));
  const checkins = reservations
    .filter((item) => item.entry_date === today && ["Confirmada", "Aguardando aprovacao", "Pendente"].includes(item.status))
    .slice(0, 4)
    .map((item) => ({
      key: `checkin-${item.id}`,
      title: "Check-in previsto hoje",
      text: `${item.pet_name} chega para ${serviceKind(item.service)}`,
      meta: item.expected_time || "Horario nao informado",
      tone: "confirmed" as const
    }));
  const inProgress = reservations
    .filter((item) => item.status === "Em andamento")
    .slice(0, 3)
    .map((item) => ({
      key: `progress-${item.id}`,
      title: "Atendimento em andamento",
      text: `${item.pet_name} esta em ${serviceKind(item.service)}`,
      meta: item.exit_date ? `Saida ${dateLabel(item.exit_date)}` : "Acompanhar atendimento",
      tone: "done" as const
    }));

  return [...pending, ...checkins, ...inProgress].slice(0, 8);
}

function AdminNotificationBell({ reservations, fallbackCount = 0, onOpenReservations }: { reservations?: Reservation[]; fallbackCount?: number; onOpenReservations?: (status?: string) => void }) {
  const [open, setOpen] = useState(false);
  const notifications = buildAdminNotifications(reservations || []);
  const count = reservations ? notifications.length : fallbackCount;

  function openPending() {
    setOpen(false);
    onOpenReservations?.("Aguardando aprovacao");
  }

  return (
    <div className="admin-notification-wrap">
      <button className="admin-bell" type="button" onClick={() => setOpen((current) => !current)}><Bell size={20} />{count > 0 && <span>{count}</span>}</button>
      {open && (
        <div className="admin-notification-popover">
          <div className="admin-notification-head">
            <div><strong>Notificacoes</strong><small>{count > 0 ? `${count} alerta(s) para acompanhar` : "Tudo certo por enquanto"}</small></div>
            <button onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <div className="admin-notification-list">
            {notifications.map((item) => (
              <button key={item.key} onClick={item.tone === "pending" ? openPending : () => setOpen(false)}>
                <i className={item.tone}><Bell size={14} /></i>
                <span><strong>{item.title}</strong><small>{item.text}</small><em>{item.meta}</em></span>
              </button>
            ))}
            {notifications.length === 0 && <p className="admin-empty">Nenhuma notificacao importante agora.</p>}
          </div>
          <footer>
            <button onClick={openPending}>Ver reservas pendentes</button>
          </footer>
        </div>
      )}
    </div>
  );
}

function petAge(pet: PetOption) {
  if (!pet.birth_date) return "-";
  const birth = new Date(`${pet.birth_date}T12:00:00`);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years -= 1;
  return years <= 0 ? "Menos de 1 ano" : `${years} ano${years > 1 ? "s" : ""}`;
}

function petStatus(pet: PetOption, reservations: Reservation[]) {
  return reservations.some((item) => item.pet_id === pet.id && activeStatuses.includes(item.status)) ? "Ativo" : "Ativo";
}

function petLastActivity(pet: PetOption, reservations: Reservation[]) {
  const last = reservations
    .filter((item) => item.pet_id === pet.id || item.pet_name.toLowerCase() === pet.name.toLowerCase())
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))[0];
  return last ? `${dateLabel(last.entry_date)} - ${serviceKind(last.service)}` : "Sem atividade";
}

function petNotes(pet: PetOption) {
  return [pet.food_restrictions, pet.medications, pet.important_notes, pet.behavior].filter(Boolean) as string[];
}

function tutorInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "T";
}

function tutorNeighborhood(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 2] : "Sao Paulo - SP";
}

function tutorTotalSpent(tutor: TutorRecord) {
  return tutor.reservations.reduce((sum, item) => sum + reservationValue(item), 0);
}

function tutorLastReservation(tutor: TutorRecord) {
  return [...tutor.reservations].sort((a, b) => b.entry_date.localeCompare(a.entry_date))[0];
}

type AdminRecordsPageProps = {
  config: ModuleConfig;
  records: AdminRecord[];
  reservations: Reservation[];
  onCreate: (payload: AdminRecordPayload) => Promise<void>;
  onPatch: (id: number, payload: Partial<AdminRecordPayload>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

function recordValue(record: AdminRecord | AdminRecordPayload, key: string) {
  const value = record.payload?.[key];
  return value === undefined || value === null ? "" : String(value);
}

function AdminRecordsPage({ config, records, reservations, onCreate, onPatch, onDelete }: AdminRecordsPageProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<AdminRecord | null>(null);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminRecordPayload>({ module_key: config.key, title: "", status: "Ativo", payload: {} });
  const Icon = config.icon;
  const mergedRecords = useMemo(() => {
    const persistedTitles = new Set(records.map((record) => record.title.toLowerCase()));
    const defaults = config.defaults
      .filter((item) => !persistedTitles.has(item.title.toLowerCase()))
      .map((item, index) => ({
        id: Number(`9${index}${config.key.length}`),
        module_key: config.key,
        title: item.title,
        status: item.status || "Ativo",
        payload: item.payload || {},
        created_at: null,
        updated_at: null
      } as AdminRecord));
    return [...records, ...defaults];
  }, [records, config]);

  const filteredRecords = useMemo(() => {
    const text = query.trim().toLowerCase();
    return mergedRecords.filter((record) => {
      const payloadText = Object.values(record.payload || {}).join(" ").toLowerCase();
      const matchesText = !text || record.title.toLowerCase().includes(text) || record.status.toLowerCase().includes(text) || payloadText.includes(text);
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [mergedRecords, query, statusFilter]);

  const statuses = Array.from(new Set(mergedRecords.map((record) => record.status))).filter(Boolean);
  const activeCount = mergedRecords.filter((record) => ["Ativo", "Planejada", "Confirmado", "Concluido"].includes(record.status)).length;

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setDetail(null);
    setForm({ module_key: config.key, title: "", status: "Ativo", payload: Object.fromEntries(config.fields.map((field) => [field.key, ""])) });
  }

  function openEdit(record: AdminRecord) {
    setEditing(record);
    setCreating(false);
    setDetail(null);
    setForm({ module_key: config.key, title: record.title, status: record.status, payload: { ...record.payload } });
  }

  async function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editing && editing.created_at) {
      await onPatch(editing.id, form);
    } else {
      await onCreate(form);
    }
    setCreating(false);
    setEditing(null);
  }

  async function removeRecord(record: AdminRecord) {
    if (record.created_at) await onDelete(record.id);
    setDetail(null);
  }

  async function toggleStatus(record: AdminRecord) {
    const nextStatus = record.status === "Ativo" ? "Inativo" : record.status === "Concluido" ? "Ativo" : "Concluido";
    if (record.created_at) {
      await onPatch(record.id, { status: nextStatus });
    } else {
      await onCreate({ module_key: config.key, title: record.title, status: nextStatus, payload: record.payload });
    }
    setDetail(null);
  }

  return (
    <section className="admin-main admin-module-page">
      <header className="admin-reservations-head">
        <div>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search reservation-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar em ${config.title.toLowerCase()}...`} /><Search size={20} /></label>
          <AdminNotificationBell reservations={reservations} fallbackCount={mergedRecords.length} />
          <div className="admin-date"><CalendarDays size={20} />Hoje, {fullDateLabel()}</div>
        </div>
      </header>

      <div className="reservation-metrics module-metrics">
        <article><span className="aqua"><Icon size={28} /></span><div><small>Total</small><strong>{mergedRecords.length}</strong><em>{filteredRecords.length} no filtro atual</em></div></article>
        <article><span className="purple"><CheckCircle2 size={28} /></span><div><small>Ativos</small><strong>{activeCount}</strong><em>Itens em uso</em></div></article>
        <article><span className="yellow"><Clock size={28} /></span><div><small>Pendentes</small><strong>{mergedRecords.filter((record) => ["Pendente", "Planejada"].includes(record.status)).length}</strong><em>Aguardando acao</em></div></article>
        <article><span className="pink"><Star size={28} /></span><div><small>Modelos</small><strong>{config.defaults.length}</strong><em>Padroes do sistema</em></div></article>
        <article><span className="aqua"><Edit3 size={28} /></span><div><small>Personalizados</small><strong>{records.length}</strong><em>Salvos no sistema</em></div></article>
      </div>

      <section className="reservation-table-card module-table-card">
        <div className="reservation-filterbar module-filterbar">
          <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por titulo, status ou detalhe..." /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos os status</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button onClick={() => { setQuery(""); setStatusFilter("all"); }}><Filter size={18} />Filtros</button>
          <button className="new-client-button" onClick={openCreate}><Plus size={18} />{config.newLabel}</button>
        </div>

        <div className="module-table">
          <div className="module-table-head"><span>Item</span><span>Status</span>{config.fields.slice(0, 3).map((field) => <span key={field.key}>{field.label}</span>)}<span></span></div>
          {filteredRecords.map((record) => (
            <button key={`${record.module_key}-${record.id}-${record.title}`} className="module-table-row" onClick={() => setDetail(record)}>
              <span className="module-title-cell"><i><Icon size={18} /></i><b>{record.title}</b><small>{record.created_at ? "Registro personalizado" : "Modelo padrao"}</small></span>
              <span><em className={`reservation-status ${record.status === "Inativo" ? "done" : record.status === "Cancelado" ? "canceled" : record.status === "Pendente" || record.status === "Planejada" ? "pending" : "confirmed"}`}>{record.status}</em></span>
              {config.fields.slice(0, 3).map((field) => <span key={field.key}><b>{recordValue(record, field.key) || "-"}</b></span>)}
              <span><MoreVertical size={18} /></span>
            </button>
          ))}
          {filteredRecords.length === 0 && <p className="admin-empty">Nenhum item encontrado.</p>}
        </div>
      </section>

      {detail && (
        <div className="reservation-modal-backdrop">
          <aside className="client-detail-card module-detail-modal">
            <div className="client-detail-head">
              <div className="client-avatar-large"><Icon size={30} /></div>
              <div><h2>{detail.title}</h2><p><span>{config.title}</span><span>{detail.created_at ? `Criado em ${dateLabel(detail.created_at.slice(0, 10))}` : "Modelo padrao do sistema"}</span></p></div>
              <em className="reservation-status confirmed">{detail.status}</em>
              <button className="pet-detail-close" onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="module-detail-grid">
              {config.fields.map((field) => <article key={field.key}><small>{field.label}</small><strong>{recordValue(detail, field.key) || "-"}</strong></article>)}
            </div>
            <div className="client-detail-actions">
              <button onClick={() => openEdit(detail)}><Edit3 size={16} />Editar</button>
              <button onClick={() => toggleStatus(detail)}><CheckCircle2 size={16} />Alterar status</button>
              <button className="danger-action" onClick={() => removeRecord(detail)}><Trash2 size={16} />Excluir</button>
            </div>
          </aside>
        </div>
      )}

      {(creating || editing) && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal module-edit-modal" onSubmit={saveRecord}>
            <div className="reservation-detail-head"><h2>{editing ? "Editar item" : config.newLabel}</h2><button type="button" onClick={() => { setCreating(false); setEditing(null); }}><X size={18} /></button></div>
            <label>Titulo<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
            <label>Status<select value={form.status || "Ativo"} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option>Ativo</option><option>Inativo</option><option>Pendente</option><option>Planejada</option><option>Concluido</option><option>Cancelado</option></select></label>
            {config.fields.map((field) => (
              <label key={field.key} className={field.type === "textarea" ? "span-2" : ""}>{field.label}
                {field.type === "textarea" ? (
                  <textarea rows={4} value={recordValue(form, field.key)} onChange={(event) => setForm((current) => ({ ...current, payload: { ...current.payload, [field.key]: event.target.value } }))} />
                ) : field.type === "select" ? (
                  <select value={recordValue(form, field.key)} onChange={(event) => setForm((current) => ({ ...current, payload: { ...current.payload, [field.key]: event.target.value } }))}>
                    <option value="">Selecione</option>
                    {field.options?.map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : (
                  <input type={field.type || "text"} value={recordValue(form, field.key)} onChange={(event) => setForm((current) => ({ ...current, payload: { ...current.payload, [field.key]: event.target.value } }))} />
                )}
              </label>
            ))}
            <button className="approve-action span-2" type="submit"><Check size={18} />Salvar</button>
          </form>
        </div>
      )}
    </section>
  );
}

type AdminTutorsPageProps = {
  tutors: TutorRecord[];
  reservations: Reservation[];
  selectedTutorKey: string;
  setSelectedTutorKey: (key: string) => void;
  onCreate: (payload: TutorPayload) => Promise<TutorRecord | null>;
  onPatch: (id: number, payload: TutorPatch) => Promise<void>;
};

function AdminTutorsPage({ tutors, reservations, selectedTutorKey, setSelectedTutorKey, onCreate, onPatch }: AdminTutorsPageProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [detail, setDetail] = useState<TutorRecord | null>(null);
  const [editing, setEditing] = useState<TutorRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TutorPayload>({ full_name: "", phone: "", whatsapp: "", email: "", address: "", emergency_contact: "" });
  const areas = Array.from(new Set(tutors.map((tutor) => tutorNeighborhood(tutor.address)).filter(Boolean))).sort();
  const selected = selectedTutorKey ? tutors.find((tutor) => tutor.key === selectedTutorKey) : undefined;

  const filteredTutors = useMemo(() => {
    const text = query.trim().toLowerCase();
    return tutors.filter((tutor) => {
      const active = tutor.pets.length > 0 || tutor.reservations.some((item) => activeStatuses.includes(item.status));
      const matchesText = !text || [tutor.name, tutor.phone, tutor.email, tutor.address, ...tutor.pets.map((pet) => pet.name)].some((value) => String(value || "").toLowerCase().includes(text));
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? active : !active);
      const matchesArea = areaFilter === "all" || tutorNeighborhood(tutor.address) === areaFilter;
      return matchesText && matchesStatus && matchesArea;
    });
  }, [tutors, query, statusFilter, areaFilter]);

  const activeTutors = tutors.filter((tutor) => tutor.pets.length > 0 || tutor.reservations.some((item) => activeStatuses.includes(item.status))).length;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const newTutors = tutors.filter((tutor) => {
    if (!tutor.created_at) return false;
    const created = new Date(tutor.created_at);
    return created.getMonth() + 1 === currentMonth && created.getFullYear() === currentYear;
  }).length;
  const reservationsThisMonth = tutors.filter((tutor) => tutor.reservations.some((item) => {
    const date = new Date(`${item.entry_date}T12:00:00`);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  })).length;

  function openDetail(tutor: TutorRecord) {
    setSelectedTutorKey(tutor.key);
    setDetail(tutor);
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ full_name: "", phone: "", whatsapp: "", email: "", address: "", emergency_contact: "" });
  }

  function openEdit(tutor: TutorRecord) {
    setEditing(tutor);
    setCreating(false);
    setDetail(null);
    setForm({
      full_name: tutor.name,
      phone: tutor.phone,
      whatsapp: tutor.phone,
      email: tutor.email,
      address: tutor.address,
      emergency_contact: ""
    });
  }

  async function saveTutor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...form, whatsapp: form.whatsapp || form.phone };
    if (editing?.id) {
      await onPatch(editing.id, payload);
    } else {
      await onCreate(payload);
    }
    setEditing(null);
    setCreating(false);
  }

  return (
    <section className="admin-main admin-clients-page">
      <header className="admin-reservations-head">
        <div>
          <h1>Clientes (Tutores)</h1>
          <p>Gerencie os tutores cadastrados e acompanhe seu relacionamento.</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search reservation-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tutor por nome, e-mail ou telefone..." /><Search size={20} /></label>
          <AdminNotificationBell reservations={reservations} fallbackCount={newTutors} />
          <div className="admin-date"><CalendarDays size={20} />Hoje, {fullDateLabel()}</div>
        </div>
      </header>

      <div className="reservation-metrics client-metrics">
        <article><span className="aqua"><Users size={28} /></span><div><small>Total de tutores</small><strong>{tutors.length}</strong><em>{filteredTutors.length} no filtro atual</em></div></article>
        <article><span className="purple"><Star size={28} /></span><div><small>Novos cadastros</small><strong>{newTutors}</strong><em>Este mes</em></div></article>
        <article><span className="yellow"><Heart size={28} /></span><div><small>Tutores ativos</small><strong>{activeTutors}</strong><em>Com pets ou reservas</em></div></article>
        <article><span className="pink"><CalendarCheck size={28} /></span><div><small>Com reservas este mes</small><strong>{reservationsThisMonth}</strong><em>Relacionamento ativo</em></div></article>
        <article><span className="aqua"><Mail size={28} /></span><div><small>Avaliacao media</small><strong>4,8</strong><em>Base pronta para notas</em></div></article>
      </div>

      <div className="clients-workspace">
        <section className="reservation-table-card clients-table-card">
          <div className="reservation-filterbar clients-filterbar">
            <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tutor por nome, e-mail ou telefone..." /></label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
              <option value="all">Todos os bairros</option>
              {areas.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
            <button onClick={() => { setQuery(""); setStatusFilter("all"); setAreaFilter("all"); }}><Filter size={18} />Filtros</button>
            <button className="new-client-button" onClick={openCreate}><Plus size={18} />Novo tutor</button>
          </div>

          <div className="clients-table">
            <div className="clients-table-head"><span>Tutor</span><span>Contato</span><span>Pets</span><span>Cidade / Bairro</span><span>Status</span><span>Ultima reserva</span><span>Total gasto</span><span></span></div>
            {filteredTutors.map((tutor) => {
              const last = tutorLastReservation(tutor);
              const active = tutor.pets.length > 0 || tutor.reservations.some((item) => activeStatuses.includes(item.status));
              return (
                <button key={tutor.key} className={`clients-table-row ${selected?.key === tutor.key ? "active" : ""}`} onClick={() => openDetail(tutor)}>
                  <span className="client-name-cell"><i>{tutorInitials(tutor.name)}</i><b>{tutor.name}</b></span>
                  <span><b>{tutor.phone || "Telefone nao informado"}</b><small>{tutor.email || "E-mail nao informado"}</small></span>
                  <span><em className="client-pet-count"><PawPrint size={14} />{tutor.pets.length}</em></span>
                  <span><b>Sao Paulo - SP</b><small>{tutorNeighborhood(tutor.address)}</small></span>
                  <span><em className={`reservation-status ${active ? "confirmed" : "done"}`}>{active ? "Ativo" : "Inativo"}</em></span>
                  <span>{last ? <><b>{dateLabel(last.entry_date)}</b><small>{serviceKind(last.service)}</small></> : "Sem reserva"}</span>
                  <span><b>{money(tutorTotalSpent(tutor))}</b></span>
                  <span><MoreVertical size={18} /></span>
                </button>
              );
            })}
            {filteredTutors.length === 0 && <p className="admin-empty">Nenhum tutor encontrado com esses filtros.</p>}
          </div>

          <footer className="reservation-pagination">
            <span>Mostrando {filteredTutors.length ? 1 : 0} a {filteredTutors.length} de {tutors.length} tutores</span>
          </footer>
        </section>
      </div>

      {detail && (
        <div className="reservation-modal-backdrop">
          <aside className="client-detail-card client-detail-modal">
            <div className="client-detail-head">
              <div className="client-avatar-large">{tutorInitials(detail.name)}</div>
              <div>
                <h2>{detail.name}</h2>
                <p><span>{detail.phone || "Telefone nao informado"}</span><span>{detail.email || "E-mail nao informado"}</span><span>{detail.address || "Endereco nao cadastrado"}</span></p>
              </div>
              <em className="reservation-status confirmed">Ativo</em>
              <button className="pet-detail-close" onClick={() => setDetail(null)}><X size={18} /></button>
            </div>

            <div className="client-summary-grid">
              <article><small>Desde</small><strong>{detail.created_at ? dateLabel(detail.created_at.slice(0, 10)) : "-"}</strong><span>Cliente cadastrado</span></article>
              <article><small>Total gasto</small><strong>{money(tutorTotalSpent(detail))}</strong><span>Em {detail.reservations.length} reservas</span></article>
              <article><small>Avaliacao media</small><strong>5,0</strong><span>{Math.max(detail.reservations.length, 1)} atendimento(s)</span></article>
            </div>

            <section className="client-detail-section">
              <div><h3>Pets cadastrados</h3><button>Ver todos os pets ({detail.pets.length})</button></div>
              <div className="client-pets-grid">
                {detail.pets.slice(0, 4).map((pet) => <article key={pet.id}><i>{pet.name.slice(0, 1)}</i><strong>{pet.name}</strong><span>{pet.breed || "Pet"} - {petAge(pet)}</span></article>)}
                {detail.pets.length === 0 && <p>Nenhum pet vinculado ainda.</p>}
              </div>
            </section>

            <section className="client-detail-section">
              <div><h3>Ultimas reservas</h3><button>Ver todas</button></div>
              <div className="client-reservations-list">
                {detail.reservations.slice(0, 4).map((item) => <article key={item.id}><span className={`reservation-service ${serviceIconClass(item.service)}`}>{serviceKind(item.service)}</span><div><strong>{dateLabel(item.entry_date)}</strong><small>{item.pet_name}</small></div><em className={`reservation-status ${statusClass(item.status)}`}>{item.status}</em></article>)}
                {detail.reservations.length === 0 && <p>Nenhuma reserva cadastrada.</p>}
              </div>
            </section>

            <section className="client-note-box">
              <h3>Anotacoes</h3>
              <p>{detail.name} tem {detail.pets.length} pet(s) cadastrado(s) e {detail.reservations.length} reserva(s) no historico.</p>
            </section>

            <div className="client-detail-actions">
              <button onClick={() => openEdit(detail)}><Edit3 size={16} />Editar tutor</button>
              <button><Clock size={16} />Historico completo</button>
              <a href={`https://wa.me/55${detail.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Mail size={16} />Enviar mensagem</a>
            </div>
          </aside>
        </div>
      )}

      {(creating || editing) && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal client-edit-modal" onSubmit={saveTutor}>
            <div className="reservation-detail-head"><h2>{editing ? "Editar tutor" : "Novo tutor"}</h2><button type="button" onClick={() => { setEditing(null); setCreating(false); }}><X size={18} /></button></div>
            <label>Nome<input required value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} /></label>
            <label>Telefone<input value={form.phone || ""} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>WhatsApp<input value={form.whatsapp || ""} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} /></label>
            <label>E-mail<input type="email" value={form.email || ""} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label className="span-2">Endereco<input value={form.address || ""} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} /></label>
            <label className="span-2">Contato de emergencia<input value={form.emergency_contact || ""} onChange={(event) => setForm((current) => ({ ...current, emergency_contact: event.target.value }))} /></label>
            <button className="approve-action span-2" type="submit"><Check size={18} />Salvar tutor</button>
          </form>
        </div>
      )}
    </section>
  );
}

type AdminPetsPageProps = {
  pets: PetOption[];
  tutors: TutorRecord[];
  reservations: Reservation[];
  selectedPetId: number;
  setSelectedPetId: (id: number) => void;
  onCreate: (payload: PetPayload) => Promise<PetOption | null>;
  onPatch: (id: number, payload: PetPatch) => Promise<void>;
  onCreateTutor: (payload: TutorPayload) => Promise<TutorRecord | null>;
};

function AdminPetsPage({ pets, tutors, reservations, selectedPetId, setSelectedPetId, onCreate, onPatch, onCreateTutor }: AdminPetsPageProps) {
  const [query, setQuery] = useState("");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState("info");
  const [detail, setDetail] = useState<PetOption | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PetOption | null>(null);
  const [editForm, setEditForm] = useState<PetPatch>({});
  const [selectedTutorIds, setSelectedTutorIds] = useState<number[]>([]);
  const [showTutorForm, setShowTutorForm] = useState(false);
  const [tutorForm, setTutorForm] = useState<TutorPayload>({ full_name: "", phone: "", whatsapp: "", email: "", address: "", emergency_contact: "" });
  const breeds = Array.from(new Set(pets.map((pet) => pet.breed).filter(Boolean) as string[])).sort();
  const selected = selectedPetId ? pets.find((pet) => pet.id === selectedPetId) : undefined;
  const filteredPets = useMemo(() => {
    const text = query.trim().toLowerCase();
    return pets.filter((pet) => {
      const matchesText = !text || [pet.name, pet.breed, pet.size, pet.tutor_name, pet.tutor_phone, pet.tutor_email].some((value) => String(value || "").toLowerCase().includes(text));
      const matchesBreed = breedFilter === "all" || pet.breed === breedFilter;
      const matchesSize = sizeFilter === "all" || pet.size === sizeFilter;
      const matchesStatus = statusFilter === "all" || petStatus(pet, reservations) === statusFilter;
      return matchesText && matchesBreed && matchesSize && matchesStatus;
    });
  }, [pets, reservations, query, breedFilter, sizeFilter, statusFilter]);
  const cats = pets.filter((pet) => String(pet.breed || "").toLowerCase().includes("gato") || String(pet.breed || "").toLowerCase().includes("cat")).length;
  const documented = pets.filter((pet) => pet.birth_date && pet.tutor_name && pet.tutor_phone).length;
  const activePets = pets.filter((pet) => petStatus(pet, reservations) === "Ativo").length;

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setDetail(null);
    setShowTutorForm(false);
    setSelectedTutorIds([]);
    setTutorForm({ full_name: "", phone: "", whatsapp: "", email: "", address: "", emergency_contact: "" });
    setEditForm({
      name: "",
      breed: "",
      size: "Pequeno",
      sex: "",
      weight: null,
      birth_date: "",
      behavior: "",
      food_restrictions: "",
      medications: "",
      important_notes: "",
      veterinarian: "",
      photo_url: ""
    });
  }

  function openEdit(pet: PetOption) {
    setEditing(pet);
    setCreating(false);
    setDetail(null);
    setShowTutorForm(false);
    setTutorForm({ full_name: "", phone: "", whatsapp: "", email: "", address: "", emergency_contact: "" });
    setSelectedTutorIds((pet.tutor_ids?.length ? pet.tutor_ids : pet.tutor_id ? [pet.tutor_id] : []).map(Number));
    setEditForm({
      name: pet.name,
      breed: pet.breed || "",
      size: pet.size || "",
      sex: pet.sex || "",
      weight: pet.weight || null,
      birth_date: pet.birth_date || "",
      behavior: pet.behavior || "",
      food_restrictions: pet.food_restrictions || "",
      medications: pet.medications || "",
      important_notes: pet.important_notes || "",
      veterinarian: pet.veterinarian || "",
      photo_url: pet.photo_url || ""
    });
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...editForm, tutor_ids: selectedTutorIds, birth_date: editForm.birth_date || null, weight: editForm.weight ? Number(editForm.weight) : null };
    if (editing) {
      await onPatch(editing.id, payload);
    } else {
      await onCreate({ ...payload, name: String(editForm.name || "").trim() } as PetPayload);
    }
    setEditing(null);
    setCreating(false);
  }

  function closeEdit() {
    setEditing(null);
    setCreating(false);
  }

  function toggleTutor(id?: number | null) {
    if (!id) return;
    setSelectedTutorIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function createTutorInsidePet() {
    if (!tutorForm.full_name.trim()) return;
    const created = await onCreateTutor({ ...tutorForm, whatsapp: tutorForm.whatsapp || tutorForm.phone });
    if (created?.id) {
      setSelectedTutorIds((current) => current.includes(created.id!) ? current : [...current, created.id!]);
      setTutorForm({ full_name: "", phone: "", whatsapp: "", email: "", address: "", emergency_contact: "" });
      setShowTutorForm(false);
    }
  }

  function uploadPetPhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm((current) => ({ ...current, photo_url: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  function openDetail(pet: PetOption) {
    setSelectedPetId(pet.id);
    setTab("info");
    setDetail(pet);
  }

  return (
    <section className="admin-main admin-pets-page">
      <header className="admin-reservations-head">
        <div>
          <h1>Pets</h1>
          <p>Gerencie as informacoes, documentos e historico dos pets cadastrados.</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search reservation-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pet por nome, raca, tutor..." /><Search size={20} /></label>
          <button className="admin-primary-action" type="button" onClick={openCreate}><Plus size={18} />Adicionar pet</button>
          <AdminNotificationBell reservations={reservations} fallbackCount={pets.length} />
          <div className="admin-date"><CalendarDays size={20} />Hoje, {fullDateLabel()}</div>
        </div>
      </header>

      <div className="reservation-metrics pet-metrics">
        <article><span className="aqua"><Users size={28} /></span><div><small>Total de pets</small><strong>{pets.length}</strong><em>{filteredPets.length} no filtro atual</em></div></article>
        <article><span className="purple"><PawPrint size={28} /></span><div><small>Caes</small><strong>{Math.max(pets.length - cats, 0)}</strong><em>Pets caninos cadastrados</em></div></article>
        <article><span className="yellow"><PawPrint size={28} /></span><div><small>Gatos</small><strong>{cats}</strong><em>Identificados por raca</em></div></article>
        <article><span className="pink"><Heart size={28} /></span><div><small>Pets ativos</small><strong>{activePets}</strong><em>Disponiveis no sistema</em></div></article>
        <article><span className="aqua"><ClipboardCheck size={28} /></span><div><small>Documentacao em dia</small><strong>{documented}</strong><em>{pets.length ? Math.round((documented / pets.length) * 100) : 0}% do total</em></div></article>
      </div>

      <div className="pets-workspace">
        <section className="reservation-table-card pets-table-card">
          <div className="reservation-filterbar pets-filterbar">
            <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pet por nome..." /></label>
            <select value={breedFilter} onChange={(event) => setBreedFilter(event.target.value)}><option value="all">Todas as racas</option>{breeds.map((breed) => <option key={breed} value={breed}>{breed}</option>)}</select>
            <select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)}><option value="all">Todos os portes</option><option>Pequeno</option><option>Medio</option><option>Grande</option></select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos os status</option><option>Ativo</option></select>
            <button onClick={() => { setQuery(""); setBreedFilter("all"); setSizeFilter("all"); setStatusFilter("all"); }}><Filter size={18} />Filtros</button>
            <button className="new-client-button" type="button" onClick={openCreate}><Plus size={18} />Novo pet</button>
          </div>
          <div className="pets-table">
            <div className="pets-table-head"><span></span><span>Pet</span><span>Tutor</span><span>Raca</span><span>Porte</span><span>Idade</span><span>Status</span><span>Ultima atividade</span><span></span></div>
            {filteredPets.map((pet) => (
              <button key={pet.id} className={`pets-table-row ${selected?.id === pet.id ? "active" : ""}`} onClick={() => openDetail(pet)}>
                <span><input type="checkbox" checked={selected?.id === pet.id} onChange={() => openDetail(pet)} /></span>
                <span className="reservation-pet-cell">{pet.photo_url ? <img className="pet-photo-avatar" src={pet.photo_url} alt={pet.name} /> : <i>{pet.name.slice(0, 1)}</i>}<span><b>{pet.name}</b><small>{pet.sex || ""}</small></span></span>
                <span><b>{pet.tutor_name || "Sem tutor"}</b><small>{pet.tutor_phone || "Telefone nao informado"}</small></span>
                <span>{pet.breed || "-"}</span>
                <span><em className={`pet-size ${pet.size === "Grande" ? "large" : pet.size === "Medio" ? "medium" : "small"}`}>{pet.size || "-"}</em></span>
                <span>{petAge(pet)}</span>
                <span><em className="reservation-status confirmed">{petStatus(pet, reservations)}</em></span>
                <span>{petLastActivity(pet, reservations)}</span>
                <span><MoreVertical size={18} /></span>
              </button>
            ))}
            {filteredPets.length === 0 && (
              <div className="admin-empty pets-empty-state">
                <p>Nenhum pet encontrado com esses filtros.</p>
                <button className="new-client-button" type="button" onClick={openCreate}><Plus size={18} />Adicionar pet</button>
              </div>
            )}
          </div>
        </section>

      </div>

      {detail && (
        <div className="reservation-modal-backdrop">
        <aside className="pet-detail-card pet-detail-modal">
          {detail ? (
            <>
              <div className="pet-detail-hero">
                {detail.photo_url ? <img className="reservation-detail-avatar pet-detail-photo" src={detail.photo_url} alt={detail.name} /> : <div className="reservation-detail-avatar">{detail.name.slice(0, 1)}</div>}
                <div><h2>{detail.name}</h2><span>{detail.breed || "Raca nao informada"} - {petAge(detail)}</span></div>
                <em className="reservation-status confirmed">{petStatus(detail, reservations)}</em>
                <button className="pet-detail-close" onClick={() => setDetail(null)}><X size={18} /></button>
              </div>
              <div className="pet-actions">
                <button onClick={() => openEdit(detail)}><Edit3 size={16} />Editar</button>
                <button onClick={() => setTab("docs")}><ClipboardCheck size={16} />Vacinas</button>
                <button onClick={() => setTab("history")}><Clock size={16} />Historico</button>
                <button onClick={() => setTab("notes")}><MoreVertical size={16} />Mais</button>
              </div>
              <div className="pet-tabs"><button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>Informacoes</button><button className={tab === "docs" ? "active" : ""} onClick={() => setTab("docs")}>Documentos</button><button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>Historico</button><button className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")}>Anotacoes</button></div>
              {tab === "info" && <div className="pet-info-grid"><p><span>Tutor</span><strong>{detail.tutor_name || "-"}</strong></p><p><span>Data de nascimento</span><strong>{detail.birth_date ? dateLabel(detail.birth_date) : "-"}</strong></p><p><span>Telefone</span><strong>{detail.tutor_phone || "-"}</strong></p><p><span>Peso</span><strong>{detail.weight ? `${detail.weight} kg` : "-"}</strong></p><p><span>E-mail</span><strong>{detail.tutor_email || "-"}</strong></p><p><span>Sexo</span><strong>{detail.sex || "-"}</strong></p><p><span>Porte</span><strong>{detail.size || "-"}</strong></p><p><span>Veterinario</span><strong>{detail.veterinarian || "-"}</strong></p></div>}
              {tab === "docs" && <div className="pet-note-box"><strong>Documentos e vacinas</strong><p>{detail.birth_date ? "Cadastro com data de nascimento informada." : "Cadastre data de nascimento e documentos para acompanhar vencimentos."}</p><p>{detail.photo_url ? "Foto cadastrada." : "Foto ainda nao cadastrada."}</p></div>}
              {tab === "history" && <div className="pet-activity-list">{reservations.filter((item) => item.pet_id === detail.id || item.pet_name.toLowerCase() === detail.name.toLowerCase()).slice(0, 5).map((item) => <article key={item.id}><span className={`reservation-service ${serviceIconClass(item.service)}`}>{serviceKind(item.service)}</span><strong>{dateLabel(item.entry_date)} as {item.expected_time || "--:--"}</strong></article>)}<button className="approve-action"><Plus size={16} />Nova atividade</button></div>}
              {tab === "notes" && <div className="pet-note-box"><strong>Informacoes importantes</strong>{petNotes(detail).length ? petNotes(detail).map((note) => <p key={note}>{note}</p>) : <p>Nenhuma anotacao importante cadastrada.</p>}</div>}
            </>
          ) : <p className="admin-empty">Selecione um pet para ver os detalhes.</p>}
        </aside>
        </div>
      )}

      {(creating || editing) && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal pet-edit-modal" onSubmit={saveEdit}>
            <div className="reservation-detail-head"><h2>{editing ? "Editar pet" : "Novo pet"}</h2><button type="button" onClick={closeEdit}><X size={18} /></button></div>
            <label>Nome<input required value={editForm.name || ""} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label>Raca<input value={editForm.breed || ""} onChange={(event) => setEditForm((current) => ({ ...current, breed: event.target.value }))} /></label>
            <label>Porte<select value={editForm.size || "Pequeno"} onChange={(event) => setEditForm((current) => ({ ...current, size: event.target.value }))}><option>Pequeno</option><option>Medio</option><option>Grande</option></select></label>
            <label>Sexo<select value={editForm.sex || ""} onChange={(event) => setEditForm((current) => ({ ...current, sex: event.target.value }))}><option value="">Nao informado</option><option>Macho</option><option>Femea</option></select></label>
            <label>Peso<input type="number" value={editForm.weight ?? ""} onChange={(event) => setEditForm((current) => ({ ...current, weight: Number(event.target.value) }))} /></label>
            <label>Nascimento<input type="date" value={editForm.birth_date || ""} onChange={(event) => setEditForm((current) => ({ ...current, birth_date: event.target.value }))} /></label>
            <div className="pet-tutor-picker span-2">
              <div className="pet-tutor-picker-head">
                <div><strong>Tutores vinculados</strong><span>Selecione um ou mais tutores para este pet.</span></div>
                <button type="button" onClick={() => setShowTutorForm((current) => !current)}><Plus size={16} />Novo tutor</button>
              </div>
              <div className="pet-tutor-options">
                {tutors.map((tutor) => (
                  <label key={tutor.key} className={selectedTutorIds.includes(Number(tutor.id)) ? "active" : ""}>
                    <input type="checkbox" checked={selectedTutorIds.includes(Number(tutor.id))} onChange={() => toggleTutor(tutor.id)} disabled={!tutor.id} />
                    <span><b>{tutor.name}</b><small>{tutor.phone || tutor.email || "Contato nao informado"}</small></span>
                  </label>
                ))}
                {tutors.length === 0 && <p className="admin-empty">Nenhum tutor cadastrado ainda. Crie um novo tutor abaixo.</p>}
              </div>
              {showTutorForm && (
                <div className="pet-inline-tutor-form">
                  <label>Nome do tutor<input value={tutorForm.full_name} onChange={(event) => setTutorForm((current) => ({ ...current, full_name: event.target.value }))} /></label>
                  <label>Telefone<input value={tutorForm.phone || ""} onChange={(event) => setTutorForm((current) => ({ ...current, phone: event.target.value }))} /></label>
                  <label>E-mail<input type="email" value={tutorForm.email || ""} onChange={(event) => setTutorForm((current) => ({ ...current, email: event.target.value }))} /></label>
                  <label>Endereco<input value={tutorForm.address || ""} onChange={(event) => setTutorForm((current) => ({ ...current, address: event.target.value }))} /></label>
                  <button type="button" className="approve-action" onClick={createTutorInsidePet}><Check size={16} />Salvar tutor e vincular</button>
                </div>
              )}
            </div>
            <label className="span-2">Foto do pet<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadPetPhoto(event.target.files?.[0])} /></label>
            {editForm.photo_url && <div className="pet-photo-preview span-2"><img src={editForm.photo_url} alt="Previa da foto do pet" /><span>Previa da foto cadastrada</span><button type="button" onClick={() => setEditForm((current) => ({ ...current, photo_url: "" }))}>Remover foto</button></div>}
            <label className="span-2">Restricoes alimentares<textarea rows={3} value={editForm.food_restrictions || ""} onChange={(event) => setEditForm((current) => ({ ...current, food_restrictions: event.target.value }))} /></label>
            <label className="span-2">Medicamentos<textarea rows={3} value={editForm.medications || ""} onChange={(event) => setEditForm((current) => ({ ...current, medications: event.target.value }))} /></label>
            <label className="span-2">Anotacoes importantes<textarea rows={4} value={editForm.important_notes || ""} onChange={(event) => setEditForm((current) => ({ ...current, important_notes: event.target.value }))} /></label>
            <button className="approve-action span-2" type="submit"><Check size={18} />{editing ? "Salvar pet" : "Cadastrar pet"}</button>
          </form>
        </div>
      )}
    </section>
  );
}

type AdminReservationsPageProps = {
  reservations: Reservation[];
  selectedId: number;
  setSelectedId: (id: number) => void;
  pendingCount: number;
  initialStatus: string;
  initialService?: string;
  title?: string;
  description?: string;
  onPatch: (id: number, payload: ReservationPatch) => Promise<void>;
  onCreate: (payload: ReservationPayload) => Promise<Reservation | null>;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateInputValue(date: Date) {
  return localDateKey(date);
}

function minutesFromTime(value?: string) {
  if (!value) return 8 * 60;
  const [hours = "8", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function agendaEndTime(item: Reservation) {
  const start = minutesFromTime(item.expected_time);
  const duration = serviceKind(item.service) === "Hospedagem" ? 120 : serviceKind(item.service) === "Banho e Tosa" ? 90 : serviceKind(item.service) === "Atividade" ? 60 : 240;
  const end = start + duration;
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

type AdminAgendaPageProps = {
  reservations: Reservation[];
  pendingCount: number;
  onPatch: (id: number, payload: ReservationPatch) => Promise<void>;
  onCreate: (payload: ReservationPayload) => Promise<Reservation | null>;
};

function AdminAgendaPage({ reservations, pendingCount, onPatch, onCreate }: AdminAgendaPageProps) {
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [viewMode, setViewMode] = useState<"Dia" | "Semana" | "Mes">("Dia");
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ReservationPayload>({
    tutor_name: "",
    phone: "",
    email: "",
    pet_name: "",
    breed: "",
    size: "",
    service: "Day Care",
    entry_date: selectedDate,
    exit_date: "",
    expected_time: "08:00",
    notes: ""
  });
  const selected = new Date(`${selectedDate}T12:00:00`);
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const monthDays = Array.from({ length: new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate() }, (_, index) => new Date(selected.getFullYear(), selected.getMonth(), index + 1));
  const leadingDays = Array.from({ length: monthStart.getDay() }, (_, index) => addDays(monthStart, index - monthStart.getDay()));
  const calendarDays = [...leadingDays, ...monthDays];
  const weekStart = addDays(selected, -selected.getDay());
  const weekEnd = addDays(weekStart, 6);
  const dayItems = reservations.filter((item) => {
    if (viewMode === "Dia") return item.entry_date === selectedDate;
    if (viewMode === "Semana") return item.entry_date >= dateInputValue(weekStart) && item.entry_date <= dateInputValue(weekEnd);
    return item.entry_date.slice(0, 7) === selectedDate.slice(0, 7);
  }).sort((a, b) => (a.expected_time || "").localeCompare(b.expected_time || ""));
  const nextItems = reservations
    .filter((item) => item.entry_date >= selectedDate && !["Cancelada", "Reprovada"].includes(item.status))
    .sort((a, b) => `${a.entry_date} ${a.expected_time || ""}`.localeCompare(`${b.entry_date} ${b.expected_time || ""}`))
    .slice(0, 5);
  const hours = Array.from({ length: 13 }, (_, index) => index + 7);
  const columns = [
    { title: "Hospedagem", service: "Hospedagem", icon: Home, className: "hosting" },
    { title: "Day Care", service: "Day Care", icon: Users, className: "daycare" },
    { title: "Banho e Tosa", service: "Banho e Tosa", icon: Scissors, className: "grooming" },
    { title: "Atividades", service: "Atividade", icon: PawPrint, className: "activity" }
  ];

  function openCreate(date = selectedDate, service = "Day Care", time = "08:00") {
    setCreating(true);
    setDetail(null);
    setForm({
      tutor_name: "",
      phone: "",
      email: "",
      pet_name: "",
      breed: "",
      size: "",
      service,
      entry_date: date,
      exit_date: service === "Hospedagem" ? date : "",
      expected_time: time,
      notes: ""
    });
  }

  async function saveAgenda(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate({ ...form, exit_date: form.exit_date || null });
    setCreating(false);
  }

  async function patchFromDetail(id: number, payload: ReservationPatch) {
    await onPatch(id, payload);
    setDetail(null);
  }

  return (
    <section className="admin-main admin-agenda-page">
      <header className="admin-reservations-head">
        <div>
          <h1>Agenda</h1>
          <p>Visualize e gerencie todos os servicos e atividades agendadas.</p>
        </div>
        <div className="admin-topbar-tools">
          <AdminNotificationBell reservations={reservations} fallbackCount={pendingCount} />
          <div className="admin-date"><CalendarDays size={20} />{fullDateLabel(selected)}</div>
        </div>
      </header>

      <div className="agenda-toolbar">
        <button onClick={() => setSelectedDate(localDateKey())}>Hoje</button>
        <button onClick={() => setSelectedDate(dateInputValue(addDays(selected, -1)))}><ArrowLeft size={16} /></button>
        <button onClick={() => setSelectedDate(dateInputValue(addDays(selected, 1)))}><ArrowRight size={16} /></button>
        <strong>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(selected)}</strong>
        <div className="agenda-view-switch">
          {(["Dia", "Semana", "Mes"] as const).map((mode) => <button key={mode} className={viewMode === mode ? "active" : ""} onClick={() => setViewMode(mode)}>{mode}</button>)}
        </div>
        <button className="new-client-button" onClick={() => openCreate()}><Plus size={18} />Novo agendamento</button>
      </div>

      <div className="agenda-layout">
        <section className="agenda-board">
          <div className="agenda-grid agenda-grid-head">
            <span></span>
            {columns.map(({ title, icon: Icon, className }) => <strong key={title} className={className}><Icon size={18} />{title}</strong>)}
          </div>
          <div className="agenda-grid agenda-grid-body">
            {hours.map((hour) => (
              <div className="agenda-hour-row" key={hour}>
                <time>{String(hour).padStart(2, "0")}:00</time>
                {columns.map((column) => {
                  const slotItems = dayItems.filter((item) => serviceKind(item.service) === column.service && Math.floor(minutesFromTime(item.expected_time) / 60) === hour);
                  return (
                    <div key={column.service} className="agenda-slot" onDoubleClick={() => openCreate(selectedDate, column.service, `${String(hour).padStart(2, "0")}:00`)}>
                      {slotItems.map((item) => (
                        <button key={item.id} className={`agenda-event ${column.className}`} onClick={() => setDetail(item)}>
                          <strong>{item.pet_name}</strong>
                          <span>{serviceKind(item.service)}</span>
                          <small>{item.expected_time || "--:--"} - {agendaEndTime(item)}</small>
                          <em>{item.tutor_name || `${reservationDays(item)} pet(s)`}</em>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <aside className="agenda-side">
          <section className="admin-panel-card agenda-calendar">
            <div className="admin-card-head"><h2>{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(selected)}</h2><button onClick={() => setSelectedDate(dateInputValue(addDays(selected, 30)))}><ChevronRight size={16} /></button></div>
            <div className="agenda-weekdays">{["D", "S", "T", "Q", "Q", "S", "S"].map((day) => <b key={day}>{day}</b>)}</div>
            <div className="agenda-calendar-grid">
              {calendarDays.map((day) => {
                const value = dateInputValue(day);
                const hasItems = reservations.some((item) => item.entry_date === value);
                return <button key={value} className={`${value === selectedDate ? "active" : ""} ${day.getMonth() !== selected.getMonth() ? "muted" : ""} ${hasItems ? "has-items" : ""}`} onClick={() => setSelectedDate(value)}>{day.getDate()}</button>;
              })}
            </div>
          </section>

          <section className="admin-panel-card agenda-next">
            <div className="admin-card-head"><h2>Proximos agendamentos</h2><button>Ver todos</button></div>
            {nextItems.map((item) => <button key={item.id} onClick={() => setDetail(item)}><div className="admin-pet-thumb">{item.pet_name.slice(0, 1)}</div><span><strong>{serviceKind(item.service)}</strong><small>{item.pet_name}</small></span><em>{item.entry_date === selectedDate ? "Hoje" : dateLabel(item.entry_date)} - {item.expected_time || "--:--"}</em><b className={statusClass(item.status)}>{item.status}</b></button>)}
            {nextItems.length === 0 && <p className="admin-empty">Nenhum agendamento encontrado.</p>}
          </section>
        </aside>
      </div>

      <div className="agenda-legend"><strong>Legenda:</strong>{columns.map((column) => <span key={column.service} className={column.className}>{column.title}</span>)}</div>

      {detail && (
        <div className="reservation-modal-backdrop">
          <aside className="reservation-detail-card reservation-detail-modal">
            <div className="reservation-detail-head"><h2>{detail.pet_name}</h2><em className={`reservation-status ${statusClass(detail.status)}`}>{detail.status}</em><button onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="reservation-detail-section"><h3>Agendamento</h3><dl><dt>Servico</dt><dd>{serviceKind(detail.service)}</dd><dt>Data</dt><dd>{dateLabel(detail.entry_date)}</dd><dt>Horario</dt><dd>{detail.expected_time || "--:--"} - {agendaEndTime(detail)}</dd><dt>Tutor</dt><dd>{detail.tutor_name}</dd><dt>Telefone</dt><dd>{detail.phone}</dd></dl></div>
            <div className="reservation-detail-section"><h3>Observacoes</h3><p>{detail.notes || "Sem observacoes cadastradas."}</p></div>
            <div className="reservation-detail-actions">
              <button className="edit" onClick={() => patchFromDetail(detail.id, { status: "Em andamento" })}><CheckCircle2 size={16} />Iniciar</button>
              <button onClick={() => patchFromDetail(detail.id, { status: "Concluida" })}><Check size={16} />Concluir</button>
              <button className="danger" onClick={() => patchFromDetail(detail.id, { status: "Cancelada" })}><Trash2 size={16} />Cancelar</button>
            </div>
          </aside>
        </div>
      )}

      {creating && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal" onSubmit={saveAgenda}>
            <div className="reservation-detail-head"><h2>Novo agendamento</h2><button type="button" onClick={() => setCreating(false)}><X size={18} /></button></div>
            <label>Tutor<input required value={form.tutor_name} onChange={(event) => setForm((current) => ({ ...current, tutor_name: event.target.value }))} /></label>
            <label>Telefone<input required value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>E-mail<input value={form.email || ""} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label>Pet<input required value={form.pet_name} onChange={(event) => setForm((current) => ({ ...current, pet_name: event.target.value }))} /></label>
            <label>Servico<select value={form.service} onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}><option>Hospedagem</option><option>Day Care</option><option>Banho e Tosa</option><option>Atividade</option></select></label>
            <label>Data<input type="date" required value={form.entry_date} onChange={(event) => setForm((current) => ({ ...current, entry_date: event.target.value }))} /></label>
            <label>Horario<input type="time" required value={form.expected_time || ""} onChange={(event) => setForm((current) => ({ ...current, expected_time: event.target.value }))} /></label>
            <label>Raca<input value={form.breed || ""} onChange={(event) => setForm((current) => ({ ...current, breed: event.target.value }))} /></label>
            <label className="span-2">Observacoes<textarea rows={4} value={form.notes || ""} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
            <button className="approve-action span-2" type="submit"><Check size={18} />Salvar agendamento</button>
          </form>
        </div>
      )}
    </section>
  );
}

type AdminCheckinPageProps = {
  reservations: Reservation[];
  maxCapacity: number;
  pendingCount: number;
  onPatch: (id: number, payload: ReservationPatch) => Promise<void>;
  onCreate: (payload: ReservationPayload) => Promise<Reservation | null>;
};

function AdminCheckinPage({ reservations, maxCapacity, pendingCount, onPatch, onCreate }: AdminCheckinPageProps) {
  const [tab, setTab] = useState<"checkin" | "checkout">("checkin");
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [creating, setCreating] = useState(false);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [walkInForm, setWalkInForm] = useState<ReservationPayload>({
    tutor_name: "",
    phone: "",
    email: "",
    pet_name: "",
    breed: "",
    size: "",
    service: "Day Care",
    entry_date: localDateKey(),
    exit_date: "",
    expected_time: new Date().toTimeString().slice(0, 5),
    notes: "Check-in sem agendamento"
  });
  const today = localDateKey();
  const scheduledStatuses = ["Aguardando aprovacao", "Pendente", "Confirmada"];
  const scheduledToday = reservations
    .filter((item) => item.entry_date === today && scheduledStatuses.includes(item.status))
    .sort((a, b) => (a.expected_time || "").localeCompare(b.expected_time || ""));
  const inProgressToday = reservations
    .filter((item) => item.entry_date === today && item.status === "Em andamento")
    .sort((a, b) => (a.expected_time || "").localeCompare(b.expected_time || ""));
  const completedToday = reservations.filter((item) => item.entry_date === today && item.status === "Concluida");
  const sourceItems = tab === "checkin" ? scheduledToday : inProgressToday;
  const filteredItems = sourceItems.filter((item) => {
    const text = query.trim().toLowerCase();
    const matchesText = !text || [item.pet_name, item.tutor_name, item.phone, item.service, item.breed].some((value) => String(value || "").toLowerCase().includes(text));
    const matchesService = serviceFilter === "all" || serviceKind(item.service) === serviceFilter;
    return matchesText && matchesService;
  });
  const checklistItems = [
    "Documento de vacinacao atualizado",
    "Avaliacao comportamental",
    "Informar alimentacao e rotina",
    "Itens pessoais entregues",
    "Termo de responsabilidade assinado"
  ];

  function openDetail(item: Reservation) {
    setDetail(item);
    setCreating(false);
    setNotes(item.notes || "");
    setChecklist({});
  }

  async function confirmCheckin(item: Reservation) {
    await onPatch(item.id, { status: "Em andamento", notes: notes || item.notes || "Check-in realizado." });
    setDetail(null);
  }

  async function confirmCheckout(item: Reservation) {
    await onPatch(item.id, { status: "Concluida", notes: notes || item.notes || "Check-out realizado." });
    setDetail(null);
  }

  function openWalkIn() {
    setCreating(true);
    setDetail(null);
    setWalkInForm({
      tutor_name: "",
      phone: "",
      email: "",
      pet_name: "",
      breed: "",
      size: "",
      service: "Day Care",
      entry_date: today,
      exit_date: "",
      expected_time: new Date().toTimeString().slice(0, 5),
      notes: "Check-in sem agendamento"
    });
  }

  async function saveWalkIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await onCreate({ ...walkInForm, entry_date: today, exit_date: walkInForm.exit_date || null });
    if (created) await onPatch(created.id, { status: "Em andamento", notes: walkInForm.notes || "Check-in sem agendamento" });
    setCreating(false);
  }

  return (
    <section className="admin-main admin-checkin-page">
      <header className="admin-reservations-head">
        <div>
          <h1>Check-in / Check-out</h1>
          <p>Gerencie as entradas e saidas de pets de forma rapida e pratica.</p>
        </div>
        <div className="admin-topbar-tools">
          <AdminNotificationBell reservations={reservations} fallbackCount={pendingCount} />
          <div className="admin-date"><CalendarDays size={20} />Hoje, {fullDateLabel()}</div>
        </div>
      </header>

      <div className="checkin-tabs">
        <button className={tab === "checkin" ? "active" : ""} onClick={() => setTab("checkin")}>Check-in</button>
        <button className={tab === "checkout" ? "active" : ""} onClick={() => setTab("checkout")}>Check-out</button>
        <button className="new-client-button" onClick={openWalkIn}><Plus size={18} />Check-in sem agendamento</button>
      </div>

      <div className="reservation-metrics checkin-metrics">
        <article><span className="aqua"><ArrowRight size={28} /></span><div><small>Previstos para hoje</small><strong>{scheduledToday.length}</strong><em>reservas</em></div></article>
        <article><span className="yellow"><Clock size={28} /></span><div><small>Ja realizados</small><strong>{completedToday.length}</strong><em>check-outs</em></div></article>
        <article><span className="purple"><CalendarCheck size={28} /></span><div><small>Pendentes</small><strong>{scheduledToday.length}</strong><em>check-ins</em></div></article>
        <article><span className="aqua"><ClipboardCheck size={28} /></span><div><small>Capacidade hoje</small><strong>{activeCapacityCount(reservations)} / {maxCapacity}</strong><em>vagas ocupadas</em></div></article>
      </div>

      <section className="reservation-table-card checkin-list-card">
        <div className="admin-card-head checkin-list-title"><h2>{tab === "checkin" ? `Reservas para hoje (${new Intl.DateTimeFormat("pt-BR").format(new Date(`${today}T12:00:00`))})` : "Pets em atendimento"}</h2></div>
        <div className="reservation-filterbar checkin-filterbar">
          <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por pet ou tutor..." /></label>
          <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}><option value="all">Todos os servicos</option><option value="Hospedagem">Hospedagem</option><option value="Day Care">Day Care</option><option value="Banho e Tosa">Banho e Tosa</option><option value="Atividade">Atividade</option></select>
        </div>
        <div className="checkin-list">
          {filteredItems.map((item) => (
            <button key={item.id} className="checkin-row" onClick={() => openDetail(item)}>
              <time>{item.expected_time || "--:--"}</time>
              <span className="reservation-pet-cell"><i>{item.pet_name.slice(0, 1)}</i><span><b>{item.pet_name}</b><small>Tutor: {item.tutor_name}</small></span></span>
              <em className={`reservation-service ${serviceIconClass(item.service)}`}>{serviceKind(item.service)}</em>
              <strong className={`reservation-status ${statusClass(item.status)}`}>{tab === "checkin" ? "Pendente" : "Em atendimento"}</strong>
              <span className="checkin-row-action">{tab === "checkin" ? "Fazer check-in" : "Fazer check-out"}</span>
            </button>
          ))}
          {filteredItems.length === 0 && <p className="admin-empty">{tab === "checkin" ? "Nenhuma reserva agendada pendente para hoje." : "Nenhum pet em atendimento agora."}</p>}
        </div>
      </section>

      {detail && (
        <div className="reservation-modal-backdrop">
          <aside className="checkin-detail-modal">
            <div className="checkin-detail-head">
              <div className="reservation-detail-avatar">{detail.pet_name.slice(0, 1)}</div>
              <div><h2>{detail.pet_name}</h2><p>{detail.breed || "Pet"} - {detail.tutor_name} - {detail.phone}</p></div>
              <em className={`reservation-status ${statusClass(detail.status)}`}>{detail.status}</em>
              <button onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="checkin-detail-cards">
              <article><CalendarDays size={18} /><small>Data e hora da reserva</small><strong>{dateLabel(detail.entry_date)} - {detail.expected_time || "--:--"}</strong></article>
              <article><Clock size={18} /><small>Previsao de saida</small><strong>{detail.exit_date ? dateLabel(detail.exit_date) : dateLabel(detail.entry_date)} - {agendaEndTime(detail)}</strong></article>
            </div>
            <section className="checkin-checklist">
              <h3>Checklist de {tab === "checkin" ? "check-in" : "check-out"}</h3>
              {checklistItems.map((item) => <label key={item}><span>{item}</span><input type="checkbox" checked={Boolean(checklist[item])} onChange={(event) => setChecklist((current) => ({ ...current, [item]: event.target.checked }))} /></label>)}
            </section>
            <label className="checkin-notes">Observacoes<textarea rows={4} placeholder="Adicionar observacao..." value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
            <button className="approve-action checkin-confirm" onClick={() => tab === "checkin" ? confirmCheckin(detail) : confirmCheckout(detail)}><Check size={18} />{tab === "checkin" ? "Confirmar check-in" : "Confirmar check-out"}</button>
          </aside>
        </div>
      )}

      {creating && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal" onSubmit={saveWalkIn}>
            <div className="reservation-detail-head"><h2>Check-in sem agendamento</h2><button type="button" onClick={() => setCreating(false)}><X size={18} /></button></div>
            <label>Tutor<input required value={walkInForm.tutor_name} onChange={(event) => setWalkInForm((current) => ({ ...current, tutor_name: event.target.value }))} /></label>
            <label>Telefone<input required value={walkInForm.phone} onChange={(event) => setWalkInForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>E-mail<input value={walkInForm.email || ""} onChange={(event) => setWalkInForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label>Pet<input required value={walkInForm.pet_name} onChange={(event) => setWalkInForm((current) => ({ ...current, pet_name: event.target.value }))} /></label>
            <label>Servico<select value={walkInForm.service} onChange={(event) => setWalkInForm((current) => ({ ...current, service: event.target.value }))}><option>Day Care</option><option>Hospedagem</option><option>Banho e Tosa</option><option>Atividade</option></select></label>
            <label>Horario<input type="time" required value={walkInForm.expected_time || ""} onChange={(event) => setWalkInForm((current) => ({ ...current, expected_time: event.target.value }))} /></label>
            <label className="span-2">Observacoes<textarea rows={4} value={walkInForm.notes || ""} onChange={(event) => setWalkInForm((current) => ({ ...current, notes: event.target.value }))} /></label>
            <button className="approve-action span-2" type="submit"><Check size={18} />Criar e fazer check-in</button>
          </form>
        </div>
      )}
    </section>
  );
}

function AdminReservationsPage({ reservations, selectedId, setSelectedId, pendingCount, initialStatus, initialService = "all", title = "Reservas", description = "Gerencie todas as reservas de Day Care, Hospedagem, Banho e Tosa e muito mais.", onPatch, onCreate }: AdminReservationsPageProps) {
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState<ReservationPatch>({});
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<ReservationPayload>({
    tutor_name: "",
    phone: "",
    email: "",
    pet_name: "",
    breed: "",
    size: "Pequeno",
    service: initialService === "all" ? "Day Care" : initialService,
    entry_date: localDateKey(),
    exit_date: "",
    expected_time: "08:00",
    notes: ""
  });
  const perPage = 8;

  const filteredReservations = useMemo(() => {
    const text = query.trim().toLowerCase();
    return reservations.filter((item) => {
      const matchesText = !text || [item.pet_name, item.tutor_name, item.phone, item.email, item.service, String(item.id)].some((value) => String(value || "").toLowerCase().includes(text));
      const matchesService = serviceFilter === "all" || serviceKind(item.service) === serviceFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter || (statusFilter === "Aguardando aprovacao" && item.status === "Pendente");
      const matchesStart = !startDate || item.entry_date >= startDate;
      const matchesEnd = !endDate || item.entry_date <= endDate;
      return matchesText && matchesService && matchesStatus && matchesStart && matchesEnd;
    });
  }, [reservations, query, serviceFilter, statusFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / perPage));
  const pageItems = filteredReservations.slice((page - 1) * perPage, page * perPage);
  const selected = selectedId ? reservations.find((item) => item.id === selectedId) : undefined;
  const totalRevenue = reservations.reduce((sum, item) => sum + reservationValue(item), 0);
  const confirmed = reservations.filter((item) => item.status === "Confirmada").length;
  const canceled = reservations.filter((item) => ["Cancelada", "Reprovada"].includes(item.status)).length;

  useEffect(() => {
    setPage(1);
  }, [query, serviceFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setServiceFilter(initialService);
  }, [initialService]);

  function openEdit(item: Reservation) {
    setEditing(item);
    setCreating(false);
    setDetail(null);
    setEditForm({
      tutor_name: item.tutor_name,
      phone: item.phone,
      email: item.email || "",
      pet_name: item.pet_name,
      breed: item.breed || "",
      size: item.size || "",
      service: item.service,
      entry_date: item.entry_date,
      exit_date: item.exit_date || "",
      expected_time: item.expected_time || "",
      notes: item.notes || ""
    });
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setDetail(null);
    setCreateForm({
      tutor_name: "",
      phone: "",
      email: "",
      pet_name: "",
      breed: "",
      size: "Pequeno",
      service: initialService === "all" ? "Day Care" : initialService,
      entry_date: localDateKey(),
      exit_date: "",
      expected_time: "08:00",
      notes: ""
    });
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    await onPatch(editing.id, { ...editForm, exit_date: editForm.exit_date || null });
    setEditing(null);
  }

  async function saveCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await onCreate({ ...createForm, exit_date: createForm.exit_date || null });
    if (created) {
      setSelectedId(created.id);
      setCreating(false);
      setDetail(created);
    }
  }

  async function patchFromDetail(id: number, payload: ReservationPatch) {
    await onPatch(id, payload);
    setDetail(null);
  }

  function openDetail(item: Reservation) {
    setSelectedId(item.id);
    setDetail(item);
  }

  return (
    <section className="admin-main admin-reservations-page">
      <header className="admin-reservations-head">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search reservation-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar reserva, tutor ou pet..." /><Search size={20} /></label>
          <button className="admin-primary-action" type="button" onClick={openCreate}><Plus size={18} />Nova reserva</button>
          <AdminNotificationBell reservations={reservations} fallbackCount={pendingCount} />
          <div className="admin-date"><CalendarDays size={20} />Hoje, {fullDateLabel()}</div>
        </div>
      </header>

      <div className="reservation-metrics">
        <article><span className="aqua"><CalendarCheck size={28} /></span><div><small>Total de reservas</small><strong>{reservations.length}</strong><em>+ {filteredReservations.length} no filtro atual</em></div></article>
        <article><span className="purple"><Clock size={28} /></span><div><small>Pendentes</small><strong>{pendingCount}</strong><em>Aguardando avaliacao</em></div></article>
        <article><span className="yellow"><CheckCircle2 size={28} /></span><div><small>Confirmadas</small><strong>{confirmed}</strong><em>Prontas para receber</em></div></article>
        <article><span className="pink"><X size={28} /></span><div><small>Canceladas</small><strong>{canceled}</strong><em>Canceladas ou recusadas</em></div></article>
        <article><span className="aqua"><CreditCard size={28} /></span><div><small>Faturamento</small><strong>{money(totalRevenue)}</strong><em>Estimativa por reservas</em></div></article>
      </div>

      <div className="reservation-workspace">
        <section className="reservation-table-card">
          <div className="reservation-filterbar">
            <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por tutor ou pet..." /></label>
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
              <option value="all">Todos os servicos</option>
              <option value="Day Care">Day Care</option>
              <option value="Hospedagem">Hospedagem</option>
              <option value="Banho e Tosa">Banho e Tosa</option>
              <option value="Atividade">Atividade</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todos os status</option>
              {statusTabs.filter((item) => item.status !== "all").map((item) => <option key={item.status} value={item.status}>{item.label}</option>)}
            </select>
            <label><CalendarDays size={18} /><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label><CalendarDays size={18} /><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
            <button onClick={() => { setQuery(""); setServiceFilter("all"); setStatusFilter("all"); setStartDate(""); setEndDate(""); }}><Filter size={18} />Filtros</button>
            <button className="new-client-button" type="button" onClick={openCreate}><Plus size={18} />Nova reserva</button>
          </div>

          <div className="reservation-table">
            <div className="reservation-table-head">
              <span></span><span>Reserva</span><span>Tutor</span><span>Pet</span><span>Servico</span><span>Periodo</span><span>Status</span><span>Valor</span><span></span>
            </div>
            {pageItems.map((item) => (
              <button key={item.id} className={`reservation-table-row ${selected?.id === item.id ? "active" : ""}`} onClick={() => openDetail(item)}>
                <span><input type="checkbox" checked={selected?.id === item.id} onChange={() => openDetail(item)} /></span>
                <span><strong>#{String(item.id).padStart(4, "0")}</strong><small>{dateLabel(item.created_at?.slice(0, 10) || item.entry_date)}</small></span>
                <span><b>{item.tutor_name}</b><small>{item.phone}</small></span>
                <span className="reservation-pet-cell"><i>{item.pet_name.slice(0, 1)}</i><span><b>{item.pet_name}</b><small>{item.breed || item.size || "Pet"}</small></span></span>
                <span className={`reservation-service ${serviceIconClass(item.service)}`}>{serviceKind(item.service)}</span>
                <span><b>{dateLabel(item.entry_date)} as {item.expected_time || "--:--"}</b><small>ate {dateLabel(item.exit_date || item.entry_date)}</small></span>
                <span><em className={`reservation-status ${statusClass(item.status)}`}>{item.status}</em></span>
                <span><b>{money(reservationValue(item))}</b></span>
                <span><MoreVertical size={18} /></span>
              </button>
            ))}
            {pageItems.length === 0 && (
              <div className="admin-empty pets-empty-state">
                <p>Nenhuma reserva encontrada com esses filtros.</p>
                <button className="new-client-button" type="button" onClick={openCreate}><Plus size={18} />Nova reserva</button>
              </div>
            )}
          </div>

          <footer className="reservation-pagination">
            <span>Mostrando {pageItems.length ? (page - 1) * perPage + 1 : 0} a {Math.min(page * perPage, filteredReservations.length)} de {filteredReservations.length} reservas</span>
            <div>
              <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ArrowLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((item) => <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>{item}</button>)}
              <button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ArrowRight size={16} /></button>
            </div>
          </footer>
        </section>

      </div>

      {detail && (
        <div className="reservation-modal-backdrop">
        <aside className="reservation-detail-card reservation-detail-modal">
          {detail ? (
            <>
              <div className="reservation-detail-head">
                <h2>Reserva #{String(detail.id).padStart(4, "0")}</h2>
                <em className={`reservation-status ${statusClass(detail.status)}`}>{detail.status}</em>
                <button onClick={() => setDetail(null)}><X size={18} /></button>
              </div>
              <div className="reservation-detail-pet">
                <div className="reservation-detail-avatar">{detail.pet_name.slice(0, 1)}</div>
                <div><strong>{detail.pet_name}</strong><span>{detail.breed || detail.size || "Pet cadastrado"}</span><em className={`reservation-service ${serviceIconClass(detail.service)}`}>{serviceKind(detail.service)}</em></div>
              </div>
              <div className="reservation-detail-period">
                <strong>{dateLabel(detail.entry_date)} as {detail.expected_time || "--:--"}</strong>
                <span>ate {dateLabel(detail.exit_date || detail.entry_date)}</span>
                <small>{reservationDays(detail)} diaria(s)</small>
              </div>
              <div className="reservation-detail-section">
                <h3>Tutor</h3>
                <p><strong>{detail.tutor_name}</strong><span>{detail.phone}</span><span>{detail.email || "E-mail nao informado"}</span></p>
              </div>
              <div className="reservation-detail-section">
                <h3>Informacoes da reserva</h3>
                <dl><dt>Data da reserva</dt><dd>{dateLabel(detail.created_at?.slice(0, 10) || detail.entry_date)} as {detail.expected_time || "--:--"}</dd><dt>Unidade</dt><dd>Vila Mariana</dd><dt>Pacote</dt><dd>{serviceKind(detail.service)} Premium</dd><dt>Valor total</dt><dd>{money(reservationValue(detail))}</dd><dt>Status do pagamento</dt><dd>Pago</dd></dl>
              </div>
              <div className="reservation-detail-section">
                <h3>Observacoes</h3>
                <p>{detail.notes || "Sem observacoes cadastradas."}</p>
              </div>
              <div className="reservation-detail-actions">
                <button className="edit" onClick={() => openEdit(detail)}><Edit3 size={16} />Editar reserva</button>
                <button onClick={() => patchFromDetail(detail.id, { status: "Em andamento" })}><CheckCircle2 size={16} />Check-in</button>
                <button className="danger" onClick={() => patchFromDetail(detail.id, { status: "Cancelada" })}><Trash2 size={16} />Cancelar reserva</button>
              </div>
            </>
          ) : <p className="admin-empty">Selecione uma reserva para ver detalhes.</p>}
        </aside>
        </div>
      )}

      {creating && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal" onSubmit={saveCreate}>
            <div className="reservation-detail-head"><h2>Nova reserva</h2><button type="button" onClick={() => setCreating(false)}><X size={18} /></button></div>
            <label>Tutor<input required value={createForm.tutor_name} onChange={(event) => setCreateForm((current) => ({ ...current, tutor_name: event.target.value }))} /></label>
            <label>Telefone<input required value={createForm.phone} onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>E-mail<input value={createForm.email || ""} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label>Pet<input required value={createForm.pet_name} onChange={(event) => setCreateForm((current) => ({ ...current, pet_name: event.target.value }))} /></label>
            <label>Raca<input value={createForm.breed || ""} onChange={(event) => setCreateForm((current) => ({ ...current, breed: event.target.value }))} /></label>
            <label>Porte<select value={createForm.size || "Pequeno"} onChange={(event) => setCreateForm((current) => ({ ...current, size: event.target.value }))}><option>Pequeno</option><option>Medio</option><option>Grande</option></select></label>
            <label>Servico<select value={createForm.service} onChange={(event) => setCreateForm((current) => ({ ...current, service: event.target.value }))}><option>Day Care</option><option>Hospedagem</option><option>Banho e Tosa</option><option>Atividade</option></select></label>
            <label>Entrada<input required type="date" value={createForm.entry_date} onChange={(event) => setCreateForm((current) => ({ ...current, entry_date: event.target.value }))} /></label>
            <label>Saida<input type="date" value={createForm.exit_date || ""} onChange={(event) => setCreateForm((current) => ({ ...current, exit_date: event.target.value }))} /></label>
            <label>Horario<input type="time" value={createForm.expected_time || ""} onChange={(event) => setCreateForm((current) => ({ ...current, expected_time: event.target.value }))} /></label>
            <label className="span-2">Observacoes<textarea rows={4} value={createForm.notes || ""} onChange={(event) => setCreateForm((current) => ({ ...current, notes: event.target.value }))} /></label>
            <button className="approve-action span-2" type="submit"><Check size={18} />Criar reserva</button>
          </form>
        </div>
      )}

      {editing && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal" onSubmit={saveEdit}>
            <div className="reservation-detail-head"><h2>Editar reserva</h2><button type="button" onClick={() => setEditing(null)}><X size={18} /></button></div>
            <label>Tutor<input value={editForm.tutor_name || ""} onChange={(event) => setEditForm((current) => ({ ...current, tutor_name: event.target.value }))} /></label>
            <label>Telefone<input value={editForm.phone || ""} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>E-mail<input value={editForm.email || ""} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label>Pet<input value={editForm.pet_name || ""} onChange={(event) => setEditForm((current) => ({ ...current, pet_name: event.target.value }))} /></label>
            <label>Servico<select value={editForm.service || "Day Care"} onChange={(event) => setEditForm((current) => ({ ...current, service: event.target.value }))}><option>Day Care</option><option>Hospedagem</option><option>Banho e Tosa</option><option>Atividade</option></select></label>
            <label>Entrada<input type="date" value={editForm.entry_date || ""} onChange={(event) => setEditForm((current) => ({ ...current, entry_date: event.target.value }))} /></label>
            <label>Saida<input type="date" value={editForm.exit_date || ""} onChange={(event) => setEditForm((current) => ({ ...current, exit_date: event.target.value }))} /></label>
            <label>Horario<input type="time" value={editForm.expected_time || ""} onChange={(event) => setEditForm((current) => ({ ...current, expected_time: event.target.value }))} /></label>
            <label className="span-2">Observacoes<textarea rows={4} value={editForm.notes || ""} onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))} /></label>
            <button className="approve-action span-2" type="submit"><Check size={18} />Salvar alteracoes</button>
          </form>
        </div>
      )}
    </section>
  );
}

type DashboardHomeProps = {
  reservations: Reservation[];
  pets: PetOption[];
  users: AppUser[];
  maxCapacity: number;
  adminName: string;
  userKey: string;
  onOpenReservations: (status?: string) => void;
  onOpenNewReservation: () => void;
  onOpenUsers: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  onExportReport: (kind: "reservas" | "daycare" | "hospedagem" | "financeiro") => void;
};

type DashboardWidgetKey = "kpis" | "line" | "next" | "checkins" | "activities" | "finance" | "donut" | "birthdays" | "reports" | "indicators";

const dashboardWidgets: Array<{ key: DashboardWidgetKey; title: string; description: string }> = [
  { key: "kpis", title: "Indicadores principais", description: "Cards de reservas, hospedagem, Day Care, banho e faturamento." },
  { key: "line", title: "Reservas dos ultimos 7 dias", description: "Grafico dos ultimos dias por servico." },
  { key: "next", title: "Proximas reservas", description: "Lista curta dos proximos atendimentos." },
  { key: "checkins", title: "Check-ins de hoje", description: "Entradas e saidas programadas para hoje." },
  { key: "activities", title: "Atividades de hoje", description: "Rotina operacional do dia." },
  { key: "finance", title: "Resumo financeiro", description: "Faturamento, ticket medio e reservas faturadas." },
  { key: "donut", title: "Reservas por servico", description: "Distribuicao entre Day Care, hospedagem e banho." },
  { key: "birthdays", title: "Aniversariantes do mes", description: "Pets com aniversario no mes atual." },
  { key: "reports", title: "Relatorios rapidos", description: "Atalhos para exportacao CSV." },
  { key: "indicators", title: "Indicadores do mes", description: "Ocupacao, satisfacao, novos clientes e faturamento." }
];

const defaultDashboardWidgets: DashboardWidgetKey[] = ["kpis", "line", "next", "checkins", "activities", "finance"];

function AdminDashboardHome({ reservations, pets, users, maxCapacity, adminName, userKey, onOpenReservations, onOpenNewReservation, onOpenUsers, onUpdateStatus, onExportReport }: DashboardHomeProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<DashboardWidgetKey[]>(defaultDashboardWidgets);
  const today = localDateKey();
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return localDateKey(date);
  });
  const currentMonth = new Date().getMonth() + 1;
  const todayReservations = reservations.filter((item) => isTodayReservation(item, today) && activeStatuses.includes(item.status));
  const activeHosting = reservations.filter((item) => isActiveHosting(item, today));
  const dayCareToday = todayReservations.filter((item) => serviceKind(item.service) === "Day Care");
  const groomingToday = todayReservations.filter((item) => serviceKind(item.service) === "Banho e Tosa");
  const todayRevenue = todayReservations.reduce((sum, item) => sum + reservationValue(item), 0);
  const ticketAverage = todayReservations.length ? todayRevenue / todayReservations.length : 0;
  const serviceCounts = {
    "Day Care": reservations.filter((item) => serviceKind(item.service) === "Day Care").length,
    "Hospedagem": reservations.filter((item) => serviceKind(item.service) === "Hospedagem").length,
    "Banho e Tosa": reservations.filter((item) => serviceKind(item.service) === "Banho e Tosa").length
  };
  const totalServices = Math.max(serviceCounts["Day Care"] + serviceCounts.Hospedagem + serviceCounts["Banho e Tosa"], 1);
  const dayCareSeries = lastSevenDays.map((day) => reservations.filter((item) => item.entry_date === day && serviceKind(item.service) === "Day Care").length);
  const hostingSeries = lastSevenDays.map((day) => reservations.filter((item) => item.entry_date === day && serviceKind(item.service) === "Hospedagem").length);
  const groomingSeries = lastSevenDays.map((day) => reservations.filter((item) => item.entry_date === day && serviceKind(item.service) === "Banho e Tosa").length);
  const nextReservations = reservations
    .filter((item) => item.entry_date >= today && !["Reprovada", "Cancelada", "Concluida"].includes(item.status))
    .sort((a, b) => `${a.entry_date} ${a.expected_time || ""}`.localeCompare(`${b.entry_date} ${b.expected_time || ""}`))
    .slice(0, 4);
  const checkins = todayReservations
    .sort((a, b) => (a.expected_time || "").localeCompare(b.expected_time || ""))
    .slice(0, 5);
  const birthdays = pets
    .filter((pet) => pet.birth_date && Number(pet.birth_date.slice(5, 7)) === currentMonth)
    .slice(0, 3);
  const newClients = pets.filter((pet) => pet.created_at?.slice(0, 7) === today.slice(0, 7)).length;
  const occupancy = maxCapacity > 0 ? Math.round((todayReservations.length / maxCapacity) * 100) : 0;
  const satisfaction = reservations.length > 0 ? "4,8 / 5" : "-";
  const estimatedRevenue = reservations.reduce((total, item) => {
    const kind = serviceKind(item.service);
    const start = new Date(`${item.entry_date}T12:00:00`);
    const end = new Date(`${item.exit_date || item.entry_date}T12:00:00`);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    const price = kind === "Hospedagem" ? 120 : kind === "Banho e Tosa" ? 90 : 80;
    return total + price * days;
  }, 0);
  const activities = [
    ["08:00", "Abertura da unidade", "Equipe preparada para receber os pets", CheckCircle2],
    ["09:00", "Day Care", `${dayCareToday.length} pet(s) programado(s)`, Activity],
    ["12:00", "Alimentacao", `${todayReservations.length} rotina(s) para acompanhar`, Utensils],
    ["15:00", "Banho e Tosa", `${todayReservations.filter((item) => serviceKind(item.service) === "Banho e Tosa").length} agendamento(s)`, Scissors],
    ["18:00", "Encerramento do dia", `${checkins.filter((item) => item.status === "Concluida").length} check-in(s) concluidos`, CheckCircle2]
  ] as const;
  const storageKey = `scoltcia-dashboard-widgets-v2-${userKey || "default"}`;

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as DashboardWidgetKey[];
      const allowed = parsed.filter((key) => dashboardWidgets.some((widget) => widget.key === key));
      setVisibleWidgets(allowed.length ? allowed : defaultDashboardWidgets);
    } catch {
      setVisibleWidgets(defaultDashboardWidgets);
    }
  }, [storageKey]);

  function isWidgetVisible(widget: DashboardWidgetKey) {
    return visibleWidgets.includes(widget);
  }

  function saveWidgets(next: DashboardWidgetKey[]) {
    const safeNext = next.length ? next : defaultDashboardWidgets;
    setVisibleWidgets(safeNext);
    window.localStorage.setItem(storageKey, JSON.stringify(safeNext));
  }

  function toggleWidget(widget: DashboardWidgetKey) {
    const next = isWidgetVisible(widget)
      ? visibleWidgets.filter((item) => item !== widget)
      : [...visibleWidgets, widget];
    saveWidgets(next);
  }

  function moveWidget(widget: DashboardWidgetKey, direction: -1 | 1) {
    const index = visibleWidgets.indexOf(widget);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= visibleWidgets.length) return;
    const next = [...visibleWidgets];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    saveWidgets(next);
  }

  return (
    <section className="admin-main admin-dashboard-page">
      <header className="admin-dashboard-topbar">
        <div>
          <h1>Ola, {adminName}!</h1>
          <p>Aqui esta um resumo do que acontece na Scolt&Cia hoje.</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search"><input placeholder="Buscar..." /><Search size={20} /></label>
          <button className="dashboard-edit-button" onClick={() => setEditorOpen(true)}><Edit3 size={18} />Editar widgets</button>
          <AdminNotificationBell reservations={reservations} onOpenReservations={onOpenReservations} />
          <div className="admin-date"><CalendarDays size={20} />Hoje, {fullDateLabel()}</div>
        </div>
      </header>

      {isWidgetVisible("kpis") && <div className="admin-kpi-grid dashboard-widget" style={{ order: visibleWidgets.indexOf("kpis") }}>
        <button className="admin-kpi kpi-aqua" onClick={() => onOpenReservations()}><span><CalendarCheck size={30} /></span><div><small>Reservas hoje</small><strong>{todayReservations.length}</strong><em>{reservations.length} reserva(s) no total</em></div></button>
        <button className="admin-kpi kpi-purple" onClick={() => onOpenReservations("Em andamento")}><span><Home size={30} /></span><div><small>Hospedagens</small><strong>{activeHosting.length}</strong><em>Ativas hoje</em></div></button>
        <button className="admin-kpi kpi-yellow" onClick={() => onOpenReservations()}><span><PawPrint size={30} /></span><div><small>Day Care</small><strong>{dayCareToday.length}</strong><em>Ativos hoje</em></div></button>
        <button className="admin-kpi kpi-pink" onClick={() => onOpenReservations()}><span><Scissors size={30} /></span><div><small>Banho e Tosa</small><strong>{groomingToday.length}</strong><em>Agendamentos hoje</em></div></button>
        <button className="admin-kpi kpi-aqua" onClick={() => onExportReport("financeiro")}><span><CreditCard size={30} /></span><div><small>Faturamento hoje</small><strong>{money(todayRevenue)}</strong><em>{todayReservations.length} reserva(s)</em></div></button>
      </div>}

      <div className="admin-dashboard-layout">
        {isWidgetVisible("line") && <section className="admin-panel-card admin-line-card dashboard-widget" style={{ order: visibleWidgets.indexOf("line") }}>
          <div className="admin-card-head"><h2>Reservas dos ultimos 7 dias</h2><button>Ultimos 7 dias <ChevronRight size={16} /></button></div>
          <div className="admin-chart-legend"><span className="aqua">Day Care</span><span className="purple">Hospedagem</span><span className="yellow">Banho e Tosa</span></div>
          <div className="admin-line-chart">
            <div className="admin-y-axis"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
            <svg viewBox="0 0 620 220" preserveAspectRatio="none">
              <polyline className="line-aqua" points={linePoints(dayCareSeries)} />
              <polyline className="line-purple" points={linePoints(hostingSeries)} />
              <polyline className="line-yellow" points={linePoints(groomingSeries)} />
            </svg>
            <div className="admin-x-axis">{lastSevenDays.map((day) => <span key={day}>{dateLabel(day)}</span>)}</div>
          </div>
        </section>}

        {isWidgetVisible("donut") && <section className="admin-panel-card admin-donut-card dashboard-widget" style={{ order: visibleWidgets.indexOf("donut") }}>
          <h2>Reservas por servico</h2>
          <div className="admin-donut-wrap"><div className="admin-donut" style={{ "--daycare": `${(serviceCounts["Day Care"] / totalServices) * 100}%`, "--hosting": `${((serviceCounts["Day Care"] + serviceCounts.Hospedagem) / totalServices) * 100}%` } as CSSProperties}><span>Total<strong>{reservations.length}</strong></span></div><div className="admin-donut-legend"><p><i className="aqua"></i>Day Care <strong>{serviceCounts["Day Care"]} ({Math.round((serviceCounts["Day Care"] / totalServices) * 100)}%)</strong></p><p><i className="purple"></i>Hospedagem <strong>{serviceCounts.Hospedagem} ({Math.round((serviceCounts.Hospedagem / totalServices) * 100)}%)</strong></p><p><i className="yellow"></i>Banho e Tosa <strong>{serviceCounts["Banho e Tosa"]} ({Math.round((serviceCounts["Banho e Tosa"] / totalServices) * 100)}%)</strong></p></div></div>
        </section>}

        <aside className="admin-dashboard-side">

          {isWidgetVisible("next") && <section className="admin-panel-card admin-next-reservations dashboard-widget" style={{ order: visibleWidgets.indexOf("next") }}>
            <h2>Proximas reservas</h2>
            {nextReservations.map((row) => (
              <article key={row.id}><div className="admin-pet-thumb">{row.pet_name.slice(0, 1)}</div><div><strong>{row.pet_name}</strong><span>{row.service}</span><small>{dateLabel(row.entry_date)} - {row.expected_time || "--:--"}</small></div><b className={row.status === "Confirmada" ? "ok" : "wait"}>{row.status}</b></article>
            ))}
            {nextReservations.length === 0 && <p className="admin-empty">Nenhuma reserva futura.</p>}
            <button className="admin-wide-button" onClick={() => onOpenReservations()}>Ver todas as reservas <ChevronRight size={16} /></button>
          </section>}

          {isWidgetVisible("birthdays") && <section className="admin-panel-card admin-birthdays dashboard-widget" style={{ order: visibleWidgets.indexOf("birthdays") }}>
            <div className="admin-card-head"><h2>Aniversariantes do mes</h2><a>Ver todos</a></div>
            {birthdays.map((pet) => <article key={pet.id}><div className="admin-pet-thumb">{pet.name.slice(0, 1)}</div><span>{pet.name} {pet.birth_date ? dateLabel(pet.birth_date) : ""}</span><Cake size={26} /></article>)}
            {birthdays.length === 0 && <p className="admin-empty">Cadastre a data de nascimento dos pets para acompanhar aqui.</p>}
          </section>}

          {isWidgetVisible("reports") && <section className="admin-panel-card admin-quick-reports dashboard-widget" style={{ order: visibleWidgets.indexOf("reports") }}>
            <div className="admin-card-head"><h2>Relatorios rapidos</h2><button><Download size={18} /></button></div>
            <button onClick={() => onExportReport("reservas")}><ClipboardCheck size={16} />Relatorio de reservas</button>
            <button onClick={() => onExportReport("daycare")}><ClipboardCheck size={16} />Relatorio de Day Care</button>
            <button onClick={() => onExportReport("hospedagem")}><ClipboardCheck size={16} />Relatorio de Hospedagem</button>
            <button onClick={() => onExportReport("financeiro")}><ClipboardCheck size={16} />Relatorio financeiro</button>
          </section>}
        </aside>

        {isWidgetVisible("checkins") && <section className="admin-panel-card admin-checkins dashboard-widget" style={{ order: visibleWidgets.indexOf("checkins") }}>
          <h2>Check-ins de hoje</h2>
          {checkins.map((row) => (
            <article key={row.id}><div className="admin-pet-thumb">{row.pet_name.slice(0, 1)}</div><div><strong>{row.pet_name}</strong><span>{row.breed || row.size || row.tutor_name}</span></div><em>{row.service}</em><small><Clock size={14} />{row.expected_time || "--:--"}</small><button className={row.status === "Concluida" ? "ok" : "wait"} onClick={() => onUpdateStatus(row.id, row.status === "Concluida" ? "Em andamento" : "Concluida")}>{row.status === "Concluida" ? "Reabrir" : "Concluir"}</button></article>
          ))}
          {checkins.length === 0 && <p className="admin-empty">Nenhum check-in previsto para hoje.</p>}
          <button className="admin-wide-button" onClick={() => onOpenReservations()}>Ver todos check-ins <ChevronRight size={16} /></button>
        </section>}

        {isWidgetVisible("activities") && <section className="admin-panel-card admin-activities dashboard-widget" style={{ order: visibleWidgets.indexOf("activities") }}>
          <h2>Atividades de hoje</h2>
          {activities.map(([time, title, text, Icon]) => {
            const ActivityIcon = Icon as typeof CheckCircle2;
            return <article key={String(title)}><time>{String(time)}</time><span><ActivityIcon size={18} /></span><div><strong>{String(title)}</strong><small>{String(text)}</small></div></article>;
          })}
          <button className="admin-wide-button" onClick={() => onOpenReservations()}>Ver agenda completa <ChevronRight size={16} /></button>
        </section>}

        {isWidgetVisible("finance") && <section className="admin-panel-card admin-finance dashboard-widget" style={{ order: visibleWidgets.indexOf("finance") }}>
          <div className="admin-card-head"><h2>Resumo financeiro</h2><button onClick={() => onExportReport("financeiro")}>Hoje <ChevronRight size={16} /></button></div>
          <article><span>Faturamento</span><strong>{money(todayRevenue)}</strong></article>
          <article><span>Reservas faturadas</span><strong>{todayReservations.length}</strong></article>
          <article><span>Ticket medio</span><strong>{money(ticketAverage)}</strong></article>
        </section>}

        {isWidgetVisible("indicators") && <section className="admin-panel-card admin-indicators dashboard-widget" style={{ order: visibleWidgets.indexOf("indicators") }}>
          <h2>Indicadores do mes</h2>
          <div>
            <article><span><PawPrint size={26} /></span><small>Taxa de ocupacao</small><strong>{occupancy}%</strong><em>{todayReservations.length}/{maxCapacity} vagas hoje</em></article>
            <article><span><Star size={26} /></span><small>Satisfacao dos tutores</small><strong>{satisfaction}</strong><em>Base pronta para avaliacoes</em></article>
            <article><span><Users size={26} /></span><small>Novos clientes</small><strong>{newClients}</strong><em>Pets cadastrados no mes</em></article>
            <article><span><Scissors size={26} /></span><small>Faturamento estimado</small><strong>{money(estimatedRevenue)}</strong><em>Calculado pelas reservas</em></article>
          </div>
        </section>}
      </div>
      <button className="admin-floating-action" onClick={onOpenNewReservation}><Plus size={24} /><span>Acoes rapidas</span></button>

      {editorOpen && (
        <div className="reservation-modal-backdrop">
          <aside className="dashboard-widget-editor">
            <div className="reservation-detail-head">
              <div><h2>Editar widgets</h2><p>Escolha o que aparece no seu dashboard.</p></div>
              <button onClick={() => setEditorOpen(false)}><X size={18} /></button>
            </div>
            <div className="dashboard-widget-list">
              {dashboardWidgets.map((widget) => {
                const active = isWidgetVisible(widget.key);
                const index = visibleWidgets.indexOf(widget.key);
                return (
                  <article key={widget.key} className={active ? "active" : ""}>
                    <label><input type="checkbox" checked={active} onChange={() => toggleWidget(widget.key)} /><span><strong>{widget.title}</strong><small>{widget.description}</small></span></label>
                    <div>
                      <button disabled={!active || index <= 0} onClick={() => moveWidget(widget.key, -1)}><ArrowLeft size={14} /></button>
                      <button disabled={!active || index === visibleWidgets.length - 1} onClick={() => moveWidget(widget.key, 1)}><ArrowRight size={14} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
            <footer className="dashboard-widget-actions">
              <button onClick={() => saveWidgets(defaultDashboardWidgets)}>Restaurar padrao</button>
              <button className="approve-action" onClick={() => setEditorOpen(false)}><Check size={16} />Concluir</button>
            </footer>
          </aside>
        </div>
      )}
    </section>
  );
}

export function AdminPanel({ pets, reservations, settings }: Props) {
  const [email, setEmail] = useState("lucasalmeidapedroso@gmail.com");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [adminName, setAdminName] = useState("Marina");
  const [adminPage, setAdminPage] = useState<AdminPageKey>("dashboard");
  const [reservationInitialStatus, setReservationInitialStatus] = useState("all");
  const [loginMessage, setLoginMessage] = useState("");
  const [items, setItems] = useState(reservations);
  const [petItems, setPetItems] = useState(pets);
  const [selectedId, setSelectedId] = useState(reservations[0]?.id ?? 0);
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? 0);
  const [selectedTutorKey, setSelectedTutorKey] = useState("");
  const [extraTutors, setExtraTutors] = useState<TutorRecord[]>([]);
  const [allTutors, setAllTutors] = useState<TutorRecord[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [adminRecords, setAdminRecords] = useState<AdminRecord[]>([]);
  const [userForm, setUserForm] = useState<UserPayload>({ name: "", email: "", password: "", role: "equipe" });
  const [userMessage, setUserMessage] = useState("");
  const [maxCapacity] = useState(settings.max_capacity);
  const tutors = useMemo(() => buildTutors(petItems, items, [...allTutors, ...extraTutors]), [petItems, items, allTutors, extraTutors]);

  function adminHeaders() {
    return {
      "Content-Type": "application/json",
      ...(accessToken ? {
        "Authorization": `Bearer ${accessToken}`
      } : {
        "x-admin-email": email,
        "x-admin-password": password
      })
    };
  }

  function openReservations(status = "all") {
    setAdminPage("reservations");
    setReservationInitialStatus(status);
    if (status !== "all") setSelectedId(items.find((item) => item.status === status || (status === "Aguardando aprovacao" && item.status === "Pendente"))?.id ?? 0);
  }

  function openUsers() {
    setAdminPage("users");
  }

  function openClients() {
    setAdminPage("clients");
  }

  function openPets() {
    setAdminPage("pets");
  }

  function openModule(page: AdminModulePageKey) {
    setAdminPage(page);
  }

  async function loadAdminRecords(headers = adminHeaders()) {
    const response = await fetch("/api/admin/records", { headers });
    if (response.ok) setAdminRecords(await response.json());
  }

  async function loadTutors(headers = adminHeaders()) {
    const response = await fetch("/api/admin/tutors", { headers });
    if (response.ok) {
      const loaded = await response.json() as Tutor[];
      setAllTutors(loaded.map(tutorRecordFromTutor));
    }
  }

  function exportReport(kind: "reservas" | "daycare" | "hospedagem" | "financeiro") {
    const filteredItems = items.filter((item) => {
      if (kind === "daycare") return serviceKind(item.service) === "Day Care";
      if (kind === "hospedagem") return serviceKind(item.service) === "Hospedagem";
      return true;
    });
    const rows = [
      ["id", "pet", "tutor", "telefone", "email", "servico", "entrada", "saida", "horario", "status", "valor_estimado"],
      ...filteredItems.map((item) => {
        const kindName = serviceKind(item.service);
        const start = new Date(`${item.entry_date}T12:00:00`);
        const end = new Date(`${item.exit_date || item.entry_date}T12:00:00`);
        const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
        const price = kindName === "Hospedagem" ? 120 : kindName === "Banho e Tosa" ? 90 : 80;
        return [item.id, item.pet_name, item.tutor_name, item.phone, item.email || "", item.service, item.entry_date, item.exit_date || "", item.expected_time || "", item.status, kind === "financeiro" ? String(price * days) : ""];
      })
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scolt-cia-${kind}-${localDateKey()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function unlockWithToken(token: string) {
    const response = await fetch("/api/admin/google-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    setUnlocked(response.ok);

    if (response.ok) {
      setAccessToken(token);
      const loginData = await response.json();
      if (loginData.user?.name) setAdminName(loginData.user.name.split(" ")[0]);
      const usersResponse = await fetch("/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (usersResponse.ok) setUsers(await usersResponse.json());
      await loadTutors({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      });
      await loadAdminRecords({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      });
    } else {
      setLoginMessage("Nao foi possivel acessar o painel com essa conta.");
    }
  }

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (token) void unlockWithToken(token);
    });
  }, []);

  function countByStatus(status: string) {
    if (status === "all") return items.length;
    return items.filter((item) => item.status === status || (status === "Aguardando aprovacao" && item.status === "Pendente")).length;
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setUnlocked(response.ok);

    if (response.ok) {
      const loginData = await response.json();
      if (loginData.user?.name) setAdminName(loginData.user.name.split(" ")[0]);
      setAccessToken("");
      const usersResponse = await fetch("/api/admin/users", { headers: adminHeaders() });
      if (usersResponse.ok) setUsers(await usersResponse.json());
      await loadTutors();
      await loadAdminRecords();
    } else {
      setLoginMessage("Login nao autorizado. Confira seu e-mail e senha.");
    }
  }

  async function googleLogin() {
    if (!googleLoginEnabled) {
      setLoginMessage("Login com Google preparado, mas desativado por enquanto.");
      return;
    }

    setLoginMessage("");
    const supabase = getSupabaseBrowser();

    if (!supabase) {
      setLoginMessage("Login com Google indisponivel no momento.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`
      }
    });
  }

  async function updateDashboardStatus(id: number, status: string) {
    await updateReservationFields(id, { status });
  }

  async function updateReservationFields(id: number, payload: ReservationPatch) {
    const response = await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ id, ...payload })
    });

    if (response.ok) {
      const updated = await response.json();
      setItems((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
    }
  }

  async function createReservationFields(payload: ReservationPayload) {
    const response = await fetch("/api/admin/reservations", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const created = await response.json();
      setItems((current) => [created, ...current]);
      setSelectedId(created.id);
      return created as Reservation;
    }
    return null;
  }

  async function updatePetFields(id: number, payload: PetPatch) {
    const response = await fetch("/api/admin/pets", {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ id, ...payload })
    });

    if (response.ok) {
      const updated = await response.json();
      setPetItems((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
    }
  }

  async function createPetFields(payload: PetPayload) {
    const response = await fetch("/api/admin/pets", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const created = await response.json() as PetOption;
      setPetItems((current) => [created, ...current]);
      setSelectedPetId(created.id);
      return created;
    }
    return null;
  }

  async function createTutorRecord(payload: TutorPayload) {
    const response = await fetch("/api/admin/tutors", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const created = await response.json();
      const tutor = {
        key: `tutor-${created.id}`,
        id: created.id,
        name: created.full_name,
        phone: created.phone || "",
        email: created.email || "",
        address: created.address || "",
        created_at: created.created_at,
        pets: [],
        reservations: []
      };
      setExtraTutors((current) => [tutor, ...current]);
      setSelectedTutorKey(`tutor-${created.id}`);
      return tutor;
    }
    return null;
  }

  async function updateTutorRecord(id: number, payload: TutorPatch) {
    const response = await fetch("/api/admin/tutors", {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ id, ...payload })
    });

    if (response.ok) {
      const updated = await response.json();
      setExtraTutors((current) => current.map((tutor) => tutor.id === id ? {
        ...tutor,
        name: updated.full_name || tutor.name,
        phone: updated.phone || tutor.phone,
        email: updated.email || tutor.email,
        address: updated.address || tutor.address
      } : tutor));
      setPetItems((current) => current.map((pet) => pet.tutor_id === id ? {
        ...pet,
        tutor_name: updated.full_name || pet.tutor_name,
        tutor_phone: updated.phone || pet.tutor_phone,
        tutor_email: updated.email || pet.tutor_email,
        tutor_address: updated.address || pet.tutor_address
      } : pet));
    }
  }

  async function createAdminRecordItem(payload: AdminRecordPayload) {
    const response = await fetch("/api/admin/records", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const created = await response.json();
      setAdminRecords((current) => [created, ...current]);
    }
  }

  async function updateAdminRecordItem(id: number, payload: Partial<AdminRecordPayload>) {
    const response = await fetch("/api/admin/records", {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ id, ...payload })
    });

    if (response.ok) {
      const updated = await response.json();
      setAdminRecords((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
    }
  }

  async function deleteAdminRecordItem(id: number) {
    const response = await fetch(`/api/admin/records?id=${id}`, {
      method: "DELETE",
      headers: adminHeaders()
    });

    if (response.ok) {
      setAdminRecords((current) => current.filter((item) => item.id !== id));
    }
  }

  async function createAdminUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUserMessage("");

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(userForm)
    });

    if (response.ok) {
      const created = await response.json();
      setUsers((current) => [created, ...current]);
      setUserForm({ name: "", email: "", password: "", role: "equipe" });
      setUserMessage("Usuario cadastrado.");
    } else {
      setUserMessage("Nao foi possivel cadastrar o usuario.");
    }
  }

  async function updateAdminUser(id: number, payload: Partial<Pick<AppUser, "role" | "is_active">>) {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ id, ...payload })
    });

    if (response.ok) {
      const updated = await response.json();
      setUsers((current) => current.map((user) => user.id === id ? updated : user));
    }
  }

  if (!unlocked) {
    return (
      <div className="login-showcase">
        <section className="login-visual">
          <div className="login-logo">
            <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={74} height={74} />
            <div><strong>Scolt&Cia</strong><span>Day Care e Hospedagem</span></div>
          </div>
          <div className="login-copy">
            <h1>Cuidado, carinho e diversao</h1>
            <p>Um lugar seguro e cheio de amor para o seu melhor amigo.</p>
          </div>
          <Image className="login-dogs" src="/img/hero-dachshund-akita.png" alt="Cachorros na creche" width={560} height={420} priority />
          <div className="login-benefits">
            <div><span><ShieldCheck size={28} /></span><strong>Ambiente seguro</strong><p>Rotina acompanhada</p></div>
            <div><span><Heart size={28} /></span><strong>Muito carinho</strong><p>Equipe apaixonada por caes</p></div>
            <div><span><Gamepad2 size={28} /></span><strong>Diversao garantida</strong><p>Atividades diarias</p></div>
          </div>
        </section>

        <form className="login-form-panel" onSubmit={login}>
          <h2>Bem-vindo de volta!</h2>
          <p>Faca login para acessar o sistema de gestao.</p>
          <label>E-mail
            <div className="input-icon"><Mail size={18} /><input type="email" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          </label>
          <label>Senha
            <div className="input-icon"><Lock size={18} /><input type={showPassword ? "text" : "password"} placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>
          <div className="login-row">
            <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Lembrar de mim</label>
            <a href="mailto:lucasalmeidapedroso@gmail.com">Esqueci minha senha</a>
          </div>
          <button className="login-submit" type="submit"><Lock size={18} />Entrar</button>
          <div className="login-divider"><span></span>ou<span></span></div>
          <button className="google-button" type="button" onClick={googleLogin} disabled={!googleLoginEnabled}><strong>G</strong>Entrar com Google</button>
          {loginMessage && <strong className="form-warning">{loginMessage}</strong>}
          <p className="login-help">Ainda nao tem uma conta? <a href="mailto:lucasalmeidapedroso@gmail.com">Fale com o administrador</a></p>
        </form>
      </div>
    );
  }

  const currentModuleConfig = adminPage in moduleConfigs ? moduleConfigs[adminPage as AdminModulePageKey] : null;

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={52} height={52} />
          <div><strong>Scolt&Cia</strong><span>Day Care e Hospedagem</span></div>
        </div>
        <nav className="admin-nav">
          <a className={adminPage === "dashboard" ? "active" : ""} onClick={() => setAdminPage("dashboard")}><LayoutDashboard size={18} />Dashboard</a>
          <div className="admin-nav-section">
            <span>Gestao</span>
            <a className={adminPage === "reservations" ? "active" : ""} onClick={() => openReservations("all")}><CalendarCheck size={18} />Reservas</a>
            <a className={adminPage === "pets" ? "active" : ""} onClick={openPets}><PawPrint size={18} />Pets</a>
            <a className={adminPage === "clients" ? "active" : ""} onClick={openClients}><Users size={18} />Clientes (Tutores)</a>
            <a className={adminPage === "services" ? "active" : ""} onClick={() => openModule("services")}><Scissors size={18} />Servicos</a>
            <a className={adminPage === "packages" ? "active" : ""} onClick={() => openModule("packages")}><Package size={18} />Pacotes</a>
            <a className={adminPage === "daily_reports" ? "active" : ""} onClick={() => openModule("daily_reports")}><ClipboardCheck size={18} />Relatorios diarios</a>
          </div>
          <div className="admin-nav-section">
            <span>Operacao</span>
            <a className={adminPage === "agenda" ? "active" : ""} onClick={() => setAdminPage("agenda")}><CalendarDays size={18} />Agenda</a>
            <a className={adminPage === "checkin" ? "active" : ""} onClick={() => setAdminPage("checkin")}><CheckCircle2 size={18} />Check-in / Check-out</a>
            <a className={adminPage === "activities" ? "active" : ""} onClick={() => openModule("activities")}><Activity size={18} />Atividades</a>
            <a className={adminPage === "feeding" ? "active" : ""} onClick={() => openModule("feeding")}><Utensils size={18} />Alimentacao</a>
            <a className={adminPage === "grooming" ? "active" : ""} onClick={() => setAdminPage("grooming")}><Scissors size={18} />Banho e Tosa</a>
          </div>
          <div className="admin-nav-section">
            <span>Equipe</span>
            <a className={adminPage === "users" ? "active" : ""} onClick={openUsers}><Users size={18} />Equipe</a>
            <a className={adminPage === "users" ? "active" : ""} onClick={openUsers}><UserRound size={18} />Funcoes e permissoes</a>
            <a className={adminPage === "schedules" ? "active" : ""} onClick={() => openModule("schedules")}><CalendarCheck size={18} />Escalas</a>
          </div>
          <div className="admin-nav-section">
            <span>Configuracoes</span>
            <a className={adminPage === "unit" ? "active" : ""} onClick={() => openModule("unit")}><Home size={18} />Unidade</a>
            <a className={adminPage === "communications" ? "active" : ""} onClick={() => openModule("communications")}><Mail size={18} />Comunicacoes</a>
            <a className={adminPage === "general_settings" ? "active" : ""} onClick={() => openModule("general_settings")}><ShieldCheck size={18} />Configuracoes gerais</a>
          </div>
        </nav>
        <div className="admin-profile">
          <div className="admin-profile-photo">M</div>
          <div><strong>Marina Souza</strong><span>Administrador</span></div>
          <ChevronRight size={16} />
        </div>
      </aside>

      {adminPage === "dashboard" && (
        <AdminDashboardHome
          reservations={items}
          pets={petItems}
          users={users}
          maxCapacity={maxCapacity}
          adminName={adminName}
          userKey={email}
          onOpenReservations={(status = "all") => openReservations(status)}
          onOpenNewReservation={() => openReservations("all")}
          onOpenUsers={openClients}
          onUpdateStatus={updateDashboardStatus}
          onExportReport={exportReport}
        />
      )}

      {adminPage === "pets" && (
        <AdminPetsPage
          pets={petItems}
          tutors={tutors}
          reservations={items}
          selectedPetId={selectedPetId}
          setSelectedPetId={setSelectedPetId}
          onCreate={createPetFields}
          onPatch={updatePetFields}
          onCreateTutor={createTutorRecord}
        />
      )}

      {adminPage === "clients" && (
        <AdminTutorsPage
          tutors={tutors}
          reservations={items}
          selectedTutorKey={selectedTutorKey}
          setSelectedTutorKey={setSelectedTutorKey}
          onCreate={createTutorRecord}
          onPatch={updateTutorRecord}
        />
      )}

      {adminPage === "reservations" && (
        <AdminReservationsPage
          reservations={items}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          pendingCount={countByStatus("Aguardando aprovacao")}
          initialStatus={reservationInitialStatus}
          onPatch={updateReservationFields}
          onCreate={createReservationFields}
        />
      )}

      {adminPage === "agenda" && (
        <AdminAgendaPage
          reservations={items}
          pendingCount={countByStatus("Aguardando aprovacao")}
          onPatch={updateReservationFields}
          onCreate={createReservationFields}
        />
      )}

      {adminPage === "checkin" && (
        <AdminCheckinPage
          reservations={items}
          maxCapacity={maxCapacity}
          pendingCount={countByStatus("Aguardando aprovacao")}
          onPatch={updateReservationFields}
          onCreate={createReservationFields}
        />
      )}

      {adminPage === "grooming" && (
        <AdminReservationsPage
          reservations={items}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          pendingCount={countByStatus("Aguardando aprovacao")}
          initialStatus="all"
          initialService="Banho e Tosa"
          title="Banho e Tosa"
          description="Gerencie atendimentos de higiene, banho, tosa e finalizacao."
          onPatch={updateReservationFields}
          onCreate={createReservationFields}
        />
      )}

      {currentModuleConfig && (
        <AdminRecordsPage
          config={currentModuleConfig}
          records={adminRecords.filter((record) => record.module_key === currentModuleConfig.key)}
          reservations={items}
          onCreate={createAdminRecordItem}
          onPatch={updateAdminRecordItem}
          onDelete={deleteAdminRecordItem}
        />
      )}

      {adminPage === "users" && (
        <section className="admin-main admin-legacy-panel">
          <header className="admin-topbar">
            <div>
              <h1>Clientes e usuarios</h1>
              <p>Gerencie acessos da equipe, tutores e administradores.</p>
            </div>
          </header>

          <section id="usuarios-admin" className="admin-card">
            <h2>Usuarios do sistema</h2>
            <form className="compact-form" onSubmit={createAdminUser}>
              <input required placeholder="Nome" value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} />
              <input required type="email" placeholder="E-mail" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} />
              <input required type="password" placeholder="Senha temporaria" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
              <select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as UserPayload["role"] }))}>
                <option value="equipe">Equipe</option>
                <option value="admin">Admin</option>
                <option value="tutor">Tutor</option>
              </select>
              <button className="secondary-button">Cadastrar usuario</button>
            </form>
            {userMessage && <strong>{userMessage}</strong>}
            <div className="admin-list">
              {users.map((user) => (
                <article className="reservation-row user-admin-row" key={user.id}>
                  <div><strong>{user.name}</strong><p>{user.email} - {user.is_active ? "ativo" : "inativo"}</p></div>
                  <select value={user.role} onChange={(event) => updateAdminUser(user.id, { role: event.target.value as AppUser["role"] })}>
                    <option value="admin">Admin</option>
                    <option value="equipe">Equipe</option>
                    <option value="tutor">Tutor</option>
                  </select>
                  <button className={user.is_active ? "danger-action" : ""} onClick={() => updateAdminUser(user.id, { is_active: !user.is_active })}>{user.is_active ? "Desativar" : "Ativar"}</button>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}
