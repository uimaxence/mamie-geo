"use server";

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { competitors, technicalAudits } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { incrementAuditCounter } from "@/lib/audits/counters";
import { runAudit } from "@/lib/audit/run";
import { enqueue } from "@/lib/queue";
import { quotaReached, quotasFor, type PlanKey, type QuotaReachedError } from "@/lib/plans/quotas";

// Server actions /app/audits — Sprint 6 PR B (cf. doc 09 § 2026-05-17).
//
// runWorkspaceAudit : on-demand synchrone (~5-15s) sur 1 URL.
// runCompetitorsBatch : enqueue N jobs `audit_workspace_url` async pour
//   les concurrents de la brand. Réservé Starter+ (Solo = 0 comparaison).
// listAudits / getAuditDetail / deleteAudit : helpers UI.

export interface ActionOk {
  ok: true;
  id?: string;
}
export interface ActionError {
  ok: false;
  error: string;
  details?: Record<string, unknown>;
}
export type ActionResult = ActionOk | ActionError | QuotaReachedError;

async function getCtxOrError() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Non authentifié" as const };
  const ctx = await getUserContext(session.user.id);
  if (!ctx) return { error: "Aucun workspace" as const };
  return { ctx };
}

const runAuditSchema = z.object({
  url: z.string().url("URL invalide"),
  isCompetitor: z.boolean().default(false),
});

export type RunWorkspaceAuditInput = z.input<typeof runAuditSchema>;

/**
 * Lance un audit synchrone sur une URL et persiste le résultat. Bloque
 * dans la limite Vercel functions (60s) ; `runAudit` prend typiquement
 * 5-15s donc on est large. Pour les batchs, utiliser `runCompetitorsBatch`
 * qui enqueue des jobs async.
 *
 * - Vérifie le quota mensuel (audits ou competitorAudits selon `isCompetitor`)
 * - Incrémente le compteur AVANT de lancer le run (idempotence côté UI)
 * - Persiste dans `technical_audits` (workspaceId, brandId, scoreGlobal…)
 */
export async function runWorkspaceAudit(raw: RunWorkspaceAuditInput): Promise<ActionResult> {
  const { error, ctx } = await getCtxOrError();
  if (error) return { ok: false, error };

  const parsed = runAuditSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const { url, isCompetitor } = parsed.data;

  // Quota check + increment atomique. Si quota_reached, on stoppe avant
  // d'appeler runAudit() (économie de fetch + PSI).
  const increment = await incrementAuditCounter({
    workspaceId: ctx.workspace.id,
    plan: ctx.workspace.plan,
    isCompetitor,
  });
  if (!increment.ok) {
    return quotaReached(
      isCompetitor ? "comparison_competitors" : "audits",
      increment.current,
      increment.max,
      ctx.workspace.plan as PlanKey,
    );
  }

  const result = await runAudit(url);
  if (!result.ok) {
    // L'incrément a déjà eu lieu : on choisit de le laisser (le user a
    // consommé une "tentative", même ratée). Évite d'inciter à spammer
    // des URLs invalides pour grappiller du quota.
    return { ok: false, error: `Audit échoué : ${result.code} — ${result.message}` };
  }

  const report = result.report;
  const inserted = await db
    .insert(technicalAudits)
    .values({
      workspaceId: ctx.workspace.id,
      brandId: isCompetitor ? null : ctx.brand.id,
      url,
      isCompetitor,
      scoreGlobal: report.scoreGlobal,
      subScores: report.subScores,
      checks: report.checks,
      htmlSizeKb: String(report.htmlSizeKb),
      httpStatus: report.httpStatus,
      psiUnavailable: report.psiUnavailable,
      fetchedAt: new Date(report.fetchedAt),
    })
    .returning({ id: technicalAudits.id });

  revalidatePath("/app/audits");
  return { ok: true, id: inserted[0]?.id };
}

/**
 * Enqueue 1 audit_workspace_url par concurrent. Pas de fan-out synchrone
 * (un batch de 10 concurrents = 50-150s = dépasse Vercel functions 60s).
 *
 * Quota : compteur séparé `competitorAuditsCount` consommé 1 fois par
 * concurrent enqueué. Réservé aux plans avec `comparisonCompetitors > 0`.
 */
