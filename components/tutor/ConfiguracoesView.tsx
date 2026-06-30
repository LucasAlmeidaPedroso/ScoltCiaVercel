"use client";

import { useState } from "react";
import { Lock, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";

type TutorProfile = { name: string; email: string; phone: string; address: string; twoFactor: boolean };

const notifPrefs = [
  { key: "fotos", label: "Novas fotos e videos", on: true },
  { key: "entrada", label: "Entrada e saida da creche", on: true },
  { key: "refeicoes", label: "Refeicoes e petiscos", on: false },
  { key: "relatorio", label: "Relatorio diario pronto", on: true },
  { key: "financeiro", label: "Vencimentos e pagamentos", on: true }
];

export function ConfiguracoesView({ tutor }: { tutor: TutorProfile }) {
  const [twoFA, setTwoFA] = useState(tutor.twoFactor);
  const [prefs, setPrefs] = useState(() => Object.fromEntries(notifPrefs.map((p) => [p.key, p.on])));

  return (
    <div className="tutor-page">
      <section className="tutor-section">
        <h3 className="tutor-section-title"><UserRound size={20} /> Dados pessoais</h3>
        <div className="tutor-form-grid">
          <label><UserRound size={16} /><input defaultValue={tutor.name} placeholder="Nome completo" /></label>
          <label><Mail size={16} /><input defaultValue={tutor.email} placeholder="E-mail" /></label>
          <label><Phone size={16} /><input defaultValue={tutor.phone} placeholder="Telefone" /></label>
          <label className="wide"><MapPin size={16} /><input defaultValue={tutor.address} placeholder="Endereco" /></label>
        </div>
        <button className="tutor-primary-btn"><Save size={16} /> Salvar alteracoes</button>
      </section>

      <section className="tutor-section">
        <h3 className="tutor-section-title"><Lock size={20} /> Seguranca</h3>
        <div className="tutor-form-grid">
          <label><Lock size={16} /><input type="password" defaultValue="********" placeholder="Nova senha" /></label>
          <label><Lock size={16} /><input type="password" defaultValue="********" placeholder="Confirmar senha" /></label>
        </div>
        <div className="tutor-toggle-row">
          <div>
            <strong><ShieldCheck size={16} /> Autenticacao em duas etapas</strong>
            <small>Adicione uma camada extra de seguranca ao seu login.</small>
          </div>
          <button className={`tutor-switch ${twoFA ? "on" : ""}`} onClick={() => setTwoFA((v) => !v)} aria-pressed={twoFA}>
            <span />
          </button>
        </div>
      </section>

      <section className="tutor-section">
        <h3 className="tutor-section-title">🔔 Preferencias de notificacao</h3>
        <div className="tutor-prefs">
          {notifPrefs.map((p) => (
            <div key={p.key} className="tutor-toggle-row">
              <strong>{p.label}</strong>
              <button
                className={`tutor-switch ${prefs[p.key] ? "on" : ""}`}
                onClick={() => setPrefs((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                aria-pressed={prefs[p.key]}
              >
                <span />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
