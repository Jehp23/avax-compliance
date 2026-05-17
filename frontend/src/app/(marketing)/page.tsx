import Link from "next/link";

const FEATURES = [
  {
    title: "Privacidad",
    text: "Montos cifrados on-chain. El explorador no revela importes.",
  },
  {
    title: "Auditoría",
    text: "Código regulatorio en cada transferencia privada.",
  },
  {
    title: "Avalanche",
    text: "eERC en Fuji, listo para instituciones en producción.",
  },
] as const;

export default function HomePage() {
  return (
    <main id="main-content" className="landing screen">
      <div className="landing-inner">
        <div className="landing-hero">
          <p className="landing-kicker">Cello · Fuji · eERC20</p>
          <h1 className="landing-title">
            Pagos institucionales
            <br />
            privados y auditables
          </h1>
          <p className="landing-sub">
            Transferencias con montos privados y trazabilidad para el regulador,
            sobre EncryptedERC en Avalanche.
          </p>
          <div className="landing-cta">
            <Link href="/registro" className="primary-btn landing-cta-primary">
              Comenzar demo
            </Link>
            <Link href="/auditoria" className="secondary-btn">
              Ver auditoría
            </Link>
          </div>
        </div>

        <div className="landing-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="panel landing-feature">
              <h3 className="panel-title">{f.title}</h3>
              <p className="panel-text">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
