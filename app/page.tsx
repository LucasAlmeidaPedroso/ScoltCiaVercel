import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarDays, CheckCircle2, ChevronRight, Heart, Home, Menu, MessageCircle, PawPrint, Scissors, Stethoscope, Moon } from "lucide-react";

const services = [
  {
    title: "Creche/daycare",
    text: "Socializacao assistida, recreacao e descanso com supervisao.",
    className: "home-card-aqua",
    icon: Home
  },
  {
    title: "Hospedagem",
    text: "Pernoite com rotina, carinho e acompanhamento proximo.",
    className: "home-card-purple",
    icon: Moon
  },
  {
    title: "Banho e tosa",
    text: "Cuidado de higiene integrado a rotina do dia.",
    className: "home-card-yellow",
    icon: Scissors
  },
  {
    title: "Relatorio diario",
    text: "Alimentacao, humor, atividades, medicacao e fotos.",
    className: "home-card-pink",
    icon: Stethoscope
  }
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <span className="decor decor-paw decor-paw-left"><PawPrint size={44} /></span>
        <span className="decor decor-paw decor-paw-mid"><PawPrint size={34} /></span>
        <span className="decor decor-paw decor-paw-right"><PawPrint size={44} /></span>
        <span className="decor decor-heart-line" aria-hidden="true" />

        <div className="home-hero-grid">
          <div className="home-mobile-appbar" aria-label="Topo do aplicativo">
            <button type="button" aria-label="Menu"><Menu size={24} /></button>
            <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={58} height={58} />
            <div>
              <strong>Scolt&Cia</strong>
              <span>Day Care e Hospedagem</span>
            </div>
            <button type="button" className="home-mobile-bell" aria-label="Notificacoes"><Bell size={22} /><i /></button>
          </div>

          <div className="home-hero-copy">
            <span className="home-eyebrow"><Heart size={15} /> Day Care, hospedagem e cuidado diario</span>
            <h1>
              <span className="home-title-desktop">Um dia alegre, seguro e cheio de afeto para o seu cachorro gastar energia, socializar e voltar para <strong>casa feliz.</strong></span>
              <span className="home-title-mobile">Um dia alegre, seguro e cheio de afeto para o seu <strong>cachorro!</strong></span>
            </h1>
            <div className="home-mobile-points" aria-label="Destaques">
              <span>Creche</span>
              <span>Hospedagem</span>
              <span>Banho e tosa</span>
            </div>
            <div className="home-underline" />
            <div className="home-actions">
              <Link className="home-button home-button-aqua" href="/contato"><CalendarDays size={18} /> Agendar visita</Link>
              <Link className="home-button home-button-yellow" href="/reserva"><PawPrint size={18} /> Fazer reserva</Link>
              <a className="home-button home-button-whatsapp" href="https://wa.me/5511984130296"><MessageCircle size={18} /> Falar no WhatsApp</a>
            </div>
          </div>

          <div className="home-hero-photo">
            <span className="hero-heart"><Heart size={54} /></span>
            <span className="hero-rays" aria-hidden="true" />
            <Image src="/img/hero-dachshund-akita.png" alt="Dachshund e Akita na Scolt&Cia" width={1536} height={1024} priority />
          </div>
        </div>
      </section>

      <section className="home-services">
        <div className="home-service-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className={`home-service-card ${service.className}`} key={service.title}>
                <span className="home-service-icon"><Icon size={40} /></span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
                <PawPrint className="card-paw" size={24} />
              </article>
            );
          })}
        </div>
        <Link className="home-app-cta" href="/reserva">
          <span><strong>Pronto para reservar?</strong><small>Agende agora e proporcione o melhor dia para seu pet!</small></span>
          <ChevronRight size={22} />
        </Link>
      </section>

      <section className="home-diffs">
        <span className="decor decor-paw decor-diff-left"><PawPrint size={52} /></span>
        <span className="decor decor-paw decor-diff-right"><PawPrint size={42} /></span>
        <span className="decor decor-heart-soft" aria-hidden="true" />

        <div className="home-diff-grid">
          <div className="home-diff-copy">
            <span className="home-eyebrow purple">Diferenciais</span>
            <h2>Organizacao de operacao, jeitinho de casa</h2>
            <ul className="home-check-list">
              <li><CheckCircle2 size={18} /> Conferencia de vacinas antes da reserva.</li>
              <li><CheckCircle2 size={18} /> Separacao por porte, energia e comportamento.</li>
              <li><CheckCircle2 size={18} /> Equipe com rotina de alimentacao, descanso e recreacao.</li>
              <li><CheckCircle2 size={18} /> Comunicacao transparente pelo WhatsApp e relatorios.</li>
            </ul>
          </div>

          <div className="home-photo-mosaic">
            <img className="mosaic-main" src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=85" alt="Cachorros correndo felizes" />
            <img src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=700&q=85" alt="Cachorro feliz ao ar livre" />
            <img src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=700&q=85" alt="Cachorro descansando" />
            <span className="mosaic-love"><Heart size={28} fill="currentColor" /></span>
            <span className="mosaic-rays" aria-hidden="true" />
          </div>
        </div>
      </section>
    </main>
  );
}
