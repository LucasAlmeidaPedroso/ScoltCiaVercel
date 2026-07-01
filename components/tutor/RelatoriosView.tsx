"use client";

import { Activity, Download, Droplets, Moon, Smile, Users, Utensils } from "lucide-react";
import type { dailyReport as DailyReport } from "@/lib/tutor-empty";

type Report = typeof DailyReport;

export function RelatoriosView({ report, petName, petPhoto }: { report: Report; petName: string; petPhoto: string }) {
  const blocks = [
    { icon: Utensils, label: "Alimentacao", value: report.food, tone: "yellow" },
    { icon: Droplets, label: "Hidratacao", value: report.hydration, tone: "aqua" },
    { icon: Moon, label: "Descanso", value: report.rest, tone: "purple" },
    { icon: Users, label: "Socializacao", value: report.social, tone: "pink" },
    { icon: Smile, label: "Humor", value: report.mood, tone: "yellow" },
    { icon: Activity, label: "Ocorrencias", value: report.occurrences, tone: "aqua" }
  ];

  return (
    <div className="tutor-page">
      <section className="tutor-section">
        <div className="tutor-timeline-head">
          <div>
            <h3 className="tutor-section-title">ðŸ“‹ Relatorio diario</h3>
            <p className="tutor-section-sub">Gerado automaticamente ao final do dia Â· {report.date}</p>
          </div>
          <button className="tutor-primary-btn" onClick={() => window.print()}><Download size={16} /> Baixar PDF</button>
        </div>

        <article className="tutor-report" id="relatorio-print">
          <div className="tutor-report-summary">
            <img src={petPhoto} alt={petName} />
            <div>
              <span className="tutor-card-tag tag-aqua">Resumo do dia</span>
              <p>{report.summary}</p>
            </div>
          </div>

          <div className="tutor-report-grid">
            {blocks.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className={`tutor-report-cell tone-${b.tone}`}>
                  <header><Icon size={18} /> {b.label}</header>
                  <p>{b.value}</p>
                </div>
              );
            })}
          </div>

          <footer className="tutor-report-foot">
            <span>Responsavel: <strong>{report.responsible}</strong></span>
            <span>Scolt &amp; Cia Daycare ðŸ¾</span>
          </footer>
        </article>
      </section>
    </div>
  );
}

