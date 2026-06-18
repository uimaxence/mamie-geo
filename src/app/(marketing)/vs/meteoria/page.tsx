import type { Metadata } from "next";
import { type VsConfig, VsPage } from "../_vs-page";

// Landing comparative conversion-first vs concurrent FR.
// Données vérifiées sur meteoria.ai le 2026-06-18. Pricing Mamie : CLAUDE.md § 1.
//
// Faits vérifiés : Meteoria couvre ChatGPT/AI Overview/Gemini/Perplexity/
// Copilot/AI Mode (3 au choix sur le plan d'entrée), Claude annoncé en
// roadmap, PAS de Mistral. Hébergement EU. Forces : intégration Google
// Analytics + Looker Studio + onboarding humain. On ne qualifie PAS leur
// méthode de mesure (non documentée publiquement) : angle = prix + Le Chat/
// Claude inclus + simplicité.

export const metadata: Metadata = {
  title: "Mamie GEO vs Meteoria : 5 IA dès 9,99 € ou 3 au choix à 75 €",
  description:
    "Meteoria est un outil GEO francophone (intégration Google Analytics, Looker Studio, onboarding humain) à 75 €/mois, avec 3 moteurs au choix sur son plan d'entrée et pas de Mistral. Mamie GEO inclut 5 IA dont Claude et Le Chat dès 9,99 €/mois. Comparatif honnête.",
  alternates: { canonical: "https://mamie-geo.fr/vs/meteoria" },
  openGraph: {
    title: "Mamie GEO vs Meteoria : 5 IA dès 9,99 € ou 3 au choix à 75 €",
    description:
      "Deux outils GEO francophones et EU comparés : moteurs inclus, pricing, intégrations, simplicité.",
    url: "https://mamie-geo.fr/vs/meteoria",
    type: "website",
  },
};

const CONFIG: VsConfig = {
  slug: "meteoria",
  competitorName: "Meteoria",
  breadcrumbLabel: "vs Meteoria",
  h1: "Mamie GEO vs Meteoria : 5 IA dès 9,99 € ou 3 au choix à 75 €",
  heroIntro:
    "Meteoria et Mamie GEO sont tous les deux francophones et hébergés en Europe. Meteoria se veut holistique (intégration Google Analytics, Looker Studio, onboarding humain) à 75 €/mois, mais son plan d'entrée ne couvre que 3 moteurs au choix, sans Le Chat. Mamie GEO inclut les 5 IA, dont Claude et Le Chat, dès 9,99 €/mois. Voici le trade-off, sans bullshit.",
  tableNote:
    "Données vérifiées le 18 juin 2026 sur meteoria.ai. Vérifier leur page pricing pour le détail à jour.",
  competitorCard: {
    name: "Meteoria",
    tagline: "L'outil GEO francophone holistique, fort sur les intégrations",
    price: "75 €",
    priceSuffix: "/mois (Starter, 25 prompts)",
    target: "PME FR · Équipes voulant GA/Looker Studio et un onboarding humain",
  },
  mamieCard: {
    name: "Mamie GEO",
    tagline: "Le GEO francophone simple, 5 IA incluses",
    price: "9,99 €",
    priceSuffix: "/mois (plan Solo)",
    target: "Freelances · PME · Petites agences SEO/marketing FR",
  },
  comparison: [
    {
      title: "Couverture moteurs",
      rows: [
        {
          feature: "Moteurs sur le plan d'entrée",
          competitor: "3 au choix",
          mamieGeo: "5 inclus",
        },
        { feature: "Le Chat (Mistral) 🇫🇷", competitor: false, mamieGeo: true },
        { feature: "Claude", competitor: "Annoncé (roadmap)", mamieGeo: true },
        {
          feature: "Copilot · AI Mode · AI Overviews",
          competitor: true,
          mamieGeo: false,
        },
      ],
    },
    {
      title: "Pricing",
      rows: [
        { feature: "Plan d'entrée", competitor: "75 €/mois (25 prompts)", mamieGeo: "9,99 €/mois" },
        { feature: "Plan supérieur", competitor: "175 €/mois (Pro)", mamieGeo: "149 €/mois (Pro)" },
        {
          feature: "Essai gratuit",
          competitor: "7 j, toutes fonctions",
          mamieGeo: "14 j sans carte + garantie 14 j",
        },
      ],
    },
    {
      title: "Features & intégrations",
      rows: [
        {
          feature: "Intégration Google Analytics",
          competitor: true,
          mamieGeo: "Attribution trafic IA native (pixel)",
        },
        {
          feature: "Connecteur Looker Studio",
          competitor: "Advanced+",
          mamieGeo: "Export CSV (connecteur prévu V1)",
        },
        {
          feature: "Onboarding humain",
          competitor: true,
          mamieGeo: "Wizard guidé + done-for-you en option",
        },
        {
          feature: "Création de contenu IA",
          competitor: true,
          mamieGeo: "Plan d'action /conseils",
        },
      ],
    },
    {
      title: "Conformité (à parité)",
      rows: [
        { feature: "Hébergement EU", competitor: true, mamieGeo: true },
        { feature: "Données non transmises à des IA tierces", competitor: true, mamieGeo: true },
        { feature: "RGPD natif", competitor: true, mamieGeo: true },
      ],
    },
  ],
  chooseCompetitor: {
    title: "Choisir Meteoria si…",
    points: [
      "Tu as besoin de Copilot, AI Mode ou AI Overviews dans le tracking",
      "L'intégration Google Analytics et le connecteur Looker Studio sont clés",
      "Tu veux un onboarding humain accompagné dès le départ",
      "La création de contenu IA intégrée t'intéresse",
    ],
  },
  chooseMamie: {
    title: "Choisir Mamie GEO si…",
    points: [
      "Tu veux Le Chat ET Claude dès l'entrée (Meteoria : 3 au choix, pas de Mistral)",
      "Tu veux démarrer à 9,99 €/mois plutôt qu'à 75 €",
      "Tu préfères un pricing fixe simple et un essai 14 j sans carte",
      "L'attribution du trafic IA native (pixel cookieless) te suffit",
    ],
  },
  faq: [
    {
      q: "Meteoria track-t-il Le Chat (Mistral) et Claude ?",
      a: "Pas de Mistral au moment de cette page, et Claude est annoncé en roadmap. Le plan d'entrée Meteoria couvre 3 moteurs au choix parmi ChatGPT, Perplexity, Gemini, AI Overview, AI Mode et Copilot. Mamie GEO inclut les 5 IA, dont Claude et Le Chat, dès le plan Solo.",
    },
    {
      q: "Meteoria couvre des moteurs que Mamie GEO n'a pas ?",
      a: "Oui : Copilot, Google AI Mode et AI Overviews font partie de son catalogue, pas du nôtre en V0. Si ton marché est très Microsoft ou très Google AI Overviews, Meteoria couvre ces angles. Si tu vises ChatGPT, Claude, Perplexity, Gemini et Le Chat, Mamie GEO suffit.",
    },
    {
      q: "Les deux sont français et hébergés en Europe : qu'est-ce qui vous différencie ?",
      a: "Le prix d'entrée (9,99 € vs 75 €), Le Chat et Claude inclus dès le départ, et la simplicité du flat-prompts. Meteoria reste plus riche côté intégrations (Google Analytics, Looker Studio) et onboarding humain : on vise un usage plus autonome et plus accessible.",
    },
  ],
};

export default function Page() {
  return <VsPage config={CONFIG} />;
}
