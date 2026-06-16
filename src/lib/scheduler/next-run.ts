import type { PlanCadence } from "@/lib/plans/quotas";

// Calcule la date du PROCHAIN run automatique pour afficher un compte à
// rebours au dashboard. Le cron `schedule-runs` tourne chaque jour à
// 06:00 UTC ; l'éligibilité fine est par cadence de plan :
//   - daily  → tous les jours à 06:00 UTC
//   - weekly → uniquement le lundi à 06:00 UTC (Solo + essai gratuit)
// (cf. src/lib/scheduler/cadence-eligibility.ts).

export const RUN_HOUR_UTC = 6;

/** Prochain créneau de run automatique strictement après `now`. */
export function nextScheduledRunAt(cadence: PlanCadence, now: Date): Date {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), RUN_HOUR_UTC, 0, 0, 0),
  );

  if (cadence === "daily") {
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }

  // weekly : avancer jusqu'au prochain lundi (getUTCDay() === 1) futur.
  while (next.getUTCDay() !== 1 || next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}
