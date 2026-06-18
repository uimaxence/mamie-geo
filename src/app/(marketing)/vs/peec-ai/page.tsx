import type { Metadata } from "next";
import { type VsConfig, VsPage } from "../_vs-page";

// Landing comparative conversion-first. Recycle l'article blog
// `mamie-geo-vs-peec-ai.mdx` (source de vérité données concurrent).
// Pricing Mamie GEO : CLAUDE.md § 1.

export const metadata: Metadata = {
  title: "Mamie GEO vs Peec AI : l'alternative francophone dès 9,99 €",
  description:
    "Peec AI vise les scale-ups et le mid-market international à partir de 85 €/mois. Mamie GEO vise les freelances et PME francophones dès 9,99 €/mois, avec Le Chat de Mistral tracké en natif et hébergement EU. Comparatif honnête.",
  alternates: { canonical: "https://mamie-geo.fr/vs/peec-ai" },
  openGraph: {
    title: "Mamie GEO vs Peec AI : l'alternative francophone dès 9,99 €",
    description:
      "Comparatif feature par feature : pricing, LLMs trackés, hébergement, langue. Sans bullshit.",
    url: "https://mamie-geo.fr/vs/peec-ai",
    type: "website",
  },
};

const CONFIG: VsConfig = {
  slug: "peec-ai",
  competitorName: "Peec AI",
  breadcrumbLabel: "vs Peec AI",
  h1: "Mamie GEO vs Peec AI : l'alternative francophone dès 9,99 €",
  heroIntro:
    "Peec AI est le leader européen du tracking de visibilité IA, mais il vise les scale-ups et le mid-market international en anglais, à partir de 85 €/mois. Mamie GEO vise les freelances et PME francophones dès 9,99 €/mois, avec Le Chat de Mistral tracké en natif. Voici la comparaison, sans bullshit.",
  tableNote:
    "Mis à jour le 18 juin 2026. Données Peec AI issues de leur site public : vérifier leur page pricing pour le détail à jour.",
  competitorCard: {
    name: "Peec AI",
    tagline: "Le leader européen pour scale-ups et mid-market",
    price: "85 €",
    priceSuffix: "/mois (plan Starter)",
    target: "Scale-ups · Mid-market international · Équipes marketing 20-200 personnes",
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
        { feature: "Plan d'entrée", competitor: "85 €/mois", mamieGeo: "9,99 €/mois" },
        {
          feature: "Plan supérieur",
          competitor: "499 €/mois (Growth)",
          mamieGeo: "149 €/mois (Pro)",
        },
        {
          feature: "Démarrage",
          competitor: "Démo commerciale recommandée",
          mamieGeo: "Signup direct, sans démo",
        },
        {
          feature: "Essai gratuit",
          competitor: "7 à 14 j selon période",
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
        { feature: "Copilot", competitor: true, mamieGeo: false },
        { feature: "Le Chat (Mistral) 🇫🇷", competitor: false, mamieGeo: true },
      ],
    },
    {
      title: "Hébergement & conformité",
      rows: [
        {
          feature: "Hébergement",
          competitor: "Non documenté (société DE)",
          mamieGeo: "Vercel Paris + Neon Frankfurt",
        },
        { feature: "RGPD natif", competitor: "Soumis RGPD (DE)", mamieGeo: true },
        {
          feature: "DPA disponible",
          competitor: "Sur demande",
          mamieGeo: "Sur demande, tous plans",
        },
        { feature: "Transfert hors UE", competitor: "À vérifier via DPA", mamieGeo: "Aucun" },
      ],
    },
    {
      title: "Langue & marché",
      rows: [
        { feature: "Interface", competitor: "Anglais", mamieGeo: "Français" },
        { feature: "Rapports", competitor: "Anglais", mamieGeo: "Français" },
        { feature: "Support", competitor: "Anglais (équipe EU)", mamieGeo: "Français" },
        {
          feature: "Funnel Apparition/Fréquence/Citation",
          competitor: true,
          mamieGeo: true,
        },
      ],
    },
  ],
  chooseCompetitor: {
    title: "Choisir Peec AI si…",
    points: [
      "Scale-up multi-pays anglophone, présence US déjà active",
      "Budget tooling supérieur à 85 €/mois sur la visibilité IA",
      "Équipe marketing 20+ personnes à l'aise en anglais",
      "Besoin de Copilot dans le tracking",
    ],
  },
  chooseMamie: {
    title: "Choisir Mamie GEO si…",
    points: [
      "Freelance ou PME francophone, budget inférieur à 200 €/mois",
      "Tu as besoin de Le Chat (Mistral) dans le tracking",
      "Tu valorises l'hébergement EU et le support en français",
      "Tu veux tester sans engagement (essai 14 j sans carte)",
    ],
  },
  faq: [
    {
      q: "Peec AI track-t-il Le Chat de Mistral ?",
      a: "Pas en natif au moment de cette page : leur set tracké standard est ChatGPT/Claude/Gemini/Perplexity/Copilot. À vérifier sur leur page produit. Mamie GEO track Le Chat depuis le V0 comme moteur de premier rang, pas comme option payante.",
    },
    {
      q: "Quel est l'équivalent du plan Solo 9,99 € chez Peec ?",
      a: "Pas d'équivalent au moment de cette page. Le plan d'entrée Peec démarre autour de 85 €, soit un facteur 8 à 9. Si ton besoin est « est-ce que ChatGPT et Claude me citent sur 10 prompts par semaine », Mamie GEO Solo couvre, Peec sera surdimensionné.",
    },
    {
      q: "Mamie GEO reprend-il le vocabulaire Apparition/Fréquence/Citation de Peec ?",
      a: "Oui, c'est délibéré. Peec a installé ce funnel comme standard du marché. On utilise les mêmes termes en français et on les affiche dans le dashboard et les exports CSV.",
    },
  ],
};

export default function Page() {
  return <VsPage config={CONFIG} />;
}
