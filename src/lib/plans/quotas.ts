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
  prompts: number; // Infinity si illimité
  competitors: number;
  cadence: PlanCadence;
}

const QUOTAS: Record<PlanKey, PlanQuotas> = {
  // Compte créé sans paiement — aucun run lancé tant que pas de subscription.
  // Pivot 2026-05-14 : remplace l'ancien "trial 7j sans carte" (cf. doc 09).
  trialing: { prompts: 0, competitors: 0, cadence: "weekly" },
  // Plan d'entrée 9,99 € — 1 run par semaine sur 5 LLMs, marge ~75 % en Phase A
  solo: { prompts: 5, competitors: 3, cadence: "weekly" },
  starter: { prompts: 25, competitors: 5, cadence: "daily" },
  pro: { prompts: 100, competitors: 10, cadence: "daily" },
  agency: {
    prompts: 300,
    competitors: Number.POSITIVE_INFINITY,
    cadence: "daily",
  },
  enterprise: {
    prompts: Number.POSITIVE_INFINITY,
    competitors: Number.POSITIVE_INFINITY,
    cadence: "daily",
  },
  // États dégradés : lecture seule, pas de runs.
  past_due: { prompts: 0, competitors: 0, cadence: "weekly" },
  expired: { prompts: 0, competitors: 0, cadence: "weekly" },
  canceled: { prompts: 0, competitors: 0, cadence: "weekly" },
};

export function quotasFor(plan: string): PlanQuotas {
  const key = plan as PlanKey;
  return QUOTAS[key] ?? QUOTAS.starter;
}

/** Plans considérés comme actifs (peuvent générer des runs et accéder à l'app). */
export const ACTIVE_PLANS: readonly PlanKey[] = [
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
  resource: "prompts" | "competitors";
  current: number;
  max: number; // Number si fini, "illimité" jamais (pas de quota_reached si illimité)
  plan: PlanKey;
}

export function quotaReached(
  resource: "prompts" | "competitors",
  current: number,
  max: number,
  plan: PlanKey,
): QuotaReachedError {
  return { ok: false, error: "quota_reached", resource, current, max, plan };
}
