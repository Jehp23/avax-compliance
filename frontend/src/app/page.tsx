import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";

export default function HomePage() {
  return (
    <main id="main-content" className="landing screen">
      <div className="landing-hero">
        <p className="landing-kicker">AVALANCHE FUJI · eERC20 · COMPLIANCE CNBV</p>
        <h1 className="landing-title">
          Pagos institucionales
          <br />
          privados y auditables
        </h1>
        <p className="landing-sub">
          Veila es la capa de experiencia sobre{" "}
          <strong className="font-medium text-[var(--text2)]">EncryptedERC</strong>: montos
          cifrados on-chain, visibles solo para la contraparte y el regulador autorizado.
        </p>
        <div className="landing-cta">
          <Link href="/registro" className="primary-btn">
            Probar en Fuji
          </Link>
          <Link
            href="/auditoria"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-[13px] font-medium text-[var(--text2)] hover:border-[var(--border2)]"
          >
            Panel auditoría
          </Link>
        </div>
      </div>

      <div className="landing-grid">
        <article className="landing-card">
          <h3>Privacidad comercial</h3>
          <p>
            El público ve movimiento, no montos. BabyJubjub + ElGamal + pruebas ZK en cada
            operación.
          </p>
        </article>
        <article className="landing-card">
          <h3>Auditoría nativa</h3>
          <p>
            Cada transferencia incluye copia cifrada para el auditor del protocolo. Vista
            regulatoria en <code className="font-mono text-[11px]">/auditoria</code>.
          </p>
        </article>
        <article className="landing-card">
          <h3>Avalanche institucional</h3>
          <p>
            Testnet Fuji hoy; mismo stack eERC de Ava Labs listo para mainnet y KYC real
            post-hackathon.
          </p>
        </article>
      </div>

      <div className="landing-diagram" aria-label="Diagrama dual-lock">
        <div>
          [ Institución A ] ——ZK privado——▶ [ eERC20 Fuji ] ◀—— descifrado —— [ CNBV ]
        </div>
        <div className="mt-2 text-[var(--text4)]">
          candado destino · candado auditor · resto del mundo: opaco
        </div>
      </div>

      <nav className="landing-footer-links" aria-label="Documentación">
        <Link href="/registro">Registro</Link>
        <Link href="/transferencias">Transferencias</Link>
        <Link href="/recibir">Recibir</Link>
        <Link href="/auditoria">Auditoría</Link>
        <span>·</span>
        <a
          href="https://docs.avacloud.io/encrypted-erc/welcome"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs eERC
        </a>
      </nav>

      <p className="mt-8 text-center text-[10px] text-[var(--text4)]">
        <LogoMark /> Veila · Hackathon Avalanche LatAm
      </p>
    </main>
  );
}
