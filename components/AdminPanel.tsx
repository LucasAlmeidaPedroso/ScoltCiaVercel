"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Activity, ArrowLeft, ArrowRight, Bell, CalendarCheck, CalendarDays, Cake, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock, CreditCard, Download, Edit3, Eye, EyeOff, Filter, Gamepad2, Heart, Home, LayoutDashboard, Lock, Mail, MoreVertical, Package, PawPrint, Plus, Scissors, Search, ShieldCheck, Star, Trash2, UserRound, Users, Utensils, X } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { AppUser, DaycareSettings, PetOption, Reservation, UserPayload } from "@/lib/types";

type Props = {
  pets: PetOption[];
  reservations: Reservation[];
  settings: DaycareSettings;
};

type AdminPageKey = "dashboard" | "reservations" | "pets" | "users";

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
  return "daycare";
}

type ReservationPatch = Partial<Pick<Reservation, "status" | "expected_time" | "notes" | "exit_date" | "entry_date" | "service" | "pet_name" | "breed" | "size" | "tutor_name" | "phone" | "email">>;
type PetPatch = Partial<Pick<PetOption, "name" | "breed" | "size" | "sex" | "weight" | "birth_date" | "behavior" | "food_restrictions" | "medications" | "important_notes" | "veterinarian" | "photo_url">>;

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

type AdminPetsPageProps = {
  pets: PetOption[];
  reservations: Reservation[];
  selectedPetId: number;
  setSelectedPetId: (id: number) => void;
  onPatch: (id: number, payload: PetPatch) => Promise<void>;
};