export async function runCompetitorsBatch(): Promise<ActionResult> {
  const { error, ctx } = await getCtxOrError();
  if (error) return { ok: false, error };

  const quotas = quotasFor(ctx.workspace.plan as PlanKey);
  if (quotas.comparisonCompetitors === 0) {
    return {
      ok: false,
      error: `Comparaison concurrents non disponible sur ${ctx.workspace.plan}. Passe en Starter ou plus.`,
    };
  }

  // Liste des concurrents avec domaine défini (pas de domain = pas auditable).
  const rows = await db
    .select({ id: competitors.id, name: competitors.name, domain: competitors.domain })
    .from(competitors)
    .where(eq(competitors.brandId, ctx.brand.id));
  const auditable = rows.filter((r): r is { id: string; name: string; domain: string } => {
    return typeof r.domain === "string" && r.domain.length > 0;
  });
  if (auditable.length === 0) {
    return {
      ok: false,
      error: "Aucun concurrent avec domaine renseigné. Ajoute des domaines dans /app/competitors.",
    };
  }

  const limit = Number.isFinite(quotas.comparisonCompetitors)
    ? Math.min(quotas.comparisonCompetitors, auditable.length)
    : auditable.length;
  const targets = auditable.slice(0, limit);

  let enqueued = 0;
  for (const c of targets) {
    const increment = await incrementAuditCounter({
      workspaceId: ctx.workspace.id,
      plan: ctx.workspace.plan,
      isCompetitor: true,
    });
    if (!increment.ok) break; // quota concurrent atteint, on stoppe
    const url = c.domain.startsWith("http") ? c.domain : `https://${c.domain}`;
    await enqueue({
      kind: "audit_workspace_url",
      payload: {
        workspaceId: ctx.workspace.id,
        brandId: null,
        url,
        isCompetitor: true,
        notifyOnDrop: false,
      },
    });
    enqueued += 1;
  }

  if (enqueued === 0) {
    return { ok: false, error: "Quota concurrents atteint" };
  }
  revalidatePath("/app/audits/compare");
  return { ok: true };
}

export async function deleteAudit(auditId: string): Promise<ActionResult> {
  const { error, ctx } = await getCtxOrError();
  if (error) return { ok: false, error };

  const owned = await db
    .select({ id: technicalAudits.id })
    .from(technicalAudits)
    .where(and(eq(technicalAudits.id, auditId), eq(technicalAudits.workspaceId, ctx.workspace.id)))
    .limit(1);
  if (owned.length === 0) {
    return { ok: false, error: "Audit introuvable" };
  }

  await db.delete(technicalAudits).where(eq(technicalAudits.id, auditId));
  revalidatePath("/app/audits");
  return { ok: true };
}

// ─── Read helpers (utilisés par les pages app) ───────────────────────

export interface AuditListItem {
  url: string;
  isCompetitor: boolean;
  /** Audit le plus récent sur cette URL (pour cette workspace). */
  latestId: string;
  latestScore: number;
  latestFetchedAt: Date;
  /** Audit précédent pour calculer le delta — null si premier audit. */
  previousScore: number | null;
  /** Nb total d'audits historiques sur cette URL (badge "5 audits"). */
  historyCount: number;
}

/** Liste groupée par URL, audit le plus récent en tête. */
export async function listAudits(workspaceId: string): Promise<AuditListItem[]> {
  const rows = await db
    .select({
      id: technicalAudits.id,
      url: technicalAudits.url,
      isCompetitor: technicalAudits.isCompetitor,
      scoreGlobal: technicalAudits.scoreGlobal,
      fetchedAt: technicalAudits.fetchedAt,
    })
    .from(technicalAudits)
    .where(eq(technicalAudits.workspaceId, workspaceId))
    .orderBy(desc(technicalAudits.createdAt));

  // Regroupement client-side (volumes V0 modestes ; passer en SQL window
  // function quand on dépassera 1000 audits / workspace).
  const byUrl = new Map<string, AuditListItem>();
  for (const row of rows) {
    const existing = byUrl.get(row.url);
    if (!existing) {
      byUrl.set(row.url, {
        url: row.url,
        isCompetitor: row.isCompetitor,
        latestId: row.id,
        latestScore: row.scoreGlobal,
        latestFetchedAt: row.fetchedAt,
        previousScore: null,
        historyCount: 1,
      });
      continue;
    }
    existing.historyCount += 1;
    if (existing.previousScore === null) {
      existing.previousScore = row.scoreGlobal;
    }
  }
  return Array.from(byUrl.values()).sort(
    (a, b) => b.latestFetchedAt.getTime() - a.latestFetchedAt.getTime(),
  );
}

/** Détail d'un audit avec ownership check workspace. */
export async function getAuditDetail(workspaceId: string, auditId: string) {
  const row = await db.query.technicalAudits.findFirst({
    where: and(eq(technicalAudits.id, auditId), eq(technicalAudits.workspaceId, workspaceId)),
  });
  return row ?? null;
}
