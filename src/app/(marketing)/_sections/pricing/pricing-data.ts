// Source de vérité pour les plans pricing — un seul endroit à toucher
// quand les tarifs bougent. cf. doc 04-pricing-business-model.md +
// CLAUDE.md § 2 (« Pricing : 49 / 149 / 399 € + Enterprise sur devis »).
//
// Discount annuel verrouillé à 20 % (doc 09 § Décisions Sprint 0).

export const ANNUAL_DISCOUNT_PCT = 20;

export type PlanId = "starter" | "pro" | "agency" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  // null = sur devis (Enterprise)
  monthlyEur: number | null;
  // Features mises en avant sur la card (5-7 items max)
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
  audience: string;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour les freelances qui veulent répondre à « et pour ChatGPT ? ».",
    audience: "Freelance SEO solo",
    monthlyEur: 49,
    features: [
      "1 marque trackée",
      "25 prompts générés et suivis",
      "5 LLMs dont Le Chat de Mistral",
      "Refresh hebdomadaire",
      "Dashboard quotidien + email hebdo",
      "5 concurrents comparés",
      "Support email J+2",
    ],
    ctaLabel: "Commencer l'essai 14 j",
    ctaHref: "/login",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour les équipes marketing qui pilotent leur visibilité IA en CODIR.",
    audience: "Marketing PME · plus populaire",
    monthlyEur: 149,
    popular: true,
    features: [
      "5 marques trackées",
      "100 prompts générés et suivis",
      "5 LLMs dont Le Chat de Mistral",
      "Refresh quotidien",
      "Alertes (Slack + email) quand le score chute",
      "10 concurrents comparés",
      "Export CSV + API lecture",
      "Support email J+1",
    ],
    ctaLabel: "Commencer l'essai 14 j",
    ctaHref: "/login",
  },
  {
    id: "agency",
    name: "Agence",
    tagline: "Pour les agences SEO/Marketing qui revendent du suivi IA en marque blanche.",
    audience: "Agence SEO/Marketing",
    monthlyEur: 399,
    features: [
      "25 marques trackées",
      "Prompts illimités",
      "5 LLMs dont Le Chat de Mistral",
      "Refresh quotidien",
      "Rapports PDF en marque blanche (ton logo)",
      "Concurrents illimités",
      "5 sièges utilisateurs inclus",
      "Support chat + email J",
    ],
    ctaLabel: "Commencer l'essai 14 j",
    ctaHref: "/login",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Pour les grands comptes avec besoins SSO, SLA, account manager.",
    audience: "Sur devis",
    monthlyEur: null,
    features: [
      "Tout illimité (marques, prompts, sièges)",
      "SSO SAML + provisioning SCIM",
      "SLA 99,9 % avec engagement contractuel",
      "Account manager dédié",
      "Audit RGPD + DPA signé",
      "Onboarding personnalisé",
    ],
    ctaLabel: "Contacter les ventes",
    ctaHref: "mailto:hello@mamie-geo.fr?subject=Mamie%20GEO%20Enterprise",
  },
];

// Tableau comparatif — 1 ligne par feature, valeur par plan. Valeurs
// `true/false` rendues en check/cross, valeurs string rendues telles
// quelles.
export interface ComparisonRow {
  feature: string;
  starter: string | boolean;
  pro: string | boolean;
  agency: string | boolean;
  enterprise: string | boolean;
}

export const COMPARISON_GROUPS: { title: string; rows: ComparisonRow[] }[] = [
  {
    title: "Tracking",
    rows: [
      { feature: "Marques trackées", starter: "1", pro: "5", agency: "25", enterprise: "Illimité" },
      {
        feature: "Prompts suivis",
        starter: "25",
        pro: "100",
        agency: "Illimité",
        enterprise: "Illimité",
      },
      {
        feature: "LLMs trackés",
        starter: "5 (dont Le Chat)",
        pro: "5 (dont Le Chat)",
        agency: "5 (dont Le Chat)",
        enterprise: "5 + LLMs custom",
      },
      {
        feature: "Fréquence de refresh",
        starter: "Hebdo",
        pro: "Quotidien",
        agency: "Quotidien",
        enterprise: "Quotidien + on-demand",
      },
      {
        feature: "Concurrents comparés",
        starter: "5",
        pro: "10",
        agency: "Illimité",
        enterprise: "Illimité",
      },
    ],
  },
  {
    title: "Reporting",
    rows: [
      {
        feature: "Dashboard quotidien",
        starter: true,
        pro: true,
        agency: true,
        enterprise: true,
      },
      {
        feature: "Email hebdo automatique",
        starter: true,
        pro: true,
        agency: true,
        enterprise: true,
      },
      {
        feature: "Alertes (chute de score)",
        starter: false,
        pro: true,
        agency: true,
        enterprise: true,
      },
      {
        feature: "Rapports PDF marque blanche",
        starter: false,
        pro: false,
        agency: true,
        enterprise: true,
      },
      { feature: "Export CSV", starter: false, pro: true, agency: true, enterprise: true },
      { feature: "API lecture", starter: false, pro: true, agency: true, enterprise: true },
    ],
  },
  {
    title: "Compte",
    rows: [
      {
        feature: "Utilisateurs inclus",
        starter: "1",
        pro: "3",
        agency: "5",
        enterprise: "Illimité",
      },
      { feature: "SSO SAML", starter: false, pro: false, agency: false, enterprise: true },
      {
        feature: "Audit RGPD + DPA signé",
        starter: false,
        pro: false,
        agency: true,
        enterprise: true,
      },
      {
        feature: "Support",
        starter: "Email J+2",
        pro: "Email J+1",
        agency: "Chat + email J",
        enterprise: "Account manager",
      },
    ],
  },
];

// Calcule le prix mensuel facturé annuellement, arrondi à l'euro.
// 49 × (1 - 0.2) = 39.2 → 39 €/mois.
export function annualMonthly(monthlyEur: number): number {
  return Math.round(monthlyEur * (1 - ANNUAL_DISCOUNT_PCT / 100));
}
