import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="landing screen">
      <div className="landing-inner">
        <div className="landing-hero">
          <p className="landing-kicker">Cello · Avalanche Fuji · eERC20 · CNBV</p>
          <h1 className="landing-title">
            Pagos institucionales
            <br />
            privados y auditables
          </h1>
          <p className="landing-sub">
            Montos cifrados on-chain con auditoría regulatoria nativa. Cello es la
            capa institucional sobre EncryptedERC.
          </p>
          <div className="landing-cta">
            <Link href="/registro" className="primary-btn landing-cta-primary">
              Probar en Fuji
            </Link>
            <Link href="/auditoria" className="secondary-btn">
              Panel auditoría
            </Link>
          </div>
        </div>

        <div className="landing-grid">
          <article className="panel">
            <h3 className="panel-title">Privacidad</h3>
            <p className="panel-text">
              El público ve movimiento, no montos. ZK + ElGamal en cada operación.
            </p>
          </article>
          <article className="panel">
            <h3 className="panel-title">Auditoría</h3>
            <p className="panel-text">
              Copia cifrada para el regulador en cada transferencia privada.
            </p>
          </article>
          <article className="panel">
            <h3 className="panel-title">Avalanche</h3>
            <p className="panel-text">
              Fuji hoy; mismo stack eERC de Ava Labs listo para producción.
            </p>
          </article>
        </div>

        <p className="landing-diagram" aria-label="Flujo dual-lock">
          Institución → ZK privado → eERC Fuji ← descifrado ← CNBV
        </p>
      </div>
    </main>
  );
}
