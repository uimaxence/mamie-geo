import { NextResponse, type NextRequest } from "next/server";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { ACTIVE_PLANS, quotasFor } from "@/lib/plans/quotas";
import { getTrackedLLMs, scheduleRunsForEligiblePlans } from "@/lib/scheduler/schedule-runs";

// Cron quotidien (cf. vercel.json) : pour chaque prompt actif d'un
// workspace en plan ACTIVE_PLANS et non hard-capé, enqueue 1 job
// execute_prompt × LLM tracké (Phase A : seul "claude").
//
// Cadence per-plan (cf. doc 09 § 2026-05-14, ajout Solo) :
//   - daily  : enqueue chaque jour (Starter, Pro, Agency, Enterprise)
//   - weekly : enqueue uniquement le lundi UTC (Solo)
// Le cron tournant tous les jours à 06:00 UTC, le lundi déclenche toutes
// les cadences ; les autres jours uniquement daily.
//
// La logique d'enqueue est extraite dans `src/lib/scheduler/schedule-runs.ts`
// pour être appelable aussi depuis le webhook Stripe (run immédiat
// post-checkout).
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
  const isMonday = new Date().getUTCDay() === 1;
  const eligiblePlans = isMonday
    ? (ACTIVE_PLANS as readonly string[])
    : (ACTIVE_PLANS as readonly string[]).filter((p) => quotasFor(p).cadence === "daily");

  logCronEvent({
    event: "schedule_runs_start",
    method: request.method,
    trackedLlms: getTrackedLLMs(),
    isMonday,
    eligiblePlans,
  });

  const summary = await scheduleRunsForEligiblePlans(eligiblePlans);

  logCronEvent({
    event: "schedule_runs_end",
    ...summary,
    totalDurationMs: Date.now() - startedAt,
  });

  return NextResponse.json(summary);
}
