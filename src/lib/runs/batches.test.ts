import { describe, expect, it } from "vitest";
import { groupRunsIntoBatches, type RawRunRow } from "./batches-grouping";

// Tests sur la logique pure de grouping (DB-less). Couvre :
// - Groupement par (promptId, scheduledDate UTC)
// - Aggregation summary (citedCount, costSum, durationAvg, status counts)
// - Tri des batches par latestScheduledAt DESC
// - Tri interne des runs par LLM_ORDER (chatgpt, claude, perplexity, gemini, lechat)
// - Slice à `limit`
// - brandMentioned parsing depuis parsedBrands payload

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function makeRun(overrides: Partial<RawRunRow> = {}): RawRunRow {
  // `??` ne distingue pas undefined (clé absente) de null (clé fournie =
  // null) — on utilise `in` pour les champs qui peuvent légitimement être
  // null en prod (costUsd, durationMs, executedAt, parsedBrands).
  return {
    id: overrides.id ?? "run-1",
    promptId: overrides.promptId ?? "prompt-1",
    promptText: overrides.promptText ?? "prompt text",
    llm: overrides.llm ?? "claude",
    status: overrides.status ?? "success",
    costUsd: "costUsd" in overrides ? overrides.costUsd! : "0.0050",
    durationMs: "durationMs" in overrides ? overrides.durationMs! : 5000,
    scheduledAt: overrides.scheduledAt ?? new Date("2026-05-18T06:00:00Z"),
    executedAt:
      "executedAt" in overrides ? overrides.executedAt! : new Date("2026-05-18T06:00:10Z"),
    cacheHit: overrides.cacheHit ?? false,
    parsedBrands: "parsedBrands" in overrides ? overrides.parsedBrands : null,
  };
}

function citedPayload(brandMentioned = true) {
  return {
    scoring: {
      brandMentioned,
      brandSentiment: "neutral" as const,
      competitorsMentioned: [],
    },
  };
}

/**
 * Payload avec sentiment custom — utilisé pour tester
 * `dominantBrandSentiment` et `brandSentiment` par run.
 */
function payloadWithSentiment(
  brandMentioned: boolean,
  brandSentiment: "positive" | "neutral" | "negative",
) {
  return {
    scoring: { brandMentioned, brandSentiment, competitorsMentioned: [] },
  };
}

function skippedPayload() {
  return { scoring: { skipped: true as const } };
}

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

