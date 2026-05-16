import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { usageCounters, user, workspaceMembers, workspaces } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { sendTransactional } from "@/lib/email";
import { renderUsageWarning } from "@/lib/email/templates/usage-warning";
import { env } from "@/lib/env";
import { computeUsageRatio, isPlanWithHardcap } from "./quotas";

// Hard-cap check appelé en début de chaque `executePrompt`. Bloque si
// usage > 200 % du théorique mensuel. Envoie des warnings à 60 % et
// 100 % (idempotents via `usage_counters.warnedAt60pct/warnedAt100pct`).
//
// cf. doc 03 § Hard-cap LLM 200 % + doc 09 § Sprint 4 hard-cap enforcement.

const APP_URL = env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr";
const SETTINGS_URL = `${APP_URL}/app/settings#billing`;
const CONTACT_EMAIL = env.ADMIN_ALERT_EMAIL ?? "hello@mamie-geo.fr";

export interface HardcapCheckResult {
  blocked: boolean;
  /** Reason humainement lisible pour log + run.error. */
  reason: string;
  /** Ratio runs/théorique au moment du check. */
  ratio: number;
}

function startOfCurrentMonth(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/**
 * Vérifie le quota du workspace avant l'exécution d'un run.
 * - Si `workspaces.hardCapHitAt` déjà posé → blocked immédiatement (le reset
 *   se fait via webhook Stripe `invoice.paid` qui clear le champ).
 * - Sinon lit usage_counters de la période, calcule le ratio, applique :
 *     ≥ 200 % → block + email user + email admin + pose hardCapHitAt
 *     ≥ 100 % (1ʳᵉ fois) → email user (warnedAt100pct posé)
 *     ≥ 60 %  (1ʳᵉ fois) → email user (warnedAt60pct posé)
 *
 * Plans enterprise (Infinity) et plans inactifs (trialing/expired/0)
 * passent toujours (le scheduler les filtre déjà).
 */
export async function checkQuotaBeforeRun(workspaceId: string): Promise<HardcapCheckResult> {
  const wsRow = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });
  if (!wsRow) {
    return { blocked: true, reason: "Workspace introuvable", ratio: 0 };
  }

  // Si déjà hard-cap hit (par un check précédent), on bloque sans relire usage.
  if (wsRow.hardCapHitAt) {
    return {
      blocked: true,
      reason: `Hard-cap déjà actif depuis ${wsRow.hardCapHitAt.toISOString()}`,
      ratio: 2,
    };
  }

  // Plans sans hard-cap (enterprise, trialing/expired/0) : pas de check.
  if (!isPlanWithHardcap(wsRow.plan)) {
    return { blocked: false, reason: "Plan sans hard-cap", ratio: 0 };
  }

  const periodStart = startOfCurrentMonth();
  const counter = await db.query.usageCounters.findFirst({
    where: and(
      eq(usageCounters.workspaceId, workspaceId),
      eq(usageCounters.periodStart, periodStart),
    ),
  });

  const runsCount = counter?.runsCount ?? 0;
  const { ratio, theoreticalMonthly, hardCap } = computeUsageRatio(runsCount, wsRow.plan);

  // ── 200 % : hard-cap hit ──────────────────────────────────────────
  if (ratio >= 2) {
    await applyHardcap({
      workspaceId,
      plan: wsRow.plan,
      workspaceName: wsRow.name,
      runsCount,
      theoreticalMonthly,
      hardCap,
      periodStart,
    });
    return {
      blocked: true,
      reason: `Hard-cap atteint : ${runsCount} runs (théorique ${theoreticalMonthly}, cap ${hardCap})`,
      ratio,
    };
  }

  // ── 100 % : warning idempotent ────────────────────────────────────
  if (ratio >= 1 && !counter?.warnedAt100pct) {
    await sendThresholdEmail({
      level: "warn-100",
      workspaceId,
      plan: wsRow.plan,
      workspaceName: wsRow.name,
      runsCount,
      theoreticalMonthly,
      hardCap,
      periodStart,
      counterField: "warnedAt100pct",
    });
  }

  // ── 60 % : warning idempotent ─────────────────────────────────────
  if (ratio >= 0.6 && ratio < 1 && !counter?.warnedAt60pct) {
    await sendThresholdEmail({
      level: "warn-60",
      workspaceId,
      plan: wsRow.plan,
      workspaceName: wsRow.name,
      runsCount,
      theoreticalMonthly,
      hardCap,
      periodStart,
      counterField: "warnedAt60pct",
    });
  }

  return { blocked: false, reason: "OK", ratio };
}

// ─── Internals ──────────────────────────────────────────────────────

interface ApplyHardcapArgs {
  workspaceId: string;
  plan: string;
  workspaceName: string;
  runsCount: number;
  theoreticalMonthly: number;
  hardCap: number;
  periodStart: string;
}

