// Quotas par plan — source de vérité unique pour les server actions
// qui vérifient avant insert (prompts, competitors) et pour le
// scheduler qui détermine la cadence d'exécution (daily / weekly).
// Aligné sur doc 04 § Pricing + doc 09 § 2026-05-14 (ajout Solo).
//
// `Infinity` représente l'illimité (Agency = prompts illimités).
// `cadence` : "daily" lance les runs chaque jour (Starter+),
//             "weekly" lance les runs uniquement le lundi (Solo).
// Les plans inactifs (trialing, past_due, expired, canceled) sont en
// cadence weekly avec quotas 0 → ne génèrent aucun run.

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
}

const QUOTAS: Record<PlanKey, PlanQuotas> = {
  // Compte créé sans paiement — aucun run lancé tant que pas de subscription.
  // Pivot 2026-05-14 : remplace l'ancien "trial 7j sans carte" (cf. doc 09).
  trialing: {
    brands: 1,
    prompts: 0,
    competitors: 0,
    cadence: "weekly",
    audits: 0,
    comparisonCompetitors: 0,
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
  },
  // Plan d'entrée 9,99 € — 1 run par semaine sur 5 LLMs, marge ~75 % en Phase A
  solo: {
    brands: 1,
    prompts: 5,
    competitors: 3,
    cadence: "weekly",
    audits: 5,
    comparisonCompetitors: 0,
  },
  starter: {
    brands: 1,
    prompts: 25,
    competitors: 5,
    cadence: "daily",
    audits: 30,
    comparisonCompetitors: 3,
  },
  pro: {
    brands: 3,
    prompts: 100,
    competitors: 10,
    cadence: "daily",
    audits: 100,
    comparisonCompetitors: 10,
  },
  agency: {
    brands: 10,
    prompts: 300,
    competitors: Number.POSITIVE_INFINITY,
    cadence: "daily",
    audits: Number.POSITIVE_INFINITY,
    comparisonCompetitors: Number.POSITIVE_INFINITY,
  },
  enterprise: {
    brands: Number.POSITIVE_INFINITY,
    prompts: Number.POSITIVE_INFINITY,
    competitors: Number.POSITIVE_INFINITY,
    cadence: "daily",
    audits: Number.POSITIVE_INFINITY,
    comparisonCompetitors: Number.POSITIVE_INFINITY,
  },
  // États dégradés : lecture seule, pas de runs ni d'audits ni d'ajout brand.
  past_due: {
    brands: 1,
    prompts: 0,
    competitors: 0,
    cadence: "weekly",
    audits: 0,
    comparisonCompetitors: 0,
  },
  expired: {
    brands: 1,
    prompts: 0,
    competitors: 0,
    cadence: "weekly",
    audits: 0,
    comparisonCompetitors: 0,
  },
  canceled: {
    brands: 1,
    prompts: 0,
    competitors: 0,
    cadence: "weekly",
    audits: 0,
    comparisonCompetitors: 0,
  },
};

export function quotasFor(plan: string): PlanQuotas {
  const key = plan as PlanKey;
  return QUOTAS[key] ?? QUOTAS.starter;
}

/** Plans considérés comme actifs (peuvent générer des runs et accéder à l'app). */
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
