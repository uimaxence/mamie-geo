import { describe, expect, it } from "vitest";
import {
  buildRankStatus,
  computeRanking,
  computeRankHistory,
  type RankingDailyRow,
  type RankingEntry,
} from "./ranking";

// Tests de la fonction pure computeRanking — données issues de
// citation_metrics_daily (brandCitedCount + competitorsData).

const NOW = new Date("2026-06-10T12:00:00Z");

const BRAND = { name: "Mamie GEO", aliases: ["mamie-geo.fr"], domain: "mamie-geo.fr" };

const COMPETITORS = [
  { id: "c-profound", name: "Profound", aliases: ["Profound Inc."], domain: "tryprofound.com" },
  { id: "c-peec", name: "Peec AI", aliases: ["Peec"], domain: "peec.ai" },
];

function row(partial: Partial<RankingDailyRow> & { date: string }): RankingDailyRow {
  return {
    llm: "claude",
    totalRuns: 10,
    brandCitedCount: 0,
    competitorsData: null,
    ...partial,
  };
}

function comp(name: string, citationCount: number) {
  return { name, citationCount, sentiments: { positive: 0, neutral: citationCount, negative: 0 } };
}

describe("computeRanking", () => {
  it("classe par mentions décroissantes avec ta marque et les trackés toujours présents", () => {
    const rows = [
      row({
        date: "2026-06-09",
        brandCitedCount: 3,
        competitorsData: [comp("Profound", 5), comp("Athena", 1)],
      }),
    ];
    const entries = computeRanking({
      rows,
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: COMPETITORS,
      now: NOW,
    });

    expect(entries.map((e) => [e.name, e.rank, e.mentions])).toEqual([
      ["Profound", 1, 5],
      ["Mamie GEO", 2, 3],
      ["Athena", 3, 1],
      // Peec AI jamais cité mais présent (info « tu n'es pas cité » assumée)
      ["Peec AI", 4, 0],
    ]);
    expect(entries[0]?.type).toBe("competitor");
    expect(entries[2]?.type).toBe("discovered");
  });

  it("matche les alias des concurrents trackés (normalisation casse/espaces)", () => {
    const rows = [
      row({ date: "2026-06-09", competitorsData: [comp("  profound INC. ", 2), comp("PEEC", 4)] }),
    ];
    const entries = computeRanking({
      rows,
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: COMPETITORS,
      now: NOW,
    });

    const peec = entries.find((e) => e.key === "c-peec");
    const profound = entries.find((e) => e.key === "c-profound");
    expect(peec?.mentions).toBe(4);
    expect(profound?.mentions).toBe(2);
    // Aucune entrée "discovered" : tout a matché les trackés
    expect(entries.filter((e) => e.type === "discovered")).toHaveLength(0);
  });

  it("exclut ta propre marque des competitorsData et calcule l'apparition", () => {
    const rows = [
      row({
        date: "2026-06-09",
        totalRuns: 20,
        brandCitedCount: 5,
        competitorsData: [comp("mamie-geo.fr", 3)],
      }),
    ];
    const entries = computeRanking({
      rows,
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: [],
      now: NOW,
    });

    expect(entries).toHaveLength(1);
    expect(entries[0]?.key).toBe("you");
    expect(entries[0]?.mentions).toBe(5);
    expect(entries[0]?.apparitionPct).toBe(25);
  });

  it("cap les marques détectées à maxDiscovered (top mentions)", () => {
    const rows = [
      row({
        date: "2026-06-09",
        competitorsData: [comp("A", 5), comp("B", 4), comp("C", 3), comp("D", 2)],
      }),
    ];
    const entries = computeRanking({
      rows,
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: [],
      maxDiscovered: 2,
      now: NOW,
    });

    const discovered = entries.filter((e) => e.type === "discovered");
    expect(discovered.map((e) => e.name)).toEqual(["A", "B"]);
  });

  it("calcule previousRank sur la fenêtre décalée et null sans historique", () => {
    const rows = [
      // Fenêtre précédente (J-37 → J-7) : Profound devant la marque
      row({ date: "2026-05-20", brandCitedCount: 1, competitorsData: [comp("Profound", 4)] }),
      // Fenêtre courante : la marque repasse devant
      row({ date: "2026-06-09", brandCitedCount: 6, competitorsData: [comp("Profound", 2)] }),
    ];
    const entries = computeRanking({
      rows,
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: COMPETITORS,
      now: NOW,
    });

    const you = entries.find((e) => e.key === "you");
    const profound = entries.find((e) => e.key === "c-profound");
    expect(you?.rank).toBe(1);
    expect(you?.previousRank).toBe(2);
    expect(profound?.rank).toBe(2);
    expect(profound?.previousRank).toBe(1);

    // Sans aucune donnée sur la fenêtre précédente → previousRank null
    const noHistory = computeRanking({
      rows: [rows[1]!],
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: COMPETITORS,
      now: NOW,
    });
    expect(noHistory.every((e) => e.previousRank === null)).toBe(true);
  });

  it("filtre par LLM quand demandé", () => {
    const rows = [
      row({ date: "2026-06-09", llm: "claude", competitorsData: [comp("Profound", 3)] }),
      row({ date: "2026-06-09", llm: "chatgpt", competitorsData: [comp("Profound", 1)] }),
    ];
    const entries = computeRanking({
      rows,
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: COMPETITORS,
      llm: "chatgpt",
      now: NOW,
    });

    expect(entries.find((e) => e.key === "c-profound")?.mentions).toBe(1);
  });

  it("retourne un classement vide de mentions (mais pas d'entités) à zéro run", () => {
    const entries = computeRanking({
      rows: [],
      windowDays: 30,
      deltaDays: 7,
      brand: BRAND,
      competitors: COMPETITORS,
      now: NOW,
    });

    expect(entries).toHaveLength(3); // toi + 2 trackés
    expect(entries.every((e) => e.mentions === 0 && e.apparitionPct === 0)).toBe(true);
    expect(entries[0]?.key).toBe("you"); // à égalité, ta marque d'abord
  });
});

