import { getTutorData } from "@/lib/tutor-data";
import { RelatoriosView } from "@/components/tutor/RelatoriosView";

export default async function RelatoriosPage() {
  const { dailyReport, pet } = await getTutorData();
  return <RelatoriosView report={dailyReport} petName={pet.name} petPhoto={pet.photo} />;
}
