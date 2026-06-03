import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Heart, Home, Moon, Scissors, ClipboardCheck, Sparkles } from "lucide-react";
import { MapCard } from "@/components/MapCard";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">Day Care, hospedagem e cuidado diario</span>
            <h1>Scolt&Cia</h1>
            <p>Um dia alegre, seguro e cheio de afeto para o seu cachorro gastar energia, socializar e voltar para casa feliz.</p>
            <div className="hero-actions">
              <Link className="primary-button" href="/contato"><CalendarDays size={18} /> Agendar visita</Link>
              <Link className="secondary-button" href="/reserva"><Sparkles size={18} /> Fazer reserva</Link>
              <a className="whatsapp-button" href="https://wa.me/5511984130296">Falar no WhatsApp</a>
            </div>
          </div>
          <div className="hero-photo">
            <span className="bubble-heart"><Heart /></span>
            <Image src="/img/hero-dachshund-akita.png" alt="Dachshund e Akita na Scolt&Cia" width={1536} height={1024} priority />
          </div>
        </div>
      </section>

      <section className="service-overlap">
        <div className="service-grid">
          <article className="service-tile tile-aqua"><span className="icon-bubble"><Home /></span><div><h3>Creche/daycare</h3><p>Socializacao assistida, recreacao e descanso com supervisao.</p></div></article>
          <article className="service-tile tile-purple"><span className="icon-bubble"><Moon /></span><div><h3>Hospedagem</h3><p>Pernoite com rotina, carinho e acompanhamento proximo.</p></div></article>
          <article className="service-tile tile-yellow"><span className="icon-bubble"><Scissors /></span><div><h3>Banho e tosa</h3><p>Cuidado de higiene integrado a rotina do dia.</p></div></article>
          <article className="service-tile tile-pink"><span className="icon-bubble"><ClipboardCheck /></span><div><h3>Relatorio diario</h3><p>Alimentacao, humor, atividades, medicacao e fotos.</p></div></article>
        </div>
      </section>

      <section className="section soft">
        <div className="split">
          <div>
            <span className="eyebrow">Diferenciais</span>
            <h2>Organizacao de operacao, jeitinho de casa</h2>
            <ul className="check-list">
              <li>Conferencia de vacinas antes da reserva.</li>
              <li>Separacao por porte, energia e comportamento.</li>
              <li>Equipe com rotina de alimentacao, descanso e recreacao.</li>
              <li>Comunicacao transparente pelo WhatsApp e relatorios.</li>
            </ul>
          </div>
          <div className="photo-grid">
            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80" alt="Cachorros correndo" />
            <img src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=80" alt="Cachorro feliz" />
            <img src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80" alt="Cachorro descansando" />
          </div>
        </div>
      </section>

      <section className="section" id="localizacao">
        <div className="split">
          <div>
            <span className="eyebrow">Localizacao</span>
            <h2>Venha conhecer a rotina da Scolt&Cia</h2>
            <p>Atendimento com horario agendado, avaliacao inicial e adaptacao cuidadosa para novos pets.</p>
          </div>
          <MapCard />
        </div>
      </section>
    </main>
  );
}
