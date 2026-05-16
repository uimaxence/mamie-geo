// Source de vérité pour les plans pricing publics — un seul endroit à
// toucher quand les tarifs bougent. cf. doc 04-pricing-business-model.md
// + doc 09 § 2026-05-14 (ajout Solo + retrait Agency public).
//
// Discount annuel verrouillé à 20 % (doc 09 § Décisions Sprint 0).
// Agency reste dans l'enum DB (workspaces.plan) mais n'est plus dans
// la grille publique : remplacée par "Plus de volume ? Contact".

export const ANNUAL_DISCOUNT_PCT = 20;

export type PlanId = "solo" | "starter" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyEur: number;
  /** Features mises en avant sur la card (4-6 items max) */
  features: string[];
  ctaLabel: string;
  /** Pour les 3 plans souscriptibles, on redirige vers /login?next=%2Fapp%2Fsettings%23billing
      qui présente le checkout après auth. Pas d'URL Stripe directe pour préserver
      la création du customer via /api/checkout. */
  ctaHref: string;
  popular?: boolean;
  audience: string;
}

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    tagline: "Pour découvrir ta visibilité IA sans engagement.",
    audience: "Freelance · première brique",
    monthlyEur: 9.99,
    features: [
      "5 prompts trackés",
      "3 concurrents",
      "5 IA suivies (ChatGPT, Claude, Perplexity, Gemini, Le Chat)",
      "1 run par semaine (lundi)",
      "Dashboard + email récap",
    ],
    ctaLabel: "Commencer avec Solo",
    ctaHref: "/login?next=%2Fapp%2Fsettings%23billing",
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour les freelances qui veulent répondre à « et pour ChatGPT ? ».",
    audience: "Freelance SEO · le plus choisi",
    monthlyEur: 49,
    popular: true,
    features: [
      "25 prompts trackés",
      "5 concurrents",
      "5 IA suivies",
      "Tracking quotidien",
      "Dashboard + email hebdo",
      "Support email J+2",
    ],
    ctaLabel: "S'abonner à Starter",
    ctaHref: "/login?next=%2Fapp%2Fsettings%23billing",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour les équipes marketing qui pilotent leur visibilité IA en CODIR.",
    audience: "Marketing PME · scaling",
    monthlyEur: 149,
    features: [
      "100 prompts trackés",
      "10 concurrents",
      "5 IA suivies",
      "Tracking quotidien · scoring premium",
      "Alertes (email) quand le score chute",
      "Export CSV + API lecture",
      "Support email J+1",
    ],
    ctaLabel: "S'abonner à Pro",
    ctaHref: "/login?next=%2Fapp%2Fsettings%23billing",
  },
];

// Tableau comparatif — 1 ligne par feature, valeur par plan. Valeurs
// `true/false` rendues en check/cross, valeurs string rendues telles
// quelles.
export interface ComparisonRow {
  feature: string;
  solo: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
}

export const COMPARISON_GROUPS: { title: string; rows: ComparisonRow[] }[] = [
  {
    title: "Tracking",
    rows: [
      { feature: "Prompts suivis", solo: "5", starter: "25", pro: "100" },
      { feature: "Concurrents", solo: "3", starter: "5", pro: "10" },
      {
        feature: "LLMs trackés",
        solo: "5 (dont Le Chat)",
        starter: "5 (dont Le Chat)",
        pro: "5 (dont Le Chat)",
      },
      {
        feature: "Fréquence de refresh",
        solo: "Hebdo (lundi)",
        starter: "Quotidien",
        pro: "Quotidien",
      },
    ],
  },
  {
    title: "Reporting",
    rows: [
      { feature: "Dashboard", solo: true, starter: true, pro: true },
      { feature: "Email récap hebdo", solo: true, starter: true, pro: true },
      { feature: "Alertes chute de score", solo: false, starter: false, pro: true },
      { feature: "Export CSV", solo: false, starter: false, pro: true },
      { feature: "API lecture", solo: false, starter: false, pro: true },
    ],
  },
  {
    title: "Compte",
    rows: [
      {
        feature: "Support",
        solo: "Email J+3",
        starter: "Email J+2",
        pro: "Email J+1",
      },
    ],
  },
];

// Calcule le prix mensuel facturé annuellement, arrondi à 2 décimales.
// 9,99 × (1 - 0.2) = 7,99 → 7,99 €/mois. 49 × (1 - 0.2) = 39,2 → 39 €/mois.
export function annualMonthly(monthlyEur: number): number {
  const raw = monthlyEur * (1 - ANNUAL_DISCOUNT_PCT / 100);
  return monthlyEur < 20 ? Math.round(raw * 100) / 100 : Math.round(raw);
}
