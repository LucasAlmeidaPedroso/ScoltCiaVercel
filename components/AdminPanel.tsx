"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

function AdminDashboardHome({ pendingCount }: { pendingCount: number }) {
  const checkins = [
    ["Thor", "Golden Retriever", "Hospedagem", "14:00", "Concluido"],
    ["Chico", "Labrador", "Day Care", "08:30", "Concluido"],
    ["Mel", "Shih Tzu", "Hospedagem", "14:00", "Pendente"],
    ["Luna", "Poodle", "Banho e Tosa", "10:00", "Pendente"]
  ];
  const reservations = [
    ["Thor", "Day Care", "Hoje - 08:00", "Confirmado"],
    ["Mel", "Hospedagem", "Hoje - 14:00", "Confirmado"],
    ["Luna", "Banho e Tosa", "Amanha - 10:00", "Pendente"]
  ];
  const activities = [
    ["08:00", "Abertura da unidade", "Unidade Vila Mariana", CheckCircle2],
    ["09:00", "Atividade recreativa", "Area externa", Activity],
    ["12:00", "Alimentacao", "Todos os grupos", Utensils],
    ["15:00", "Banho e Tosa", "3 agendamentos", Scissors],
    ["18:00", "Encerramento do dia", "Unidade Vila Mariana", CheckCircle2]
  ];

  return (
    <section className="admin-main admin-dashboard-page">
      <header className="admin-dashboard-topbar">
        <div>
          <h1>Ola, Marina!</h1>
          <p>Bem-vinda ao painel de gestao da Scolt&Cia.</p>
        </div>
        <div className="admin-topbar-tools">
          <label className="admin-search"><input placeholder="Buscar..." /><Search size={20} /></label>
          <button className="admin-bell"><Bell size={20} /><span>{pendingCount}</span></button>
          <div className="admin-date"><CalendarDays size={20} />Hoje, 20 de maio de 2025</div>
        </div>
      </header>

      <div className="admin-kpi-grid">
        <article className="admin-kpi kpi-aqua"><span><Users size={30} /></span><div><small>Reservas hoje</small><strong>28</strong><em>+ 12% vs ontem</em></div><svg viewBox="0 0 180 44"><polyline points="0,28 18,20 36,27 54,24 72,30 90,35 108,33 126,36 144,25 162,18 180,21" /></svg></article>
        <article className="admin-kpi kpi-purple"><span><Home size={30} /></span><div><small>Hospedagens ativas</small><strong>14</strong><em>+ 8% vs ontem</em></div><svg viewBox="0 0 180 44"><polyline points="0,26 18,20 36,28 54,24 72,31 90,34 108,35 126,30 144,18 162,16 180,20" /></svg></article>
        <article className="admin-kpi kpi-yellow"><span><PawPrint size={30} /></span><div><small>Day Care hoje</small><strong>36</strong><em>+ 15% vs ontem</em></div><svg viewBox="0 0 180 44"><polyline points="0,30 18,18 36,29 54,27 72,34 90,36 108,32 126,20 144,17 162,22 180,14" /></svg></article>
        <article className="admin-kpi kpi-pink"><span><Heart size={30} /></span><div><small>Clientes ativos</small><strong>152</strong><em>+ 10% vs ultimo mes</em></div><svg viewBox="0 0 180 44"><polyline points="0,27 18,19 36,28 54,25 72,31 90,34 108,25 126,18 144,20 162,17 180,22" /></svg></article>
      </div>

      <div className="admin-dashboard-layout">
        <section className="admin-panel-card admin-line-card">
          <div className="admin-card-head"><h2>Visao geral de reservas</h2><button>Ultimos 7 dias <ChevronRight size={16} /></button></div>
          <div className="admin-chart-legend"><span className="aqua">Day Care</span><span className="purple">Hospedagem</span><span className="yellow">Banho e Tosa</span></div>
          <div className="admin-line-chart">
            <div className="admin-y-axis"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
            <svg viewBox="0 0 620 220" preserveAspectRatio="none">
              <polyline className="line-aqua" points="0,160 95,132 190,94 285,108 380,54 475,78 620,116" />
              <polyline className="line-purple" points="0,178 95,145 190,116 285,146 380,98 475,106 620,136" />
              <polyline className="line-yellow" points="0,192 95,194 190,164 285,185 380,162 475,182 620,164" />
            </svg>
            <div className="admin-x-axis"><span>14/05</span><span>15/05</span><span>16/05</span><span>17/05</span><span>18/05</span><span>19/05</span><span>20/05</span></div>
          </div>
        </section>

        <section className="admin-panel-card admin-donut-card">
          <h2>Reservas por servico</h2>
          <div className="admin-donut-wrap"><div className="admin-donut"><span>Total<strong>78</strong></span></div><div className="admin-donut-legend"><p><i className="aqua"></i>Day Care <strong>45 (57.7%)</strong></p><p><i className="purple"></i>Hospedagem <strong>20 (25.6%)</strong></p><p><i className="yellow"></i>Banho e Tosa <strong>13 (16.7%)</strong></p></div></div>
        </section>

        <aside className="admin-dashboard-side">

          <section className="admin-panel-card admin-next-reservations">
            <h2>Proximas reservas</h2>
            {reservations.map((row) => (
              <article key={row[0]}><div className="admin-pet-thumb">{row[0].slice(0, 1)}</div><div><strong>{row[0]}</strong><span>{row[1]}</span><small>{row[2]}</small></div><b className={row[3] === "Confirmado" ? "ok" : "wait"}>{row[3]}</b></article>
            ))}
            <button className="admin-wide-button">Ver todas as reservas <ChevronRight size={16} /></button>
          </section>

          <section className="admin-panel-card admin-birthdays">
            <div className="admin-card-head"><h2>Aniversariantes do mes</h2><a>Ver todos</a></div>
            {["Rex 06/05", "Maya 12/05", "Buddy 25/05"].map((item) => <article key={item}><div className="admin-pet-thumb">{item.slice(0, 1)}</div><span>{item}</span><Cake size={26} /></article>)}
          </section>

          <section className="admin-panel-card admin-quick-reports">
            <div className="admin-card-head"><h2>Relatorios rapidos</h2><button><Download size={18} /></button></div>
            <a><ClipboardCheck size={16} />Relatorio de reservas</a>
            <a><ClipboardCheck size={16} />Relatorio de Day Care</a>
            <a><ClipboardCheck size={16} />Relatorio de Hospedagem</a>
            <a><ClipboardCheck size={16} />Relatorio financeiro</a>
          </section>
        </aside>

        <section className="admin-panel-card admin-checkins">
          <h2>Check-ins de hoje</h2>
          {checkins.map((row) => (
            <article key={row[0]}><div className="admin-pet-thumb">{row[0].slice(0, 1)}</div><div><strong>{row[0]}</strong><span>{row[1]}</span></div><em>{row[2]}</em><small><Clock size={14} />{row[3]}</small><b className={row[4] === "Concluido" ? "ok" : "wait"}>{row[4]}</b></article>
          ))}
          <button className="admin-wide-button">Ver todos check-ins <ChevronRight size={16} /></button>
        </section>

        <section className="admin-panel-card admin-activities">
          <h2>Atividades de hoje</h2>
          {activities.map(([time, title, text, Icon]) => {
            const ActivityIcon = Icon as typeof CheckCircle2;
            return <article key={String(title)}><time>{String(time)}</time><span><ActivityIcon size={18} /></span><div><strong>{String(title)}</strong><small>{String(text)}</small></div></article>;
          })}
          <button className="admin-wide-button">Ver agenda completa <ChevronRight size={16} /></button>
        </section>

        <section className="admin-panel-card admin-indicators">
          <h2>Indicadores do mes</h2>
          <div>
            <article><span><PawPrint size={26} /></span><small>Taxa de ocupacao</small><strong>82%</strong><em>+ 9% vs mes anterior</em></article>
            <article><span><Star size={26} /></span><small>Satisfacao dos tutores</small><strong>4,8 / 5</strong><em>+ 0,3 vs mes anterior</em></article>
            <article><span><Users size={26} /></span><small>Novos clientes</small><strong>23</strong><em>+ 15% vs mes anterior</em></article>
            <article><span><Scissors size={26} /></span><small>Faturamento</small><strong>R$ 48.560,00</strong><em>+ 12% vs mes anterior</em></article>
          </div>
        </section>
      </div>
      <button className="admin-floating-action"><Plus size={24} /><span>Acoes rapidas</span></button>
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
          <a className="active"><LayoutDashboard size={18} />Dashboard</a>
          <div className="admin-nav-section">
            <span>Gestao</span>
            <a><CalendarCheck size={18} />Reservas</a>
            <a><PawPrint size={18} />Pets</a>
            <a><Users size={18} />Clientes (Tutores)</a>
            <a><Scissors size={18} />Servicos</a>
            <a><Package size={18} />Pacotes</a>
            <a><ClipboardCheck size={18} />Relatorios diarios</a>
          </div>
          <div className="admin-nav-section">
            <span>Operacao</span>
            <a><CalendarDays size={18} />Agenda</a>
            <a><CheckCircle2 size={18} />Check-in / Check-out</a>
            <a><Activity size={18} />Atividades</a>
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

      <AdminDashboardHome pendingCount={countByStatus("Aguardando aprovacao")} />
      <section className="admin-main admin-legacy-hidden">
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
