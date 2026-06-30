import { getTutorData } from "@/lib/tutor-data";
import { MensagensView } from "@/components/tutor/MensagensView";

export default async function MensagensPage() {
  const { messages, quickReplies } = await getTutorData();
  return <MensagensView messages={messages} quickReplies={quickReplies} />;
}
