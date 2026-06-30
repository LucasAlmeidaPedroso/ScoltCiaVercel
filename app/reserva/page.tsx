import { ReservationForm } from "@/components/ReservationForm";
import { getDaycareSettings, listPets, listReservations } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReservaPage() {
  const [pets, reservations, settings] = await Promise.all([listPets(), listReservations(), getDaycareSettings()]);

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
          <ReservationForm pets={pets} reservations={reservations} settings={settings} />
        </div>
      </section>
    </main>
  );
}
