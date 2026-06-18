import type { Metadata } from "next";
import { type VsConfig, VsPage } from "../_vs-page";

// Landing comparative conversion-first vs concurrent FR.
// Données vérifiées sur botrank.ai le 2026-06-18. Pricing Mamie : CLAUDE.md § 1.
//
// Faits clés vérifiés : plan d'entrée Botrank = 3 moteurs seulement
// (ChatGPT, Gemini, Perplexity) ; Claude/Mistral/Copilot/Grok réservés au
// plan Custom. Détection par scraping d'interfaces (confirmé sur leur site).
// Pas de RGPD/résidence documentés. Agent IA « Bob » + audit GEO 25+ critères.

export const metadata: Metadata = {
  title: "Mamie GEO vs Botrank : 5 IA dès 9,99 € ou 3 moteurs à 75 €",
  description:
    "Botrank est un outil GEO francophone (agent IA « Bob », audit GEO) qui mesure par scraping d'interfaces, dès 75 €/mois mais limité à 3 moteurs sur son plan d'entrée. Mamie GEO inclut 5 IA dont Claude et Le Chat via API natives dès 9,99 €/mois. Comparatif honnête.",
  alternates: { canonical: "https://mamie-geo.fr/vs/botrank" },
  openGraph: {
    title: "Mamie GEO vs Botrank : 5 IA dès 9,99 € ou 3 moteurs à 75 €",
    description:
      "Deux outils GEO francophones comparés : moteurs inclus, méthode de mesure, pricing, conformité.",
    url: "https://mamie-geo.fr/vs/botrank",
    type: "website",
  },
};

const CONFIG: VsConfig = {
  slug: "botrank",
  competitorName: "Botrank",
  breadcrumbLabel: "vs Botrank",
  h1: "Mamie GEO vs Botrank : 5 IA dès 9,99 € ou 3 moteurs à 75 €",
  heroIntro:
    "Botrank et Mamie GEO sont tous les deux francophones. Botrank propose un agent IA « Bob » et un audit GEO, mais son plan d'entrée à 75 €/mois ne couvre que 3 moteurs (ChatGPT, Gemini, Perplexity) par scraping d'interfaces. Mamie GEO inclut les 5 IA, dont Claude et Le Chat, via API natives dès 9,99 €/mois. Voici le trade-off, sans bullshit.",
  tableNote:
    "Données vérifiées le 18 juin 2026 sur botrank.ai. Vérifier leur page pricing pour le détail à jour.",
  competitorCard: {
    name: "Botrank",
    tagline: "L'outil GEO francophone avec agent IA « Bob »",
    price: "75 €",
    priceSuffix: "/mois (Starter en annuel, 89 € au mois)",
    target: "PME FR · Équipes voulant un agent conversationnel et un audit GEO",
  },
  mamieCard: {
    name: "Mamie GEO",
    tagline: "Le GEO francophone via API natives, simple et accessible",
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
          competitor: "3 : ChatGPT, Gemini, Perplexity",
          mamieGeo: "5 dès Solo",
        },
        { feature: "Claude inclus à l'entrée", competitor: false, mamieGeo: true },
        { feature: "Le Chat (Mistral) 🇫🇷 inclus à l'entrée", competitor: false, mamieGeo: true },
        {
          feature: "Claude · Mistral · Copilot · Grok",
          competitor: "Plan Custom uniquement",
          mamieGeo: "Claude + Le Chat dès Solo",
        },
      ],
    },
    {
      title: "Méthode de mesure",
      rows: [
        {
          feature: "Source des réponses",
          competitor: "Scraping d'interfaces (confirmé)",
          mamieGeo: "API natives officielles",
        },
        {
          feature: "Reproductibilité",
          competitor: "Variable (UI peut changer)",
          mamieGeo: "Stable et versionnée",
        },
        {
          feature: "Robustesse dans le temps",
          competitor: "Dépend des UI scrappées",
          mamieGeo: "Contrats d'API stables",
        },
      ],
    },
    {
      title: "Pricing",
      rows: [
        {
          feature: "Plan d'entrée",
          competitor: "89 €/mois (75 € en annuel)",
          mamieGeo: "9,99 €/mois",
        },
        {
          feature: "Plan supérieur",
          competitor: "289 €/mois (245 € en annuel)",
          mamieGeo: "149 €/mois (Pro)",
        },
        {
          feature: "Essai gratuit",
          competitor: "7 jours",
          mamieGeo: "14 j sans carte + garantie 14 j",
        },
      ],
    },
    {
      title: "Features & conformité",
      rows: [
        { feature: "Agent IA conversationnel", competitor: "« Bob »", mamieGeo: false },
        { feature: "Audit GEO technique", competitor: "25+ critères", mamieGeo: "30+ checks" },
        { feature: "Part de voix vs concurrents", competitor: true, mamieGeo: true },
        { feature: "Génération de contenu / code", competitor: true, mamieGeo: false },
        {
          feature: "RGPD / résidence documentés",
          competitor: "Non documenté",
          mamieGeo: "EU + DPA tous plans",
        },
      ],
    },
  ],
  chooseCompetitor: {
    title: "Choisir Botrank si…",
    points: [
      "Tu veux un agent IA conversationnel (« Bob ») et de la génération de contenu/code",
      "Tu privilégies un scraping au plus près de ce que voit l'utilisateur",
      "L'audit GEO technique intégré est un critère central",
      "Tu acceptes de passer sur l'offre Custom pour Claude, Mistral et Copilot",
    ],
  },
  chooseMamie: {
    title: "Choisir Mamie GEO si…",
    points: [
      "Tu veux Claude ET Le Chat dès le plan d'entrée (Botrank : 3 moteurs seulement)",
      "Tu veux démarrer à 9,99 €/mois plutôt qu'à 75 €",
      "Tu préfères une mesure stable et reproductible via API natives",
      "Tu valorises un hébergement EU et un DPA documentés",
    ],
  },
  faq: [
    {
      q: "Botrank track-t-il Claude et Le Chat (Mistral) ?",
      a: "Pas sur son plan d'entrée. Le Starter Botrank couvre ChatGPT, Gemini et Perplexity ; Claude, Mistral, Copilot et Grok sont réservés à l'offre Custom (sur devis). Mamie GEO inclut les 5 IA, dont Claude et Le Chat, dès le plan Solo à 9,99 €.",
    },
    {
      q: "Scraping d'interface ou API natives : lequel est mieux ?",
      a: "C'est un vrai trade-off. Le scraping capte ce que voit exactement un utilisateur mais casse quand l'interface change et navigue plus près des limites d'usage. Les API natives sont stables, reproductibles et utilisent le browse/search officiel. Mamie GEO a fait le choix des API natives pour la fiabilité dans le temps.",
    },
    {
      q: "Mamie GEO a-t-il un agent IA conversationnel comme « Bob » ?",
      a: "Pas en V0. Mamie GEO mise sur un dashboard lisible et un plan d'action priorisé (/conseils) plutôt que sur un chat. Si l'exploration conversationnelle et la génération de contenu sont des critères forts, Botrank est plus spécialisé là-dessus.",
    },
  ],
};

export default function Page() {
  return <VsPage config={CONFIG} />;
}
