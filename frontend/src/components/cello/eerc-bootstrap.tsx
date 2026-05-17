"use client";

import { useEffect } from "react";

import { useAutoDemoUnlock } from "@/hooks/use-auto-demo-unlock";
import { applyCelloSessionFromConsole } from "@/lib/cello-session";

declare global {
  interface Window {
    celloApplySession?: typeof applyCelloSessionFromConsole;
  }
}

/** Intenta auto-unlock de claves demo al conectar wallet registrada. */
export function EercBootstrap() {
  useAutoDemoUnlock();

  useEffect(() => {
    window.celloApplySession = applyCelloSessionFromConsole;
    return () => {
      delete window.celloApplySession;
    };
  }, []);

  return null;
}
