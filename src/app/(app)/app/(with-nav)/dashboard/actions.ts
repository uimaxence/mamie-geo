"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/db/client";
import { brands, prompts, runs, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getConfiguredLLMs } from "@/lib/llm";
import { captureServerEvent } from "@/lib/posthog-server";
import { enqueue } from "@/lib/queue";
import { drainQueue } from "@/workers/drain-queue";

// Server Action pour le bouton "Lancer maintenant" du dashboard. Même
// logique que /api/runs/trigger mais auth via session Better Auth (et pas
// CRON_SECRET), c'est le chemin user-initié, pas le chemin cron.
//
// Lance sur TOUS les LLMs configurés (getConfiguredLLMs — source de
// vérité partagée avec le scheduler), pas seulement Claude. L'ancien
// hardcode ["claude"] datait de la Phase A mono-provider (corrigé
// 2026-06-16 : le run manuel ne couvrait qu'1 IA sur les 5).

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
      plan: workspaces.plan,
      role: workspaceMembers.role,
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

  const trackedLlms = getConfiguredLLMs();
  for (const row of activePrompts) {
    for (const llm of trackedLlms) {
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

  await captureServerEvent({
    event: "run_triggered_manually",
    distinctId: session.user.id,
    ctx: { workspaceId: ws.workspaceId, plan: ws.plan, role: ws.role },
    properties: {
      jobs_enqueued: jobsEnqueued,
      runs_created: runsCreated,
      skipped,
      active_prompts: activePrompts.length,
    },
  });

  // Force le re-render du dashboard côté client après l'action
  revalidatePath("/app/dashboard");

  // Draine la queue immédiatement en tâche de fond (après la réponse user)
  // pour que le run parte tout de suite, sans attendre le cron dispatch
  // (passé à 1 h pour laisser Neon scale-to-zero, cf. doc 09 § 2026-06-19).
  // Best-effort : si le drain échoue ou est coupé, le cron rattrape. La
  // page expose maxDuration=300 pour laisser le temps au drain.
  if (jobsEnqueued > 0) {
    after(async () => {
      try {
        await drainQueue();
      } catch {
        // silencieux : le cron filet de sécurité reprendra les jobs restants
      }
    });
  }

  return { ok: true, jobsEnqueued, runsCreated, skipped };
}
