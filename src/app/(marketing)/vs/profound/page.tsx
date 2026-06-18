import type { Metadata } from "next";
import { type VsConfig, VsPage } from "../_vs-page";

// Landing comparative SEO-focus : capter le mot-clé "alternative
// Profound" en français. Recycle l'article blog en format conversion.
// Pricing Mamie GEO : CLAUDE.md § 1.

export const metadata: Metadata = {
  title: "Mamie GEO vs Profound : l'alternative francophone à 1/10ᵉ du prix",
  description:
    "Profound vise les grandes entreprises US à 500 $/mois. Mamie GEO vise les freelances et PME francophones dès 9,99 €/mois, avec Le Chat de Mistral, hébergement EU et support FR. Comparaison honnête.",
  alternates: { canonical: "https://mamie-geo.fr/vs/profound" },
  openGraph: {
    title: "Mamie GEO vs Profound : l'alternative francophone à 1/10ᵉ du prix",
    description:
      "Comparatif feature par feature : pricing, LLMs trackés, hébergement, conformité, langue. Sans bullshit.",
    url: "https://mamie-geo.fr/vs/profound",
    type: "website",
  },
};

const CONFIG: VsConfig = {
  slug: "profound",
  competitorName: "Profound",
  breadcrumbLabel: "vs Profound",
  h1: "Mamie GEO vs Profound : l'alternative francophone à 1/10ᵉ du prix",
  heroIntro:
    "Profound vise les Fortune 1000 anglo-saxonnes à 500 $/mois. Mamie GEO vise les freelances et PME francophones dès 9,99 €/mois, avec Le Chat de Mistral et hébergement Europe. Voici la comparaison honnête, sans bullshit.",
  tableNote:
    "Mis à jour le 18 juin 2026. Données Profound issues de leur page pricing publique et de leur documentation.",
  competitorCard: {
    name: "Profound",
    tagline: "L'outil US de référence pour Fortune 1000",
    price: "500 $",
    priceSuffix: "/mois (plan Starter)",
    target: "Grandes entreprises US/UK · Marketing 50+ personnes",
  },
  mamieCard: {
    name: "Mamie GEO",
    tagline: "Le SaaS francophone GEO pour freelances et PME",
    price: "9,99 €",
    priceSuffix: "/mois (plan Solo)",
    target: "Freelances · PME · Agences SEO/marketing FR",
  },
  comparison: [
    {
      title: "Pricing",
      rows: [
        { feature: "Plan d'entrée", competitor: "500 $/mois", mamieGeo: "9,99 €/mois" },
        { feature: "Plan Pro / standard", competitor: "~1 200 $/mois", mamieGeo: "149 €/mois" },
        { feature: "Plan Enterprise", competitor: "Jusqu'à 2 000 $/mois", mamieGeo: "Sur devis" },
        {
          feature: "Essai gratuit",
          competitor: "Démo commerciale obligatoire",
          mamieGeo: "14 j sans carte + garantie 14 j",
        },
        {
          feature: "Outil gratuit sans inscription",
          competitor: false,
          mamieGeo: "Audit technique 30+ checks",
        },
      ],
    },
    {
      title: "LLMs trackés",
      rows: [
        { feature: "ChatGPT", competitor: true, mamieGeo: true },
        { feature: "Claude", competitor: true, mamieGeo: true },
        { feature: "Perplexity", competitor: true, mamieGeo: true },
        { feature: "Gemini", competitor: true, mamieGeo: true },
        { feature: "Le Chat (Mistral) 🇫🇷", competitor: false, mamieGeo: true },
        { feature: "Copilot · Grok · Meta AI · DeepSeek", competitor: true, mamieGeo: false },
      ],
    },
    {
      title: "Hébergement & conformité",
      rows: [
        { feature: "Hébergement", competitor: "AWS US", mamieGeo: "Vercel EU + Neon Frankfurt" },
        { feature: "RGPD natif", competitor: "Via SCC", mamieGeo: true },
        {
          feature: "DPA disponible",
          competitor: "Négociation Enterprise",
          mamieGeo: "Sur demande, tous plans",
        },
        { feature: "SOC 2 Type II", competitor: true, mamieGeo: false },
      ],
    },
    {
      title: "Langue & marché",
      rows: [
        { feature: "Interface", competitor: "Anglais uniquement", mamieGeo: "Français" },
        { feature: "Rapports", competitor: "Anglais", mamieGeo: "Français" },
        { feature: "Support", competitor: "Anglais", mamieGeo: "Français" },
        { feature: "Documentation", competitor: "Anglais", mamieGeo: "Français" },
      ],
    },
  ],
  chooseCompetitor: {
    title: "Choisir Profound si…",
    points: [
      "Grande entreprise US/UK, budget tooling > 5 k$/mois",
      "Besoin de SOC 2 Type II, SAML SSO, 8 LLMs anglo-saxons",
      "Équipe marketing 50+ personnes habituée aux outils US",
      "Tu cibles un marché anglo-saxon global (Grok, DeepSeek)",
    ],
  },
  chooseMamie: {
    title: "Choisir Mamie GEO si…",
    points: [
      "Freelance ou PME francophone, budget < 500 €/mois",
      "Tu as besoin de Le Chat (Mistral) dans le tracking",
      "Tu valorises l'hébergement EU et le support français",
      "Tu veux pouvoir tester sans engagement (essai 14 j sans carte)",
    ],
  },
  faq: [
    {
      q: "Pourquoi Mamie GEO ne track-t-il pas Grok, DeepSeek ou Copilot ?",
      a: "Choix éditorial V0 : on track les 5 LLMs les plus utilisés en France (ChatGPT, Claude, Perplexity, Gemini, Le Chat). Ajouter Grok ou DeepSeek alourdit le coût LLM sans valeur pour notre cible francophone. On les ajoutera si la demande émerge.",
    },
    {
      q: "Mamie GEO peut-il remplacer Profound pour une grande entreprise FR ?",
      a: "Probablement pas en V0 : pas de SSO SAML, pas de SOC 2, pas d'API avancée. Pour une grande entreprise qui veut un outil français, on peut discuter d'un plan custom (hello@mamie-geo.fr). Mais pour 90 % des PME françaises, Mamie GEO suffit largement.",
    },
    {
      q: "Combien coûte Mamie GEO vs Profound sur un an ?",
      a: "Mamie GEO Pro 149 €/mois = 1 788 €/an. Profound Starter 500 $/mois ≈ 5 500 €/an. Différence d'environ 3 700 €/an pour des features comparables sur les LLMs grand public + un meilleur tracking du marché FR (Le Chat).",
    },
  ],
};

export default function Page() {
  return <VsPage config={CONFIG} />;
}
