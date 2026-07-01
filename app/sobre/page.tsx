import Image from "next/image";
import Link from "next/link";
import { Award, ClipboardCheck, Heart, Home, PawPrint, ShieldCheck, Sparkles, Syringe, UsersRound } from "lucide-react";

const careItems = [
  {
    icon: ClipboardCheck,
    title: "Avaliacao inicial e adaptacao",
    text: "Conhecemos seu pet para entender suas necessidades e personalidade."
  },
  {
    icon: Syringe,
    title: "Controle de vacinas e restricoes",
    text: "Documentacao sempre em dia para garantir a seguranca de todos."
  },
  {
    icon: Sparkles,
    title: "Momentos de recreacao, socializacao e descanso",
    text: "Atividades diarias equilibradas com muito carinho e atencao."
  },
  {
    icon: UsersRound,
    title: "Equipe responsavel e apaixonada",
    text: "Profissionais treinados e dedicados ao bem-estar de cada pet."
  },
  {
    icon: PawPrint,
    title: "Diversao garantida",
    text: "Atividades, recreacao e muito aprendizado todos os dias."
  }
];

const spaceItems = [
  { icon: PawPrint, text: "Espaco interno climatizado" },
  { icon: Home, text: "Higiene e limpeza reforcadas" },
  { icon: ShieldCheck, text: "Areas externas seguras" },
  { icon: Award, text: "Brinquedos e enriquecimento" }
];

export default function SobrePage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="about-decor about-paw-a"><PawPrint size={46} /></span>
        <span className="about-decor about-paw-b"><PawPrint size={54} /></span>
        <span className="about-decor about-heart-line" aria-hidden="true" />

        <div className="about-hero-grid">
          <div className="about-hero-copy">
            <span className="about-eyebrow">Sobre nos <Heart size={16} /></span>
            <h1>Sobre a Scolt&Cia</h1>
            <p>Cuidado profissional com rotina leve, segura e afetiva para cachorros.</p>
            <div className="about-trust-row">
              <article><ShieldCheck size={24} /><span>Ambiente seguro e monitorado 24h</span></article>
              <article><Heart size={24} /><span>Amor, respeito e atencao todos os dias</span></article>
            </div>
          </div>

          <div className="about-hero-photo">
            <span className="about-floating-heart"><Heart size={32} /></span>
            <Image src="/img/hero-dachshund-akita.png" alt="Cachorros na Scolt&Cia" width={1536} height={1024} priority />
          </div>
        </div>
      </section>

      <section className="about-wellbeing">
        <div className="about-section-grid">
          <div>
            <span className="about-eyebrow">Nossos diferenciais</span>
            <h2>Por que escolher a Scolt&Cia?</h2>
            <p>A Scolt&Cia acolhe cachorros com supervisao, integracao gradual e atividades adequadas ao porte, energia e comportamento de cada pet.</p>
          </div>

          <div className="about-care-list">
            {careItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <span><Icon size={25} /></span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <ShieldCheck className="about-check" size={18} />
                </article>
              );
            })}
          </div>
        </div>
        <div className="about-mobile-dog" aria-hidden="true">
          <Image src="/img/hero-dachshund-akita.png" alt="" width={620} height={520} />
        </div>
        <Link className="about-mobile-start" href="/area-do-tutor"><PawPrint size={16} /> Vamos comecar!</Link>
      </section>

      <section className="about-space">
        <div className="about-section-grid">
          <div>
            <span className="about-eyebrow">Nosso espaco</span>
            <h2>Um lugar feito para eles</h2>
            <p>Ambientes amplos, limpos e seguros, pensados para o conforto, diversao e tranquilidade do seu melhor amigo.</p>
            <div className="about-space-tags">
              {spaceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.text}><Icon size={18} />{item.text}</span>
                );
              })}
            </div>
          </div>

          <div className="about-space-mosaic">
            <img className="about-space-main" src="/img/hero-dachshund-akita.png" alt="Espaco interno da Scolt&Cia" />
            <img src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=700&q=85" alt="Cachorro correndo feliz" />
            <img src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=700&q=85" alt="Cachorro ao ar livre" />
          </div>
        </div>
      </section>
    </main>
  );
}
