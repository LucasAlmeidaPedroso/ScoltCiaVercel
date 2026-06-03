"use client";

import { useMemo, useState } from "react";
import { ReservationForm } from "@/components/ReservationForm";
import type { AppUser, PetOption, Reservation, UserPayload } from "@/lib/types";

type Props = {
  pets: PetOption[];
  reservations: Reservation[];
};

export function AdminPanel({ pets, reservations }: Props) {
  const [email, setEmail] = useState("lucasalmeidapedroso@gmail.com");
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState(reservations);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userForm, setUserForm] = useState<UserPayload>({ name: "", email: "", password: "", role: "equipe" });
  const [userMessage, setUserMessage] = useState("");
  const pending = useMemo(() => items.filter((item) => item.status === "Aguardando aprovacao" || item.status === "Pendente"), [items]);

  function adminHeaders() {
    return {
      "Content-Type": "application/json",
      "x-admin-email": email,
      "x-admin-password": password
    };
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    setUnlocked(response.ok);

    if (response.ok) {
      const usersResponse = await fetch("/api/admin/users", { headers: adminHeaders() });
      if (usersResponse.ok) setUsers(await usersResponse.json());
    }
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
      <form className="form-card form-grid" onSubmit={login}>
        <h2 className="span-2">Entrar no admin</h2>
        <label className="span-2">E-mail
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="span-2">Senha
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
        <ReservationForm pets={pets} admin adminAuth={{ email, password }} />
      </section>
      <section className="admin-card">
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
              <div>
                <strong>{user.name}</strong>
                <p>{user.email} • {user.role} • {user.is_active ? "ativo" : "inativo"}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
