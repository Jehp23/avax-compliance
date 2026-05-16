"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/logo-mark";
import { WalletButton } from "@/components/wallet-button";

const NAV = [
  { href: "/registro", label: "Registro" },
  { href: "/transferencias", label: "Transferencias" },
  { href: "/recibir", label: "Recibir" },
  { href: "/auditoria", label: "Auditoría" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="logo" aria-label="Veila — inicio">
        <LogoMark />
        Veila
      </Link>

      <nav
        className="nav-tabs max-w-[min(100vw-120px,360px)] overflow-x-auto [-webkit-overflow-scrolling:touch]"
        aria-label="Secciones de la aplicación"
      >
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="tab shrink-0"
              aria-current={active ? "page" : undefined}
              data-active={active ? "true" : "false"}
              scroll={false}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="nav-right shrink-0">
        <div className="net-pill" title="Red de prueba">
          <span className="net-dot" aria-hidden />
          Avalanche Fuji
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