function AdminPetsPage({ pets, reservations, selectedPetId, setSelectedPetId, onPatch }: AdminPetsPageProps) {
  const [query, setQuery] = useState("");
  const [breedFilter, setBreedFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState("info");
  const [editing, setEditing] = useState<PetOption | null>(null);
  const [editForm, setEditForm] = useState<PetPatch>({});
  const breeds = Array.from(new Set(pets.map((pet) => pet.breed).filter(Boolean) as string[])).sort();
  const selected = pets.find((pet) => pet.id === selectedPetId) || pets[0];
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

  function openEdit(pet: PetOption) {
    setEditing(pet);
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
    if (!editing) return;
    await onPatch(editing.id, { ...editForm, birth_date: editForm.birth_date || null, weight: editForm.weight ? Number(editForm.weight) : null });
    setEditing(null);
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
          <button className="admin-bell"><Bell size={20} /><span>{pets.length}</span></button>
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
          </div>
          <div className="pets-table">
            <div className="pets-table-head"><span></span><span>Pet</span><span>Tutor</span><span>Raca</span><span>Porte</span><span>Idade</span><span>Status</span><span>Ultima atividade</span><span></span></div>
            {filteredPets.map((pet) => (
              <button key={pet.id} className={`pets-table-row ${selected?.id === pet.id ? "active" : ""}`} onClick={() => { setSelectedPetId(pet.id); setTab("info"); }}>
                <span><input type="checkbox" checked={selected?.id === pet.id} onChange={() => setSelectedPetId(pet.id)} /></span>
                <span className="reservation-pet-cell"><i>{pet.name.slice(0, 1)}</i><span><b>{pet.name}</b><small>{pet.sex || ""}</small></span></span>
                <span><b>{pet.tutor_name || "Sem tutor"}</b><small>{pet.tutor_phone || "Telefone nao informado"}</small></span>
                <span>{pet.breed || "-"}</span>
                <span><em className={`pet-size ${pet.size === "Grande" ? "large" : pet.size === "Medio" ? "medium" : "small"}`}>{pet.size || "-"}</em></span>
                <span>{petAge(pet)}</span>
                <span><em className="reservation-status confirmed">{petStatus(pet, reservations)}</em></span>
                <span>{petLastActivity(pet, reservations)}</span>
                <span><MoreVertical size={18} /></span>
              </button>
            ))}
            {filteredPets.length === 0 && <p className="admin-empty">Nenhum pet encontrado com esses filtros.</p>}
          </div>
        </section>

        <aside className="pet-detail-card">
          {selected ? (
            <>
              <div className="pet-detail-hero">
                <div className="reservation-detail-avatar">{selected.name.slice(0, 1)}</div>
                <div><h2>{selected.name}</h2><span>{selected.breed || "Raca nao informada"} - {petAge(selected)}</span></div>
                <em className="reservation-status confirmed">{petStatus(selected, reservations)}</em>
              </div>
              <div className="pet-actions">
                <button onClick={() => openEdit(selected)}><Edit3 size={16} />Editar</button>
                <button onClick={() => setTab("docs")}><ClipboardCheck size={16} />Vacinas</button>
                <button onClick={() => setTab("history")}><Clock size={16} />Historico</button>
                <button onClick={() => setTab("notes")}><MoreVertical size={16} />Mais</button>
              </div>
              <div className="pet-tabs"><button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>Informacoes</button><button className={tab === "docs" ? "active" : ""} onClick={() => setTab("docs")}>Documentos</button><button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>Historico</button><button className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")}>Anotacoes</button></div>
              {tab === "info" && <div className="pet-info-grid"><p><span>Tutor</span><strong>{selected.tutor_name || "-"}</strong></p><p><span>Data de nascimento</span><strong>{selected.birth_date ? dateLabel(selected.birth_date) : "-"}</strong></p><p><span>Telefone</span><strong>{selected.tutor_phone || "-"}</strong></p><p><span>Peso</span><strong>{selected.weight ? `${selected.weight} kg` : "-"}</strong></p><p><span>E-mail</span><strong>{selected.tutor_email || "-"}</strong></p><p><span>Sexo</span><strong>{selected.sex || "-"}</strong></p><p><span>Porte</span><strong>{selected.size || "-"}</strong></p><p><span>Veterinario</span><strong>{selected.veterinarian || "-"}</strong></p></div>}
              {tab === "docs" && <div className="pet-note-box"><strong>Documentos e vacinas</strong><p>{selected.birth_date ? "Cadastro com data de nascimento informada." : "Cadastre data de nascimento e documentos para acompanhar vencimentos."}</p><p>{selected.photo_url ? "Foto cadastrada." : "Foto ainda nao cadastrada."}</p></div>}
              {tab === "history" && <div className="pet-activity-list">{reservations.filter((item) => item.pet_id === selected.id || item.pet_name.toLowerCase() === selected.name.toLowerCase()).slice(0, 5).map((item) => <article key={item.id}><span className={`reservation-service ${serviceIconClass(item.service)}`}>{serviceKind(item.service)}</span><strong>{dateLabel(item.entry_date)} as {item.expected_time || "--:--"}</strong></article>)}<button className="approve-action"><Plus size={16} />Nova atividade</button></div>}
              {tab === "notes" && <div className="pet-note-box"><strong>Informacoes importantes</strong>{petNotes(selected).length ? petNotes(selected).map((note) => <p key={note}>{note}</p>) : <p>Nenhuma anotacao importante cadastrada.</p>}</div>}
            </>
          ) : <p className="admin-empty">Selecione um pet para ver os detalhes.</p>}
        </aside>
      </div>

      {editing && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal pet-edit-modal" onSubmit={saveEdit}>
            <div className="reservation-detail-head"><h2>Editar pet</h2><button type="button" onClick={() => setEditing(null)}><X size={18} /></button></div>
            <label>Nome<input value={editForm.name || ""} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label>Raca<input value={editForm.breed || ""} onChange={(event) => setEditForm((current) => ({ ...current, breed: event.target.value }))} /></label>
            <label>Porte<select value={editForm.size || "Pequeno"} onChange={(event) => setEditForm((current) => ({ ...current, size: event.target.value }))}><option>Pequeno</option><option>Medio</option><option>Grande</option></select></label>
            <label>Sexo<select value={editForm.sex || ""} onChange={(event) => setEditForm((current) => ({ ...current, sex: event.target.value }))}><option value="">Nao informado</option><option>Macho</option><option>Femea</option></select></label>
            <label>Peso<input type="number" value={editForm.weight ?? ""} onChange={(event) => setEditForm((current) => ({ ...current, weight: Number(event.target.value) }))} /></label>
            <label>Nascimento<input type="date" value={editForm.birth_date || ""} onChange={(event) => setEditForm((current) => ({ ...current, birth_date: event.target.value }))} /></label>
            <label className="span-2">Restricoes alimentares<textarea rows={3} value={editForm.food_restrictions || ""} onChange={(event) => setEditForm((current) => ({ ...current, food_restrictions: event.target.value }))} /></label>
            <label className="span-2">Medicamentos<textarea rows={3} value={editForm.medications || ""} onChange={(event) => setEditForm((current) => ({ ...current, medications: event.target.value }))} /></label>
            <label className="span-2">Anotacoes importantes<textarea rows={4} value={editForm.important_notes || ""} onChange={(event) => setEditForm((current) => ({ ...current, important_notes: event.target.value }))} /></label>
            <button className="approve-action span-2" type="submit"><Check size={18} />Salvar pet</button>
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
  onPatch: (id: number, payload: ReservationPatch) => Promise<void>;
};

function AdminReservationsPage({ reservations, selectedId, setSelectedId, pendingCount, initialStatus, onPatch }: AdminReservationsPageProps) {
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [editForm, setEditForm] = useState<ReservationPatch>({});
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

  function openEdit(item: Reservation) {
    setEditing(item);
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

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    await onPatch(editing.id, { ...editForm, exit_date: editForm.exit_date || null });
    setEditing(null);
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
          <h1>Reservas</h1>
          <p>Gerencie todas as reservas de Day Care, Hospedagem, Banho e Tosa e muito mais.</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search reservation-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar reserva, tutor ou pet..." /><Search size={20} /></label>
          <button className="admin-bell"><Bell size={20} /><span>{pendingCount}</span></button>
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
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todos os status</option>
              {statusTabs.filter((item) => item.status !== "all").map((item) => <option key={item.status} value={item.status}>{item.label}</option>)}
            </select>
            <label><CalendarDays size={18} /><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label><CalendarDays size={18} /><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
            <button onClick={() => { setQuery(""); setServiceFilter("all"); setStatusFilter("all"); setStartDate(""); setEndDate(""); }}><Filter size={18} />Filtros</button>
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
            {pageItems.length === 0 && <p className="admin-empty">Nenhuma reserva encontrada com esses filtros.</p>}
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

      {editing && (
        <div className="reservation-modal-backdrop">
          <form className="reservation-modal" onSubmit={saveEdit}>
            <div className="reservation-detail-head"><h2>Editar reserva</h2><button type="button" onClick={() => setEditing(null)}><X size={18} /></button></div>
            <label>Tutor<input value={editForm.tutor_name || ""} onChange={(event) => setEditForm((current) => ({ ...current, tutor_name: event.target.value }))} /></label>
            <label>Telefone<input value={editForm.phone || ""} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label>E-mail<input value={editForm.email || ""} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label>Pet<input value={editForm.pet_name || ""} onChange={(event) => setEditForm((current) => ({ ...current, pet_name: event.target.value }))} /></label>
            <label>Servico<select value={editForm.service || "Day Care"} onChange={(event) => setEditForm((current) => ({ ...current, service: event.target.value }))}><option>Day Care</option><option>Hospedagem</option><option>Banho e Tosa</option></select></label>
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
  const [adminPage, setAdminPage] = useState<AdminPageKey>("dashboard");
  const [reservationInitialStatus, setReservationInitialStatus] = useState("all");
  const [loginMessage, setLoginMessage] = useState("");
  const [items, setItems] = useState(reservations);
  const [petItems, setPetItems] = useState(pets);
  const [selectedId, setSelectedId] = useState(reservations[0]?.id ?? 0);
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? 0);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userForm, setUserForm] = useState<UserPayload>({ name: "", email: "", password: "", role: "equipe" });
  const [userMessage, setUserMessage] = useState("");
  const [maxCapacity] = useState(settings.max_capacity);

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

  function openPets() {
    setAdminPage("pets");
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
          <a className={adminPage === "dashboard" ? "active" : ""} onClick={() => setAdminPage("dashboard")}><LayoutDashboard size={18} />Dashboard</a>
          <div className="admin-nav-section">
            <span>Gestao</span>
            <a className={adminPage === "reservations" ? "active" : ""} onClick={() => openReservations("all")}><CalendarCheck size={18} />Reservas</a>
            <a className={adminPage === "pets" ? "active" : ""} onClick={openPets}><PawPrint size={18} />Pets</a>
            <a className={adminPage === "users" ? "active" : ""} onClick={openUsers}><Users size={18} />Clientes (Tutores)</a>
            <a onClick={() => openReservations("all")}><Scissors size={18} />Servicos</a>
            <a><Package size={18} />Pacotes</a>
            <a><ClipboardCheck size={18} />Relatorios diarios</a>
          </div>
          <div className="admin-nav-section">
            <span>Operacao</span>
            <a onClick={() => openReservations("all")}><CalendarDays size={18} />Agenda</a>
            <a onClick={() => openReservations("Confirmada")}><CheckCircle2 size={18} />Check-in / Check-out</a>
            <a onClick={() => openReservations("Em andamento")}><Activity size={18} />Atividades</a>
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

      {adminPage === "dashboard" && (
        <AdminDashboardHome
          reservations={items}
          pets={petItems}
          users={users}
          maxCapacity={maxCapacity}
          adminName={adminName}
          onOpenReservations={(status = "all") => openReservations(status)}
          onOpenNewReservation={() => openReservations("all")}
          onOpenUsers={openUsers}
          onUpdateStatus={updateDashboardStatus}
          onExportReport={exportReport}
        />
      )}

      {adminPage === "pets" && (
        <AdminPetsPage
          pets={petItems}
          reservations={items}
          selectedPetId={selectedPetId}
          setSelectedPetId={setSelectedPetId}
          onPatch={updatePetFields}
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
                <article className="reservation-row" key={user.id}>
                  <div><strong>{user.name}</strong><p>{user.email} - {user.role} - {user.is_active ? "ativo" : "inativo"}</p></div>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}
