import { AlertTriangle, Cake, Cat, Dog, HeartPulse, IdCard, Pill, Ruler, Scale, ShieldAlert, Stethoscope, Weight } from "lucide-react";
import { getTutorData } from "@/lib/tutor-data";

export default async function MeuPetPage() {
  const { health, personality, pet } = await getTutorData();

  const basics = [
  { icon: Dog, label: "Raca", value: pet.breed },
  { icon: Cake, label: "Idade", value: pet.age },
  { icon: Weight, label: "Peso", value: pet.weight },
  { icon: Cat, label: "Sexo", value: pet.sex },
  { icon: Ruler, label: "Porte", value: pet.size },
  { icon: IdCard, label: "Microchip", value: pet.microchip },
  { icon: Cake, label: "Nascimento", value: pet.birthDate },
  { icon: Scale, label: "Castrado", value: pet.neutered ? "Sim" : "Nao" }
];

  const healthBlocks = [
    { icon: ShieldAlert, label: "Alergias", items: health.allergies, tone: "pink" },
    { icon: AlertTriangle, label: "Restricoes", items: health.restrictions, tone: "yellow" },
    { icon: Pill, label: "Medicamentos", items: health.medications, tone: "purple" }
  ];

  return (
    <div className="tutor-page">
      <section className="tutor-pet-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(7,29,58,.08), rgba(7,29,58,.55)), url(${pet.cover})` }}>
        <img className="tutor-pet-avatar" src={pet.photo} alt={pet.name} />
        <div className="tutor-pet-hero-info">
          <h2>{pet.name}</h2>
          <p>{pet.breed} · {pet.age} · {pet.size}</p>
        </div>
      </section>

      <section className="tutor-section">
        <h3 className="tutor-section-title"><IdCard size={20} /> Informacoes basicas</h3>
        <div className="tutor-info-grid">
          {basics.map((b) => {
            const Icon = b.icon;
            return (
              <article key={b.label} className="tutor-info-cell">
                <Icon size={20} />
                <div><small>{b.label}</small><strong>{b.value}</strong></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="tutor-section">
        <h3 className="tutor-section-title"><HeartPulse size={20} /> Saude</h3>
        <div className="tutor-health-grid">
          {healthBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <article key={block.label} className={`tutor-health-card tone-${block.tone}`}>
                <header><Icon size={18} /> {block.label}</header>
                <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            );
          })}
          <article className="tutor-health-card tone-aqua wide">
            <header><Stethoscope size={18} /> Acompanhamento</header>
            <p><strong>Observacoes:</strong> {health.notes}</p>
            <p><strong>Veterinario:</strong> {health.vet}</p>
            <p><strong>Emergencia:</strong> {health.emergencyContact}</p>
          </article>
        </div>
      </section>

      <section className="tutor-section">
        <h3 className="tutor-section-title">😊 Personalidade</h3>
        <p className="tutor-section-sub">Essas informacoes ajudam nossos cuidadores a deixar o {pet.name} ainda mais confortavel.</p>
        <div className="tutor-personality-grid">
          {personality.map((trait) => (
            <article key={trait.text} className="tutor-trait">
              <span>{trait.emoji}</span>
              <p>{trait.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
