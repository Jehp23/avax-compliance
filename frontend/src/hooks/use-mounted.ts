"use client";

import { useEffect, useState } from "react";

/** Evita mismatch de hidratación para estado que solo existe en el browser. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
