import { logCronEvent } from "@/lib/cron-logger";
import { type ClaimedJob, claim, complete, fail } from "@/lib/queue";
import {
  parseRecomputeMetricsPayload,
  recomputeMetricsForBrandLLMDate,
} from "@/lib/metrics/recompute";
import { auditWorkspaceUrl, parseAuditWorkspaceUrlPayload } from "@/workers/audit-workspace-url";
import { executePrompt, parseExecutePromptPayload } from "@/workers/execute-prompt";
import { scoreResponse, parseScoreResponsePayload } from "@/workers/score-response";
import { parseSendWeeklyEmailPayload, sendWeeklyEmail } from "@/workers/send-weekly-email";

// Cœur de traitement de la queue, extrait de la route /api/cron/dispatch
// (2026-06-19) pour être réutilisable par : (1) le cron dispatch, devenu
// un FILET DE SÉCURITÉ basse fréquence ; (2) le déclenchement immédiat
// après un enqueue user-initié (« Lancer maintenant ») via `after()`, qui
// draine sans attendre le prochain tick du cron.
//
// Pourquoi : sur Neon (scale-to-zero après 5 min d'inactivité), un cron
// */5 réveille la base en permanence → compute facturé 24/7. En passant le
// cron à 1 h et en drainant à la demande, la base dort vraiment et le
// coût compute chute (cf. doc 09 § 2026-06-19).

const DEFAULT_BATCH_SIZE = 25;
// Budget temps par défaut d'un drain : large sous le maxDuration=300 s des
// routes/actions concernées, marge pour finir le job en cours.
const DEFAULT_MAX_MS = 250_000;

export interface DrainOptions {
  batchSize?: number;
  maxMs?: number;
}

export interface DrainSummary {
  claimed: number;
  succeeded: number;
  failed: number;
  batches: number;
  totalDurationMs: number;
  failures: { id: string; kind: string; error: string }[];
}

/**
 * Draine la queue en boucle jusqu'à ce qu'il n'y ait plus de job dû
 * (`scheduled_at <= NOW()` et `status = 'pending'`) ou que le budget temps
 * soit épuisé. La boucle est nécessaire car `execute_prompt` enchaîne un
 * job `score_response` : un seul batch ne suffit pas à finir un run.
 *
 * Idempotent et concurrence-safe : `claim` utilise FOR UPDATE SKIP LOCKED,
 * donc plusieurs drains simultanés (cron + after()) ne se marchent pas
 * dessus, ils se partagent le travail.
 */
export async function drainQueue(opts: DrainOptions = {}): Promise<DrainSummary> {
  const batchSize = opts.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxMs = opts.maxMs ?? DEFAULT_MAX_MS;
  const startedAt = Date.now();

  let claimed = 0;
  let succeeded = 0;
  let batches = 0;
  const failures: DrainSummary["failures"] = [];

  while (Date.now() - startedAt < maxMs) {
    const jobs = await claim(batchSize);
    if (jobs.length === 0) break;
    batches += 1;
    claimed += jobs.length;
    logCronEvent({ event: "jobs_claimed", count: jobs.length });

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
  }

  return {
    claimed,
    succeeded,
    failed: failures.length,
    batches,
    totalDurationMs: Date.now() - startedAt,
    failures,
  };
}

export async function runWorker(job: ClaimedJob): Promise<void> {
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
