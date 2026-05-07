import { NextResponse, type NextRequest } from "next/server";
import { claim, complete, fail } from "@/lib/queue";
import { env } from "@/lib/env";
import { executePrompt, parseExecutePromptPayload } from "@/workers/execute-prompt";
import { scoreResponse, parseScoreResponsePayload } from "@/workers/score-response";
import {
  parseRecomputeMetricsPayload,
  recomputeMetricsForBrandLLMDate,
} from "@/lib/metrics/recompute";

// Endpoint déclenché par Vercel Cron toutes les 5 minutes (cf. vercel.json).
// Il pull jusqu'à BATCH_SIZE jobs et les exécute. Phase A : seul le worker
// `execute_prompt` est branché ; les autres kinds (score_response,
// recompute_metrics, send_weekly_email) sont rejetés explicitement comme
// failed pour éviter un swallow silencieux.
// cf. geo-project/03-architecture-technique.md § Workers et orchestration

const BATCH_SIZE = 25;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Vercel Cron envoie Authorization: Bearer ${CRON_SECRET}
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const jobs = await claim(BATCH_SIZE);
  let processed = 0;
  const failures: { id: string; error: string }[] = [];

  for (const job of jobs) {
    try {
      console.info(`[cron] claimed job ${job.id} kind=${job.kind}`);
      await runWorker(job);
      await complete(job.id);
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[cron] job ${job.id} (${job.kind}) failed:`, message);
      await fail(job.id, message);
      failures.push({ id: job.id, error: message });
    }
  }

  return NextResponse.json({ claimed: jobs.length, processed, failures });
}

export async function GET() {
  // Healthcheck local — pas de secret requis.
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
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
    case "send_weekly_email":
      throw new Error(`Worker ${job.kind} pas encore implémenté (Phase A)`);
    default:
      throw new Error(`Job kind inconnu : ${job.kind}`);
  }
}
