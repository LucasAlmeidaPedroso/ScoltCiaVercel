"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Calendar, CalendarCheck, CheckCircle2, ChevronDown, Home, Hotel, Mail, PawPrint, Phone, Scissors, Settings, ShieldCheck, UserRound, Users, WalletCards } from "lucide-react";
import type { DaycareSettings, PetOption, Reservation } from "@/lib/types";

type Props = {
  pets: PetOption[];
  reservations: Reservation[];
  settings: DaycareSettings;
};

const initial = {
  pet_id: "",
  tutor_name: "",
  phone: "",
  email: "",
  pet_name: "",
  breed: "",
  size: "Pequeno",
  service: "Hospedagem",
  entry_date: "",
  exit_date: "",
  expected_time: "",
  notes: ""
};

const activeStatuses = ["Aguardando aprovacao", "Pendente", "Confirmada", "Em andamento"];

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ReservationWizard({ pets, reservations, settings }: Props) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const petMap = useMemo(() => new Map(pets.map((pet) => [String(pet.id), pet])), [pets]);
  const selectedPet = form.pet_id ? petMap.get(form.pet_id) : undefined;
  const selectedDateCount = useMemo(() => {
    if (!form.entry_date) return 0;
    return reservations.filter((reservation) => reservation.entry_date === form.entry_date && activeStatuses.includes(reservation.status)).length;
  }, [form.entry_date, reservations]);
  const isFull = Boolean(form.entry_date) && selectedDateCount >= settings.max_capacity;
  const remaining = Math.max(settings.max_capacity - selectedDateCount, 0);

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function selectPet(value: string) {
    const pet = petMap.get(value);
    if (!pet) {
      setForm({ ...initial, pet_id: "" });
      return;
    }

    setForm((current) => ({
      ...current,
      pet_id: value,
      tutor_name: pet.tutor_name ?? "",
      phone: pet.tutor_phone ?? "",
      email: pet.tutor_email ?? "",
      pet_name: pet.name,
      breed: pet.breed ?? "",
      size: pet.size ?? "Pequeno"
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (isFull) {
      setMessage("Essa data esta lotada. Escolha outro dia ou fale pelo WhatsApp.");
      return;
    }

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pet_id: form.pet_id ? Number(form.pet_id) : null,
        exit_date: form.exit_date || null
      })
    });

    if (response.ok) {
      setMessage("Reserva enviada para aprovacao. A equipe entrara em contato pelo WhatsApp.");
      setForm(initial);
    } else {
      setMessage("Nao foi possivel enviar a reserva. Confira os dados.");
    }
  }

  return (
    <div className="booking-dashboard">
      <aside className="booking-sidebar">
        <div className="admin-brand">
          <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={58} height={58} />
          <div><strong>Scolt&Cia</strong><span>Day Care e Hospedagem</span></div>
        </div>
        <nav className="admin-nav">
          <Link href="/"><Home size={18} />Dashboard</Link>
          <Link className="active" href="/reserva"><CalendarCheck size={18} />Reservas</Link>
          <Link href="/servicos"><Hotel size={18} />Hospedagens</Link>
          <Link href="/servicos"><Scissors size={18} />Day Care</Link>
          <Link href="/reserva"><PawPrint size={18} />Pets</Link>
          <Link href="/contato"><Users size={18} />Clientes</Link>
          <Link href="/contato"><WalletCards size={18} />Financeiro</Link>
          <Link href="/contato"><Settings size={18} />Configuracoes</Link>
        </nav>
        <a className="quick-whatsapp" href="https://wa.me/5511984130296" target="_blank">Atendimento rapido<br /><strong>Falar no WhatsApp</strong></a>
        <div className="admin-profile"><UserRound size={34} /><div><strong>Tutor</strong><span>Cliente</span></div></div>
      </aside>

      <main className="booking-main">
        <header className="booking-topbar">
          <div className="booking-title">
            <span className="booking-title-icon"><CalendarCheck size={28} /></span>
            <div><h1>Nova reserva</h1><p>Preencha os dados para reservar o melhor cuidado para o seu pet.</p></div>
          </div>
          <div className="admin-actions">
            <button className="icon-button"><Bell size={18} /><span>2</span></button>
            <div className="admin-profile compact"><UserRound size={32} /><div><strong>Ola, Tutor</strong><span>Solicitante</span></div><ChevronDown size={16} /></div>
          </div>
        </header>

        <div className="booking-content">
          <section className="booking-left">
            <div className="booking-steps">
              <div className="active"><span>1</span><strong>Pet e tutor</strong><small>Informacoes basicas</small></div>
              <div><span>2</span><strong>Servico</strong><small>Escolha o tipo</small></div>
              <div><span>3</span><strong>Data e horario</strong><small>Periodo da reserva</small></div>
              <div><span>4</span><strong>Resumo</strong><small>Confirmacao e envio</small></div>
            </div>

            <form className="booking-form" onSubmit={submit}>
              <section className="booking-card">
                <h2>Informacoes do pet</h2>
                <div className="booking-grid">
                  <label>Selecione o pet
                    <div className="select-card">
                      <PawPrint size={18} />
                      <select value={form.pet_id} onChange={(event) => selectPet(event.target.value)}>
                        <option value="">Adicionar novo tutor/pet</option>
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>{pet.name} - {pet.tutor_name}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label>Porte do pet
                    <select value={form.size} onChange={(event) => update("size", event.target.value)}>
                      <option>Pequeno</option><option>Medio</option><option>Grande</option>
                    </select>
                  </label>
                  {!form.pet_id && (
                    <>
                      <label>Nome do pet<input required value={form.pet_name} onChange={(event) => update("pet_name", event.target.value)} /></label>
                      <label>Raca<input value={form.breed} onChange={(event) => update("breed", event.target.value)} /></label>
                    </>
                  )}
                  <label className="span-2">Observacoes sobre o pet
                    <textarea maxLength={200} rows={4} placeholder="Ex.: Tem alguma necessidade especial, toma medicacao, etc." value={form.notes} onChange={(event) => update("notes", event.target.value)} />
                    <small>{form.notes.length}/200</small>
                  </label>
                </div>
              </section>

              <section className="booking-card">
                <h2>Informacoes do tutor</h2>
                <div className="booking-grid">
                  <label>Nome completo<div className="input-icon"><UserRound size={18} /><input required value={form.tutor_name} onChange={(event) => update("tutor_name", event.target.value)} /></div></label>
                  <label>Telefone<div className="input-icon"><Phone size={18} /><input required value={form.phone} onChange={(event) => update("phone", event.target.value)} /></div></label>
                  <label className="span-2">E-mail<div className="input-icon"><Mail size={18} /><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></div></label>
                </div>
              </section>

              <section className="booking-card">
                <h2>Servico e periodo</h2>
                <div className="booking-grid">
                  <label>Servico
                    <select value={form.service} onChange={(event) => update("service", event.target.value)}>
                      <option>Hospedagem</option><option>Day Care</option><option>Banho e tosa</option><option>Cuidados especiais</option>
                    </select>
                  </label>
                  <label>Horario previsto<input type="time" value={form.expected_time} onChange={(event) => update("expected_time", event.target.value)} /></label>
                  <label>Check-in<input required type="date" value={form.entry_date} onChange={(event) => update("entry_date", event.target.value)} /></label>
                  <label>Check-out<input type="date" value={form.exit_date} onChange={(event) => update("exit_date", event.target.value)} /></label>
                  {form.entry_date && (
                    <div className={`capacity-note span-2 ${isFull ? "is-full" : ""}`}>
                      <strong>{isFull ? "Lotado para esta data" : `${selectedDateCount} de ${settings.max_capacity} vagas ocupadas`}</strong>
                      <span>{isFull ? "Escolha outra data para enviar a reserva." : `${remaining} vaga(s) disponivel(is).`}</span>
                    </div>
                  )}
                </div>
              </section>

              <button className="booking-submit" disabled={isFull} type="submit"><span>Continuar</span><small>Enviar para aprovacao</small></button>
              {message && <strong className={`booking-message ${message.includes("enviada") ? "success" : ""}`}>{message}</strong>}
            </form>
          </section>

          <aside className="booking-right">
            <a className="booking-help" href="https://wa.me/5511984130296" target="_blank">
              <span>Duvidas sobre a reserva?</span><strong>Fale conosco pelo WhatsApp</strong>
            </a>
            <section className="booking-summary">
              <h2><Calendar size={20} />Resumo da reserva</h2>
              <div className="summary-pet">
                <div className="pet-avatar">{(form.pet_name || selectedPet?.name || "P").slice(0, 1)}</div>
                <div><strong>{form.pet_name || selectedPet?.name || "Pet selecionado"}</strong><span>{form.breed || selectedPet?.breed || form.size || "Selecione um pet"}</span></div>
              </div>
              <div className="summary-service"><Hotel size={28} /><div><strong>{form.service}</strong><p>A reserva sera analisada pela equipe antes da confirmacao.</p></div></div>
              <div className="summary-line"><span>Periodo</span><strong>{form.entry_date || "Selecionar datas"} {form.exit_date ? `-> ${form.exit_date}` : ""}</strong></div>
              <div className="summary-line"><span>Vagas</span><strong>{form.entry_date ? `${remaining}/${settings.max_capacity}` : "-"}</strong></div>
              <hr />
              <div className="summary-line"><span>Diarias</span><strong>{money(0)}</strong></div>
              <div className="summary-line"><span>Desconto</span><strong>{money(0)}</strong></div>
              <div className="summary-total"><span>Total</span><strong>{money(0)}</strong></div>
              <p className="summary-note">O pagamento sera combinado apos a aprovacao da reserva.</p>
            </section>
            <section className="safe-card"><ShieldCheck size={24} /><div><strong>Ambiente seguro e monitorado</strong><p>Cuidamos do seu pet como se fosse da nossa familia.</p></div></section>
          </aside>
        </div>
      </main>
    </div>
  );
}
