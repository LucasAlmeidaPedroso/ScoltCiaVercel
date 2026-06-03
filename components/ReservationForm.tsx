"use client";

import { useMemo, useState } from "react";
import type { DaycareSettings, PetOption, Reservation } from "@/lib/types";

type Props = {
  pets: PetOption[];
  reservations?: Reservation[];
  settings?: DaycareSettings;
  admin?: boolean;
  adminAuth?: {
    email: string;
    password: string;
    accessToken?: string;
  };
};

const initial = {
  pet_id: "",
  tutor_name: "",
  phone: "",
  email: "",
  pet_name: "",
  breed: "",
  size: "Pequeno",
  service: "Day Care",
  entry_date: "",
  exit_date: "",
  expected_time: "",
  notes: ""
};

const activeStatuses = ["Aguardando aprovacao", "Pendente", "Confirmada", "Em andamento"];

export function ReservationForm({ pets, reservations = [], settings = { max_capacity: 20 }, admin = false, adminAuth }: Props) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const petMap = useMemo(() => new Map(pets.map((pet) => [String(pet.id), pet])), [pets]);
  const selectedDateCount = useMemo(() => {
    if (!form.entry_date) return 0;
    return reservations.filter((reservation) => reservation.entry_date === form.entry_date && activeStatuses.includes(reservation.status)).length;
  }, [form.entry_date, reservations]);
  const isFull = Boolean(form.entry_date) && selectedDateCount >= settings.max_capacity;

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

    if (!admin && isFull) {
      setMessage("Data sem vagas no momento. Escolha outro dia ou fale conosco pelo WhatsApp.");
      return;
    }

    const response = await fetch(admin ? "/api/admin/reservations" : "/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(admin && adminAuth?.accessToken ? {
          "Authorization": `Bearer ${adminAuth.accessToken}`
        } : admin && adminAuth ? {
          "x-admin-email": adminAuth.email,
          "x-admin-password": adminAuth.password
        } : {})
      },
      body: JSON.stringify({
        ...form,
        pet_id: form.pet_id ? Number(form.pet_id) : null,
        exit_date: form.exit_date || null
      })
    });

    if (response.ok) {
      setMessage(admin ? "Reserva cadastrada e confirmada." : "Reserva enviada para aprovacao.");
      setForm(initial);
    } else {
      setMessage("Nao foi possivel enviar a reserva. Confira os dados.");
    }
  }

  return (
    <form className="form-card form-grid" onSubmit={submit}>
      <label className="span-2">Pet - Tutor
        <select value={form.pet_id} onChange={(event) => selectPet(event.target.value)}>
          <option value="">Adicionar novo tutor/pet</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.name} - {pet.tutor_name}</option>
          ))}
        </select>
      </label>
      <label>Nome do tutor<input required value={form.tutor_name} onChange={(event) => update("tutor_name", event.target.value)} /></label>
      <label>Telefone<input required value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
      <label>E-mail<input value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
      <label>Nome do pet<input required value={form.pet_name} onChange={(event) => update("pet_name", event.target.value)} /></label>
      <label>Raca<input value={form.breed} onChange={(event) => update("breed", event.target.value)} /></label>
      <label>Porte<select value={form.size} onChange={(event) => update("size", event.target.value)}><option>Pequeno</option><option>Medio</option><option>Grande</option></select></label>
      <label>Servico<select value={form.service} onChange={(event) => update("service", event.target.value)}><option>Day Care</option><option>Hospedagem</option><option>Banho e tosa</option><option>Cuidados especiais</option></select></label>
      <label>Data de entrada<input required type="date" value={form.entry_date} onChange={(event) => update("entry_date", event.target.value)} /></label>
      {form.entry_date && !admin && (
        <div className={`capacity-note ${isFull ? "is-full" : ""}`}>
          <strong>{isFull ? "Lotado para esta data" : `${selectedDateCount} de ${settings.max_capacity} vagas ocupadas`}</strong>
          <span>{isFull ? "Escolha outra data para enviar a reserva." : `${settings.max_capacity - selectedDateCount} vaga(s) disponivel(is).`}</span>
        </div>
      )}
      <label>Data de saida<input type="date" value={form.exit_date} onChange={(event) => update("exit_date", event.target.value)} /></label>
      <label>Horario previsto<input type="time" value={form.expected_time} onChange={(event) => update("expected_time", event.target.value)} /></label>
      <label className="span-2">Observacoes<textarea rows={4} value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>
      <button className="primary-button span-2" type="submit" disabled={!admin && isFull}>{admin ? "Cadastrar e confirmar" : "Enviar para aprovacao"}</button>
      {message && <strong className="span-2">{message}</strong>}
    </form>
  );
}
