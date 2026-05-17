"use client";

import { EercDepositPanel } from "@/components/cello/eerc-deposit-panel";
import { PageHeader } from "@/components/cello/page-header";
import { PageShell } from "@/components/cello/page-shell";
import { isAvaxPaymentMode } from "@/lib/payment-asset";
import { isEercConverterMode } from "@/lib/eerc-mode";

export default function CargarPage() {
  if (isAvaxPaymentMode()) {
    return (
      <PageShell width="narrow">
        <PageHeader
          kicker="Cargar"
          title="No disponible en modo AVAX"
          description="El depósito cifrado aplica solo con eERC en modo converter."
        />
      </PageShell>
    );
  }

  if (!isEercConverterMode()) {
    return (
      <PageShell width="narrow">
        <PageHeader
          kicker="Cargar"
          title="Modo standalone"
          description="En standalone el saldo inicial lo acredita el operador del contrato (privateMint). Para que cada usuario cargue su propio saldo, activá modo converter en el deploy."
        />
        <div className="panel mt-4">
          <p className="panel-text text-sm">
            Variables en Vercel:
          </p>
          <pre className="note mt-2 text-[11px] whitespace-pre-wrap">
{`NEXT_PUBLIC_EERC_MODE=converter
NEXT_PUBLIC_EERC_CONTRACT_ADDRESS=0x372dAB27c8d223Af11C858ea00037Dc03053B22E
NEXT_PUBLIC_CONVERTER_ERC20_ADDRESS=0xb0Fe621B4Bd7fe4975f7c58E3D6ADaEb2a2A35CD`}
          </pre>
          <p className="panel-text text-sm mt-3">
            Luego cada institución se registra de nuevo en ese contrato y usa esta
            pantalla.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="full">
      <EercDepositPanel />
    </PageShell>
  );
}
