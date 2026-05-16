import { sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { queueJobs } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { claim, complete, fail } from "@/lib/queue";
import {
  parseRecomputeMetricsPayload,
  recomputeMetricsForBrandLLMDate,
} from "@/lib/metrics/recompute";
import { auditWorkspaceUrl, parseAuditWorkspaceUrlPayload } from "@/workers/audit-workspace-url";
import { executePrompt, parseExecutePromptPayload } from "@/workers/execute-prompt";
import { scoreResponse, parseScoreResponsePayload } from "@/workers/score-response";
import { parseSendWeeklyEmailPayload, sendWeeklyEmail } from "@/workers/send-weekly-email";

// Endpoint déclenché par Vercel Cron toutes les 5 minutes (cf. vercel.json).
// Pull jusqu'à BATCH_SIZE jobs et les exécute.
//
// IMPORTANT (cf. doc 09 § 2026-05-13) : Vercel Cron envoie des **GET**
// avec `Authorization: Bearer ${CRON_SECRET}`. C'est la cause racine du
// blocker prod précédent (la route n'exportait que POST → cron tirait
// dans le vide via le healthcheck GET). GET et POST pointent maintenant
// sur le même handler.
//
// Modes :
//   - GET/POST authentifié → exécute le dispatch
//   - GET/POST ?inspect=1 authentifié → retourne l'état de la queue
//     sans rien exécuter (debug visibility)
//   - GET sans auth → healthcheck léger (sans body sensible)
//
// cf. geo-project/03-architecture-technique.md § Workers et orchestration

const BATCH_SIZE = 25;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const inspectMode = url.searchParams.get("inspect") === "1";
  const authHeader = request.headers.get("authorization");
  const isAuthed = authHeader === `Bearer ${env.CRON_SECRET}`;

  // Sans auth : healthcheck non sensible (utile pour ping local rapide).
  if (!isAuthed) {
    return NextResponse.json({ ok: true, ts: new Date().toISOString(), mode: "healthcheck" });
  }

  if (inspectMode) {
    const inspect = await collectInspectData();
    logCronEvent({ event: "cron_dispatch_inspect", ...inspect.summary });
    return NextResponse.json(inspect);
  }

  return runDispatch(request);
}

async function runDispatch(request: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  logCronEvent({
    event: "cron_dispatch_start",
    method: request.method,
    sourceIp: request.headers.get("x-forwarded-for") ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  });

  const jobs = await claim(BATCH_SIZE);
  logCronEvent({ event: "jobs_claimed", count: jobs.length });

  let succeeded = 0;
  const failures: { id: string; kind: string; error: string }[] = [];

  for (const job of jobs) {
    const jobStartedAt = Date.now();
    try {
      await runWorker(job);
      await complete(job.id);
      succeeded += 1;
      logCronEvent({
        event: "job_succeeded",
        jobId: job.id,
        kind: job.kind,
        durationMs: Date.now() - jobStartedAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await fail(job.id, message);
      failures.push({ id: job.id, kind: job.kind, error: message });
      logCronEvent({
        level: "error",
        event: "job_failed",
        jobId: job.id,
        kind: job.kind,
        durationMs: Date.now() - jobStartedAt,
        error: message,
      });
    }
  }

  const summary = {
    claimed: jobs.length,
    succeeded,
    failed: failures.length,
    totalDurationMs: Date.now() - startedAt,
  };
  logCronEvent({ event: "cron_dispatch_end", ...summary });

  return NextResponse.json({ ...summary, failures });
}

interface ClaimedJob {
  id: string;
  kind: string;
  payload: unknown;
}

async function runWorker(job: ClaimedJob): Promise<void> {
  switch (job.kind) {
    case "execute_prompt": {
      const payload = parseExecutePromptPayload(job.payload);
      await executePrompt(payload);
      return;
    }
    case "score_response": {
      const payload = parseScoreResponsePayload(job.payload);
      await scoreResponse(payload);
      return;
    }
    case "recompute_metrics": {
      // En Phase A le recompute est appelé inline depuis score_response,
      // donc rien n'enqueue ce kind par défaut. La route de dispatch
      // reste branchée pour les ré-agrégations manuelles ou un cron de
      // safety à venir en Phase B.
      const payload = parseRecomputeMetricsPayload(job.payload);
      await recomputeMetricsForBrandLLMDate(payload);
      return;
    }
    case "send_weekly_email": {
      const payload = parseSendWeeklyEmailPayload(job.payload);
      await sendWeeklyEmail(payload);
      return;
    }
    case "audit_workspace_url": {
      const payload = parseAuditWorkspaceUrlPayload(job.payload);
      await auditWorkspaceUrl(payload);
      return;
    }
    default:
      throw new Error(`Job kind inconnu : ${job.kind}`);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Inspect mode — retourne l'état de la queue sans exécuter de jobs.
// Utile en debug prod : `curl -H "Authorization: Bearer ..."
// "https://.../api/cron/dispatch?inspect=1"`.
// ─────────────────────────────────────────────────────────────────────

async function collectInspectData() {
  const statusRows = await db.execute<{
    status: string;
    n: string | number;
  }>(sql`
    SELECT status, COUNT(*) AS n FROM ${queueJobs} GROUP BY status ORDER BY status
  `);
  const recentRows = await db.execute<{
    id: string;
    kind: string;
    status: string;
    attempts: number;
    scheduled_at: Date;
    last_error: string | null;
  }>(sql`
    SELECT id, kind, status, attempts, scheduled_at, last_error
    FROM ${queueJobs}
    ORDER BY scheduled_at DESC
    LIMIT 10
  `);

  const countsByStatus: Record<string, number> = {};
  for (const row of statusRows.rows) {
    countsByStatus[row.status] = Number(row.n);
  }
  const recentJobs = recentRows.rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    status: r.status,
    attempts: r.attempts,
    scheduledAt:
      r.scheduled_at instanceof Date ? r.scheduled_at.toISOString() : String(r.scheduled_at),
    lastError: r.last_error,
  }));

  // Présence (booléen) des env vars critiques — jamais leur valeur.
  // Vérifie que la prod a bien les vars posées.
  const envPresence = {
    CRON_SECRET: Boolean(env.CRON_SECRET),
    DATABASE_URL: Boolean(env.DATABASE_URL),
    ANTHROPIC_API_KEY: Boolean(env.ANTHROPIC_API_KEY),
    BREVO_API_KEY: Boolean(env.BREVO_API_KEY),
    NEXT_PUBLIC_APP_URL: Boolean(env.NEXT_PUBLIC_APP_URL),
  };

  return {
    summary: {
      pending: countsByStatus.pending ?? 0,
      claimed: countsByStatus.claimed ?? 0,
      done: countsByStatus.done ?? 0,
      failed: countsByStatus.failed ?? 0,
      dead: countsByStatus.dead ?? 0,
    },
    countsByStatus,
    recentJobs,
    envPresence,
    serverTimeUtc: new Date().toISOString(),
  };
}
