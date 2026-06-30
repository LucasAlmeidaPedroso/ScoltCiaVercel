import Link from "next/link";
import { CalendarDays, CalendarPlus, Clock, RotateCcw, X } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

const statusCls: Record<string, string> = { Confirmada: "green", Aguardando: "yellow", Concluida: "muted" };

// Mini calendario estatico de Junho/2026 (demo) destacando os dias com reserva.
const reservedDays = [26, 27, 28];
const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const firstWeekday = 1; // 01/06/2026 cai numa segunda
const daysInMonth = 30;

export default async function AgendaPage() {
  const { agenda } = await getTutorData();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <div className="tutor-page">
      <section className="tutor-section">
        <div className="tutor-timeline-head">
          <div>
            <h3 className="tutor-section-title"><CalendarDays size={20} /> Agenda</h3>
            <p className="tutor-section-sub">Reservas futuras, servicos agendados e eventos.</p>
          </div>
          <Link href="/reserva" className="tutor-primary-btn"><CalendarPlus size={16} /> Nova reserva</Link>
        </div>

        <div className="tutor-agenda-grid">
          <div className="tutor-calendar">
            <header><strong>Junho 2026</strong></header>
            <div className="tutor-calendar-week">{weekDays.map((d, i) => <span key={i}>{d}</span>)}</div>
            <div className="tutor-calendar-days">
              {cells.map((day, i) => (
                <span key={i} className={day && reservedDays.includes(day) ? "reserved" : day ? "" : "empty"}>
                  {day || ""}
                </span>
              ))}
            </div>
            <footer><span className="tutor-dot aqua" /> Dias com reserva</footer>
          </div>

          <div className="tutor-agenda-list">
            {agenda.map((item) => (
              <article key={`${item.date}-${item.time}`} className="tutor-agenda-item">
                <div className="tutor-agenda-date">
                  <strong>{item.date}</strong><span>{item.weekday}</span>
                </div>
                <div className="tutor-agenda-info">
                  <strong>{item.service}</strong>
                  <small><Clock size={13} /> {item.time}</small>
                </div>
                <span className={`tutor-status-badge ${statusCls[item.status]}`}><span className="tutor-dot" /> {item.status}</span>
                <div className="tutor-agenda-actions">
                  <button className="tutor-ghost-btn"><RotateCcw size={14} /> Reagendar</button>
                  <button className="tutor-ghost-btn danger"><X size={14} /> Cancelar</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
