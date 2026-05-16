import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { Providers } from "@/components/providers";
import { wagmiConfig } from "@/lib/wagmi-config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veila · Pagos eERC20 + auditoría CNBV",
  description:
    "Pagos institucionales privados en Avalanche Fuji con EncryptedERC (eERC20), ZK y panel regulatorio.",
  openGraph: {
    title: "Veila · eERC20 en Avalanche",
    description:
      "Privados para el sistema financiero · auditables para el regulador. Hackathon Avalanche LatAm.",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veila · eERC20 + compliance",
    description: "Pagos institucionales privados con auditoría nativa en Avalanche.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const initialState = cookieToInitialState(wagmiConfig, cookieHeader);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