describe("groupRunsIntoBatches", () => {
  it("groupe les 5 runs d'un même batch (prompt × jour) en 1 ligne", () => {
    const runs: RawRunRow[] = (
      ["chatgpt", "claude", "perplexity", "gemini", "lechat"] as const
    ).map((llm, i) =>
      makeRun({
        id: `run-${i}`,
        llm,
        scheduledAt: new Date(`2026-05-18T06:0${i}:00Z`),
        parsedBrands: citedPayload(i % 2 === 0),
      }),
    );

    const batches = groupRunsIntoBatches(runs, 10);

    expect(batches).toHaveLength(1);
    expect(batches[0]!.runs).toHaveLength(5);
    expect(batches[0]!.summary.totalRuns).toBe(5);
    expect(batches[0]!.summary.succeededCount).toBe(5);
    expect(batches[0]!.summary.citedCount).toBe(3); // i=0,2,4
    expect(batches[0]!.scheduledDate).toBe("2026-05-18");
  });

  it("sépare 2 batches du même prompt à 2 jours différents", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "claude", scheduledAt: new Date("2026-05-18T06:00:00Z") }),
      makeRun({ id: "r2", llm: "claude", scheduledAt: new Date("2026-05-17T06:00:00Z") }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);

    expect(batches).toHaveLength(2);
    expect(batches[0]!.scheduledDate).toBe("2026-05-18"); // plus récent en premier
    expect(batches[1]!.scheduledDate).toBe("2026-05-17");
  });

  it("sépare 2 batches de 2 prompts différents au même jour", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", promptId: "p1", promptText: "prompt A" }),
      makeRun({ id: "r2", promptId: "p2", promptText: "prompt B" }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);

    expect(batches).toHaveLength(2);
    const ids = batches.map((b) => b.promptId).sort();
    expect(ids).toEqual(["p1", "p2"]);
  });

  it("trie les runs internes dans l'ordre canonique LLM_ORDER", () => {
    // Insertion désordonnée : Le Chat → Perplexity → ChatGPT → Gemini → Claude
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "lechat" }),
      makeRun({ id: "r2", llm: "perplexity" }),
      makeRun({ id: "r3", llm: "chatgpt" }),
      makeRun({ id: "r4", llm: "gemini" }),
      makeRun({ id: "r5", llm: "claude" }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);

    expect(batches[0]!.runs.map((r) => r.llm)).toEqual([
      "chatgpt",
      "claude",
      "perplexity",
      "gemini",
      "lechat",
    ]);
  });

  it("compte status (success / failed / skipped / pending)", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "chatgpt", status: "success" }),
      makeRun({ id: "r2", llm: "claude", status: "failed" }),
      makeRun({ id: "r3", llm: "perplexity", status: "skipped" }),
      makeRun({ id: "r4", llm: "gemini", status: "pending" }),
      makeRun({ id: "r5", llm: "lechat", status: "running" }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    const s = batches[0]!.summary;

    expect(s.succeededCount).toBe(1);
    expect(s.failedCount).toBe(1);
    expect(s.skippedCount).toBe(1);
    expect(s.pendingCount).toBe(2); // pending + running comptés ensemble
    expect(s.totalRuns).toBe(5);
  });

  it("somme les coûts et moyenne les durées sur le batch", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", costUsd: "0.0050", durationMs: 4000 }),
      makeRun({ id: "r2", llm: "chatgpt", costUsd: "0.0100", durationMs: 6000 }),
      makeRun({ id: "r3", llm: "perplexity", costUsd: null, durationMs: null }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    const s = batches[0]!.summary;

    expect(s.costSumUsd).toBeCloseTo(0.015, 4);
    // Moyenne sur les 2 runs avec durationMs non null
    expect(s.durationAvgMs).toBe(5000);
  });

  it("durationAvgMs = null si aucun run n'a de durationMs", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", durationMs: null, executedAt: null, status: "pending" }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    expect(batches[0]!.summary.durationAvgMs).toBeNull();
  });

  it("parse brandMentioned depuis parsedBrands (true / false / skipped / unscored)", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "chatgpt", parsedBrands: citedPayload(true) }),
      makeRun({ id: "r2", llm: "claude", parsedBrands: citedPayload(false) }),
      makeRun({ id: "r3", llm: "perplexity", parsedBrands: skippedPayload() }),
      makeRun({ id: "r4", llm: "gemini", parsedBrands: null }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    const byId = new Map(batches[0]!.runs.map((r) => [r.id, r]));

    expect(byId.get("r1")?.brandMentioned).toBe(true);
    expect(byId.get("r2")?.brandMentioned).toBe(false);
    expect(byId.get("r3")?.brandMentioned).toBe("skipped");
    expect(byId.get("r4")?.brandMentioned).toBe("unscored");
    expect(batches[0]!.summary.citedCount).toBe(1); // seul r1 est cité
  });

  it("trie les batches par latestScheduledAt DESC", () => {
    const runs: RawRunRow[] = [
      // Batch A : 2026-05-18, run le plus tardif à 12:00
      makeRun({
        id: "a1",
        promptId: "pa",
        scheduledAt: new Date("2026-05-18T06:00:00Z"),
      }),
      makeRun({
        id: "a2",
        promptId: "pa",
        scheduledAt: new Date("2026-05-18T12:00:00Z"),
      }),
      // Batch B : 2026-05-19, run unique à 08:00 (plus récent)
      makeRun({
        id: "b1",
        promptId: "pb",
        scheduledAt: new Date("2026-05-19T08:00:00Z"),
      }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);

    expect(batches[0]!.promptId).toBe("pb"); // 2026-05-19 d'abord
    expect(batches[1]!.promptId).toBe("pa");
    expect(batches[1]!.latestScheduledAt.toISOString()).toBe("2026-05-18T12:00:00.000Z");
  });

  it("slice à `limit` batches après tri", () => {
    const runs: RawRunRow[] = Array.from({ length: 5 }, (_, i) =>
      makeRun({
        id: `r-${i}`,
        promptId: `prompt-${i}`,
        scheduledAt: new Date(`2026-05-${10 + i}T06:00:00Z`),
      }),
    );

    const batches = groupRunsIntoBatches(runs, 3);

    expect(batches).toHaveLength(3);
    // Les 3 dates les plus récentes
    expect(batches.map((b) => b.scheduledDate)).toEqual(["2026-05-14", "2026-05-13", "2026-05-12"]);
  });

  it("retourne [] sur input vide", () => {
    expect(groupRunsIntoBatches([], 10)).toEqual([]);
  });

  it("latestExecutedAt prend le max parmi les success", () => {
    const runs: RawRunRow[] = [
      makeRun({
        id: "r1",
        executedAt: new Date("2026-05-18T06:00:00Z"),
      }),
      makeRun({
        id: "r2",
        llm: "chatgpt",
        executedAt: new Date("2026-05-18T06:00:30Z"),
      }),
      makeRun({
        id: "r3",
        llm: "perplexity",
        executedAt: null,
        status: "pending",
      }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    expect(batches[0]!.latestExecutedAt?.toISOString()).toBe("2026-05-18T06:00:30.000Z");
  });

  // ───────────────────────────────────────────────────────────────────
  // Tests sentiment (KPI business introduit 2026-05-26 en remplacement
  // de la colonne "Durée" dans <BatchesTable>).
  // Cf. computeDominantSentiment dans batches-grouping.ts.
  // ───────────────────────────────────────────────────────────────────

  it("brandSentiment par run : extrait du payload ou skipped/unscored", () => {
    const runs: RawRunRow[] = [
      makeRun({
        id: "r1",
        llm: "chatgpt",
        parsedBrands: payloadWithSentiment(true, "positive"),
      }),
      makeRun({
        id: "r2",
        llm: "claude",
        parsedBrands: payloadWithSentiment(false, "neutral"),
      }),
      makeRun({ id: "r3", llm: "perplexity", parsedBrands: skippedPayload() }),
      makeRun({ id: "r4", llm: "gemini", parsedBrands: null }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    const byId = new Map(batches[0]!.runs.map((r) => [r.id, r]));

    expect(byId.get("r1")?.brandSentiment).toBe("positive");
    expect(byId.get("r2")?.brandSentiment).toBe("neutral");
    expect(byId.get("r3")?.brandSentiment).toBe("skipped");
    expect(byId.get("r4")?.brandSentiment).toBe("unscored");
  });

  it("dominantBrandSentiment = 'positive' avec majorité stricte (3/4)", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "chatgpt", parsedBrands: payloadWithSentiment(true, "positive") }),
      makeRun({ id: "r2", llm: "claude", parsedBrands: payloadWithSentiment(true, "positive") }),
      makeRun({
        id: "r3",
        llm: "perplexity",
        parsedBrands: payloadWithSentiment(true, "positive"),
      }),
      makeRun({ id: "r4", llm: "gemini", parsedBrands: payloadWithSentiment(true, "neutral") }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    expect(batches[0]!.summary.dominantBrandSentiment).toBe("positive");
  });

  it("dominantBrandSentiment = 'mixed' sur égalité 2-2 (pas de majorité stricte)", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "chatgpt", parsedBrands: payloadWithSentiment(true, "positive") }),
      makeRun({ id: "r2", llm: "claude", parsedBrands: payloadWithSentiment(true, "positive") }),
      makeRun({
        id: "r3",
        llm: "perplexity",
        parsedBrands: payloadWithSentiment(true, "negative"),
      }),
      makeRun({ id: "r4", llm: "gemini", parsedBrands: payloadWithSentiment(true, "negative") }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    expect(batches[0]!.summary.dominantBrandSentiment).toBe("mixed");
  });

  it("dominantBrandSentiment = 'absent' quand scoring abouti mais aucune mention", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "chatgpt", parsedBrands: citedPayload(false) }),
      makeRun({ id: "r2", llm: "claude", parsedBrands: citedPayload(false) }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    expect(batches[0]!.summary.dominantBrandSentiment).toBe("absent");
  });

  it("dominantBrandSentiment = null si aucun run scoré (tous skipped/unscored)", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "chatgpt", parsedBrands: skippedPayload() }),
      makeRun({ id: "r2", llm: "claude", parsedBrands: null }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    expect(batches[0]!.summary.dominantBrandSentiment).toBeNull();
  });

  it("dominantBrandSentiment = 'negative' avec majorité stricte (2/3)", () => {
    const runs: RawRunRow[] = [
      makeRun({ id: "r1", llm: "chatgpt", parsedBrands: payloadWithSentiment(true, "negative") }),
      makeRun({ id: "r2", llm: "claude", parsedBrands: payloadWithSentiment(true, "negative") }),
      makeRun({
        id: "r3",
        llm: "perplexity",
        parsedBrands: payloadWithSentiment(true, "positive"),
      }),
    ];

    const batches = groupRunsIntoBatches(runs, 10);
    expect(batches[0]!.summary.dominantBrandSentiment).toBe("negative");
  });
});
