import Link from "next/link";
import { Bed, CalendarDays, Camera, Heart, Home, MessageCircle, PawPrint, Scissors, Sparkles, Utensils } from "lucide-react";

const filters = [
  { label: "Todos", icon: PawPrint, active: true },
  { label: "Day Care", icon: Home },
  { label: "Hospedagem", icon: Bed },
  { label: "Atividades", icon: Sparkles },
  { label: "Descanso", icon: Bed },
  { label: "Banho e Tosa", icon: Scissors },
  { label: "Alimentacao", icon: Utensils }
];

const photos = [
  { src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=85", alt: "Cachorros correndo na area externa", wide: true },
  { src: "/img/hero-dachshund-akita.png", alt: "Espaco interno com piscina de bolinhas" },
  { src: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85", alt: "Cachorros brincando no jardim", wide: true },
  { src: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=85", alt: "Cachorro feliz na creche" },
  { src: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=85", alt: "Cachorro descansando com brinquedo" },
  { src: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=85", alt: "Cachorros brincando com bola" },
  { src: "https://images.unsplash.com/photo-1597633611385-17238892d086?auto=format&fit=crop&w=900&q=85", alt: "Cachorro no parque com brinquedo" },
  { src: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=900&q=85", alt: "Cachorro no banho" }
];

export default function GaleriaPage() {
  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <span className="gallery-decor gallery-paw-a"><PawPrint size={58} /></span>
        <span className="gallery-decor gallery-paw-b"><PawPrint size={52} /></span>
        <span className="gallery-decor gallery-heart-line" aria-hidden="true" />

        <div className="gallery-hero-grid">
          <div>
            <span className="gallery-eyebrow"><PawPrint size={18} /> Galeria Scolt&Cia</span>
            <h1>Momentos que viram lembrancas <Heart size={42} /></h1>
            <p>Cada sorriso, cada brincadeira e cada descanso aqui vira parte da historia do seu pet.</p>
          </div>

          <div className="gallery-benefits">
            <article><Camera size={34} /><strong>Fotos e videos todos os dias</strong></article>
            <article><Heart size={34} /><strong>Acompanhamento em tempo real</strong></article>
            <article><PawPrint size={34} /><strong>Muito amor e diversao</strong></article>
          </div>
        </div>
      </section>

      <section className="gallery-content">
        <div className="gallery-filters" aria-label="Categorias da galeria">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button className={filter.active ? "active" : ""} key={filter.label} type="button">
                <Icon size={22} />{filter.label}
              </button>
            );
          })}
        </div>

        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <figure className={photo.wide ? "wide" : ""} key={`${photo.src}-${index}`}>
              <img src={photo.src} alt={photo.alt} />
            </figure>
          ))}
        </div>
      </section>

      <section className="gallery-cta">
        <PawPrint className="gallery-cta-paw" size={58} />
        <div>
          <h2>Quer ver mais momentos do seu pet?</h2>
          <p>Acompanhe tudo em tempo real na Area do Tutor!</p>
        </div>
        <div className="gallery-actions">
          <a className="gallery-button gallery-button-aqua" href="https://wa.me/5511984130296"><MessageCircle size={20} /> Falar no WhatsApp</a>
          <Link className="gallery-button gallery-button-yellow" href="/reserva"><CalendarDays size={20} /> Area do tutor</Link>
        </div>
      </section>
    </main>
  );
}
