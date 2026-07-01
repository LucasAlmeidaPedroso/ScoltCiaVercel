import Link from "next/link";
import {
  ArrowRight, CalendarDays, Camera, Clock, Heart, PawPrint, Sparkles, Syringe, Wallet
} from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

const vaccineDot: Record<string, string> = { "em-dia": "green", proxima: "yellow", vencida: "red" };

export default async function TutorDashboard() {
  const { aiInsights, dashboardAvisos, financial, indicators, nextReservation, petStatus, pet, photos, vaccines } = await getTutorData();
  const lastPhoto = photos[0];
  const upcomingVaccines = vaccines.filter((v) => v.status !== "em-dia").slice(0, 3);
  const petName = pet.name || "Pet nao cadastrado";

  return (
    <div className="tutor-page">
      <section className="tutor-dash-grid">
        {/* Card 1 - Status Atual */}
        <article className="tutor-card tutor-card-status">
          <header><span className="tutor-card-tag"><PawPrint size={15} /> Status agora</span></header>
          <div className="tutor-status-body">
            <img src={pet.photo} alt={petName} />
            <div>
              <strong>{petName}</strong>
              {petStatus.present ? (
                <>
                  <p className="tutor-status-line"><span className="dot-pulse" /> Na creche · {petStatus.location}</p>
                  <p className="tutor-status-activity">🟢 {petStatus.activity}</p>
                  <small><Clock size={13} /> Atualizado as {petStatus.lastUpdate}</small>
                </>
              ) : (
                <>
                  <p className="tutor-status-line">🏠 Em casa</p>
                  <small><Clock size={13} /> {petStatus.lastVisit ? `Ultima visita: ${petStatus.lastVisit}` : "Sem presenca registrada"}</small>
                </>
              )}
            </div>
          </div>
        </article>

        {/* Card 2 - Proxima Reserva */}
        <article className="tutor-card">
          <header><span className="tutor-card-tag tag-aqua"><CalendarDays size={15} /> Proxima reserva</span></header>
          <div className="tutor-next-res">
            <div className="tutor-next-date">
              <strong>{nextReservation.date}</strong>
              <span>{nextReservation.weekday}</span>
            </div>
            <div>
              <p>{nextReservation.service}</p>
              <small><Clock size={13} /> {nextReservation.time} · {nextReservation.status}</small>
            </div>
          </div>
          <Link href="/area-do-tutor/agenda" className="tutor-card-link">Alterar reserva <ArrowRight size={15} /></Link>
        </article>

        {/* Card 3 - Ultima Foto */}
        <article className="tutor-card tutor-card-photo">
          <header><span className="tutor-card-tag tag-pink"><Camera size={15} /> Ultima foto</span></header>
          {lastPhoto ? (
            <div className="tutor-last-photo" style={{ backgroundImage: `url(${lastPhoto.src})` }}>
              <span>{lastPhoto.caption}</span>
            </div>
          ) : <p className="tutor-empty">Nenhuma foto cadastrada ainda.</p>}
          <Link href="/area-do-tutor/fotos" className="tutor-card-link">Ver galeria <ArrowRight size={15} /></Link>
        </article>

        {/* Card 4 - Proximas Vacinas */}
        <article className="tutor-card">
          <header><span className="tutor-card-tag tag-purple"><Syringe size={15} /> Vacinas</span></header>
          <ul className="tutor-vaccine-mini">
            {upcomingVaccines.length > 0 ? upcomingVaccines.map((v) => (
              <li key={v.name}>
                <span className={`tutor-dot ${vaccineDot[v.status]}`} />
                <span>{v.name}</span>
                <small>{v.valid}</small>
              </li>
            )) : <li className="ok"><span className="tutor-dot green" /> Nenhuma vacina cadastrada.</li>}
          </ul>
          <Link href="/area-do-tutor/vacinas" className="tutor-card-link">Ver vacinas <ArrowRight size={15} /></Link>
        </article>

        {/* Card 5 - Financeiro */}
        <article className="tutor-card">
          <header><span className="tutor-card-tag tag-yellow"><Wallet size={15} /> Financeiro</span></header>
          <div className="tutor-fin-mini">
            <div><small>Mensalidade</small><strong>R$ {financial.monthlyValue}</strong></div>
            <div><small>Pacotes restantes</small><strong>{financial.packagesLeft}/{financial.packageTotal}</strong></div>
            <div><small>Proximo vencimento</small><strong>{financial.nextDue || "Nao informado"}</strong></div>
          </div>
          <Link href="/area-do-tutor/financeiro" className="tutor-card-link">Ver financeiro <ArrowRight size={15} /></Link>
        </article>

        {/* Card 6 - Avisos */}
        <article className="tutor-card tutor-card-avisos">
          <header><span className="tutor-card-tag tag-aqua"><Heart size={15} /> Avisos da creche</span></header>
          <ul className="tutor-avisos">
            {dashboardAvisos.map((a) => (
              <li key={a.title}>
                <span>{a.icon}</span>
                <div><strong>{a.title}</strong><p>{a.text}</p><small>{a.date}</small></div>
              </li>
            ))}
            {dashboardAvisos.length === 0 ? <li><div><strong>Nenhum aviso cadastrado.</strong><p>Os comunicados reais aparecerao aqui.</p></div></li> : null}
          </ul>
        </article>
      </section>

      {/* Faixa de insights da IA */}
      <section className="tutor-ai-strip">
        <div className="tutor-ai-head">
          <Sparkles size={20} />
          <div><strong>Insights da IA</strong><span>{pet.name ? `Gerados a partir da rotina do ${pet.name}` : "Sem dados suficientes para gerar insights"}</span></div>
        </div>
        <div className="tutor-ai-cards">
          {aiInsights.slice(0, 3).map((insight, i) => (
            <article key={i}>
              <span className="tutor-ai-badge">{insight.period}</span>
              <p>{insight.text}</p>
            </article>
          ))}
          {aiInsights.length === 0 ? <article><p>Nenhum insight cadastrado ainda.</p></article> : null}
        </div>
      </section>

      {/* Indicadores rapidos */}
      <section className="tutor-quick-indicators">
        {indicators.slice(0, 4).map((ind) => (
          <article key={ind.label}>
            <span>{ind.icon}</span>
            <div><strong>{ind.value}</strong><small>{ind.label}</small></div>
          </article>
        ))}
      </section>
    </div>
  );
}
