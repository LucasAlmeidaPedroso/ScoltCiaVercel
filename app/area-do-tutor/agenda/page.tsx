import Link from "next/link";
import { CalendarDays, CalendarPlus, Clock, RotateCcw, X } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

const statusCls: Record<string, string> = { Confirmada: "green", Aguardando: "yellow", Concluida: "muted" };

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

export default async function AgendaPage() {
  const { agenda } = await getTutorData();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const reservedDays = agenda
    .map((item) => Number(item.date.split("/")[0]))
    .filter((day) => Number.isFinite(day));
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
            <header><strong>{monthLabel}</strong></header>
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
                  <button className="tutor-ghost-btn" disabled><RotateCcw size={14} /> Reagendar</button>
                  <button className="tutor-ghost-btn danger" disabled><X size={14} /> Cancelar</button>
                </div>
              </article>
            ))}
            {agenda.length === 0 ? <p className="tutor-empty">Nenhuma reserva cadastrada ainda.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
