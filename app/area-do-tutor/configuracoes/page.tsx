import { getTutorData } from "@/lib/tutor-data";
import { ConfiguracoesView } from "@/components/tutor/ConfiguracoesView";

export default async function ConfiguracoesPage() {
  const { tutor } = await getTutorData();
  return <ConfiguracoesView tutor={{ name: tutor.name, email: tutor.email, phone: tutor.phone, address: tutor.address, twoFactor: tutor.twoFactor }} />;
}
