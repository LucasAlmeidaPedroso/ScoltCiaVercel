import { Sparkles, TrendingUp } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

export default async function JornadaPage() {
  const { achievements, aiInsights, indicators, lifeTimeline, pet, weightHistory } = await getTutorData();
  const earned = achievements.filter((a) => a.earned).length;
  const maxW = Math.max(...weightHistory.map((w) => w.value));
  const minW = Math.min(...weightHistory.map((w) => w.value));

  return (
    <div className="tutor-page">
      {/* Conquistas */}
      <section className="tutor-section">
        <div className="tutor-timeline-head">
          <div>
            <h3 className="tutor-section-title">🏅 Conquistas do {pet.name}</h3>
            <p className="tutor-section-sub">{earned} de {achievements.length} medalhas conquistadas.</p>
          </div>
        </div>
        <div className="tutor-medals">
          {achievements.map((a) => (
            <article key={a.title} className={`tutor-medal ${a.earned ? "earned" : "locked"}`}>
              <span className="tutor-medal-icon">{a.icon}</span>
              <strong>{a.title}</strong>
              <small>{a.desc}</small>
              {!a.earned ? <span className="tutor-medal-lock">Em progresso</span> : null}
            </article>
          ))}
        </div>
      </section>

      {/* Linha do tempo da vida */}
      <section className="tutor-section">
        <h3 className="tutor-section-title">💛 Linha do tempo da vida</h3>
        <p className="tutor-section-sub">Os momentos marcantes do {pet.name} na Scolt &amp; Cia.</p>
        <div className="tutor-life">
          {lifeTimeline.map((m, i) => (
            <article key={i} className="tutor-life-item">
              <div className="tutor-life-icon">{m.icon}</div>
              <div className="tutor-life-card">
                <span className="tutor-life-date">{m.date}</span>
                <strong>{m.title}</strong>
                <p>{m.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Indicadores */}
      <section className="tutor-section">
        <h3 className="tutor-section-title"><TrendingUp size={20} /> Indicadores do tutor</h3>
        <div className="tutor-indicators-grid">
          {indicators.map((ind) => (
            <article key={ind.label}>
              <span>{ind.icon}</span>
              <strong>{ind.value}</strong>
              <small>{ind.label}</small>
            </article>
          ))}
        </div>
      </section>

      {/* Peso + IA */}
      <section className="tutor-jornada-bottom">
        <div className="tutor-section tutor-weight">
          <h3 className="tutor-section-title">⚖️ Historico de peso</h3>
          <div className="tutor-chart">
            {weightHistory.map((w) => {
              const h = 30 + ((w.value - minW) / (maxW - minW || 1)) * 70;
              return (
                <div key={w.label} className="tutor-bar-col">
                  <span className="tutor-bar-val">{w.value}</span>
                  <div className="tutor-bar" style={{ height: `${h}%` }} />
                  <small>{w.label}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tutor-section tutor-ai-full">
          <h3 className="tutor-section-title"><Sparkles size={20} /> Resumos da IA</h3>
          <div className="tutor-ai-list">
            {aiInsights.map((insight, i) => (
              <article key={i}>
                <span className="tutor-ai-badge">{insight.period}</span>
                <p>{insight.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
