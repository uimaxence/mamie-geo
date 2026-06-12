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
    default: "Mamie GEO, mesure la visibilité de ta marque dans les IA",
    template: "%s, Mamie GEO",
  },
  description:
    "Sache si ChatGPT, Claude, Perplexity, Gemini et Le Chat citent ta marque, et comment progresser. Le premier outil GEO francophone, hébergé en Europe, RGPD natif.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr"),
  // Pas de title/description ici : Next les hérite du title/description
  // résolus de chaque page (template inclus), donc chaque partage de lien
  // affiche le titre de SA page — pas le H1 scrapé ni un titre global.
  openGraph: {
    type: "website",
    siteName: "Mamie GEO",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// JSON-LD entité organisation + site, injecté côté <head>. Signal majeur
// pour les LLMs (Claude, ChatGPT, Perplexity) afin de désambiguïser
// "Mamie GEO" comme entité éditrice indépendante. Ajouté 2026-06-08
// suite à l'audit AI readiness (rapport "brand entity signals: fail").
//
// L'URL du logo pointe sur `/logo.svg` (fichier statique servi depuis
// `/public/`), même asset que <Logo> mais accessible aux crawlers.
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mamie GEO",
  url: "https://mamie-geo.fr",
  logo: "https://mamie-geo.fr/logo.svg",
  description:
    "SaaS francophone de Generative Engine Optimization. Mesure quotidiennement la visibilité d'une marque dans ChatGPT, Claude, Perplexity, Gemini et Le Chat. Hébergement EU, RGPD natif.",
  foundingDate: "2026",
  knowsAbout: [
    "Generative Engine Optimization",
    "AI search visibility",
    "Brand tracking in LLMs",
    "SEO",
    "ChatGPT visibility",
    "Claude visibility",
    "Perplexity visibility",
    "Gemini visibility",
    "Le Chat Mistral",
  ],
  areaServed: { "@type": "Place", name: "France" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "contact@mamie-geo.fr",
    availableLanguage: ["French", "English"],
  },
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Mamie GEO",
  url: "https://mamie-geo.fr",
  inLanguage: "fr-FR",
  publisher: { "@type": "Organization", name: "Mamie GEO" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
      </head>
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
