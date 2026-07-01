import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nunito_Sans } from "next/font/google";
import { Camera, ChevronRight, ClipboardCheck, Heart, Home, Hotel, MapPin, MessageCircle, PawPrint, Scissors, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { RouteLoadingIndicator } from "@/components/RouteLoadingIndicator";
import { FontSizeControls } from "@/components/FontSizeControls";
import { MobileAppNav } from "@/components/MobileAppNav";
import "./globals.css";

const roundedFont = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-rounded"
});

export const metadata: Metadata = {
  title: "Scolt&Cia | Day Care e Hospedagem",
  description: "Day Care, hospedagem e cuidado diario para cachorros."
};

const mapUrl = "https://www.google.com/maps/search/?api=1&query=Rua%20Engenheiro%20Ernesto%20Markgraf%2C%20221%20Sao%20Paulo%20SP";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={roundedFont.variable}>
        <header className="site-header">
          <nav className="nav-shell">
            <Link href="/" className="brand">
              <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={72} height={72} />
              <span><strong>Scolt&Cia</strong><small>Day Care e Hospedagem</small></span>
            </Link>
            <SiteNav />
          </nav>
        </header>
        <RouteLoadingIndicator />
        <FontSizeControls />
        {children}
        <footer className="site-footer">
          <div className="footer-shell">
            <span className="footer-paw footer-paw-a"><PawPrint size={118} /></span>
            <span className="footer-paw footer-paw-b"><PawPrint size={92} /></span>
            <span className="footer-heart-line" aria-hidden="true" />

            <div className="footer-main">
              <section className="footer-brand-block">
                <div className="footer-logo-row">
                  <Image src="/img/logo-scolt-cia.png" alt="Scolt&Cia" width={92} height={92} />
                  <div><strong>Scolt & Cia</strong><span>Day Care e Hospedagem</span></div>
                </div>
                <p>Day Care, hospedagem e cuidado organizado para cachorros felizes. Aqui seu pet e tratado como familia!</p>
                <div className="footer-socials">
                  <a href="https://wa.me/5511984130296" aria-label="WhatsApp"><MessageCircle size={22} /></a>
                  <a href="https://www.instagram.com/explore/search/keyword/?q=scolt%26cia" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Camera size={22} /></a>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label="Mapa"><MapPin size={22} /></a>
                </div>
              </section>

              <section className="footer-column">
                <h2><PawPrint size={24} />Navegacao</h2>
                <Link href="/"><ChevronRight size={18} />Inicio</Link>
                <Link href="/sobre"><ChevronRight size={18} />Sobre nos</Link>
                <Link href="/servicos"><ChevronRight size={18} />Servicos</Link>
                <Link href="/galeria"><ChevronRight size={18} />Galeria</Link>
                <Link href="/contato"><ChevronRight size={18} />Contato</Link>
                <Link href="/area-do-tutor"><ChevronRight size={18} />Area do tutor</Link>
              </section>

              <section className="footer-column footer-services-list">
                <h2><PawPrint size={24} />Servicos</h2>
                <Link href="/servicos"><Home size={30} />Creche / Day Care</Link>
                <Link href="/servicos"><Hotel size={30} />Hospedagem</Link>
                <Link href="/servicos"><Scissors size={30} />Banho e Tosa</Link>
                <Link href="/servicos"><ClipboardCheck size={30} />Relatorio Diario</Link>
              </section>

              <section className="footer-column footer-contact">
                <h2><PawPrint size={24} />Contato</h2>
                <a href="https://wa.me/5511984130296"><MessageCircle size={28} /><span><strong>Sandra</strong>(11) 98413-0296</span></a>
                <a href="https://wa.me/5511977552805"><MessageCircle size={28} /><span><strong>Carina</strong>(11) 97755-2805</span></a>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin size={28} /><span>Rua Engenheiro Ernesto Markgraf, 221<br />Sao Paulo - SP</span></a>
              </section>
            </div>

            <div className="footer-benefits">
              <article><ShieldCheck size={34} /><div><strong>Ambiente seguro</strong><span>Monitoramento e equipe treinada.</span></div></article>
              <article><Heart size={34} /><div><strong>Muito carinho</strong><span>Atencao todos os dias.</span></div></article>
              <article><PawPrint size={34} /><div><strong>Diversao garantida</strong><span>Atividades para gastar energia.</span></div></article>
              <article><Camera size={34} /><div><strong>Relatorios diarios</strong><span>Acompanhe tudo com fotos.</span></div></article>
            </div>

            <div className="footer-bottom">
              <span><Heart size={22} />Feito com amor para quem voce ama.</span>
              <span>© 2025 Scolt & Cia Day Care e Hospedagem. Todos os direitos reservados.</span>
              <span>Desenvolvido com <Heart size={22} /> para pets e tutores</span>
            </div>
          </div>
        </footer>
        <MobileAppNav />
      </body>
    </html>
  );
}
