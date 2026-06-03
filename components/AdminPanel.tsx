"use client";

import { useMemo, useState } from "react";
import { ReservationForm } from "@/components/ReservationForm";
import type { PetOption, Reservation } from "@/lib/types";

type Props = {
  pets: PetOption[];
  reservations: Reservation[];
};

export function AdminPanel({ pets, reservations }: Props) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState(reservations);
  const pending = useMemo(() => items.filter((item) => item.status === "Aguardando aprovacao" || item.status === "Pendente"), [items]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    setUnlocked(response.ok);
  }

  async function setStatus(id: number, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/reservations/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    if (response.ok) {
      const status = action === "approve" ? "Confirmada" : "Reprovada";
      setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    }
  }

  if (!unlocked) {
    return (
      <form className="form-card form-grid" onSubmit={login}>
        <h2 className="span-2">Entrar no admin</h2>
        <label className="span-2">Senha administrativa
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button className="primary-button span-2">Entrar</button>
      </form>
    );
  }

  return (
    <div className="admin-shell">
      <section className="admin-card">
        <h2>Reservas aguardando aprovacao</h2>
        <div className="admin-list">
          {pending.length === 0 && <p>Nenhuma reserva pendente.</p>}
          {pending.map((reservation) => (
            <article className="reservation-row" key={reservation.id}>
              <div>
                <strong>{reservation.pet_name} - {reservation.tutor_name}</strong>
                <p>{reservation.service} • {reservation.entry_date} • {reservation.expected_time}</p>
                <p>{reservation.phone} • {reservation.email}</p>
                {reservation.notes && <p>{reservation.notes}</p>}
              </div>
              <div className="row-actions">
                <button className="primary-button" onClick={() => setStatus(reservation.id, "approve")}>Aprovar</button>
                <button className="danger-button" onClick={() => setStatus(reservation.id, "reject")}>Reprovar</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Cadastrar reserva pelo admin</h2>
        <ReservationForm pets={pets} admin />
      </section>
    </div>
  );
}
