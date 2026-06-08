import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, prompts, runs, usageCounters, workspaceMembers } from "@/db/schema";
import { checkQuotaBeforeRun } from "@/lib/hardcap/check";
import { getLLMClient, LLMError, type LLMClient, type LLMValue } from "@/lib/llm";
import { captureServerEvent, identifyServerUser } from "@/lib/posthog-server";
import { enqueue } from "@/lib/queue";
import type { ExecutePromptPayload } from "./execute-prompt-payload";

export { parseExecutePromptPayload, type ExecutePromptPayload } from "./execute-prompt-payload";

// Worker qui exécute un prompt sur un LLM et persiste le résultat.
// Consommé par le dispatcher (cf. src/app/api/cron/dispatch/route.ts) à
// chaque tick Vercel Cron.
//
// Pré-requis : le run a été pré-créé en `pending` par schedule-runs ou
// par /api/runs/trigger (avec son UUID transmis dans le payload). Si le
// run est absent (cas pathologique : insert run a échoué après enqueue),
// on lève — le job sera retry par la queue.
//
// Phase A : seul le provider Anthropic est supporté ; les 4 autres slot
// derrière l'interface LLMClient en Phase C.

// Le client LLM peut être injecté pour les tests (FakeLLMClient).
// En prod c'est getLLMClient() qui décide du provider selon llm.
export interface ExecutePromptOptions {
  getClient?: (llm: LLMValue) => LLMClient;
}

export async function executePrompt(
  payload: ExecutePromptPayload,
  options: ExecutePromptOptions = {},
): Promise<void> {
  const { promptId, llm, runId } = payload;

  // 1. Charger le prompt et la brand → workspace pour pouvoir incrémenter
  //    le compteur usage_counters sur le bon workspace. Pas de relations()
  //    déclarées dans le schéma → on chaîne deux queries simples.
  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.id, promptId),
  });
  if (!prompt) throw new Error(`Prompt ${promptId} introuvable`);

  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, prompt.brandId),
  });
  if (!brand) throw new Error(`Brand ${prompt.brandId} introuvable pour prompt ${promptId}`);

  // 1bis. Hard-cap check (cf. src/lib/hardcap/check.ts) — bloque si le
  //       workspace a dépassé 200 % de son quota théorique mensuel, ou
  //       si hardCapHitAt est déjà posé. Envoie aussi les warnings 60/100 %.
  //       Si bloqué, on marque le run en `skipped` et on ne chaîne pas
  //       score_response. Le scheduler filtre déjà sur hardCapHitAt donc
  //       ce cas concerne surtout les runs déjà queued au moment du hit.
  const guard = await checkQuotaBeforeRun(brand.workspaceId);
  if (guard.blocked) {
    await db
      .update(runs)
      .set({
        status: "skipped",
        error: `Hard-cap : ${guard.reason}`,
        executedAt: new Date(),
      })
      .where(eq(runs.id, runId));
    return;
  }

  // 2. Marquer le run comme running. Le run row a été créé en pending par
  //    schedule-runs ou /api/runs/trigger.
  const updated = await db
    .update(runs)
    .set({ status: "running" })
    .where(eq(runs.id, runId))
    .returning({ id: runs.id });
  if (updated.length === 0) {
    throw new Error(
      `Run ${runId} introuvable — race condition sur enqueue/insert run, à investiguer`,
    );
  }

  // 3. Appeler le LLM. Erreurs typées remontent à la queue qui retry.
  const client = options.getClient ? options.getClient(llm) : getLLMClient(llm);
  const startedAt = Date.now();
  let response;
  try {
    response = await client.execute({
      prompt: prompt.text,
      language: prompt.language as "fr" | "en",
    });
  } catch (error) {
    await db
      .update(runs)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        executedAt: new Date(),
        durationMs: Date.now() - startedAt,
      })
      .where(eq(runs.id, runId));
    // Re-throw avec contexte → la queue gère le retry/dead selon attempts
    if (error instanceof LLMError) throw error;
    throw new Error(
      `LLM call failed for run ${runId} (llm=${llm}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 4. Persister le run réussi. parsedCitations stocke les sources brutes
  //    de l'API. La détection brand vs concurrents arrive en PR 3
  //    (worker score_response).
  await db
    .update(runs)
    .set({
      status: "success",
      rawResponse: response.text,
      parsedCitations: response.sources,
      costUsd: response.costUsd.toFixed(6),
      durationMs: response.durationMs,
      executedAt: new Date(),
    })
    .where(eq(runs.id, runId));

  // 5. Incrémenter usage_counters sur la fenêtre courante (mois calendrier
  //    en V0, Stripe period en Phase C). UPSERT par PK (workspaceId,
  //    periodStart).
  const periodStart = startOfCurrentMonth();
  await db
    .insert(usageCounters)
    .values({
      workspaceId: brand.workspaceId,
      periodStart,
      promptsCount: 0,
      runsCount: 1,
      llmCostUsd: response.costUsd.toFixed(4),
    })
    .onConflictDoUpdate({
      target: [usageCounters.workspaceId, usageCounters.periodStart],
      set: {
        runsCount: sql`${usageCounters.runsCount} + 1`,
        llmCostUsd: sql`${usageCounters.llmCostUsd} + ${response.costUsd.toFixed(4)}`,
      },
    });

  // 6. Chaîner score_response. idempotency_key = score_response:{runId},
  //    donc relancer le run ne re-score pas en double.
  await enqueue({
    kind: "score_response",
    payload: { runId },
  });

  // 7. PostHog : si c'est le tout premier run.success de ce workspace,
  //    fire app_first_run_completed + set first_run_at person property.
  //    Vérification idempotente par count(*) où status='success' joint
  //    aux prompts du workspace. Si count == 1 (= ce run), c'est le premier.
  try {
    await emitFirstRunIfApplicable(brand.workspaceId, runId);
  } catch (error) {
    // Pas bloquant : un fail PostHog ne doit pas faire échouer le worker.
    console.error("[execute-prompt] PostHog first-run capture failed", error);
  }
}

async function emitFirstRunIfApplicable(workspaceId: string, runId: string): Promise<void> {
  const totalSuccess = await db
    .select({ id: runs.id })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .where(and(eq(brands.workspaceId, workspaceId), eq(runs.status, "success")))
    .limit(2);
  if (totalSuccess.length !== 1) return;
  if (totalSuccess[0]?.id !== runId) return;
  const owner = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, "owner")))
    .limit(1);
  const ownerId = owner[0]?.userId;
  if (!ownerId) return;
  const now = new Date().toISOString();
  await captureServerEvent({
    event: "app_first_run_completed",
    distinctId: ownerId,
    ctx: { workspaceId },
    properties: { run_id: runId, first_run_at: now },
  });
  await identifyServerUser({ distinctId: ownerId, setOnce: { first_run_at: now } });
}

function startOfCurrentMonth(): string {
  const now = new Date();
  // YYYY-MM-01
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
