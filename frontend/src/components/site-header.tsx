"use client";

import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";
import { SiteHeaderNav } from "@/components/site-header-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-side site-header-side--start">
        <Link href="/" className="logo" aria-label="Cello — inicio">
          <LogoMark />
        </Link>
      </div>

      <SiteHeaderNav />

      <div className="site-header-side site-header-side--end nav-right">
        <ThemeToggle />
        <div className="net-pill" title="Red de prueba">
          <span className="net-dot" aria-hidden />
          Avalanche Fuji
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
