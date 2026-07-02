"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  Heart,
  Home,
  Menu,
  MessageCircle,
  Moon,
  PawPrint,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Wrench,
  X
} from "lucide-react";

const tabs = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "services", label: "Servicos", icon: PawPrint },
  { id: "gallery", label: "Galeria", icon: Camera },
  { id: "contact", label: "Contato", icon: Phone },
  { id: "tutor", label: "Area do Tutor", icon: UserRound, href: "/area-do-tutor" },
  { id: "admin", label: "Administracao", icon: Wrench, href: "/admin" }
];

const services = [
  {
    title: "Creche/daycare",
    text: "Socializacao assistida, recreacao e descanso com supervisao.",
    icon: Home,
    tone: "teal"
  },
  {
    title: "Hospedagem",
    text: "Pernoite com rotina de atividades, carinho e acompanhamento proximo.",
    icon: Moon,
    tone: "purple"
  },
  {
    title: "Banho e tosa",
    text: "Cuidado de higiene integrado a rotina e bem-estar do dia.",
    icon: Scissors,
    tone: "orange"
  },
  {
    title: "Relatorio diario",
    text: "Acompanhe alimentacao, humor, atividades, fotos e check list do pet.",
    icon: Stethoscope,
    tone: "pink"
  }
];

const differentials = [
  {
    title: "Ambiente seguro",
    text: "Monitoramento ativo e equipe altamente treinada.",
    icon: ShieldCheck,
    tone: "teal"
  },
  {
    title: "Muito carinho",
    text: "Atencao e carinho individualizado todos os dias.",
    icon: Heart,
    tone: "purple"
  },
  {
    title: "Diversao garantida",
    text: "Atividades planejadas para gastar energia de forma saudavel.",
    icon: Sparkles,
    tone: "orange"
  },
  {
    title: "Relatorios diarios",
    text: "Acompanhe tudo em tempo real com fotos e relatorios de rotina.",
    icon: Camera,
    tone: "pink"
  }
];

const contacts = [
  { name: "Sandra", phone: "(11) 98413-0296", href: "https://wa.me/5511984130296" },
  { name: "Carina", phone: "(11) 97755-2805", href: "https://wa.me/5511977552805" }
];

