"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, MessageCircle, PawPrint, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/reserva", label: "Reservas", icon: CalendarDays },
  { href: "/area-do-tutor", label: "Meu pet", icon: PawPrint, main: true },
  { href: "https://wa.me/5511984130296", label: "Mensagens", icon: MessageCircle, external: true },
  { href: "/area-do-tutor", label: "Perfil", icon: UserRound }
];

export function MobileAppNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-app-nav" aria-label="Navegacao do aplicativo">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href !== "/" ? pathname.startsWith(item.href) : pathname === "/";
        const className = `${item.main ? "mobile-app-nav-main" : ""} ${active ? "active" : ""}`.trim();
        const content = <><Icon size={item.main ? 34 : 22} /><span>{item.label}</span></>;
        return item.external
          ? <a href={item.href} className={className} key={item.label}>{content}</a>
          : <Link href={item.href} className={className} key={item.label}>{content}</Link>;
      })}
    </nav>
  );
}
