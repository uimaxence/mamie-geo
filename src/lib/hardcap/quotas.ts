import { quotasFor, type PlanKey } from "@/lib/plans/quotas";

// Quotas théoriques mensuels pour le hard-cap LLM. Différent des quotas
// produit (prompts max, competitors max) qui limitent ce que le user
// peut CRÉER. Ici on calcule combien de runs un workspace devrait
// produire par mois selon son plan, pour détecter les usages anormaux
// (bot, abus, scraping, fuite token, etc.).
//
// cf. doc 03 § Hard-cap LLM : 200 % du quota théorique → block + email.
//
// Formule : prompts × LLMs × cycles
//   - LLMs = 5 (constante marketing du plan, pas le nb actuel tracké)
//   - cycles = 4 (weekly) ou 30 (daily) selon la cadence du plan

const LLMS_PER_CYCLE = 5;
const WEEKLY_CYCLES_PER_MONTH = 4;
const DAILY_CYCLES_PER_MONTH = 30;

const HARDCAP_RATIO = 2; // 200 % du théorique

/** Quota mensuel théorique de runs pour un plan. Infinity si plan illimité. */
export function getMonthlyTheoreticalRuns(plan: string): number {
  const q = quotasFor(plan);
  if (!Number.isFinite(q.prompts)) return Number.POSITIVE_INFINITY;
  const cyclesPerMonth = q.cadence === "weekly" ? WEEKLY_CYCLES_PER_MONTH : DAILY_CYCLES_PER_MONTH;
  return q.prompts * LLMS_PER_CYCLE * cyclesPerMonth;
}

/** Seuil hard-cap : 200 % du théorique. Infinity si plan illimité. */
export function getHardCapThreshold(plan: string): number {
  const monthly = getMonthlyTheoreticalRuns(plan);
  if (!Number.isFinite(monthly)) return Number.POSITIVE_INFINITY;
  return monthly * HARDCAP_RATIO;
}

/** Plans dont l'usage est compté pour le hard-cap. Trialing/expired = 0/0 donc
 *  ne devraient pas avoir de runs ; mais on les inclut quand même pour catch
 *  les bugs (qui devraient être bloqués au scheduler). */
export function isPlanWithHardcap(plan: string): boolean {
  const monthly = getMonthlyTheoreticalRuns(plan);
  return Number.isFinite(monthly) && monthly > 0;
}

/** Calcule où en est le workspace par rapport à son quota. */
export interface UsageRatio {
  /** Ratio actuel : 0 = 0 runs, 1 = 100% du théorique, 2 = 200% (hard-cap). */
  ratio: number;
  /** Théorique en absolu. */
  theoreticalMonthly: number;
  /** Hard-cap absolu. */
  hardCap: number;
}

export function computeUsageRatio(runsCount: number, plan: string): UsageRatio {
  const theoreticalMonthly = getMonthlyTheoreticalRuns(plan);
  const hardCap = getHardCapThreshold(plan);
  const ratio =
    theoreticalMonthly > 0 && Number.isFinite(theoreticalMonthly)
      ? runsCount / theoreticalMonthly
      : 0;
  return { ratio, theoreticalMonthly, hardCap };
}

export { HARDCAP_RATIO, LLMS_PER_CYCLE };

export type { PlanKey };
