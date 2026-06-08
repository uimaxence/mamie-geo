import type { PromptCadence } from "@/db/schema";
import type { PlanCadence } from "@/lib/plans/quotas";

// Pure logic : étant donné le jour calendaire, dit si un prompt doit
// tourner aujourd'hui. Pour V0+ per-prompt cadence (cf. doc 02 § V0+).
//
// Règles :
//   - `daily`   → tous les jours
//   - `weekly`  → uniquement le lundi UTC (jour 1 du week JS)
//   - `monthly` → uniquement le 1er du mois UTC
//   - `inherit` → applique la cadence du plan (mêmes règles que ci-dessus
//                 mais avec `daily` / `weekly` venant de quotasFor(plan).cadence)
//
// Pas d'I/O, pas de DB. Le scheduler appelle cette fonction par row.

export interface CadenceContext {
  /** Date UTC pour laquelle on évalue (typiquement now()). */
  now: Date;
  /** Cadence stockée sur prompts.cadence. */
  promptCadence: PromptCadence;
  /** Cadence du plan du workspace, utilisée si promptCadence === 'inherit'. */
  planCadence: PlanCadence;
}

export function isPromptEligibleToday(ctx: CadenceContext): boolean {
  const effective: "daily" | "weekly" | "monthly" =
    ctx.promptCadence === "inherit" ? ctx.planCadence : ctx.promptCadence;

  if (effective === "daily") return true;
  if (effective === "weekly") return ctx.now.getUTCDay() === 1;
  if (effective === "monthly") return ctx.now.getUTCDate() === 1;
  return false;
}

/**
 * Label humain pour l'UI. Sert dans le picker prompt-form et la liste
 * prompts. Distingue `inherit` (héritage du plan) des cadences explicites.
 */
export function cadenceLabel(cadence: PromptCadence, planCadence?: PlanCadence): string {
  switch (cadence) {
    case "daily":
      return "Quotidien";
    case "weekly":
      return "Hebdomadaire (lundis)";
    case "monthly":
      return "Mensuel (1er du mois)";
    case "inherit":
      return planCadence
        ? `Hérite du plan (${planCadence === "daily" ? "quotidien" : "hebdomadaire"})`
        : "Hérite du plan";
  }
}
