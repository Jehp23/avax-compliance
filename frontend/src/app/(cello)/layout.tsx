import { ConfigBanner } from "@/components/config-banner";
import { DemoStatusBar } from "@/components/demo-status-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicEnv } from "@/lib/env";

export default function CelloSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showDevStatusBar } = getPublicEnv();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Ir al contenido
      </a>
      <ConfigBanner />
      <SiteHeader />
      {showDevStatusBar ? <DemoStatusBar /> : null}
      {children}
      <SiteFooter />
    </>
  );
}
