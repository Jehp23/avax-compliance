import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  /** narrow = onboarding · wide = auditoría · full = transferencias */
  width?: "narrow" | "wide" | "full";
};

export function PageShell({ children, width = "narrow" }: PageShellProps) {
  return (
    <main
      id="main-content"
      className={`veila-page veila-page--${width} screen`}
    >
      {children}
    </main>
  );
}
