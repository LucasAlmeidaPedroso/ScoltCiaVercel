import { AdminPanel } from "@/components/AdminPanel";
import { getDaycareSettings, listPets, listReservations } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pets, reservations, settings] = await Promise.all([listPets(), listReservations(), getDaycareSettings()]);

  return (
    <main className="admin-app-route">
      <section className="admin-page">
        <AdminPanel pets={pets} reservations={reservations} settings={settings} />
      </section>
    </main>
  );
}
