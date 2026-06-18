import type { Metadata } from "next";
import { type VsConfig, VsPage } from "../_vs-page";

// Landing comparative conversion-first vs concurrent FR direct n°1.
// Données vérifiées sur qwairy.co le 2026-06-18. Pricing Mamie : CLAUDE.md § 1.
//
// Angle honnête : Qwairy est une suite FR très complète, EU/RGPD, API + UI,
// ~10 moteurs (dont Mistral). La langue ET la conformité ne nous
// différencient PAS. Le seul vrai trade-off = prix d'entrée (6×) +
// simplicité du flat-prompts vs crédits modulables.

export const metadata: Metadata = {
  title: "Mamie GEO vs Qwairy : la même catégorie, 6× moins cher à l'entrée",
  description:
    "Qwairy est la suite GEO francophone la plus complète (≈10 moteurs, EU/RGPD, crédits modulables) à partir de 59 €/mois. Mamie GEO couvre les 5 IA les plus utilisées en France en flat-prompts dès 9,99 €/mois. Comparatif honnête entre deux outils FR.",
  alternates: { canonical: "https://mamie-geo.fr/vs/qwairy" },
  openGraph: {
    title: "Mamie GEO vs Qwairy : la même catégorie, 6× moins cher à l'entrée",
    description:
      "Deux outils GEO francophones et EU comparés feature par feature : pricing, moteurs, simplicité.",
    url: "https://mamie-geo.fr/vs/qwairy",
    type: "website",
  },
};

const CONFIG: VsConfig = {
  slug: "qwairy",
  competitorName: "Qwairy",
  breadcrumbLabel: "vs Qwairy",
  h1: "Mamie GEO vs Qwairy : la même catégorie, 6× moins cher à l'entrée",
  heroIntro:
    "Qwairy et Mamie GEO sont tous les deux francophones et hébergés en Europe : ni la langue ni le RGPD ne départagent. Qwairy est la suite la plus complète (≈10 moteurs, crédits modulables) à partir de 59 €/mois. Mamie GEO couvre les 5 IA les plus utilisées en France en flat-prompts dès 9,99 €/mois. Le vrai trade-off est là : prix d'entrée et simplicité, sans bullshit.",
  tableNote:
    "Données vérifiées le 18 juin 2026 sur qwairy.co. Vérifier leur page pricing pour le détail à jour.",
  competitorCard: {
    name: "Qwairy",
    tagline: "La suite GEO francophone la plus complète",
    price: "59 €",
    priceSuffix: "/mois (plan Starter)",
    target: "Pros SEO · Agences · Scale-ups FR avec budget tooling établi",
  },
  mamieCard: {
    name: "Mamie GEO",
    tagline: "Le GEO francophone simple et accessible",
    price: "9,99 €",
    priceSuffix: "/mois (plan Solo)",
    target: "Freelances · PME · Petites agences SEO/marketing FR",
  },
  comparison: [
    {
      title: "Pricing",
      rows: [
        { feature: "Plan d'entrée", competitor: "59 €/mois", mamieGeo: "9,99 €/mois" },
        { feature: "Plan supérieur", competitor: "199 €/mois (Pro)", mamieGeo: "149 €/mois (Pro)" },
        {
          feature: "Modèle de quota",
          competitor: "Crédits modulables (1 requête = 1 crédit/modèle)",
          mamieGeo: "Flat-prompts, hard-cap 200 %",
        },
        {
          feature: "Essai gratuit",
          competitor: "100 crédits, sans carte",
          mamieGeo: "14 j sans carte + garantie 14 j",
        },
      ],
    },
    {
      title: "Couverture moteurs",
      rows: [
        { feature: "Nombre de moteurs", competitor: "≈ 10", mamieGeo: "5 (les + utilisés en FR)" },
        { feature: "ChatGPT · Claude · Perplexity · Gemini", competitor: true, mamieGeo: true },
        { feature: "Le Chat (Mistral) 🇫🇷", competitor: true, mamieGeo: true },
        {
          feature: "Grok · DeepSeek · AI Overviews · AI Mode",
          competitor: true,
          mamieGeo: false,
        },
      ],
    },
    {
      title: "Méthode & features",
      rows: [
        {
          feature: "Détection",
          competitor: "API + scraping UI selon moteur",
          mamieGeo: "API natives",
        },
        {
          feature: "Audit GEO + recommandations",
          competitor: true,
          mamieGeo: "Audit 30+ checks + /conseils",
        },
        { feature: "Benchmark concurrents", competitor: true, mamieGeo: true },
        {
          feature: "Suivi trafic / crawlers IA",
          competitor: "Crawler analytics",
          mamieGeo: "Pixel trafic IA (dès Solo)",
        },
      ],
    },
    {
      title: "Conformité (à parité)",
      rows: [
        { feature: "Hébergement EU", competitor: true, mamieGeo: true },
        { feature: "RGPD natif", competitor: true, mamieGeo: true },
        { feature: "Made in France 🇫🇷", competitor: true, mamieGeo: true },
      ],
    },
  ],
  chooseCompetitor: {
    title: "Choisir Qwairy si…",
    points: [
      "Tu veux le maximum de moteurs (Grok, DeepSeek, AI Mode, AI Overviews)",
      "Tu es une agence multi-clients qui module ses crédits par compte",
      "Tu veux la suite la plus riche (briefs de contenu, backlinks, sentiment)",
      "Budget tooling établi, supérieur à 59 €/mois sur le poste GEO",
    ],
  },
  chooseMamie: {
    title: "Choisir Mamie GEO si…",
    points: [
      "Tu veux démarrer à 9,99 €/mois, soit 6× moins cher à l'entrée",
      "Les 5 IA les plus utilisées en France te suffisent (dont Le Chat)",
      "Tu préfères un flat-prompts simple à un solde de crédits à surveiller",
      "Tu veux tester sans carte (essai 14 j) avant de payer",
    ],
  },
  faq: [
    {
      q: "Qwairy track plus de moteurs que Mamie GEO, c'est un problème ?",
      a: "Ça dépend de ta cible. Qwairy couvre une dizaine de moteurs (Grok, DeepSeek, AI Mode, AI Overviews inclus). Mamie GEO track les 5 les plus utilisés en France (ChatGPT, Claude, Perplexity, Gemini, Le Chat). Si ton marché est très anglo-saxon, Qwairy couvre plus large ; si tu vises la France, les 5 suffisent et tu paies moins.",
    },
    {
      q: "Les deux sont français et hébergés en Europe : qu'est-ce qui vous différencie vraiment ?",
      a: "Le prix d'entrée (9,99 € vs 59 €, soit 6× moins cher) et la simplicité. Qwairy fonctionne en crédits modulables à surveiller ; Mamie GEO est en flat-prompts fixe par plan, sans calcul ni surprise en fin de mois. Qwairy reste plus complet et plus riche : on vise un segment plus accessible.",
    },
    {
      q: "Pourquoi Mamie GEO est-il autant moins cher que Qwairy ?",
      a: "Plan d'entrée à 9,99 € vs 59 €. On a fait le choix d'un plan Solo volontairement accessible pour les freelances et TPE, là où Qwairy démarre sur un cran mid-market. Ce n'est pas un produit au rabais : les 5 IA (dont Le Chat), l'audit, le benchmark concurrents et l'attribution trafic IA sont inclus.",
    },
  ],
};

export default function Page() {
  return <VsPage config={CONFIG} />;
}
