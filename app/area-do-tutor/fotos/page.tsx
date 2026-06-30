import { getTutorData } from "@/lib/tutor-data";
import { FotosView } from "@/components/tutor/FotosView";

export default async function FotosPage() {
  const { photos, videos } = await getTutorData();
  return <FotosView photos={photos} videos={videos} />;
}
