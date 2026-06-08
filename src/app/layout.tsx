import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { CookieNotice } from "@/components/cookie-notice";
import "./globals.css";

// Une seule police chargée, Inter (Google Font classique SaaS, cf.
// doc 09 § 2026-05-11 update polices). Remplace Geist Sans (variable
// CSS `--font-geist-sans` qui ne matchait pas notre code).

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Weights chargés : 400 (body), 500 (médium / labels), 600 (titres),
  // 700 (display fort). Garder le sous-ensemble réduit pour limiter
  // le poids du bundle font.
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Mamie GEO, Mesurer la visibilité de ta marque dans les IA",
    template: "%s, Mamie GEO",
  },
  description:
    "Le premier outil francophone de tracking et d'optimisation GEO. ChatGPT, Claude, Perplexity, Gemini et Le Chat. Hébergement EU, RGPD natif.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        {children}
        <CookieNotice />
        <Analytics />
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_VTif6nvQ19KqspbPqX5W2"
          data-domain="mamie-geo.fr"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
