import { NextResponse, type NextRequest } from "next/server";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { ACTIVE_PLANS } from "@/lib/plans/quotas";
import { getTrackedLLMs, scheduleRunsForEligiblePlans } from "@/lib/scheduler/schedule-runs";

// Cron quotidien (cf. vercel.json) : pour chaque prompt actif d'un
// workspace en plan ACTIVE_PLANS et non hard-capé, enqueue 1 job
// execute_prompt × LLM tracké (Phase A : seul "claude").
//
// V0+ per-prompt cadence (cf. doc 02 § V0+) : le cron tourne CHAQUE JOUR
// pour TOUS les plans actifs. Le filtre fin se fait au niveau du prompt
// (`prompts.cadence` + `isPromptEligibleToday`). Plus de filtre plan-
// cadence ici — la logique est unifiée dans le scheduler. Un prompt en
// monthly run le 1er même sur un plan weekly (Solo).
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
  const now = new Date();

  logCronEvent({
    event: "schedule_runs_start",
    method: request.method,
    trackedLlms: getTrackedLLMs(),
    dayOfWeek: now.getUTCDay(),
    dayOfMonth: now.getUTCDate(),
    eligiblePlans: ACTIVE_PLANS,
  });

  const summary = await scheduleRunsForEligiblePlans(ACTIVE_PLANS as readonly string[], now);

  logCronEvent({
    event: "schedule_runs_end",
    ...summary,
    totalDurationMs: Date.now() - startedAt,
  });

  return NextResponse.json(summary);
}