describe("computeRankHistory", () => {
  it("produit un point par jour avec données, rang lissé sur la sous-fenêtre", () => {
    const rows = [
      // J-3 : Profound devant (4 vs 1)
      row({ date: "2026-06-07", brandCitedCount: 1, competitorsData: [comp("Profound", 4)] }),
      // J-1 : la marque repasse devant sur la fenêtre glissante (1+6 vs 4+2)
      row({ date: "2026-06-09", brandCitedCount: 6, competitorsData: [comp("Profound", 2)] }),
    ];
    const points = computeRankHistory({
      rows,
      windowDays: 5,
      smoothDays: 7,
      brand: BRAND,
      competitors: COMPETITORS,
      now: NOW,
    });

    // Tous les jours J-4..J-0 dont la sous-fenêtre contient ≥ 1 run.
    expect(points.map((p) => p.date)).toEqual([
      "2026-06-07",
      "2026-06-08",
      "2026-06-09",
      "2026-06-10",
    ]);
    // J-3 : seule la row du 07 est dans la sous-fenêtre → Profound n°1.
    expect(points[0]?.rank).toBe(2);
    // J-1 et J-0 : les deux rows cumulées → la marque n°1.
    expect(points[2]?.rank).toBe(1);
    expect(points[3]?.rank).toBe(1);
    // outOf : toi + Profound cité + Peec tracké jamais cité.
    expect(points[0]?.outOf).toBe(3);
  });

  it("ne produit aucun point sans run et filtre par LLM", () => {
    expect(
      computeRankHistory({
        rows: [],
        windowDays: 30,
        brand: BRAND,
        competitors: COMPETITORS,
        now: NOW,
      }),
    ).toEqual([]);

    const rows = [
      row({
        date: "2026-06-09",
        llm: "claude",
        brandCitedCount: 2,
        competitorsData: [comp("Profound", 5)],
      }),
      row({
        date: "2026-06-09",
        llm: "chatgpt",
        brandCitedCount: 9,
        competitorsData: [comp("Profound", 1)],
      }),
    ];
    const claudeOnly = computeRankHistory({
      rows,
      windowDays: 2,
      brand: BRAND,
      competitors: COMPETITORS,
      llm: "claude",
      now: NOW,
    });
    // Sur Claude seul, Profound (5) devance la marque (2).
    expect(claudeOnly.at(-1)?.rank).toBe(2);
  });
});

describe("buildRankStatus", () => {
  function entry(
    p: Partial<RankingEntry> & { rank: number; type: RankingEntry["type"] },
  ): RankingEntry {
    return {
      key: p.type === "you" ? "you" : `e-${p.rank}`,
      name: p.name ?? (p.type === "you" ? "Ma marque" : `Marque ${p.rank}`),
      type: p.type,
      domain: null,
      mentions: p.mentions ?? 0,
      apparitionPct: 0,
      previousRank: p.previousRank ?? null,
      rank: p.rank,
    };
  }

  it("leader : trophée + ton success + avance sur le n°2", () => {
    const s = buildRankStatus(
      [
        entry({ rank: 1, type: "you", mentions: 10 }),
        entry({ rank: 2, type: "competitor", name: "Acme", mentions: 6 }),
      ],
      "tous LLMs confondus",
    );
    expect(s.kind).toBe("leader");
    expect(s.tone).toBe("success");
    expect(s.icon).toBe("trophy");
    expect(s.headline).toBe("Ta marque est n°1");
    expect(s.detail).toContain("Acme");
  });

  it("ranked : ton neutre + écart au-dessus nommé", () => {
    const s = buildRankStatus(
      [
        entry({ rank: 1, type: "competitor", name: "Acme", mentions: 9 }),
        entry({ rank: 2, type: "you", mentions: 4 }),
      ],
      "tous LLMs confondus",
    );
    expect(s.kind).toBe("ranked");
    expect(s.rank).toBe(2);
    expect(s.headline).toBe("Ta marque est n°2");
    expect(s.detail).toContain("à 5 citations de Acme");
  });

  it("zéro citation mais d'autres cités : warning + message « recommandé à ta place »", () => {
    const s = buildRankStatus(
      [
        entry({ rank: 1, type: "competitor", name: "Acme", mentions: 7 }),
        entry({ rank: 2, type: "you", mentions: 0 }),
      ],
      "tous LLMs confondus",
    );
    expect(s.kind).toBe("uncited-others");
    expect(s.tone).toBe("warning");
    expect(s.rank).toBeNull();
    expect(s.detail).toContain("recommandé à ta place");
  });

  it("personne cité : neutre", () => {
    const s = buildRankStatus(
      [entry({ rank: 1, type: "you", mentions: 0 })],
      "tous LLMs confondus",
    );
    expect(s.kind).toBe("uncited-none");
    expect(s.tone).toBe("neutral");
  });
});
