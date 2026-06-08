import { randomUUID } from "node:crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, prompts, runs, workspaces } from "@/db/schema";
import { getConfiguredLLMs, type LLMValue } from "@/lib/llm";
import { enqueue } from "@/lib/queue";

// Coeur de la logique scheduler — partagé entre :
//   - le cron quotidien `/api/cron/schedule-runs` (tous workspaces actifs)
//   - le webhook Stripe `checkout.session.completed` (workspace fraîchement payant)
// L'idempotence reste assurée par `queue_jobs.idempotency_key` UNIQUE :
// `execute_prompt:{promptId}:{llm}:{date}`. Donc un workspace qui paie
// le matin puis attend le cron quotidien ne re-double pas ses runs.
//
// Source de vérité des LLMs à scheduler : `getConfiguredLLMs()` côté
// `src/lib/llm/index.ts`. Détecté dynamiquement selon les env vars
// présentes + les providers implémentés. Permet de lancer un V0+ avec
// 4 providers et d'activer Perplexity plus tard sans redéploiement
// (cf. doc 09 § 2026-05-18 — pas de clé Perplexity en V0+, $50 minimum).
//
// Fonction (pas constante) pour ré-évaluer à chaque cron tick si jamais
// les env vars changent en cours d'exécution (cas Vercel reload sur
// nouveau deploy avec une clé ajoutée).
export function getTrackedLLMs(): readonly LLMValue[] {
  return getConfiguredLLMs();
}

export interface ScheduleSummary {
  promptsScanned: number;
  jobsEnqueued: number;
  runsCreated: number;
  skipped: number;
}

async function enqueueForPrompts(promptRows: { promptId: string }[]): Promise<ScheduleSummary> {
  let jobsEnqueued = 0;
  let runsCreated = 0;
  let skipped = 0;
  const trackedLlms = getTrackedLLMs();

  for (const row of promptRows) {
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

  return {
    promptsScanned: promptRows.length,
    jobsEnqueued,
    runsCreated,
    skipped,
  };
}

/**
 * Variante cron quotidien : tous les workspaces dont le plan est dans
 * `eligiblePlans` (filtré au préalable par cadence + jour de la semaine).
 */
export async function scheduleRunsForEligiblePlans(
  eligiblePlans: readonly string[],
): Promise<ScheduleSummary> {
  if (eligiblePlans.length === 0) {
    return { promptsScanned: 0, jobsEnqueued: 0, runsCreated: 0, skipped: 0 };
  }
  const activePrompts = await db
    .select({ promptId: prompts.id })
    .from(prompts)
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .innerJoin(workspaces, eq(workspaces.id, brands.workspaceId))
    .where(
      and(
        eq(prompts.isActive, true),
        isNull(brands.pausedAt),
        isNull(workspaces.hardCapHitAt),
        inArray(workspaces.plan, eligiblePlans as string[]),
      ),
    );
  return enqueueForPrompts(activePrompts);
}

/**
 * Variante post-checkout : lance immédiatement les runs pour un workspace
 * spécifique, indépendamment de la cadence. Appelé depuis le webhook
 * `checkout.session.completed` pour offrir une expérience "premier run
 * tout de suite" plutôt que d'attendre le prochain cron (potentiellement
 * lundi prochain pour un plan Solo souscrit un mardi).
 *
 * Idempotence : si le cron quotidien a déjà tourné aujourd'hui pour ce
 * workspace (improbable juste après un signup mais possible), les jobs
 * existants sont conservés grâce à la clé `{promptId}:{llm}:{date}`.
 */
export async function scheduleRunsForWorkspace(workspaceId: string): Promise<ScheduleSummary> {
  const activePrompts = await db
    .select({ promptId: prompts.id })
    .from(prompts)
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .innerJoin(workspaces, eq(workspaces.id, brands.workspaceId))
    .where(
      and(
        eq(prompts.isActive, true),
        isNull(brands.pausedAt),
        isNull(workspaces.hardCapHitAt),
        eq(workspaces.id, workspaceId),
      ),
    );
  return enqueueForPrompts(activePrompts);
}
