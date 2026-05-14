#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";

// Smoke test E2E du pipeline tracking en Phase A : seed → schedule-runs
// → dispatcher → executePrompt → run.success.
// Tourne sans dev server, en appelant directement les fonctions internes.
// Coûte ~$0,04 par prompt en Haiku 4.5 + web_search.
//
// Usage : pnpm smoke:pipeline [--dry] [--limit=N]
//   --dry      Affiche le plan mais n'appelle pas le LLM
//   --limit=N  Limite à N prompts (défaut: 1, pour ne pas dépenser plein)
//
// IMPORTANT : nécessite ANTHROPIC_API_KEY + DATABASE_URL dans .env.local.

async function loadEnvLocal(): Promise<void> {
  try {
    const raw = await readFile(".env.local", "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  } catch {
    // pas de .env.local
  }
}

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 1);

async function main() {
  await loadEnvLocal();

  // Imports tardifs après load env
  const { eq } = await import("drizzle-orm");
  const { db } = await import("@/db/client");
  const { runs } = await import("@/db/schema");
  const { scheduleRunsForEligiblePlans } = await import("@/lib/scheduler/schedule-runs");
  const { executePrompt } = await import("@/workers/execute-prompt");
  const { parseExecutePromptPayload } = await import("@/workers/execute-prompt-payload");
  const { scoreResponse } = await import("@/workers/score-response");
  const { parseScoreResponsePayload } = await import("@/workers/score-response-payload");
  const queue = await import("@/lib/queue");

  console.log(`🚦 Smoke test pipeline (limit=${LIMIT}${DRY ? ", dry-run" : ""})…\n`);

  // 1. Schedule runs (enqueue jobs + crée les runs.pending).
  // Smoke test = enqueue tous plans actifs (utile pour reset rapide).
  console.log("→ scheduleRunsForEligiblePlans()");
  const { ACTIVE_PLANS } = await import("@/lib/plans/quotas");
  const summary = await scheduleRunsForEligiblePlans(ACTIVE_PLANS);
  console.log(`  ${JSON.stringify(summary)}\n`);

  if (summary.jobsEnqueued === 0) {
    console.log(
      "ℹ Pas de nouveau job (déjà tous queued aujourd'hui). On essaie quand même de claim un job pending laissé d'un précédent run.",
    );
  }

  // 2. Claim N jobs et les exécuter
  console.log(`\n→ claim(${LIMIT}) puis exécution`);
  const jobs = await queue.claim(LIMIT);
  if (jobs.length === 0) {
    console.log(
      "  ⚠ Aucun job claimable. Soit tout est déjà done, soit des jobs sont stuck en 'claimed'\n" +
        "    (idempotency_key vivant 24h). Pour reset : SQL UPDATE queue_jobs SET status='pending'\n" +
        "    WHERE status='claimed' AND claimed_at < NOW() - INTERVAL '5 minutes'.",
    );
    return;
  }

  for (const job of jobs) {
    console.log(`  ◦ job ${job.id} kind=${job.kind}`);
    if (DRY) {
      console.log("    (dry) skip exécution");
      continue;
    }
    try {
      if (job.kind === "execute_prompt") {
        const payload = parseExecutePromptPayload(job.payload);
        await executePrompt(payload);
        await queue.complete(job.id);
        const run = await db.query.runs.findFirst({ where: eq(runs.id, payload.runId) });
        console.log(
          `    ✅ run ${payload.runId} status=${run?.status} cost=$${run?.costUsd} dur=${run?.durationMs}ms text=${run?.rawResponse?.slice(0, 80)}…`,
        );
      } else if (job.kind === "score_response") {
        const payload = parseScoreResponsePayload(job.payload);
        await scoreResponse(payload);
        await queue.complete(job.id);
        const run = await db.query.runs.findFirst({ where: eq(runs.id, payload.runId) });
        const parsed = run?.parsedBrands as {
          detection?: unknown[];
          scoring?: { brandMentioned?: boolean };
        } | null;
        const detectionCount = Array.isArray(parsed?.detection) ? parsed.detection.length : 0;
        const brandMentioned = parsed?.scoring?.brandMentioned ?? "skipped";
        console.log(
          `    ✅ scored ${payload.runId} detected=${detectionCount} brandMentioned=${brandMentioned}`,
        );
      } else {
        await queue.fail(job.id, `kind ${job.kind} pas géré en smoke test`);
        console.log(`    ⏭ skip kind ${job.kind}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await queue.fail(job.id, message);
      console.log(`    ❌ failed: ${message}`);
    }
  }

  console.log("\n✅ Smoke test terminé.");
}

main().catch((error) => {
  console.error("❌ Smoke test crashé :", error);
  process.exit(1);
});
