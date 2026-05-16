import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { auditCounters } from "@/db/schema";
import { quotasFor, type PlanKey } from "@/lib/plans/quotas";

// Compteur mensuel des audits par workspace. Fenêtre = mois calendaire
// UTC (1ʳᵉ du mois). Distingue les audits "owned" (brand + URLs internes)
// des audits "concurrents" — quotas séparés pour ne pas qu'un batch
// concurrents consomme tout le quota mensuel.
//
// cf. doc 09 § 2026-05-17 — Sprint 6 PR B « audit-app Premium ».

export function startOfCurrentMonthUtc(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export interface AuditUsage {
  periodStart: string;
  auditsCount: number;
  competitorAuditsCount: number;
  /** Quota max owned audits du plan (Infinity si illimité). */
  maxAudits: number;
  /** Quota max comparaison concurrents (0 = feature désactivée). */
  maxComparisonCompetitors: number;
}

/** Lit l'état courant du compteur (créé à 0 si inexistant). */
export async function getAuditUsage(workspaceId: string, plan: string): Promise<AuditUsage> {
  const periodStart = startOfCurrentMonthUtc();
  const row = await db.query.auditCounters.findFirst({
    where: and(
      eq(auditCounters.workspaceId, workspaceId),
      eq(auditCounters.periodStart, periodStart),
    ),
  });
  const q = quotasFor(plan as PlanKey);
  return {
    periodStart,
    auditsCount: row?.auditsCount ?? 0,
    competitorAuditsCount: row?.competitorAuditsCount ?? 0,
    maxAudits: q.audits,
    maxComparisonCompetitors: q.comparisonCompetitors,
  };
}

export type IncrementAuditResult =
  | { ok: true; auditsCount: number; competitorAuditsCount: number }
  | { ok: false; error: "quota_reached"; current: number; max: number };

/**
 * Incrémente atomiquement le compteur d'audits du mois. Vérifie le quota
 * avant l'incrément — si dépassé, retourne `quota_reached`.
 *
 * Atomic via INSERT...ON CONFLICT DO UPDATE — pas de race condition entre
 * la lecture du quota et l'incrément. Plan illimité (Infinity) : skip
 * la vérification quota.
 */
export async function incrementAuditCounter(args: {
  workspaceId: string;
  plan: string;
  isCompetitor: boolean;
}): Promise<IncrementAuditResult> {
  const { workspaceId, plan, isCompetitor } = args;
  const periodStart = startOfCurrentMonthUtc();
  const q = quotasFor(plan as PlanKey);

  // Plan inactif (audits: 0) → toujours quota_reached pour les audits owned.
  // Pour les compétiteurs : on bloque si `comparisonCompetitors = 0` (Solo).
  const max = isCompetitor ? q.comparisonCompetitors : q.audits;
  if (max === 0) {
    const current = isCompetitor ? 0 : 0;
    return { ok: false, error: "quota_reached", current, max };
  }

  // Pré-check si quota fini : on lit l'état courant pour donner une erreur
  // claire avant le UPSERT. Race condition possible mais marginale (2 audits
  // simultanés au dernier slot — acceptable pour un user qui spam un bouton).
  if (Number.isFinite(max)) {
    const usage = await getAuditUsage(workspaceId, plan);
    const current = isCompetitor ? usage.competitorAuditsCount : usage.auditsCount;
    if (current >= max) {
      return { ok: false, error: "quota_reached", current, max };
    }
  }

  // UPSERT atomique. Crée la ligne avec compteur à 1 si elle n'existe pas,
  // sinon increment du bon champ. Deux requêtes distinctes pour rester
  // lisible (vs interpolation conditionnelle des noms de colonnes).
  if (isCompetitor) {
    await db.execute(sql`
      INSERT INTO audit_counters (workspace_id, period_start, audits_count, competitor_audits_count)
      VALUES (${workspaceId}, ${periodStart}, 0, 1)
      ON CONFLICT (workspace_id, period_start)
      DO UPDATE SET competitor_audits_count = audit_counters.competitor_audits_count + 1
    `);
  } else {
    await db.execute(sql`
      INSERT INTO audit_counters (workspace_id, period_start, audits_count, competitor_audits_count)
      VALUES (${workspaceId}, ${periodStart}, 1, 0)
      ON CONFLICT (workspace_id, period_start)
      DO UPDATE SET audits_count = audit_counters.audits_count + 1
    `);
  }

  const updated = await getAuditUsage(workspaceId, plan);
  return {
    ok: true,
    auditsCount: updated.auditsCount,
    competitorAuditsCount: updated.competitorAuditsCount,
  };
}
