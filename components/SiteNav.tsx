"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/sobre", label: "Sobre" },
  { href: "/servicos", label: "Servicos" },
  { href: "/galeria", label: "Galeria" },
  { href: "/contato", label: "Contato" },
  { href: "/area-do-tutor", label: "Area do tutor" }
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <div className="nav-links">
      {links.map((link) => (
        <Link className={pathname === link.href ? "nav-active" : ""} href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
      <Link href="/admin" className="login-button">Entrar</Link>
    </div>
  );
}
