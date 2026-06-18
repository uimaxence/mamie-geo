import type { Metadata } from "next";
import { type VsConfig, VsPage } from "../_vs-page";

// Landing comparative conversion-first.
// Données vérifiées sur otterly.ai/pricing le 2026-06-18. Pricing Mamie : CLAUDE.md § 1.
//
// Correction vs ancienne version : Otterly est désormais un outil
// STANDALONE (plus un simple add-on Semrush). Plans Lite 29 $ / Standard
// 189 $ / Premium 489 $. Moteurs de base ChatGPT/AI Overviews/Perplexity/
// Copilot ; Claude et Gemini en add-on payant ; pas de Mistral. Anglais.

export const metadata: Metadata = {
  title: "Mamie GEO vs Otterly : 5 IA en français dès 9,99 € ou l'outil US",
  description:
    "Otterly est un outil GEO US standalone dès 29 $/mois, mais Claude et Gemini sont des add-ons payants et Le Chat n'est pas tracké. Mamie GEO inclut 5 IA dont Claude, Gemini et Le Chat, en français et hébergé EU, dès 9,99 €/mois. Comparatif sans détour.",
  alternates: { canonical: "https://mamie-geo.fr/vs/otterly" },
  openGraph: {
    title: "Mamie GEO vs Otterly : 5 IA en français dès 9,99 € ou l'outil US",
    description: "Comparatif feature par feature : moteurs inclus, pricing, langue, hébergement.",
    url: "https://mamie-geo.fr/vs/otterly",
    type: "website",
  },
};

const CONFIG: VsConfig = {
  slug: "otterly",
  competitorName: "Otterly",
  breadcrumbLabel: "vs Otterly",
  h1: "Mamie GEO vs Otterly : 5 IA en français dès 9,99 € ou l'outil US",
  heroIntro:
    "Otterly est un outil GEO américain standalone (aussi distribué via Semrush App Center), dès 29 $/mois. Mais Claude et Gemini y sont des add-ons payants, Le Chat n'est pas tracké, et tout est en anglais. Mamie GEO inclut 5 IA dont Claude, Gemini et Le Chat, en français et hébergé en Europe, dès 9,99 €/mois. Voici le comparatif, sans détour.",
  tableNote:
    "Données vérifiées le 18 juin 2026 sur otterly.ai. Vérifier leur page pricing pour le détail à jour.",
  competitorCard: {
    name: "Otterly",
    tagline: "L'outil GEO US standalone, en anglais",
    price: "29 $",
    priceSuffix: "/mois (plan Lite)",
    target: "Équipes anglophones · Marché US/UK · Écosystème Semrush",
  },
  mamieCard: {
    name: "Mamie GEO",
    tagline: "Le GEO francophone, 5 IA incluses, hébergé EU",
    price: "9,99 €",
    priceSuffix: "/mois (plan Solo)",
    target: "Freelances · PME · Agences SEO/marketing FR",
  },
  comparison: [
    {
      title: "Couverture moteurs",
      rows: [
        {
          feature: "Moteurs de base",
          competitor: "ChatGPT, AI Overviews, Perplexity, Copilot",
          mamieGeo: "ChatGPT, Claude, Perplexity, Gemini, Le Chat",
        },
        { feature: "Claude", competitor: "Add-on payant", mamieGeo: true },
        { feature: "Gemini", competitor: "Add-on payant", mamieGeo: true },
        { feature: "Le Chat (Mistral) 🇫🇷", competitor: false, mamieGeo: true },
        { feature: "Copilot · AI Overviews", competitor: true, mamieGeo: false },
      ],
    },
    {
      title: "Pricing",
      rows: [
        {
          feature: "Plan d'entrée",
          competitor: "29 $/mois (Lite)",
          mamieGeo: "9,99 €/mois (Solo)",
        },
        {
          feature: "Plan intermédiaire",
          competitor: "189 $/mois (Standard)",
          mamieGeo: "49 €/mois (Starter)",
        },
        { feature: "Devise", competitor: "Dollars", mamieGeo: "Euros" },
        {
          feature: "Essai gratuit",
          competitor: "Oui",
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
      title: "Langue & marché",
      rows: [
        { feature: "Interface", competitor: "Anglais", mamieGeo: "Français" },
        { feature: "Support", competitor: "Anglais (US/UK)", mamieGeo: "Français" },
        {
          feature: "Hébergement",
          competitor: "Non précisé (probable US)",
          mamieGeo: "EU (Paris + Frankfurt)",
        },
        { feature: "RGPD natif", competitor: "À vérifier", mamieGeo: true },
      ],
    },
  ],
  chooseCompetitor: {
    title: "Choisir Otterly si…",
    points: [
      "Équipe anglophone, marché cible US/UK",
      "Besoin de Copilot et de Google AI Overviews dans le tracking",
      "Tu es déjà dans l'écosystème Semrush (aussi dispo via leur App Center)",
      "Budget en dollars, add-ons Claude/Gemini acceptés",
    ],
  },
  chooseMamie: {
    title: "Choisir Mamie GEO si…",
    points: [
      "Tu veux Claude, Gemini ET Le Chat inclus, sans add-on (Otterly les facture)",
      "Équipe francophone, interface et support en français",
      "Tu valorises l'hébergement EU et un pricing en euros dès 9,99 €",
      "Tu veux un outil GEO autonome sans surcoût d'écosystème",
    ],
  },
  faq: [
    {
      q: "Faut-il un abonnement Semrush pour utiliser Otterly ?",
      a: "Non, Otterly est désormais un outil standalone (il reste aussi distribué via le Semrush App Center). Mais l'interface et le support restent en anglais, et Le Chat de Mistral n'est pas tracké. Mamie GEO est francophone et inclut Le Chat dès le plan Solo.",
    },
    {
      q: "Le plan Otterly Lite à 29 $ n'est-il pas moins cher que Mamie GEO ?",
      a: "À couverture égale, non. Le Lite ne couvre que 4 moteurs de base ; Claude et Gemini sont des add-ons payants et Le Chat n'existe pas chez eux. Pour suivre les 5 IA les plus utilisées en France, Mamie GEO Solo à 9,99 € est plus complet et en euros.",
    },
    {
      q: "Quels moteurs Otterly track et Mamie GEO ne track pas ?",
      a: "Microsoft Copilot et Google AI Overviews, que Mamie GEO ne couvre pas en V0. Si ton marché est très Microsoft ou très AI Overviews, Otterly est pertinent. Si tu vises ChatGPT, Claude, Perplexity, Gemini et Le Chat, Mamie GEO suffit.",
    },
  ],
};

export default function Page() {
  return <VsPage config={CONFIG} />;
}
