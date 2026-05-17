"use client";

import { useEffect, useRef, useState } from "react";

import {
  CIRCUIT_CONFIG,
  type CircuitUrlsConfig,
} from "@/lib/eerc-config";

const MIN_REGISTRATION_WASM_BYTES = 1_882_000;

async function fetchCircuitBlob(
  origin: string,
  path: string,
): Promise<{ url: string; bytes: number }> {
  const href = `${origin.replace(/\/$/, "")}${path}`;
  const res = await fetch(href, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${href} (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf], {
    type: path.endsWith(".wasm") ? "application/wasm" : "application/octet-stream",
  });
  return { url: URL.createObjectURL(blob), bytes: buf.byteLength };
}

/**
 * Carga WASM/ZKEY en memoria (blob:) para snarkjs.
 * Prioriza registro (~3 MB) y luego el resto en segundo plano.
 */
export function useCircuitBlobUrls(origin: string): {
  circuitUrls: CircuitUrlsConfig | null;
  registerCircuitsReady: boolean;
  loading: boolean;
  error: string | null;
} {
  const [circuitUrls, setCircuitUrls] = useState<CircuitUrlsConfig | null>(null);
  const [registerCircuitsReady, setRegisterCircuitsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setRegisterCircuitsReady(false);
      setError(null);
      setCircuitUrls(null);

      try {
        const regCfg = CIRCUIT_CONFIG.register;
        const regWasm = await fetchCircuitBlob(origin, regCfg.wasm);
        const regZkey = await fetchCircuitBlob(origin, regCfg.zkey);
        blobUrlsRef.current.push(regWasm.url, regZkey.url);

        if (regWasm.bytes < MIN_REGISTRATION_WASM_BYTES) {
          throw new Error(
            `Registration wasm=${regWasm.bytes} (se esperan ≥${MIN_REGISTRATION_WASM_BYTES}). ` +
              "Recargá con Cmd+Shift+R o probá ventana privada.",
          );
        }

        if (cancelled) return;

        const partial: CircuitUrlsConfig = {
          register: { wasm: regWasm.url, zkey: regZkey.url },
          mint: { wasm: "", zkey: "" },
          transfer: { wasm: "", zkey: "" },
          withdraw: { wasm: "", zkey: "" },
          burn: { wasm: "", zkey: "" },
        };
        setCircuitUrls(partial);
        setRegisterCircuitsReady(true);
        setLoading(false);

        const rest = Object.entries(CIRCUIT_CONFIG).filter(
          ([k]) => k !== "register",
        ) as [keyof CircuitUrlsConfig, { wasm: string; zkey: string }][];

        const full: CircuitUrlsConfig = { ...partial };
        for (const [key, cfg] of rest) {
          const wasm = await fetchCircuitBlob(origin, cfg.wasm);
          const zkey = await fetchCircuitBlob(origin, cfg.zkey);
          blobUrlsRef.current.push(wasm.url, zkey.url);
          full[key] = { wasm: wasm.url, zkey: zkey.url };
          if (cancelled) return;
          setCircuitUrls({ ...full });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar circuitos ZK");
          setCircuitUrls(null);
          setRegisterCircuitsReady(false);
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      for (const url of blobUrlsRef.current) URL.revokeObjectURL(url);
      blobUrlsRef.current = [];
    };
  }, [origin]);

  return { circuitUrls, registerCircuitsReady, loading, error };
}