async function applyHardcap(args: ApplyHardcapArgs): Promise<void> {
  const now = new Date();

  // 1. Pose hardCapHitAt sur le workspace (le scheduler filtre déjà dessus,
  //    donc plus aucun nouveau run ne sera enqueued).
  await db
    .update(workspaces)
    .set({ hardCapHitAt: now, updatedAt: now })
    .where(eq(workspaces.id, args.workspaceId));

  // 2. Pose hardcapHitAt sur usage_counters pour audit historique.
  await db
    .update(usageCounters)
    .set({ hardcapHitAt: now })
    .where(
      and(
        eq(usageCounters.workspaceId, args.workspaceId),
        eq(usageCounters.periodStart, args.periodStart),
      ),
    );

  // 3. Récupère l'email owner pour l'alerte (best effort).
  const ownerEmail = await findOwnerEmail(args.workspaceId);

  logCronEvent({
    level: "warn",
    event: "hardcap_hit",
    workspaceId: args.workspaceId,
    plan: args.plan,
    runsCount: args.runsCount,
    hardCap: args.hardCap,
    ownerEmail,
  });

  const rendered = renderUsageWarning("hardcap", {
    workspaceName: args.workspaceName,
    plan: args.plan,
    runsCount: args.runsCount,
    theoreticalMonthly: args.theoreticalMonthly,
    hardCap: args.hardCap,
    settingsUrl: SETTINGS_URL,
    contactEmail: CONTACT_EMAIL,
  });

  // 4. Email user (best effort, n'échoue pas si Brevo down).
  if (ownerEmail) {
    try {
      await sendTransactional({
        to: ownerEmail,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
    } catch (error) {
      logCronEvent({
        level: "error",
        event: "hardcap_email_user_failed",
        workspaceId: args.workspaceId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // 5. Email admin (always, indépendamment).
  try {
    await sendTransactional({
      to: CONTACT_EMAIL,
      subject: `[ALERT] Hard-cap atteint sur workspace ${args.workspaceName}`,
      text: `Hard-cap atteint :
- Workspace : ${args.workspaceName} (${args.workspaceId})
- Plan : ${args.plan}
- Runs : ${args.runsCount} / théorique ${args.theoreticalMonthly} / cap ${args.hardCap}
- Owner : ${ownerEmail ?? "inconnu"}
- Période : ${args.periodStart}

À investiguer : usage légitime intense (upgrade plan) ou bot/fuite token (suspendre).`,
    });
  } catch (error) {
    logCronEvent({
      level: "error",
      event: "hardcap_email_admin_failed",
      workspaceId: args.workspaceId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

interface ThresholdEmailArgs extends ApplyHardcapArgs {
  level: "warn-60" | "warn-100";
  counterField: "warnedAt60pct" | "warnedAt100pct";
}

async function sendThresholdEmail(args: ThresholdEmailArgs): Promise<void> {
  const ownerEmail = await findOwnerEmail(args.workspaceId);
  const now = new Date();

  // Poser le timestamp d'idempotence AVANT l'envoi pour éviter les
  // doubles emails en cas de race (deux execute-prompts simultanés).
  await db
    .update(usageCounters)
    .set({ [args.counterField]: now })
    .where(
      and(
        eq(usageCounters.workspaceId, args.workspaceId),
        eq(usageCounters.periodStart, args.periodStart),
      ),
    );

  logCronEvent({
    event: "hardcap_threshold_warn",
    level_pct: args.level === "warn-60" ? 60 : 100,
    workspaceId: args.workspaceId,
    plan: args.plan,
    runsCount: args.runsCount,
  });

  if (!ownerEmail) return;

  const rendered = renderUsageWarning(args.level, {
    workspaceName: args.workspaceName,
    plan: args.plan,
    runsCount: args.runsCount,
    theoreticalMonthly: args.theoreticalMonthly,
    hardCap: args.hardCap,
    settingsUrl: SETTINGS_URL,
    contactEmail: CONTACT_EMAIL,
  });

  try {
    await sendTransactional({
      to: ownerEmail,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  } catch (error) {
    // Log only — pas de retry (la prochaine `executePrompt` re-tentera
    // si counter.warnedAt* est posé mais l'envoi a échoué… non, on a
    // déjà posé le timestamp, donc l'email est définitivement perdu).
    // Acceptable V0 — Brevo down est rare.
    logCronEvent({
      level: "error",
      event: "hardcap_threshold_email_failed",
      workspaceId: args.workspaceId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function findOwnerEmail(workspaceId: string): Promise<string | null> {
  const rows = await db
    .select({ email: user.email })
    .from(workspaceMembers)
    .innerJoin(user, eq(user.id, workspaceMembers.userId))
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, "owner")))
    .limit(1);
  return rows[0]?.email ?? null;
}
