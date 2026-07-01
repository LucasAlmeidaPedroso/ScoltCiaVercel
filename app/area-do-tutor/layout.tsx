"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award, Bell, CalendarDays, FileText, Home, Image as ImageIcon, LayoutDashboard,
  LogOut, Menu, MessageCircle, PawPrint, Settings, Syringe, Wallet, X
} from "lucide-react";
import { notifications as emptyNotifications, pet as emptyPet, petStatus as emptyPetStatus, tutor as emptyTutor } from "@/lib/tutor-empty";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { TutorLogin } from "@/components/tutor/TutorLogin";

type TutorContext = {
  pet: { name: string; photo: string };
  petStatus: { present: boolean; location: string; activity: string; lastUpdate: string; lastVisit: string };
  notifications: { id: number; icon: string; text: string; time: string; read: boolean }[];
  avatar: string;
};

const defaultContext: TutorContext = {
  pet: { name: emptyPet.name, photo: emptyPet.photo },
  petStatus: emptyPetStatus,
  notifications: emptyNotifications,
  avatar: emptyTutor.avatar
};

const nav = [
  { href: "/area-do-tutor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/area-do-tutor/meu-pet", label: "Meu Pet", icon: PawPrint },
  { href: "/area-do-tutor/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/area-do-tutor/timeline", label: "Timeline", icon: Home },
  { href: "/area-do-tutor/fotos", label: "Fotos e Videos", icon: ImageIcon },
  { href: "/area-do-tutor/relatorios", label: "Relatorios", icon: FileText },
  { href: "/area-do-tutor/vacinas", label: "Vacinas", icon: Syringe },
  { href: "/area-do-tutor/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/area-do-tutor/mensagens", label: "Mensagens", icon: MessageCircle },
  { href: "/area-do-tutor/jornada", label: "Jornada", icon: Award },
  { href: "/area-do-tutor/configuracoes", label: "Configuracoes", icon: Settings }
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "in" | "out">("loading");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [ctx, setCtx] = useState<TutorContext>(defaultContext);
  const { notifications, pet, petStatus, avatar } = ctx;
  const unread = notifications.filter((n) => !n.read).length;
  const current = nav.find((item) => item.href === pathname);
  const firstName = user?.name?.split(" ")[0] || emptyTutor.firstName;

  function loadContext() {
    fetch("/api/tutor/context")
      .then((r) => r.json())
      .then((data) => setCtx({ ...defaultContext, ...data }))
      .catch(() => {});
  }

  useEffect(() => {
    let active = true;
    fetch("/api/tutor/session")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.user) {
          setUser(data.user ?? null);
          setAuthState("in");
          loadContext();
        } else {
          setAuthState("out");
        }
      })
      .catch(() => active && setAuthState("out"));
    return () => {
      active = false;
    };
  }, []);

  async function logout(event: React.MouseEvent) {
    event.preventDefault();
    await fetch("/api/tutor/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setAuthState("out");
    router.push("/");
  }

  if (authState === "loading") return <LoadingOverlay label="Abrindo a area do tutor..." />;
  if (authState === "out") return <TutorLogin onSuccess={(u) => { setUser(u); setAuthState("in"); loadContext(); }} />;

  return (
    <div className="tutor-shell">
      <aside className={`tutor-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="tutor-brand">
          <img src="/img/logo-scolt-cia.png" alt="Scolt&Cia" />
          <div>
            <strong>Scolt &amp; Cia</strong>
            <span>Area do Tutor</span>
          </div>
          <button className="tutor-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <div className="tutor-pet-chip">
          <img src={pet.photo} alt={pet.name} />
          <div>
            <strong>{pet.name}</strong>
            <span className={petStatus.present ? "online" : ""}>
              {petStatus.present ? `Na creche Â· ${petStatus.location}` : "Em casa"}
            </span>
          </div>
        </div>

        <nav className="tutor-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <a href="/" className="tutor-exit" onClick={logout}>
          <LogOut size={18} /> Sair da area
        </a>
      </aside>

      {sidebarOpen ? <div className="tutor-overlay" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="tutor-main">
        <header className="tutor-topbar">
          <button className="tutor-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>

          <div className="tutor-topbar-title">
            <span className="tutor-topbar-eyebrow"><PawPrint size={14} /> {current?.label || "Area do Tutor"}</span>
            <h1>Ola, {firstName}! ðŸ‘‹</h1>
          </div>

          <div className="tutor-topbar-actions">
            <div className="tutor-bell-wrap">
              <button className="tutor-bell" onClick={() => setBellOpen((v) => !v)} aria-label="Notificacoes">
                <Bell size={20} />
                {unread > 0 ? <span className="tutor-bell-badge">{unread}</span> : null}
              </button>
              {bellOpen ? (
                <div className="tutor-bell-popover">
                  <header><strong>Notificacoes</strong><span>{unread} novas</span></header>
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.id} className={n.read ? "" : "unread"}>
                        <span className="tutor-bell-icon">{n.icon}</span>
                        <div><p>{n.text}</p><small>{n.time}</small></div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <Link href="/area-do-tutor/configuracoes" className="tutor-avatar">
              <img src={avatar} alt={user?.name || "Tutor"} />
            </Link>
          </div>
        </header>

        <main className="tutor-content">{children}</main>
      </div>
    </div>
  );
}

