"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Activity, Bell, CalendarCheck, CalendarDays, Cake, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock, Download, Eye, EyeOff, Gamepad2, Heart, Home, LayoutDashboard, Lock, Mail, Package, PawPrint, Plus, Scissors, Search, ShieldCheck, Star, UserRound, Users, Utensils, X } from "lucide-react";
import { ReservationForm } from "@/components/ReservationForm";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { AppUser, DaycareSettings, PetOption, Reservation, UserPayload } from "@/lib/types";

type Props = {
  pets: PetOption[];
  reservations: Reservation[];
  settings: DaycareSettings;
};

const statusTabs = [
  { label: "Todas", status: "all" },
  { label: "Aguardando aprovacao", status: "Aguardando aprovacao" },
  { label: "Confirmadas", status: "Confirmada" },
  { label: "Em andamento", status: "Em andamento" },
  { label: "Concluidas", status: "Concluida" },
  { label: "Canceladas", status: "Cancelada" }
];

const googleLoginEnabled = false;

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

type DashboardHomeProps = {
  reservations: Reservation[];
  pets: PetOption[];
  users: AppUser[];
  maxCapacity: number;
  adminName: string;
  onOpenReservations: (status?: string) => void;
  onOpenNewReservation: () => void;
  onOpenUsers: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  onExportReport: (kind: "reservas" | "daycare" | "hospedagem" | "financeiro") => void;
};

