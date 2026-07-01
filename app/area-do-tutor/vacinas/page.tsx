import { CheckCircle2, FileWarning, Paperclip, Syringe } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

const statusInfo: Record<string, { label: string; cls: string }> = {
  "em-dia": { label: "Em dia", cls: "green" },
  proxima: { label: "Proxima do vencimento", cls: "yellow" },
  vencida: { label: "Vencida", cls: "red" }
};

export default async function VacinasPage() {
  const { vaccines } = await getTutorData();
  const expired = vaccines.filter((v) => v.status === "vencida" && v.required);

  return (
    <div className="tutor-page">
      {expired.length > 0 ? (
        <div className="tutor-alert">
          <FileWarning size={22} />
          <div>
            <strong>Vacina obrigatoria vencida</strong>
            <p>A vacina <b>{expired[0].name}</b> esta vencida. Regularize para liberar novas reservas.</p>
          </div>
        </div>
      ) : null}

      <section className="tutor-section">
        <h3 className="tutor-section-title"><Syringe size={20} /> Carteira de vacinacao</h3>
        <p className="tutor-section-sub">Acompanhe o status de cada vacina e anexe a carteirinha.</p>

        <div className="tutor-vaccine-list">
          {vaccines.map((v) => {
            const info = statusInfo[v.status];
            return (
              <article key={v.name} className={`tutor-vaccine-card ${info.cls}`}>
                <div className="tutor-vaccine-icon"><Syringe size={22} /></div>
                <div className="tutor-vaccine-main">
                  <strong>{v.name} {v.required ? <span className="tutor-req">obrigatoria</span> : null}</strong>
                  <div className="tutor-vaccine-dates">
                    <span>Aplicada: <b>{v.applied}</b></span>
                    <span>Validade: <b>{v.valid}</b></span>
                  </div>
                </div>
                <div className="tutor-vaccine-side">
                  <span className={`tutor-status-badge ${info.cls}`}>
                    <span className="tutor-dot" /> {info.label}
                  </span>
                  <button className="tutor-ghost-btn" disabled><Paperclip size={15} /> Carteira</button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="tutor-vaccine-legend">
          <span><span className="tutor-dot green" /> Em dia</span>
          <span><span className="tutor-dot yellow" /> Proxima do vencimento</span>
          <span><span className="tutor-dot red" /> Vencida</span>
        </div>
      </section>
    </div>
  );
}
