import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

// Une seule police chargée — Geist Sans (cf. doc 09 § 2026-05-07
// pivot UI). Newsreader et Geist Mono retirés.

export const metadata: Metadata = {
  title: {
    default: "Mamie GEO — Mesurer la visibilité de ta marque dans les IA",
    template: "%s — Mamie GEO",
  },
  description:
    "Le premier outil francophone de tracking et d'optimisation GEO. ChatGPT, Claude, Perplexity, Gemini et Le Chat. Hébergement EU, RGPD natif.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
