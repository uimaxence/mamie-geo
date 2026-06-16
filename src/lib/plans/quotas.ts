// Quotas par plan — source de vérité unique pour les server actions
// qui vérifient avant insert (prompts, competitors) et pour le
// scheduler qui détermine la cadence d'exécution (daily / weekly).
// Aligné sur doc 04 § Pricing + doc 09 § 2026-05-14 (ajout Solo).
//
// `Infinity` représente l'illimité (Agency = prompts illimités).
// `cadence` : "daily" lance les runs chaque jour (Starter+),
//             "weekly" lance les runs uniquement le lundi (Solo).
//
// `trialing` = essai gratuit 14 jours par défaut SUR LE PLAN SOLO, SANS
// carte (revirement 2026-06-16, cf. doc 09 — remplace l'ancien trialing
// 0/0 qui rendait l'app inutilisable pendant l'essai). Il a donc les
// quotas Solo et est « schedulable » (génère des runs, cf.
// SCHEDULABLE_PLANS), mais n'est PAS dans ACTIVE_PLANS au sens
// facturation (pas d'abonnement Stripe → pas de portail). À l'expiration
// des 14 j → `expired`.
// past_due/expired/canceled restent en quotas 0 (lecture seule).

export type PlanKey =
  | "trialing"
  | "beta"
  | "solo"
  | "starter"
  | "pro"
  | "agency"
  | "enterprise"
  | "past_due"
  | "expired"
  | "canceled";

export type PlanCadence = "daily" | "weekly";

export interface PlanQuotas {
  /** Nombre max de marques (brands) trackées par workspace.
   *  Doc 03 standard : Solo/Starter 1, Pro 3, Agency 10, Enterprise illimité.
   *  Trialing et états dégradés : 1 (la brand créée à l'onboarding reste,
   *  mais pas d'ajout possible). */
  brands: number;
  prompts: number; // Infinity si illimité
  competitors: number;
  cadence: PlanCadence;
  /** Audits techniques "owned" (brand + URLs internes) par mois calendaire.
   *  Sprint 6 PR B (cf. doc 09 § 2026-05-17). */
  audits: number;
  /** Nombre max de concurrents auditables en batch (page compare).
   *  0 = feature désactivée (Solo). */
  comparisonCompetitors: number;
  /** Attribution du trafic IA (pixel cookieless) — V1, cf. doc 09 § 2026-06-15.
   *  Inclus dès Solo (preuve de valeur, coût ≈ nul). false pour les états
   *  dégradés : la clé du pixel existe toujours mais l'ingestion drop. */
  aiTrafficTracking: boolean;
}

