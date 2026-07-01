import { Award, Heart, Scale, Sparkles, TrendingUp } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

export default async function JornadaPage() {
  const { achievements, aiInsights, indicators, lifeTimeline, pet, weightHistory } = await getTutorData();
  const earned = achievements.filter((a) => a.earned).length;
  const maxW = weightHistory.length ? Math.max(...weightHistory.map((w) => w.value)) : 0;
  const minW = weightHistory.length ? Math.min(...weightHistory.map((w) => w.value)) : 0;
  const petName = pet.name || "pet";

  return (
    <div className="tutor-page">
      <section className="tutor-section">
        <div className="tutor-timeline-head">
          <div>
            <h3 className="tutor-section-title"><Award size={20} /> Conquistas do {petName}</h3>
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
          {achievements.length === 0 ? <p className="tutor-empty">Nenhuma conquista cadastrada ainda.</p> : null}
        </div>
      </section>

      <section className="tutor-section">
        <h3 className="tutor-section-title"><Heart size={20} /> Linha do tempo da vida</h3>
        <p className="tutor-section-sub">Os momentos marcantes do {petName} na Scolt &amp; Cia.</p>
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
          {lifeTimeline.length === 0 ? <p className="tutor-empty">Nenhum momento cadastrado ainda.</p> : null}
        </div>
      </section>

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

      <section className="tutor-jornada-bottom">
        <div className="tutor-section tutor-weight">
          <h3 className="tutor-section-title"><Scale size={20} /> Historico de peso</h3>
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
            {weightHistory.length === 0 ? <p className="tutor-empty">Nenhum peso cadastrado ainda.</p> : null}
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
            {aiInsights.length === 0 ? <p className="tutor-empty">Nenhum resumo cadastrado ainda.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
