import { and, eq, gte, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { brands, prompts, runs, workspaces } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { enqueue } from "@/lib/queue";
import { isoWeekFromDate } from "@/workers/send-weekly-email-payload";

// Cron hebdomadaire (lundi 9 h UTC, cf. vercel.json) : enqueue un job
// send_weekly_email pour chaque workspace ayant au moins 1 run.success
// dans les 7 derniers jours. Workspaces dormants → pas d'email
// (évite d'embêter les comptes inactifs).
//
// Idempotence : `send_weekly_email:{workspaceId}:{isoWeek}` côté queue.
// Donc même si ce cron est rejoué le même lundi, il ne re-enqueue pas.
//
// GET ET POST acceptés (cf. doc 09 § 2026-05-13) : Vercel Cron envoie GET.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: true, ts: new Date().toISOString(), mode: "healthcheck" });
  }

  const startedAt = Date.now();
  const isoWeek = isoWeekFromDate(new Date());
  logCronEvent({ event: "schedule_weekly_emails_start", method: request.method, isoWeek });

  const summary = await scheduleWeeklyEmails(isoWeek);

  logCronEvent({
    event: "schedule_weekly_emails_end",
    isoWeek,
    ...summary,
    totalDurationMs: Date.now() - startedAt,
  });

  return NextResponse.json({ isoWeek, ...summary });
}

interface ScheduleSummary {
  workspacesScanned: number;
  jobsEnqueued: number;
  skipped: number;
}

async function scheduleWeeklyEmails(isoWeek: string): Promise<ScheduleSummary> {
  // SELECT workspaces ayant ≥ 1 run.success dans les 7 derniers jours.
  // On joint runs → prompts → brands → workspaces pour remonter à l'ID.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

  const eligibleRows = await db
    .selectDistinct({ workspaceId: brands.workspaceId })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .innerJoin(workspaces, eq(workspaces.id, brands.workspaceId))
    .where(
      and(
        eq(runs.status, "success"),
        gte(runs.executedAt, sevenDaysAgo),
        // Pas d'envoi à un workspace hard-capé (sécurité, même si peu probable)
        sql`${workspaces.hardCapHitAt} IS NULL`,
      ),
    );

  let jobsEnqueued = 0;
  let skipped = 0;

  for (const row of eligibleRows) {
    const jobId = await enqueue({
      kind: "send_weekly_email",
      payload: { workspaceId: row.workspaceId, isoWeek },
    });
    if (jobId) {
      jobsEnqueued += 1;
    } else {
      // Idempotence : job déjà queued pour cette (workspace, semaine).
      skipped += 1;
    }
  }

  return {
    workspacesScanned: eligibleRows.length,
    jobsEnqueued,
    skipped,
  };
}
