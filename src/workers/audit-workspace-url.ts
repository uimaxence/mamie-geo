import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, technicalAudits, user, workspaceMembers, workspaces } from "@/db/schema";
import { runAudit } from "@/lib/audit/run";
import { renderAuditScoreDrop } from "@/lib/email/templates/audit-score-drop";
import { sendTransactional } from "@/lib/email";
import { env } from "@/lib/env";
import type { AuditWorkspaceUrlPayload } from "./audit-workspace-url-payload";

export {
  parseAuditWorkspaceUrlPayload,
  type AuditWorkspaceUrlPayload,
} from "./audit-workspace-url-payload";

// Worker audit_workspace_url — Sprint 6 PR B (cf. doc 09 § 2026-05-17).
//
// Utilisé par :
//   - Le batch concurrents lancé depuis /app/audits/new (Pro+).
//   - Le cron hebdo /api/cron/schedule-audits (lundi 5h UTC) sur les URLs
//     clés du workspace.
//
// Audit on-demand single passe par la server action `runWorkspaceAudit`
// directement (synchrone, ~10s, dans la limite Vercel 60s).
//
// Flow :
//   1. Appel `runAudit(url)` (~5-15s).
//   2. Persiste le résultat dans `technical_audits`.
//   3. Si `notifyOnDrop` ET delta < -10 pts vs audit précédent sur la
//      même URL → envoie l'email d'alerte aux membres du workspace.
//   4. Le compteur audit_counters n'est PAS incrémenté ici : la décision
//      de consommer du quota se prend en amont par l'enqueueur (server
//      action ou cron), pour pouvoir rejeter avant de bourrer la queue.
//
// Erreurs `runAudit` (fetch_failed, invalid_url…) sont remontées → le
// dispatcher passe le job en failed après `maxAttempts` essais.

const SCORE_DROP_THRESHOLD = -10;

export interface AuditWorkspaceUrlOptions {
  /** Override pour tests : remplace `runAudit` */
  runner?: typeof runAudit;
  sendEmail?: typeof sendTransactional;
}

export async function auditWorkspaceUrl(
  payload: AuditWorkspaceUrlPayload,
  options: AuditWorkspaceUrlOptions = {},
): Promise<void> {
  const runner = options.runner ?? runAudit;
  const sendEmail = options.sendEmail ?? sendTransactional;
  const { workspaceId, brandId, url, isCompetitor, notifyOnDrop } = payload;

  const result = await runner(url);
  if (!result.ok) {
    // Erreur typée (invalid_url, fetch_failed…) — on remonte pour la queue.
    throw new Error(`audit_workspace_url ${url} → ${result.code}: ${result.message}`);
  }
  const report = result.report;

  // Récupère le dernier audit sur cette URL (pour le delta + alerte).
  const previous = await db.query.technicalAudits.findFirst({
    where: and(eq(technicalAudits.workspaceId, workspaceId), eq(technicalAudits.url, url)),
    orderBy: desc(technicalAudits.createdAt),
  });

  await db.insert(technicalAudits).values({
    workspaceId,
    brandId,
    url,
    isCompetitor,
    scoreGlobal: report.scoreGlobal,
    subScores: report.subScores,
    checks: report.checks,
    htmlSizeKb: String(report.htmlSizeKb),
    httpStatus: report.httpStatus,
    psiUnavailable: report.psiUnavailable,
    fetchedAt: new Date(report.fetchedAt),
  });

  // Alerte score-drop : uniquement sur audits owned (brand), pas concurrents.
  if (!isCompetitor && notifyOnDrop && previous) {
    const delta = report.scoreGlobal - previous.scoreGlobal;
    if (delta <= SCORE_DROP_THRESHOLD) {
      await sendScoreDropAlert({
        workspaceId,
        url,
        previousScore: previous.scoreGlobal,
        currentScore: report.scoreGlobal,
        delta,
        sendEmail,
      });
    }
  }
}

async function sendScoreDropAlert(args: {
  workspaceId: string;
  url: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  sendEmail: typeof sendTransactional;
}): Promise<void> {
  const { workspaceId, url, previousScore, currentScore, delta, sendEmail } = args;

  // Récupère les destinataires : tous les membres du workspace (V0 = owner).
  const rows = await db
    .select({
      email: user.email,
      workspaceName: workspaces.name,
      brandName: brands.name,
    })
    .from(workspaceMembers)
    .innerJoin(user, eq(user.id, workspaceMembers.userId))
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .leftJoin(brands, eq(brands.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  if (rows.length === 0) return;
  const { workspaceName, brandName } = rows[0]!;
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr";

  const rendered = renderAuditScoreDrop({
    workspaceName: workspaceName ?? "ton workspace",
    brandName: brandName ?? "ta marque",
    url,
    previousScore,
    currentScore,
    delta,
    auditsAppUrl: `${appUrl}/app/audits`,
  });

  await Promise.all(
    rows.map((r) =>
      sendEmail({
        to: r.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }),
    ),
  );
}
