"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { brands, prompts, runs, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { LLMValue } from "@/lib/llm";
import { getPostHogClient, shutdownPostHog } from "@/lib/posthog-server";
import { enqueue } from "@/lib/queue";

// Server Action pour le bouton "Lancer un run" du dashboard. Même logique
// que /api/runs/trigger mais auth via session Better Auth (et pas
// CRON_SECRET), c'est le chemin user-initié, pas le chemin cron.
//
// Phase A : seul le LLM "claude" est tracké, ajout des autres en
// Phase C derrière l'interface LLMClient existante.

const TRACKED_LLMS: readonly LLMValue[] = ["claude"] as const;

export interface TriggerResult {
  ok: true;
  jobsEnqueued: number;
  runsCreated: number;
  skipped: number;
}

export async function triggerRunNow(): Promise<TriggerResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  // Charger le workspace de l'utilisateur (V0 = 1 par user)
  const membership = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      hardCapHitAt: workspaces.hardCapHitAt,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, session.user.id))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);

  const ws = membership[0];
  if (!ws) throw new Error("Aucun workspace pour cet utilisateur");
  if (ws.hardCapHitAt) throw new Error("Hard-cap atteint pour ce workspace");

  // Charger les prompts actifs via brand → workspace
  const activePrompts = await db
    .select({ promptId: prompts.id })
    .from(prompts)
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .where(and(eq(brands.workspaceId, ws.workspaceId), eq(prompts.isActive, true)));

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

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: session.user.id,
    event: "run_triggered_manually",
    properties: { jobs_enqueued: jobsEnqueued, runs_created: runsCreated },
  });
  await shutdownPostHog();

  // Force le re-render du dashboard côté client après l'action
  revalidatePath("/app/dashboard");

  return { ok: true, jobsEnqueued, runsCreated, skipped };
}
