import { EercBootstrap } from "@/components/cello/eerc-bootstrap";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function CelloSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Ir al contenido
      </a>
      <EercBootstrap />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
