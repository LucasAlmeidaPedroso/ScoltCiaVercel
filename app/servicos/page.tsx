import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Camera, CheckCircle2, ClipboardCheck, Heart, Home, Hotel, MessageCircle, PawPrint, Scissors, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Creche / Day Care",
    text: "Diversao e socializacao com supervisao profissional.",
    bullets: ["Socializacao supervisionada", "Atividades e brincadeiras", "Descanso monitorado", "Relatorio do dia"],
    action: "Agendar Day Care",
    className: "services-card-aqua"
  },
  {
    icon: Hotel,
    title: "Hospedagem",
    text: "Seu pet em um ambiente seguro, aconchegante e cheio de carinho.",
    bullets: ["Ambiente familiar", "Rotina personalizada", "Supervisao constante", "Atualizacoes para o tutor"],
    action: "Reservar hospedagem",
    className: "services-card-purple"
  },
  {
    icon: Scissors,
    title: "Banho e Tosa",
    text: "Higiene completa com produtos de qualidade e muito cuidado.",
    bullets: ["Banho completo", "Higiene das patas e ouvidos", "Corte de unhas", "Escovacao e hidratacao"],
    action: "Solicitar atendimento",
    className: "services-card-yellow"
  },
  {
    icon: ClipboardCheck,
    title: "Relatorio Diario",
    text: "Acompanhe cada momento do dia do seu pet.",
    bullets: ["Fotos e videos", "Alimentacao", "Atividades realizadas", "Comportamento e humor"],
    action: "Ver servico",
    className: "services-card-pink"
  }
];

const steps = [
  { icon: ClipboardCheck, title: "Cadastro", text: "Crie o perfil do seu pet e envie as informacoes necessarias." },
  { icon: ShieldCheck, title: "Avaliacao", text: "Analisamos vacinas, comportamento e necessidades do pet." },
  { icon: CalendarDays, title: "Reserva", text: "Escolha o servico e as datas que precisa." },
  { icon: CheckCircle2, title: "Aprovacao", text: "Nossa equipe analisa e confirma a melhor experiencia." },
  { icon: PawPrint, title: "Diversao", text: "Seu pet aproveita dias incriveis com muito amor." }
];

const included = [
  { icon: ShieldCheck, text: "Seguranca e supervisao 24h" },
  { icon: Camera, text: "Fotos e videos diarios para o tutor" },
  { icon: PawPrint, text: "Alimentacao balanceada e agua fresca" },
  { icon: Heart, text: "Descanso tranquilo em ambiente seguro" },
  { icon: Sparkles, text: "Atividades e brincadeiras supervisionadas" },
  { icon: UsersRound, text: "Equipe treinada e apaixonada por pets" }
];

export default function ServicosPage() {
  return (
    <main className="services-page">
      <section className="services-hero">
        <span className="services-decor services-paw-left"><PawPrint size={52} /></span>
        <span className="services-decor services-paw-right"><PawPrint size={56} /></span>
        <div className="services-hero-grid">
          <div className="services-hero-copy">
            <span className="services-eyebrow">Nossos servicos <Heart size={17} /></span>
            <h1>Servicos para o bem-estar do seu <strong>melhor amigo</strong></h1>
            <div className="services-underline" />
            <p>Cuidado, diversao e seguranca em cada momento da rotina do seu pet.</p>
            <div className="services-actions">
              <Link className="services-button services-button-aqua" href="/reserva"><CalendarDays size={18} /> Fazer reserva</Link>
              <a className="services-button services-button-light" href="https://wa.me/5511984130296"><MessageCircle size={18} /> Falar no WhatsApp</a>
            </div>
          </div>
          <div className="services-hero-photo">
            <span className="services-floating-heart"><Heart size={42} /></span>
            <Image src="/img/hero-dachshund-akita.png" alt="Cachorros felizes na Scolt&Cia" width={1536} height={1024} priority />
          </div>
        </div>
      </section>

      <section className="services-cards-section">
        <div className="services-card-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className={`services-card ${service.className}`} key={service.title}>
                <span className="services-card-icon"><Icon size={48} /></span>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
                <ul>
                  {service.bullets.map((bullet) => <li key={bullet}><PawPrint size={16} />{bullet}</li>)}
                </ul>
                <Link href="/reserva"><CalendarDays size={18} />{service.action}</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="services-process">
        <span className="services-section-title"><PawPrint size={20} />Como funciona</span>
        <div className="services-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title}>
                <span className="services-step-number">{index + 1}</span>
                <span className="services-step-icon"><Icon size={42} /></span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="services-included">
        <span className="services-section-title"><PawPrint size={20} />O que esta incluso</span>
        <div className="services-included-grid">
          {included.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.text}>
                <span><Icon size={40} /></span>
                <strong>{item.text}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="services-space">
        <span className="services-section-title"><PawPrint size={20} />Nosso espaco</span>
        <p>Ambientes planejados para oferecer conforto, diversao e bem-estar.</p>
        <div className="services-space-grid">
          <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85" alt="Cachorros brincando em area externa" />
          <img src="/img/hero-dachshund-akita.png" alt="Espaco interno da creche" />
          <img src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=85" alt="Cachorro em descanso" />
        </div>
      </section>

      <section className="services-cta">
        <div>
          <h2>Seu pet merece um lugar seguro e cheio de <strong>carinho.</strong></h2>
          <div className="services-cta-underline" />
        </div>
        <div>
          <p>Fale com a gente e proporcione o melhor para o seu melhor amigo.</p>
          <div className="services-actions">
            <a className="services-button services-button-aqua" href="https://wa.me/5511984130296"><MessageCircle size={18} /> Falar no WhatsApp</a>
            <Link className="services-button services-button-yellow" href="/reserva"><CalendarDays size={18} /> Fazer reserva</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
