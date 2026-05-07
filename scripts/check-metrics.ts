#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";

// Petit utilitaire pour inspecter rapidement l'état du pipeline en dev :
// runs (status, cost, scored), citation_metrics_daily (agrégé), queue.
// Usage : pnpm check:metrics

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
    /* no .env.local */
  }
}

async function main() {
  await loadEnvLocal();
  const { db } = await import("@/db/client");
  const { sql } = await import("drizzle-orm");

  console.log("\n📊 Citation metrics daily :");
  const metrics = await db.execute<{
    brand_id: string;
    llm: string;
    date: string;
    total_runs: number;
    brand_cited_count: number;
    visibility_score: string;
    competitors_data: unknown;
  }>(sql`SELECT * FROM citation_metrics_daily ORDER BY date DESC, llm`);
  if (metrics.rows.length === 0) {
    console.log("  (vide)");
  } else {
    for (const m of metrics.rows) {
      console.log(
        `  ${m.date} ${m.llm.padEnd(10)} runs=${m.total_runs} cited=${m.brand_cited_count} score=${m.visibility_score}/100`,
      );
      console.log(`    competitors: ${JSON.stringify(m.competitors_data)}`);
    }
  }

  console.log("\n🏃 Runs récents :");
  const runs = await db.execute<{
    id: string;
    llm: string;
    status: string;
    cost_usd: string | null;
    duration_ms: number | null;
    parsed_brands: unknown;
    executed_at: string | null;
  }>(sql`SELECT id, llm, status, cost_usd, duration_ms, parsed_brands, executed_at
         FROM runs ORDER BY created_at DESC LIMIT 10`);
  for (const r of runs.rows) {
    const scoring = (r.parsed_brands as { scoring?: { brandMentioned?: boolean } } | null)?.scoring;
    const brandSignal =
      scoring && "brandMentioned" in scoring
        ? scoring.brandMentioned
          ? "✅ cited"
          : "❌ not cited"
        : scoring && "skipped" in scoring
          ? "⏭ skipped"
          : "— unscored";
    console.log(
      `  ${r.id.slice(0, 8)} ${r.llm} ${r.status.padEnd(7)} cost=$${r.cost_usd ?? "—"} ${brandSignal}`,
    );
  }

  console.log("\n📦 Queue jobs :");
  const jobs = await db.execute<{ kind: string; status: string; count: number }>(
    sql`SELECT kind, status, COUNT(*)::int AS count FROM queue_jobs GROUP BY kind, status ORDER BY kind, status`,
  );
  for (const j of jobs.rows) {
    console.log(`  ${j.kind.padEnd(20)} ${j.status.padEnd(10)} ${j.count}`);
  }

  console.log("\n💸 Usage counters :");
  const usage = await db.execute<{
    workspace_id: string;
    period_start: string;
    runs_count: number;
    llm_cost_usd: string;
  }>(sql`SELECT workspace_id, period_start, runs_count, llm_cost_usd FROM usage_counters`);
  for (const u of usage.rows) {
    console.log(
      `  ws=${u.workspace_id.slice(0, 8)} period=${u.period_start} runs=${u.runs_count} cost=$${u.llm_cost_usd}`,
    );
  }
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
