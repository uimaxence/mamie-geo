import type { Metadata } from "next";
import { type VsConfig, VsPage } from "../_vs-page";

// Landing comparative conversion-first.
// Données vérifiées sur rankscale.ai/pricing le 2026-06-18. Pricing Mamie : CLAUDE.md § 1.
//
// Correction vs ancienne version : Rankscale démarre à 20 $ (Essentials),
// modèle credit-based avec rollover (Pro 99 $/1200 crédits, Growth 385 $,
// Enterprise 780 $). Rankscale TRACK Mistral AI. API REST sur Growth+.
// Le vrai trade-off : langue FR + flat-prompts simple + EU, vs couverture
// moteurs + crédits modulables + API côté Rankscale.

export const metadata: Metadata = {
  title: "Mamie GEO vs Rankscale : flat-prompts en euros ou crédits en dollars",
  description:
    "Rankscale fonctionne en crédits modulables (dès 20 $/mois), couvre 10 moteurs et propose une API REST, en anglais. Mamie GEO préfère le flat-prompts fixe en euros, en français et hébergé EU, dès 9,99 €/mois. Comparatif sans bullshit.",
  alternates: { canonical: "https://mamie-geo.fr/vs/rankscale" },
  openGraph: {
    title: "Mamie GEO vs Rankscale : flat-prompts en euros ou crédits en dollars",
    description:
      "Comparatif feature par feature : modèle de prix, moteurs, API, langue, hébergement.",
    url: "https://mamie-geo.fr/vs/rankscale",
    type: "website",
  },
};

const CONFIG: VsConfig = {
  slug: "rankscale",
  competitorName: "Rankscale",
  breadcrumbLabel: "vs Rankscale",
  h1: "Mamie GEO vs Rankscale : flat-prompts en euros ou crédits en dollars",
  heroIntro:
    "Rankscale fonctionne en crédits modulables (dès 20 $/mois), couvre une dizaine de moteurs et propose une API REST, mais en anglais. Mamie GEO préfère le flat-prompts fixe en euros, en français et hébergé en Europe, dès 9,99 €/mois. Voici le trade-off, sans bullshit.",
  tableNote:
    "Données vérifiées le 18 juin 2026 sur rankscale.ai. Vérifier leur page pricing pour le détail à jour.",
  competitorCard: {
    name: "Rankscale",
    tagline: "Le pricing credit-based avec API, pour agences",
    price: "20 $",
    priceSuffix: "/mois (plan Essentials)",
    target: "Agences US/UK · Équipes techniques · Multi-clients à modulations variées",
  },
  mamieCard: {
    name: "Mamie GEO",
    tagline: "Le flat-prompts simple en euros, pour freelances et PME",
    price: "9,99 €",
    priceSuffix: "/mois (plan Solo)",
    target: "Freelances · PME · Agences SEO/marketing FR",
  },
  comparison: [
    {
      title: "Modèle de pricing",
      rows: [
        { feature: "Plan d'entrée", competitor: "20 $/mois (Essentials)", mamieGeo: "9,99 €/mois" },
        {
          feature: "Plan Pro",
          competitor: "99 $/mois (1 200 crédits)",
          mamieGeo: "149 €/mois (Pro)",
        },
        {
          feature: "Logique",
          competitor: "Crédits modulables (rollover)",
          mamieGeo: "Flat-prompts, hard-cap 200 %",
        },
        { feature: "Devise", competitor: "Dollars", mamieGeo: "Euros" },
        {
          feature: "Essai gratuit",
          competitor: "Pro gratuit à l'essai",
          mamieGeo: "14 j sans carte + garantie 14 j",
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
        { feature: "Le Chat (Mistral) 🇫🇷", competitor: "Mistral AI", mamieGeo: true },
        {
          feature: "Grok · DeepSeek · Copilot · AI Mode",
          competitor: true,
          mamieGeo: false,
        },
      ],
    },
    {
      title: "Intégrations & cible",
      rows: [
        { feature: "API REST publique", competitor: "Growth+ tiers", mamieGeo: "Prévue en V1" },
        { feature: "Exports CSV natifs", competitor: true, mamieGeo: true },
        {
          feature: "Annuaire d'agences partenaires",
          competitor: "International",
          mamieGeo: "FR, prévu en V1",
        },
        {
          feature: "Cible cœur",
          competitor: "Agences US/UK grand groupe",
          mamieGeo: "Freelance + PME FR",
        },
      ],
    },
    {
      title: "Langue & marché",
      rows: [
        { feature: "Interface", competitor: "Anglais", mamieGeo: "Français" },
        { feature: "Support", competitor: "Anglais", mamieGeo: "Français" },
        {
          feature: "Hébergement",
          competitor: "Non précisé",
          mamieGeo: "EU (Paris + Frankfurt)",
        },
        { feature: "RGPD natif", competitor: "À vérifier", mamieGeo: true },
      ],
    },
  ],
  chooseCompetitor: {
    title: "Choisir Rankscale si…",
    points: [
      "Agence US/UK avec plusieurs clients à modulations très différentes",
      "Équipe technique qui veut une API REST (à partir du tier Growth)",
      "Tu veux le maximum de moteurs (Grok, DeepSeek, Copilot, AI Mode)",
      "Le système de crédits avec rollover correspond à ton usage variable",
    ],
  },
  chooseMamie: {
    title: "Choisir Mamie GEO si…",
    points: [
      "Tu veux un pricing fixe en euros, sans gérer un solde de crédits",
      "Interface et support en français, hébergement EU",
      "Setup de prompts stable plutôt qu'usage très variable",
      "Tu veux tester sans carte (essai 14 j) avant de payer",
    ],
  },
  faq: [
    {
      q: "Mamie GEO va-t-il passer en pricing credit-based comme Rankscale ?",
      a: "Non, c'est une décision produit délibérée. Flat-prompts pour V0/V0+. Un tier credit-based optionnel pourrait être réintroduit en V1 si une demande agence claire émerge, mais ce n'est pas un acquis. La simplicité du flat-prompts est un argument de vente pour notre cible PME/freelance.",
    },
    {
      q: "Rankscale a une API REST, pas Mamie GEO. Bloquant ?",
      a: "Dépend de ton besoin. Chez Rankscale l'API REST est réservée aux tiers Growth et Enterprise. Pour pousser tes données dans un dashboard maison, Mamie GEO propose déjà les exports CSV (runs et metrics) et l'export JSON RGPD complet ; une API REST est prévue en V1.",
    },
    {
      q: "Rankscale est moins cher à l'entrée (20 $) que certains plans Mamie GEO ?",
      a: "L'entrée Rankscale Essentials à 20 $ est en crédits : à toi d'estimer ta consommation et de surveiller ton solde. Mamie GEO Solo à 9,99 € est un flat-prompts fixe (10 prompts hebdo sur 5 IA), sans calcul ni surprise, en euros et en français.",
    },
  ],
};

export default function Page() {
  return <VsPage config={CONFIG} />;
}
