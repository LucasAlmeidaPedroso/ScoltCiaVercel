import { AdminPanel } from "@/components/AdminPanel";
import { listPets, listReservations } from "@/lib/data";

export default async function AdminPage() {
  const [pets, reservations] = await Promise.all([listPets(), listReservations()]);

  return (
    <main>
      <section className="page-hero">
        <div className="inner">
          <span className="eyebrow">Painel administrativo</span>
          <h1>Gestao de reservas</h1>
          <p>Aprove solicitacoes de clientes e cadastre reservas diretamente pela equipe.</p>
        </div>
      </section>
      <section className="section">
        <AdminPanel pets={pets} reservations={reservations} />
      </section>
    </main>
  );
}
