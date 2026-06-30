"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, PawPrint } from "lucide-react";

export function TutorLogin({ onSuccess }: { onSuccess: (user: { name: string; email: string }) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/tutor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        onSuccess(data.user);
      } else {
        setError("E-mail ou senha incorretos.");
      }
    } catch {
      setError("Nao foi possivel entrar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tutor-login">
      <div className="tutor-login-card">
        <div className="tutor-login-brand">
          <img src="/img/logo-scolt-cia.png" alt="Scolt&Cia" />
          <span className="tutor-login-eyebrow"><PawPrint size={15} /> Area do Tutor</span>
          <h1>Bem-vindo de volta! 🐾</h1>
          <p>Acompanhe a rotina do seu pet em tempo real.</p>
        </div>

        <form onSubmit={submit} className="tutor-login-form">
          <label><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail" required /></label>
          <label><Lock size={17} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" required /></label>
          {error ? <p className="tutor-login-error" role="alert">{error}</p> : null}
          <button type="submit" className="tutor-login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link href="/" className="tutor-login-back"><ArrowLeft size={15} /> Voltar ao site</Link>
      </div>
    </div>
  );
}
