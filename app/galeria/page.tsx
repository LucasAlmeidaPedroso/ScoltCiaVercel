const photos = [
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80"
];

export default function GaleriaPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="inner">
          <span className="eyebrow">Galeria</span>
          <h1>Momentos felizes</h1>
        </div>
      </section>
      <section className="section">
        <div className="service-grid">
          {photos.map((photo) => <img key={photo} src={photo} alt="Rotina Scolt&Cia" style={{ width: "100%", borderRadius: 8 }} />)}
        </div>
      </section>
    </main>
  );
}
