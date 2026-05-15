export type DemoHistoryTx = {
  direction: "out" | "in";
  counterparty: string;
  hashShort: string;
  amountLabel: string;
  timeLabel: string;
};

export const demoHistory: DemoHistoryTx[] = [
  {
    direction: "out",
    counterparty: "Bankaool · CDMX",
    hashShort: "0x3fa2…7d4e",
    amountLabel: "−$250,000",
    timeLabel: "Hace 2h",
  },
  {
    direction: "in",
    counterparty: "FinNova MX",
    hashShort: "0x9d44…1a3b",
    amountLabel: "+$89,500",
    timeLabel: "Hace 5h",
  },
  {
    direction: "out",
    counterparty: "EduPath CO",
    hashShort: "0xc831…2ef7",
    amountLabel: "−$42,000",
    timeLabel: "Ayer 14:32",
  },
];

export type VerifiedCounterparty = {
  initials: string;
  name: string;
  addrShort: string;
};

export const verifiedCounterparties: VerifiedCounterparty[] = [
  { initials: "BK", name: "Bankaool", addrShort: "0xBK…4F2c" },
  { initials: "FN", name: "FinNova MX", addrShort: "0xFN…8a1d" },
  { initials: "RL", name: "RutaLog AR", addrShort: "0xRL…3c9f" },
];

export type AuditorRow = {
  fromAddr: string;
  fromName: string;
  toAddr: string;
  toName: string;
  amount: string;
  txStatus: "ok" | "pending";
  decryptStatus: "ok" | "pending";
  hashShort: string;
};

export const auditorRows: AuditorRow[] = [
  {
    fromAddr: "0x3F4a…8Bc2",
    fromName: "FinNova MX",
    toAddr: "0xBK…4F2c",
    toName: "Bankaool",
    amount: "$250,000 MXN",
    txStatus: "ok",
    decryptStatus: "ok",
    hashShort: "0x3fa2…7d4e ↗",
  },
  {
    fromAddr: "0xFN…8a1d",
    fromName: "FinNova MX",
    toAddr: "0xEP…c21a",
    toName: "EduPath CO",
    amount: "$89,500 MXN",
    txStatus: "ok",
    decryptStatus: "ok",
    hashShort: "0x9d44…1a3b ↗",
  },
  {
    fromAddr: "0x3F4a…8Bc2",
    fromName: "EduPath CO",
    toAddr: "0xRL…3c9f",
    toName: "RutaLog AR",
    amount: "$42,000 MXN",
    txStatus: "ok",
    decryptStatus: "ok",
    hashShort: "0xc831…2ef7 ↗",
  },
  {
    fromAddr: "0xBK…4F2c",
    fromName: "Bankaool",
    toAddr: "0xFN…8a1d",
    toName: "FinNova MX",
    amount: "$1,200,000 MXN",
    txStatus: "pending",
    decryptStatus: "pending",
    hashShort: "0xa91f…8b3c ↗",
  },
  {
    fromAddr: "0xRL…3c9f",
    fromName: "RutaLog AR",
    toAddr: "0xBK…4F2c",
    toName: "Bankaool",
    amount: "$380,000 MXN",
    txStatus: "ok",
    decryptStatus: "ok",
    hashShort: "0xd72a…4c1e ↗",
  },
];
