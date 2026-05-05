import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

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
    <html
      lang="fr"
      className={`${newsreader.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
