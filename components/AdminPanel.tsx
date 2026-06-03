"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarCheck, Check, ChevronRight, Clock, CreditCard, Eye, EyeOff, Gamepad2, Heart, Hotel, LayoutDashboard, Lock, Mail, PawPrint, Scissors, Settings, ShieldCheck, UserRound, Users, X } from "lucide-react";
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

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function activeCapacityCount(reservations: Reservation[]) {
  return reservations.filter((item) => ["Aguardando aprovacao", "Pendente", "Confirmada", "Em andamento"].includes(item.status)).length;
}

export function AdminPanel({ pets, reservations, settings }: Props) {
  const [email, setEmail] = useState("lucasalmeidapedroso@gmail.com");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [items, setItems] = useState(reservations);
  const [selectedId, setSelectedId] = useState(reservations[0]?.id ?? 0);
  const [tab, setTab] = useState("Aguardando aprovacao");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userForm, setUserForm] = useState<UserPayload>({ name: "", email: "", password: "", role: "equipe" });
  const [userMessage, setUserMessage] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(settings.max_capacity);
  const [settingsMessage, setSettingsMessage] = useState("");
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
      setAccessToken("");
      const usersResponse = await fetch("/api/admin/users", { headers: adminHeaders() });
      if (usersResponse.ok) setUsers(await usersResponse.json());
    } else {
      setLoginMessage("Login nao autorizado. Confira e-mail, senha e se o SQL do Supabase foi rodado.");
    }
  }

  async function googleLogin() {
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
          <button className="google-button" type="button" onClick={googleLogin}><strong>G</strong>Entrar com Google</button>
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
          <a><LayoutDashboard size={18} />Dashboard</a>
          <a className="active"><CalendarCheck size={18} />Reservas</a>
          <a><Hotel size={18} />Hospedagens</a>
          <a><Scissors size={18} />Day Care</a>
          <a><Users size={18} />Clientes</a>
          <a><PawPrint size={18} />Pets</a>
          <a><CreditCard size={18} />Financeiro</a>
          <a><Settings size={18} />Configuracoes</a>
        </nav>
        <a className="quick-whatsapp" href="https://wa.me/5511984130296" target="_blank">Atendimento rapido<br /><strong>Falar no WhatsApp</strong></a>
        <div className="admin-profile"><UserRound size={34} /><div><strong>Admin</strong><span>Administrador</span></div></div>
      </aside>

      <section className="admin-main">
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
                  <div><h2>{selected.pet_name}</h2><span>{selected.breed || selected.size || "Pet cadastrado"}</span><p>{selected.size || "Porte nao informado"} • {selected.service}</p></div>
                  <div className="requester"><strong>Solicitado por</strong><p>{selected.tutor_name}</p><p>{selected.phone}</p><p>{selected.email}</p></div>
                </div>
                <div className="detail-grid">
                  <div>
                    <h3>Detalhes da hospedagem</h3>
                    <p><strong>Tipo de servico</strong><span>{selected.service}</span></p>
                    <p><strong>Check-in</strong><span>{selected.entry_date} • {selected.expected_time || "-"}</span></p>
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
                <div><strong>{user.name}</strong><p>{user.email} • {user.role} • {user.is_active ? "ativo" : "inativo"}</p></div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
