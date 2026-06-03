import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scolt&Cia | Day Care e Hospedagem",
  description: "Day Care, hospedagem e cuidado diario para cachorros."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <nav className="nav-shell">
            <Link href="/" className="brand">
              <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={72} height={72} />
              <strong>Scolt&Cia</strong>
            </Link>
            <div className="nav-links">
              <Link href="/">Inicio</Link>
              <Link href="/sobre">Sobre</Link>
              <Link href="/servicos">Servicos</Link>
              <Link href="/galeria">Galeria</Link>
              <Link href="/contato">Contato</Link>
              <Link href="/reserva">Area do tutor</Link>
              <Link href="/admin" className="login-button">Entrar</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="footer-grid">
            <div>
              <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={86} height={86} />
              <p>Day Care, hospedagem e cuidado organizado para cachorros felizes.</p>
            </div>
            <div>
              <strong>Contato</strong>
              <p>Sandra - 11984130296</p>
              <p>Carina - 11977552805</p>
            </div>
            <div>
              <strong>Endereco</strong>
              <p>Rua Engenheiro Ernesto Markgraf, 221</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
