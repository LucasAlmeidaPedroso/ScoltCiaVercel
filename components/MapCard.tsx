export function MapCard() {
  const query = "Rua Engenheiro Ernesto Markgraf, 221";
  const encoded = encodeURIComponent(query);

  return (
    <div className="map-card">
      <iframe
        title="Mapa da Scolt&Cia"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${encoded}&output=embed`}
      />
      <a
        className="map-overlay"
        href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>Rua Engenheiro Ernesto Markgraf, 221</strong>
        <span>Abrir no Google Maps</span>
      </a>
    </div>
  );
}
