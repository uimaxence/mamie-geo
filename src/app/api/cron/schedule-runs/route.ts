import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { brands, prompts, runs, workspaces } from "@/db/schema";
import { env } from "@/lib/env";
import { enqueue } from "@/lib/queue";
import type { LLMValue } from "@/lib/llm";

// Cron quotidien (cf. vercel.json) : pour chaque prompt actif d'un
// workspace non hard-capé, enqueue 1 job execute_prompt × LLM tracké
// (Phase A : seul "claude"). Le worker dispatcher consommera derrière
// au tick suivant.
//
// Idempotence : la queue refuse les doublons via idempotency_key
// `execute_prompt:{promptId}:{llm}:{date}` (cf. src/lib/queue/types.ts).
// Si schedule-runs tourne deux fois le même jour, le 2e passage no-op.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Phase A : seul Claude est tracké. Phase C ajoute les 4 autres.
const TRACKED_LLMS: readonly LLMValue[] = ["claude"] as const;

export async function POST(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const summary = await scheduleRuns();
  return NextResponse.json(summary);
}

export async function GET() {
  // Healthcheck local — sans secret, pas d'effet de bord
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}

interface ScheduleSummary {
  promptsScanned: number;
  jobsEnqueued: number;
  runsCreated: number;
  skipped: number;
}

export async function scheduleRuns(): Promise<ScheduleSummary> {
  // Tous les prompts actifs sur des workspaces non hard-capés. Filtre
  // côté SQL pour ne pas charger des prompts qui seraient ignorés ensuite.
  const activePrompts = await db
    .select({
      promptId: prompts.id,
    })
    .from(prompts)
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .innerJoin(workspaces, eq(workspaces.id, brands.workspaceId))
    .where(and(eq(prompts.isActive, true), isNull(workspaces.hardCapHitAt)));

  let jobsEnqueued = 0;
  let runsCreated = 0;
  let skipped = 0;

  for (const row of activePrompts) {
    for (const llm of TRACKED_LLMS) {
      // 1. Tenter d'enqueue (idempotent par idempotency_key). On génère
      //    un runId et le passe dans le payload. Si la queue retourne
      //    null → ce couple (prompt × llm × date) est déjà queued, skip.
      const runId = randomUUID();
      const jobId = await enqueue({
        kind: "execute_prompt",
        payload: { promptId: row.promptId, llm, runId },
      });

      if (!jobId) {
        skipped += 1;
        continue;
      }

      jobsEnqueued += 1;

      // 2. Créer la run row associée. Si l'INSERT échoue après l'enqueue
      //    réussi, le worker lèvera une erreur "Run introuvable" → la
      //    queue retry/dead. Acceptable en V0.
      await db.insert(runs).values({
        id: runId,
        promptId: row.promptId,
        llm,
        status: "pending",
        scheduledAt: new Date(),
      });
      runsCreated += 1;
    }
  }

  return {
    promptsScanned: activePrompts.length,
    jobsEnqueued,
    runsCreated,
    skipped,
  };
}
