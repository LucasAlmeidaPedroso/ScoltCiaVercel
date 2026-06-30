import { Sparkles } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

export default async function TimelinePage() {
  const { pet, timeline } = await getTutorData();
  return (
    <div className="tutor-page">
      <section className="tutor-section">
        <div className="tutor-timeline-head">
          <div>
            <h3 className="tutor-section-title">📖 Diario do dia · {pet.name}</h3>
            <p className="tutor-section-sub">Cada momento do dia em ordem cronologica, como um diario em tempo real.</p>
          </div>
          <span className="tutor-ai-pill"><Sparkles size={15} /> Registrado por voz + IA</span>
        </div>

        <ol className="tutor-timeline">
          {timeline.map((event, i) => (
            <li key={i} className={`tutor-tl-item type-${event.type}`}>
              <div className="tutor-tl-time">{event.time}</div>
              <div className="tutor-tl-marker"><span>{event.icon}</span></div>
              <div className="tutor-tl-card">
                <strong>{event.title}</strong>
                {event.detail ? <p>{event.detail}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
