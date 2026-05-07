import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { brands, prompts, runs, workspaces } from "@/db/schema";
import { env } from "@/lib/env";
import { enqueue } from "@/lib/queue";
import type { LLMValue } from "@/lib/llm";

// POST /api/runs/trigger — déclenche un round complet de runs pour un
// workspace en dehors du cron quotidien. Utile pour :
//   1) tester le worker en dev sans attendre 06:00 UTC
//   2) brancher un bouton "Lancer un run" sur le dashboard (PR 5)
//
// Auth Phase A : seul un Bearer CRON_SECRET est accepté. Le bouton UI
// arrivera en PR 5 avec auth session Better Auth + check membership ;
// pour l'instant on s'en passe pour valider la chaîne en CLI.
//
// Idempotence : reposée sur l'idempotency_key de la queue. Si on appelle
// trigger 2× dans la même journée, le 2e passage no-op.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  workspaceId: z.string().uuid(),
});

const TRACKED_LLMS: readonly LLMValue[] = ["claude"] as const;

export async function POST(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { workspaceId } = parsed.data;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });
  if (!workspace) {
    return NextResponse.json({ error: "workspace_not_found" }, { status: 404 });
  }
  if (workspace.hardCapHitAt) {
    return NextResponse.json({ error: "hard_cap_hit" }, { status: 402 });
  }

  // Charger les prompts actifs du workspace via la jointure brand → workspace.
  const activePrompts = await db
    .select({ promptId: prompts.id })
    .from(prompts)
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .where(and(eq(brands.workspaceId, workspaceId), eq(prompts.isActive, true)));

  let jobsEnqueued = 0;
  let runsCreated = 0;
  let skipped = 0;

  for (const row of activePrompts) {
    for (const llm of TRACKED_LLMS) {
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

  return NextResponse.json({
    workspaceId,
    promptsScanned: activePrompts.length,
    jobsEnqueued,
    runsCreated,
    skipped,
  });
}
