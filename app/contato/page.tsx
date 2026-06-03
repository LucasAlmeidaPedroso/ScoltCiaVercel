import { MapCard } from "@/components/MapCard";

export default function ContatoPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="inner">
          <span className="eyebrow">Contato</span>
          <h1>Fale com a Scolt&Cia</h1>
        </div>
      </section>
      <section className="section">
        <div className="split">
          <div>
            <h2>Agende uma visita</h2>
            <p>Sandra - 11984130296</p>
            <p>Carina - 11977552805</p>
            <p>Rua Engenheiro Ernesto Markgraf, 221</p>
          </div>
          <MapCard />
        </div>
      </section>
    </main>
  );
}
