"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getPublicEnv } from "@/lib/env";

const BASE_NAV = [
  { href: "/registro", label: "Registro" },
  { href: "/transferencias", label: "Transferencias" },
  { href: "/auditoria", label: "Auditoría" },
] as const;

export function SiteHeaderNav() {
  const pathname = usePathname();
  const env = getPublicEnv();
  const nav =
    env.paymentAsset === "eerc" && env.eercMode === "converter"
      ? [
          BASE_NAV[0],
          { href: "/cargar", label: "Cargar" },
          ...BASE_NAV.slice(1),
        ]
      : [...BASE_NAV];

  return (
    <nav className="site-header-nav nav-tabs" aria-label="Secciones de la aplicación">
      {nav.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="tab"
            aria-current={active ? "page" : undefined}
            data-active={active ? "true" : "false"}
            scroll={false}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
