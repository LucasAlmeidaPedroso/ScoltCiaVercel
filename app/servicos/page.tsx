const services = ["Day Care", "Hospedagem", "Banho e tosa", "Socializacao", "Recreacao", "Cuidados especiais", "Relatorio diario"];

export default function ServicosPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="inner">
          <span className="eyebrow">Servicos</span>
          <h1>Rotina completa para cada pet</h1>
        </div>
      </section>
      <section className="section">
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-tile tile-aqua" key={service}>
              <span className="icon-bubble">🐶</span>
              <div>
                <h3>{service}</h3>
                <p>Cuidado organizado, carinhoso e acompanhado pela equipe.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