export function PublicPreLoginApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);

  const openTab = (id: string) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  const submitVisit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Ola! Quero agendar uma visita na Scolt&Cia.",
      `Pet: ${data.get("petName")}`,
      `Tutor: ${data.get("ownerName")}`,
      `Data: ${data.get("visitDate")}`,
      `Horario: ${data.get("visitTime")}`,
      `Interesse: ${data.get("interest")}`
    ].join("\n");

    window.open(`https://wa.me/5511984130296?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setVisitModalOpen(false);
  };

  const submitReservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Ola! Quero fazer uma reserva na Scolt&Cia.",
      `Pet: ${data.get("petName")}`,
      `Tutor: ${data.get("ownerName")}`,
      `Servico: ${data.get("service")}`,
      `Entrada: ${data.get("startDate")} as ${data.get("startTime")}`,
      `Saida: ${data.get("endDate") || "A combinar"}`,
      `Observacoes: ${data.get("notes") || "Nenhuma"}`
    ].join("\n");

    window.open(`https://wa.me/5511984130296?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setReservationModalOpen(false);
  };

  return (
    <main className="prelogin-app-page">
      <span className="prelogin-blob prelogin-blob-a" />
      <span className="prelogin-blob prelogin-blob-b" />

      <section className="prelogin-desktop-copy" aria-label="Resumo Scolt&Cia">
        <span>Redesign mobile</span>
        <h1>Scolt&Cia</h1>
        <p className="prelogin-subtitle">Day Care & Hospedagem de luxo</p>
        <p>Experiencia de app antes do login, com menu suspenso no topo, conteudo amplo e atalhos claros para tutor, contato e reserva.</p>
        <div className="prelogin-feature-list">
          <strong>Menu suspenso no topo esquerdo</strong>
          <strong>Area de conteudo ampliada</strong>
          <strong>Transicoes leves entre secoes</strong>
        </div>
      </section>

      <section className="prelogin-phone-shell" aria-label="Aplicativo Scolt&Cia">
        <div className="prelogin-phone-notch" />
        <div className="prelogin-phone-screen">
          <div className="prelogin-app">
            <header className="prelogin-header">
              <div className="prelogin-header-left">
                <button className="prelogin-menu-btn" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Abrir menu">
                  {menuOpen ? <X size={21} /> : <Menu size={22} />}
                </button>
                <Link href="/" className="prelogin-brand" onClick={() => openTab("home")}>
                  <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={42} height={42} />
                  <span><strong>Scolt&Cia</strong><small>Day Care e Hospedagem</small></span>
                </Link>
              </div>
              <button className="prelogin-notification" type="button" aria-label="Notificacoes">
                <Bell size={18} />
                <i />
              </button>
            </header>

            <div className={`prelogin-dropdown ${menuOpen ? "active" : ""}`}>
              <nav aria-label="Menu publico">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  if (tab.href) {
                    return (
                      <Link className={activeTab === tab.id ? "active" : ""} href={tab.href} key={tab.id} onClick={() => setMenuOpen(false)}>
                        <Icon size={19} />
                        {tab.label}
                      </Link>
                    );
                  }
                  return (
                    <button className={activeTab === tab.id ? "active" : ""} type="button" key={tab.id} onClick={() => openTab(tab.id)}>
                      <Icon size={19} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="prelogin-views">
              {activeTab === "home" && (
                <section className="prelogin-view">
                  <div className="prelogin-welcome">
                    <span>Day Care, Hospedagem e Cuidado Diario</span>
                    <h2>Um dia alegre, seguro e cheio de afeto para o seu cachorro gastar energia, socializar e voltar para casa feliz.</h2>
                  </div>

                  <div className="prelogin-hero-card">
                    <Image src="/img/prelogin-hero-dogs.png" alt="Dois cachorrinhos felizes da Scolt&Cia" width={900} height={600} priority />
                    <button className={favorite ? "active" : ""} type="button" onClick={() => setFavorite((value) => !value)} aria-label="Favoritar">
                      <Heart size={22} fill={favorite ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="prelogin-quick-actions">
                    <button className="teal" type="button" onClick={() => setVisitModalOpen(true)}><CalendarDays size={18} /> Agendar visita</button>
                    <button className="yellow" type="button" onClick={() => setReservationModalOpen(true)}><PawPrint size={18} /> Fazer reserva</button>
                    <a className="green" href="https://wa.me/5511984130296"><MessageCircle size={18} /> WhatsApp</a>
                  </div>

                  <div className="prelogin-diff-panel">
                    <span>Diferenciais</span>
                    <h3>Organizacao de operacao, jeitinho de casa</h3>
                    <div className="prelogin-diff-list">
                      {differentials.map((item) => {
                        const Icon = item.icon;
                        return (
                          <article key={item.title}>
                            <b className={item.tone}><Icon size={20} /></b>
                            <div><strong>{item.title}</strong><p>{item.text}</p></div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  <div className="prelogin-about-card">
                    <h3>Aqui seu pet e tratado como familia!</h3>
                    <p>Rotina leve, organizada e afetiva para que cada caozinho tenha seguranca, recreacao e muito carinho.</p>
                  </div>
                </section>
              )}

              {activeTab === "services" && (
                <section className="prelogin-view">
                  <div className="prelogin-welcome">
                    <h2>Nossos Servicos</h2>
                    <p>Escolha uma opcao para conhecer melhor o cuidado da Scolt&Cia.</p>
                  </div>
                  <div className="prelogin-services-grid">
                    {services.map((service) => {
                      const Icon = service.icon;
                      return (
                        <article key={service.title}>
                          <b className={service.tone}><Icon size={28} /></b>
                          <strong>{service.title}</strong>
                          <p>{service.text}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {activeTab === "gallery" && (
                <section className="prelogin-view">
                  <div className="prelogin-welcome">
                    <h2>Nossa Galeria</h2>
                    <p>Flagrantes de carinho, descanso e brincadeiras por aqui.</p>
                  </div>
                  <div className="prelogin-gallery-grid">
                    <figure><Image src="/img/prelogin-hero-dogs.png" alt="Scolt e amigos" width={420} height={320} /><figcaption>Scolt & Pipoca</figcaption></figure>
                    <figure><span className="teal"><PawPrint size={34} /></span><figcaption>Hora da piscina</figcaption></figure>
                    <figure><span className="orange"><Sparkles size={34} /></span><figcaption>Brincadeiras</figcaption></figure>
                    <figure><span className="purple"><Moon size={34} /></span><figcaption>Hora do soninho</figcaption></figure>
                  </div>
                </section>
              )}

              {activeTab === "contact" && (
                <section className="prelogin-view">
                  <div className="prelogin-welcome">
                    <h2>Contato</h2>
                    <p>Fale diretamente com nossa equipe ou venha nos visitar.</p>
                  </div>
                  <div className="prelogin-contact-list">
                    {contacts.map((contact) => (
                      <a href={contact.href} key={contact.name}>
                        <span><UserRound size={22} /></span>
                        <div><strong>{contact.name}</strong><small>{contact.phone}</small></div>
                        <Phone size={18} />
                      </a>
                    ))}
                    <a href="https://www.google.com/maps/search/?api=1&query=Rua%20Engenheiro%20Ernesto%20Markgraf%2C%20221%20Sao%20Paulo%20SP" target="_blank" rel="noopener noreferrer">
                      <span><Home size={22} /></span>
                      <div><strong>Scolt&Cia HQ</strong><small>Rua Engenheiro Ernesto Markgraf, 221</small></div>
                      <ChevronRight size={18} />
                    </a>
                  </div>
                </section>
              )}
            </div>

            {visitModalOpen ? (
              <div className="prelogin-visit-overlay" role="dialog" aria-modal="true" aria-labelledby="visit-modal-title">
                <div className="prelogin-visit-modal">
                  <button className="prelogin-visit-close" type="button" onClick={() => setVisitModalOpen(false)} aria-label="Fechar agendamento">
                    <X size={20} />
                  </button>
                  <h2 id="visit-modal-title">Agendar uma Visita</h2>
                  <p>Escolha o melhor dia e horario para vir conhecer a Scolt&Cia!</p>

                  <form className="prelogin-visit-form" onSubmit={submitVisit}>
                    <label>
                      <span>Nome do Pet</span>
                      <input name="petName" placeholder="Ex: Scolt, Pipoca, Amora" required />
                    </label>
                    <label>
                      <span>Seu Nome</span>
                      <input name="ownerName" placeholder="Ex: Lucas Pedroso" required />
                    </label>

                    <div className="prelogin-visit-row">
                      <label>
                        <span>Data</span>
                        <input name="visitDate" type="date" required />
                      </label>
                      <label>
                        <span>Horario</span>
                        <select name="visitTime" defaultValue="" required>
                          <option value="" disabled>Selecione...</option>
                          <option value="08:00">08:00</option>
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                        </select>
                      </label>
                    </div>

                    <fieldset>
                      <legend>Servico de maior interesse</legend>
                      <label>
                        <input type="radio" name="interest" value="Daycare" defaultChecked />
                        <span>Daycare</span>
                      </label>
                      <label>
                        <input type="radio" name="interest" value="Hospedagem" />
                        <span>Hospedagem</span>
                      </label>
                      <label>
                        <input type="radio" name="interest" value="Ambos" />
                        <span>Ambos</span>
                      </label>
                    </fieldset>

                    <button className="prelogin-visit-submit" type="submit">Solicitar Agendamento</button>
                  </form>
                </div>
              </div>
            ) : null}

            {reservationModalOpen ? (
              <div className="prelogin-visit-overlay" role="dialog" aria-modal="true" aria-labelledby="reservation-modal-title">
                <div className="prelogin-visit-modal prelogin-reservation-modal">
                  <button className="prelogin-visit-close" type="button" onClick={() => setReservationModalOpen(false)} aria-label="Fechar reserva">
                    <X size={20} />
                  </button>
                  <h2 id="reservation-modal-title">Fazer Reserva</h2>
                  <p>Preencha os dados principais para nossa equipe confirmar a disponibilidade.</p>
                  <p className="prelogin-reservation-hint">
                    Se voce ja possui cadastro, faca a reserva atraves da <Link href="/area-do-tutor/agenda">area do tutor</Link>.
                  </p>

                  <form className="prelogin-visit-form" onSubmit={submitReservation}>
                    <label>
                      <span>Nome do Pet</span>
                      <input name="petName" placeholder="Ex: Scolt, Pipoca, Amora" required />
                    </label>
                    <label>
                      <span>Seu Nome</span>
                      <input name="ownerName" placeholder="Ex: Lucas Pedroso" required />
                    </label>

                    <label>
                      <span>Servico</span>
                      <select name="service" defaultValue="Day Care" required>
                        <option value="Day Care">Day Care</option>
                        <option value="Hospedagem">Hospedagem</option>
                        <option value="Banho e Tosa">Banho e Tosa</option>
                      </select>
                    </label>

                    <div className="prelogin-visit-row">
                      <label>
                        <span>Entrada</span>
                        <input name="startDate" type="date" required />
                      </label>
                      <label>
                        <span>Horario</span>
                        <select name="startTime" defaultValue="" required>
                          <option value="" disabled>Selecione...</option>
                          <option value="08:00">08:00</option>
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                        </select>
                      </label>
                    </div>

                    <label>
                      <span>Saida</span>
                      <input name="endDate" type="date" />
                    </label>

                    <label>
                      <span>Observacoes</span>
                      <textarea name="notes" placeholder="Ex: alimentacao, comportamento, restricoes..." rows={3} />
                    </label>

                    <button className="prelogin-visit-submit" type="submit">Confirmar Reserva</button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