const QUOTAS: Record<PlanKey, PlanQuotas> = {
  // Essai gratuit 14 j par défaut, calé sur Solo (2026-06-16, cf. doc 09).
  // Mêmes quotas que Solo pour que l'essai soit réellement utilisable (avant :
  // 0/0 → l'utilisateur ne pouvait même pas ajouter de prompt).
  trialing: {
    brands: 1,
    prompts: 5,
    competitors: 3,
    cadence: "weekly",
    audits: 5,
    comparisonCompetitors: 0,
    aiTrafficTracking: true,
  },
  // Accès gratuit offert aux beta-testeurs (octroi manuel admin, durée 3 mois).
  // Cadence weekly + prompts plafonnés pour maîtriser le coût LLM
  // (~10 $/mois/testeur). Tous les LLMs configurés sont accessibles.
  beta: {
    brands: 1,
    prompts: 15,
    competitors: 5,
    cadence: "weekly",
    audits: 5,
    comparisonCompetitors: 3,
    aiTrafficTracking: true,
  },
  // Plan d'entrée 9,99 € — 1 run par semaine sur 5 LLMs, marge ~75 % en Phase A
  solo: {
    brands: 1,
    prompts: 5,
    competitors: 3,
    cadence: "weekly",
    audits: 5,
    comparisonCompetitors: 0,
    aiTrafficTracking: true,
  },
  starter: {
    brands: 1,
    prompts: 25,
    competitors: 5,
    cadence: "daily",
    audits: 30,
    comparisonCompetitors: 3,
    aiTrafficTracking: true,
  },
  pro: {
    brands: 3,
    prompts: 100,
    competitors: 10,
    cadence: "daily",
    audits: 100,
    comparisonCompetitors: 10,
    aiTrafficTracking: true,
  },
  agency: {
    brands: 10,
    prompts: 300,
    competitors: Number.POSITIVE_INFINITY,
    cadence: "daily",
    audits: Number.POSITIVE_INFINITY,
    comparisonCompetitors: Number.POSITIVE_INFINITY,
    aiTrafficTracking: true,
  },
  enterprise: {
    brands: Number.POSITIVE_INFINITY,
    prompts: Number.POSITIVE_INFINITY,
    competitors: Number.POSITIVE_INFINITY,
    cadence: "daily",
    audits: Number.POSITIVE_INFINITY,
    comparisonCompetitors: Number.POSITIVE_INFINITY,
    aiTrafficTracking: true,
  },
  // États dégradés : lecture seule, pas de runs ni d'audits ni d'ajout brand.
  past_due: {
    brands: 1,
    prompts: 0,
    competitors: 0,
    cadence: "weekly",
    audits: 0,
    comparisonCompetitors: 0,
    aiTrafficTracking: false,
  },
  expired: {
    brands: 1,
    prompts: 0,
    competitors: 0,
    cadence: "weekly",
    audits: 0,
    comparisonCompetitors: 0,
    aiTrafficTracking: false,
  },
  canceled: {
    brands: 1,
    prompts: 0,
    competitors: 0,
    cadence: "weekly",
    audits: 0,
    comparisonCompetitors: 0,
    aiTrafficTracking: false,
  },
};

export function quotasFor(plan: string): PlanQuotas {
  const key = plan as PlanKey;
  return QUOTAS[key] ?? QUOTAS.starter;
}

/** Plans « actifs » au sens FACTURATION : abonnement Stripe en cours ou accès
 *  beta offert. Pilote la section facturation (carte « Gérer mon abonnement »
 *  → portail Stripe). `trialing` n'en fait PAS partie : essai sans carte, pas
 *  d'abonnement à gérer. */
export const ACTIVE_PLANS: readonly PlanKey[] = [
  "beta",
  "solo",
  "starter",
  "pro",
  "agency",
  "enterprise",
] as const;

export function isActivePlan(plan: string): boolean {
  return (ACTIVE_PLANS as readonly string[]).includes(plan);
}

/** Plans qui GÉNÈRENT des runs/audits (scheduler). = plans actifs + l'essai
 *  gratuit `trialing` (calé sur Solo depuis 2026-06-16). Distinct de
 *  ACTIVE_PLANS car l'essai tourne sans abonnement Stripe. */
export const SCHEDULABLE_PLANS: readonly PlanKey[] = [...ACTIVE_PLANS, "trialing"] as const;

export function isSchedulablePlan(plan: string): boolean {
  return (SCHEDULABLE_PLANS as readonly string[]).includes(plan);
}

/** Libellé FR d'un plan/statut, pour tout affichage utilisateur. « trialing »
 *  brut était incompréhensible (« trailing ? ») — uniformisé 2026-06-16. */
const PLAN_LABELS: Record<string, string> = {
  trialing: "Essai gratuit",
  beta: "Bêta",
  solo: "Solo",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
  enterprise: "Enterprise",
  past_due: "Paiement en retard",
  expired: "Expiré",
  canceled: "Annulé",
};

export function planLabel(plan: string): string {
  return PLAN_LABELS[plan] ?? plan.charAt(0).toUpperCase() + plan.slice(1);
}

/** Erreur typée renvoyée par les server actions quand le quota est atteint. */
export interface QuotaReachedError {
  ok: false;
  error: "quota_reached";
  resource: "brands" | "prompts" | "competitors" | "audits" | "comparison_competitors";
  current: number;
  max: number; // Number si fini, "illimité" jamais (pas de quota_reached si illimité)
  plan: PlanKey;
}

export function quotaReached(
  resource: QuotaReachedError["resource"],
  current: number,
  max: number,
  plan: PlanKey,
): QuotaReachedError {
  return { ok: false, error: "quota_reached", resource, current, max, plan };
}
