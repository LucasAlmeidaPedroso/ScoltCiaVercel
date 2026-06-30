"use client";

import { useState } from "react";
import Image from "next/image";
import { Bus, Car, Clock, Heart, MapPin, MessageCircle, PawPrint, Send, ShieldCheck, UserRound } from "lucide-react";

const address = "Rua Engenheiro Ernesto Markgraf, 221";
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
const whatsappNumber = "5511984130296";

const contactCards = [
  { icon: MessageCircle, title: "WhatsApp", text: "(11) 98413-0296", href: "https://wa.me/5511984130296", className: "contact-aqua" },
  { icon: MessageCircle, title: "Telefone", text: "(11) 97755-2805", href: "https://wa.me/5511977552805", className: "contact-purple" },
  { icon: Clock, title: "Horario", text: "Seg a Sab: 7h as 19h", href: "#localizacao", className: "contact-yellow" }
];

const accessItems = [
  { icon: Car, title: "Facil acesso", text: "Proximo as principais vias da regiao" },
  { icon: Bus, title: "Transporte publico", text: "Diversas linhas nas proximidades" },
  { icon: ShieldCheck, title: "Regiao segura e tranquila", text: "Ideal para o conforto do seu pet" }
];

export default function ContatoPage() {
  const [form, setForm] = useState({ name: "", whatsapp: "", subject: "", message: "" });
  const [error, setError] = useState("");

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (error) setError("");
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      setError("Preencha pelo menos o nome e a mensagem.");
      return;
    }

    const lines = [
      `Ola! Sou ${form.name.trim()}.`,
      form.subject.trim() ? `Assunto: ${form.subject.trim()}` : "",
      "",
      form.message.trim(),
      form.whatsapp.trim() ? `\nMeu WhatsApp: ${form.whatsapp.trim()}` : ""
    ].filter(Boolean);

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <span className="contact-decor contact-paw-left"><PawPrint size={58} /></span>
        <span className="contact-decor contact-paw-right"><PawPrint size={58} /></span>
        <span className="contact-decor contact-heart-line" aria-hidden="true" />

        <div className="contact-hero-grid">
          <div className="contact-copy">
            <span className="contact-eyebrow"><PawPrint size={16} /> Fale conosco <Heart size={16} /></span>
            <h1>Estamos aqui para cuidar do que e <strong>mais importante!</strong> <Heart size={44} /></h1>
            <p>Tire duvidas, faca sua reserva ou venha nos conhecer. Sera um prazer receber voce e seu pet!</p>

            <div className="contact-quick-grid">
              {contactCards.map((card) => {
                const Icon = card.icon;
                return (
                  <a className={`contact-card ${card.className}`} href={card.href} key={card.title}>
                    <span><Icon size={31} /></span>
                    <strong>{card.title}</strong>
                    <small>{card.text}</small>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="contact-dogs">
            <Image src="/img/hero-dachshund-akita.png" alt="Cachorros da Scolt&Cia" width={1536} height={1024} priority />
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Envie sua mensagem</h2>
            <p>Preencha o formulario e a gente continua a conversa pelo WhatsApp.</p>
            <div className="contact-form-row">
              <label><UserRound size={18} /><input value={form.name} onChange={update("name")} placeholder="Seu nome" required /></label>
              <label><MessageCircle size={18} /><input value={form.whatsapp} onChange={update("whatsapp")} placeholder="WhatsApp" inputMode="tel" /></label>
            </div>
            <label><input value={form.subject} onChange={update("subject")} placeholder="Assunto" /></label>
            <label><textarea value={form.message} onChange={update("message")} placeholder="Sua mensagem" rows={5} required /></label>
            {error ? <p className="contact-form-error" role="alert">{error}</p> : null}
            <button type="submit" className="contact-submit"><Send size={18} /> Enviar mensagem</button>
          </form>
        </div>
      </section>

      <section className="contact-location" id="localizacao">
        <div className="contact-location-copy">
          <span className="contact-eyebrow"><MapPin size={16} /> Onde estamos</span>
          <h2>Venha nos fazer uma visita!</h2>
          <p>Ambiente seguro, confortavel e preparado para o bem-estar do seu pet.</p>
        </div>

        <div className="contact-map-card">
          <iframe
            title="Mapa da Scolt&Cia"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbed}
          />
          <a href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={22} /> Abrir no Google Maps</a>
        </div>

        <div className="contact-address-card">
          <span className="contact-eyebrow"><MapPin size={16} /> Nosso endereco</span>
          <h3>{address}</h3>
          <p>Sao Paulo - SP</p>
          <div className="contact-access-list">
            {accessItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <Icon size={26} />
                  <div><strong>{item.title}</strong><span>{item.text}</span></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
