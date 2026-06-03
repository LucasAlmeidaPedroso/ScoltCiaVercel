import { ReservationForm } from "@/components/ReservationForm";
import { listPets } from "@/lib/data";

export default async function ReservaPage() {
  const pets = await listPets();

  return (
    <main>
      <section className="page-hero">
        <div className="inner">
          <span className="eyebrow">Reserva online</span>
          <h1>Enviar reserva</h1>
          <p>A equipe recebe sua solicitacao, analisa a disponibilidade e confirma pelo WhatsApp.</p>
        </div>
      </section>
      <section className="section">
        <div className="form-shell">
          <ReservationForm pets={pets} />
        </div>
      </section>
    </main>
  );
}
