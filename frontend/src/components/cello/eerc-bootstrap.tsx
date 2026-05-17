"use client";

import { useAutoDemoUnlock } from "@/hooks/use-auto-demo-unlock";

/** Intenta auto-unlock de claves demo al conectar wallet registrada. */
export function EercBootstrap() {
  useAutoDemoUnlock();
  return null;
}