function AdminDashboardHome({ reservations, pets, users, maxCapacity, adminName, onOpenReservations, onOpenNewReservation, onOpenUsers, onUpdateStatus, onExportReport }: DashboardHomeProps) {
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

  return (
    <section className="admin-main admin-dashboard-page">
      <header className="admin-dashboard-topbar">
        <div>
          <h1>Ola, {adminName}!</h1>
          <p>Bem-vinda ao painel de gestao da Scolt&Cia.</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search"><input placeholder="Buscar..." /><Search size={20} /></label>
          <button className="admin-bell" onClick={() => onOpenReservations("Aguardando aprovacao")}><Bell size={20} /><span>{reservations.filter((item) => item.status === "Aguardando aprovacao" || item.status === "Pendente").length}</span></button>
          <div className="admin-date"><CalendarDays size={20} />Hoje, {fullDateLabel()}</div>
        </div>
      </header>

      <div className="admin-kpi-grid">
        <button className="admin-kpi kpi-aqua" onClick={() => onOpenReservations()}><span><Users size={30} /></span><div><small>Reservas hoje</small><strong>{todayReservations.length}</strong><em>{reservations.length} reserva(s) no total</em></div><svg viewBox="0 0 180 44"><polyline points={trendPoints(dayCareSeries.map((value, index) => value + hostingSeries[index] + groomingSeries[index]))} /></svg></button>
        <button className="admin-kpi kpi-purple" onClick={() => onOpenReservations("Em andamento")}><span><Home size={30} /></span><div><small>Hospedagens ativas</small><strong>{activeHosting.length}</strong><em>{activeCapacityCount(reservations)} ocupacao ativa</em></div><svg viewBox="0 0 180 44"><polyline points={trendPoints(hostingSeries)} /></svg></button>
        <button className="admin-kpi kpi-yellow" onClick={() => onOpenReservations()}><span><PawPrint size={30} /></span><div><small>Day Care hoje</small><strong>{dayCareToday.length}</strong><em>{Math.max(maxCapacity - todayReservations.length, 0)} vaga(s) livres</em></div><svg viewBox="0 0 180 44"><polyline points={trendPoints(dayCareSeries)} /></svg></button>
        <button className="admin-kpi kpi-pink" onClick={onOpenUsers}><span><Heart size={30} /></span><div><small>Clientes ativos</small><strong>{uniqueClientCount(reservations, pets)}</strong><em>{users.length} usuario(s) do sistema</em></div><svg viewBox="0 0 180 44"><polyline points={trendPoints([pets.length, uniqueClientCount(reservations, pets), reservations.length, todayReservations.length])} /></svg></button>
      </div>

      <div className="admin-dashboard-layout">
        <section className="admin-panel-card admin-line-card">
          <div className="admin-card-head"><h2>Visao geral de reservas</h2><button>Ultimos 7 dias <ChevronRight size={16} /></button></div>
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
        </section>

        <section className="admin-panel-card admin-donut-card">
          <h2>Reservas por servico</h2>
          <div className="admin-donut-wrap"><div className="admin-donut" style={{ "--daycare": `${(serviceCounts["Day Care"] / totalServices) * 100}%`, "--hosting": `${((serviceCounts["Day Care"] + serviceCounts.Hospedagem) / totalServices) * 100}%` } as CSSProperties}><span>Total<strong>{reservations.length}</strong></span></div><div className="admin-donut-legend"><p><i className="aqua"></i>Day Care <strong>{serviceCounts["Day Care"]} ({Math.round((serviceCounts["Day Care"] / totalServices) * 100)}%)</strong></p><p><i className="purple"></i>Hospedagem <strong>{serviceCounts.Hospedagem} ({Math.round((serviceCounts.Hospedagem / totalServices) * 100)}%)</strong></p><p><i className="yellow"></i>Banho e Tosa <strong>{serviceCounts["Banho e Tosa"]} ({Math.round((serviceCounts["Banho e Tosa"] / totalServices) * 100)}%)</strong></p></div></div>
        </section>

        <aside className="admin-dashboard-side">

          <section className="admin-panel-card admin-next-reservations">
            <h2>Proximas reservas</h2>
            {nextReservations.map((row) => (
              <article key={row.id}><div className="admin-pet-thumb">{row.pet_name.slice(0, 1)}</div><div><strong>{row.pet_name}</strong><span>{row.service}</span><small>{dateLabel(row.entry_date)} - {row.expected_time || "--:--"}</small></div><b className={row.status === "Confirmada" ? "ok" : "wait"}>{row.status}</b></article>
            ))}
            {nextReservations.length === 0 && <p className="admin-empty">Nenhuma reserva futura.</p>}
            <button className="admin-wide-button" onClick={() => onOpenReservations()}>Ver todas as reservas <ChevronRight size={16} /></button>
          </section>

          <section className="admin-panel-card admin-birthdays">
            <div className="admin-card-head"><h2>Aniversariantes do mes</h2><a>Ver todos</a></div>
            {birthdays.map((pet) => <article key={pet.id}><div className="admin-pet-thumb">{pet.name.slice(0, 1)}</div><span>{pet.name} {pet.birth_date ? dateLabel(pet.birth_date) : ""}</span><Cake size={26} /></article>)}
            {birthdays.length === 0 && <p className="admin-empty">Cadastre a data de nascimento dos pets para acompanhar aqui.</p>}
          </section>

          <section className="admin-panel-card admin-quick-reports">
            <div className="admin-card-head"><h2>Relatorios rapidos</h2><button><Download size={18} /></button></div>
            <button onClick={() => onExportReport("reservas")}><ClipboardCheck size={16} />Relatorio de reservas</button>
            <button onClick={() => onExportReport("daycare")}><ClipboardCheck size={16} />Relatorio de Day Care</button>
            <button onClick={() => onExportReport("hospedagem")}><ClipboardCheck size={16} />Relatorio de Hospedagem</button>
            <button onClick={() => onExportReport("financeiro")}><ClipboardCheck size={16} />Relatorio financeiro</button>
          </section>
        </aside>

        <section className="admin-panel-card admin-checkins">
          <h2>Check-ins de hoje</h2>
          {checkins.map((row) => (
            <article key={row.id}><div className="admin-pet-thumb">{row.pet_name.slice(0, 1)}</div><div><strong>{row.pet_name}</strong><span>{row.breed || row.size || row.tutor_name}</span></div><em>{row.service}</em><small><Clock size={14} />{row.expected_time || "--:--"}</small><button className={row.status === "Concluida" ? "ok" : "wait"} onClick={() => onUpdateStatus(row.id, row.status === "Concluida" ? "Em andamento" : "Concluida")}>{row.status === "Concluida" ? "Reabrir" : "Concluir"}</button></article>
          ))}
          {checkins.length === 0 && <p className="admin-empty">Nenhum check-in previsto para hoje.</p>}
          <button className="admin-wide-button" onClick={() => onOpenReservations()}>Ver todos check-ins <ChevronRight size={16} /></button>
        </section>

        <section className="admin-panel-card admin-activities">
          <h2>Atividades de hoje</h2>
          {activities.map(([time, title, text, Icon]) => {
            const ActivityIcon = Icon as typeof CheckCircle2;
            return <article key={String(title)}><time>{String(time)}</time><span><ActivityIcon size={18} /></span><div><strong>{String(title)}</strong><small>{String(text)}</small></div></article>;
          })}
          <button className="admin-wide-button" onClick={() => onOpenReservations()}>Ver agenda completa <ChevronRight size={16} /></button>
        </section>

        <section className="admin-panel-card admin-indicators">
          <h2>Indicadores do mes</h2>
          <div>
            <article><span><PawPrint size={26} /></span><small>Taxa de ocupacao</small><strong>{occupancy}%</strong><em>{todayReservations.length}/{maxCapacity} vagas hoje</em></article>
            <article><span><Star size={26} /></span><small>Satisfacao dos tutores</small><strong>{satisfaction}</strong><em>Base pronta para avaliacoes</em></article>
            <article><span><Users size={26} /></span><small>Novos clientes</small><strong>{newClients}</strong><em>Pets cadastrados no mes</em></article>
            <article><span><Scissors size={26} /></span><small>Faturamento estimado</small><strong>{money(estimatedRevenue)}</strong><em>Calculado pelas reservas</em></article>
          </div>
        </section>
      </div>
      <button className="admin-floating-action" onClick={onOpenNewReservation}><Plus size={24} /><span>Acoes rapidas</span></button>
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
  const [showLegacy, setShowLegacy] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [items, setItems] = useState(reservations);
  const [selectedId, setSelectedId] = useState(reservations[0]?.id ?? 0);
  const [tab, setTab] = useState("Aguardando aprovacao");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userForm, setUserForm] = useState<UserPayload>({ name: "", email: "", password: "", role: "equipe" });
  const [userMessage, setUserMessage] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(settings.max_capacity);
  const [settingsMessage, setSettingsMessage] = useState("");
  const legacyRef = useRef<HTMLElement | null>(null);
  const filtered = useMemo(() => tab === "all" ? items : items.filter((item) => item.status === tab || (tab === "Aguardando aprovacao" && item.status === "Pendente")), [items, tab]);
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0] ?? items[0];
  const occupied = activeCapacityCount(items);

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

  function openLegacy(status = "all", target?: string) {
    setShowLegacy(true);
    setTab(status);
    requestAnimationFrame(() => {
      if (target) {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        legacyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
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
    } else {
      setLoginMessage("Seu Google entrou, mas esse e-mail nao esta cadastrado como admin.");
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
    } else {
      setLoginMessage("Login nao autorizado. Confira e-mail, senha e se o SQL do Supabase foi rodado.");
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
      setLoginMessage("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para usar Google.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`
      }
    });
  }

  async function setStatus(id: number, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/reservations/${action}`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ id })
    });

    if (response.ok) {
      const status = action === "approve" ? "Confirmada" : "Reprovada";
      setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    }
  }

  async function updateDashboardStatus(id: number, status: string) {
    const response = await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ id, status })
    });

    if (response.ok) {
      const updated = await response.json();
      setItems((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
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

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsMessage("");

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ max_capacity: maxCapacity })
    });

    setSettingsMessage(response.ok ? "Lotacao maxima atualizada." : "Nao foi possivel salvar a lotacao.");
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

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={52} height={52} />
          <div><strong>Scolt&Cia</strong><span>Day Care e Hospedagem</span></div>
        </div>
        <nav className="admin-nav">
          <a className="active" onClick={() => setShowLegacy(false)}><LayoutDashboard size={18} />Dashboard</a>
          <div className="admin-nav-section">
            <span>Gestao</span>
            <a onClick={() => openLegacy("all")}><CalendarCheck size={18} />Reservas</a>
            <a onClick={() => openLegacy("all")}><PawPrint size={18} />Pets</a>
            <a onClick={() => openLegacy("all", "usuarios-admin")}><Users size={18} />Clientes (Tutores)</a>
            <a onClick={() => openLegacy("all")}><Scissors size={18} />Servicos</a>
            <a><Package size={18} />Pacotes</a>
            <a><ClipboardCheck size={18} />Relatorios diarios</a>
          </div>
          <div className="admin-nav-section">
            <span>Operacao</span>
            <a onClick={() => openLegacy("all")}><CalendarDays size={18} />Agenda</a>
            <a onClick={() => openLegacy("Confirmada")}><CheckCircle2 size={18} />Check-in / Check-out</a>
            <a onClick={() => openLegacy("Em andamento")}><Activity size={18} />Atividades</a>
            <a><Utensils size={18} />Alimentacao</a>
            <a><Scissors size={18} />Banho e Tosa</a>
          </div>
          <div className="admin-nav-section">
            <span>Equipe</span>
            <a><Users size={18} />Equipe</a>
            <a><UserRound size={18} />Funcoes e permissoes</a>
            <a><CalendarCheck size={18} />Escalas</a>
          </div>
          <div className="admin-nav-section">
            <span>Configuracoes</span>
            <a><Home size={18} />Unidade</a>
            <a><Mail size={18} />Comunicacoes</a>
            <a><ShieldCheck size={18} />Configuracoes gerais</a>
          </div>
        </nav>
        <div className="admin-profile">
          <div className="admin-profile-photo">M</div>
          <div><strong>Marina Souza</strong><span>Administrador</span></div>
          <ChevronRight size={16} />
        </div>
      </aside>

      <AdminDashboardHome
        reservations={items}
        pets={pets}
        users={users}
        maxCapacity={maxCapacity}
        adminName={adminName}
        onOpenReservations={(status = "all") => openLegacy(status)}
        onOpenNewReservation={() => openLegacy("all", "nova-reserva")}
        onOpenUsers={() => openLegacy("all", "usuarios-admin")}
        onUpdateStatus={updateDashboardStatus}
        onExportReport={exportReport}
      />
      <section ref={legacyRef} className={`admin-main admin-legacy-panel ${showLegacy ? "" : "admin-legacy-hidden"}`}>
        <header className="admin-topbar">
          <div>
            <h1>Gestao de Reservas</h1>
            <p>Acompanhe e gerencie todas as solicitacoes de reservas.</p>
          </div>
          <div className="admin-actions">
            <button className="icon-button"><Bell size={18} /><span>{countByStatus("Aguardando aprovacao")}</span></button>
            <a className="primary-button" href="#nova-reserva">Nova reserva</a>
          </div>
        </header>

        <div className="capacity-card">
          <div><strong>Lotacao da creche</strong><span>{occupied} de {maxCapacity} vagas ocupadas hoje/periodo ativo</span></div>
          <form onSubmit={saveSettings}>
            <label>Lotacao maxima<input type="number" min={1} value={maxCapacity} onChange={(event) => setMaxCapacity(Number(event.target.value))} /></label>
            <button className="secondary-button">Salvar</button>
          </form>
          {settingsMessage && <strong>{settingsMessage}</strong>}
        </div>

        <div className="reservation-tabs">
          {statusTabs.map((item) => (
            <button key={item.status} className={tab === item.status ? "active" : ""} onClick={() => setTab(item.status)}>
              {item.label}<span>{countByStatus(item.status)}</span>
            </button>
          ))}
        </div>

        <div className="approval-workspace">
          <div className="approval-list">
            {filtered.length === 0 && <p>Nenhuma reserva nesta categoria.</p>}
            {filtered.map((reservation) => (
              <button key={reservation.id} className={`approval-item ${selected?.id === reservation.id ? "active" : ""}`} onClick={() => setSelectedId(reservation.id)}>
                <div className="pet-avatar">{reservation.pet_name.slice(0, 1)}</div>
                <div>
                  <strong>{reservation.pet_name}</strong>
                  <span>{reservation.breed || reservation.size || "Pet"}</span>
                  <small>{reservation.status}</small>
                  <p>Check-in: {reservation.entry_date}</p>
                  <p>Check-out: {reservation.exit_date || "-"}</p>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>

          <div className="approval-detail">
            {selected ? (
              <>
                <div className="approval-alert"><Clock size={26} /><div><strong>{selected.status}</strong><span>Essa solicitacao aguarda avaliacao do administrador.</span></div></div>
                <div className="pet-detail-head">
                  <div className="pet-photo">{selected.pet_name.slice(0, 1)}</div>
                  <div><h2>{selected.pet_name}</h2><span>{selected.breed || selected.size || "Pet cadastrado"}</span><p>{selected.size || "Porte nao informado"} - {selected.service}</p></div>
                  <div className="requester"><strong>Solicitado por</strong><p>{selected.tutor_name}</p><p>{selected.phone}</p><p>{selected.email}</p></div>
                </div>
                <div className="detail-grid">
                  <div>
                    <h3>Detalhes da hospedagem</h3>
                    <p><strong>Tipo de servico</strong><span>{selected.service}</span></p>
                    <p><strong>Check-in</strong><span>{selected.entry_date} - {selected.expected_time || "-"}</span></p>
                    <p><strong>Check-out</strong><span>{selected.exit_date || "-"}</span></p>
                    <p><strong>Observacoes</strong><span>{selected.notes || "Sem observacoes."}</span></p>
                  </div>
                  <div className="price-box">
                    <p><span>Valor das diarias</span><strong>{money(120)}</strong></p>
                    <p><span>Quantidade de diarias</span><strong>3</strong></p>
                    <p><span>Desconto</span><strong>{money(0)}</strong></p>
                    <hr />
                    <p><span>Total</span><strong>{money(360)}</strong></p>
                  </div>
                </div>
                <div className="approval-actions">
                  <button className="reject-action" onClick={() => setStatus(selected.id, "reject")}><X size={18} />Recusar solicitacao</button>
                  <button className="approve-action" onClick={() => setStatus(selected.id, "approve")}><Check size={18} />Aprovar hospedagem</button>
                </div>
                <div className="approval-note">Ao aprovar, o cliente recebera uma confirmacao e as proximas instrucoes.</div>
              </>
            ) : <p>Nenhuma reserva selecionada.</p>}
          </div>
        </div>

        <section id="nova-reserva" className="admin-card">
          <h2>Cadastrar reserva pelo admin</h2>
          <ReservationForm pets={pets} reservations={items} settings={{ max_capacity: maxCapacity }} admin adminAuth={{ email, password, accessToken }} />
        </section>

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
              <article className="reservation-row" key={user.id}>
                <div><strong>{user.name}</strong><p>{user.email} - {user.role} - {user.is_active ? "ativo" : "inativo"}</p></div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
