import { describe, expect, it } from "vitest";
import { geoTipFor, WEEKLY_ACTIONS, type ActionContext } from "./catalog";

// Contexte neutre : aucune action ne se déclenche par défaut (marque
// installée, à jour, leader). Chaque test active un seul signal.
function baseCtx(overrides: Partial<ActionContext> = {}): ActionContext {
  return {
    promptsCount: 5,
    competitorsCount: 3,
    totalRuns: 20,
    brandCitedCount: 15,
    topCompetitor: { name: "Globex", citationCount: 8 },
    sources: { retrievedCount: 10, retrievalsTotal: 12, citationsCount: 9 },
    bestLlm: { label: "Claude", value: 60 },
    worstLlm: { label: "ChatGPT", value: 45 },
    rank: { rank: 1, outOf: 6, previousRank: 1, reliable: true, aheadName: null, gapToAhead: null },
    audit: { everRun: true, criticalIssues: 0 },
    ...overrides,
  };
}

function evalSlug(slug: string, ctx: ActionContext) {
  const def = WEEKLY_ACTIONS.find((a) => a.slug === slug);
  if (!def) throw new Error(`action ${slug} introuvable`);
  return def.evaluate(ctx);
}

describe("WEEKLY_ACTIONS catalogue", () => {
  it("ne déclenche aucune action sur un contexte sain", () => {
    const ctx = baseCtx();
    const fired = WEEKLY_ACTIONS.filter((a) => a.evaluate(ctx) !== null);
    expect(fired).toHaveLength(0);
  });

  it("tous les slugs sont uniques", () => {
    const slugs = WEEKLY_ACTIONS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("tous les geoTipSlug référencés existent dans GEO_TIPS", () => {
    for (const def of WEEKLY_ACTIONS) {
      if (def.geoTipSlug) expect(geoTipFor(def)).not.toBeNull();
    }
  });

  describe("add-first-prompts", () => {
    it("se déclenche sans prompt et est permanent au done", () => {
      expect(evalSlug("add-first-prompts", baseCtx({ promptsCount: 0 }))).not.toBeNull();
      expect(WEEKLY_ACTIONS.find((a) => a.slug === "add-first-prompts")?.permanentOnDone).toBe(true);
    });
    it("ne se déclenche pas avec des prompts", () => {
      expect(evalSlug("add-first-prompts", baseCtx({ promptsCount: 1 }))).toBeNull();
    });
  });

  describe("add-more-prompts", () => {
    it("se déclenche entre 1 et 2 prompts, interpole le compte", () => {
      const t = evalSlug("add-more-prompts", baseCtx({ promptsCount: 2 }));
      expect(t?.expectedOutcome).toContain("de 2 à 5");
    });
    it("ne se déclenche pas à 0 (add-first prend le relais) ni à 3+", () => {
      expect(evalSlug("add-more-prompts", baseCtx({ promptsCount: 0 }))).toBeNull();
      expect(evalSlug("add-more-prompts", baseCtx({ promptsCount: 3 }))).toBeNull();
    });
  });

  describe("track-competitors", () => {
    it("se déclenche sans concurrent suivi mais avec un top détecté, nomme le concurrent", () => {
      const t = evalSlug(
        "track-competitors",
        baseCtx({ competitorsCount: 0, topCompetitor: { name: "Initech", citationCount: 5 } }),
      );
      expect(t?.expectedOutcome).toContain("Initech");
    });
    it("ne se déclenche pas si aucun concurrent détecté", () => {
      expect(
        evalSlug("track-competitors", baseCtx({ competitorsCount: 0, topCompetitor: null })),
      ).toBeNull();
    });
  });

  describe("overtake-top-competitor", () => {
    it("se déclenche quand le concurrent te devance, calcule l'écart", () => {
      const t = evalSlug(
        "overtake-top-competitor",
        baseCtx({ brandCitedCount: 3, topCompetitor: { name: "Globex", citationCount: 8 } }),
      );
      expect(t?.expectedOutcome).toContain("Globex");
      expect(t?.expectedOutcome).toContain("5 fois de plus");
    });
    it("ne se déclenche pas si tu mènes", () => {
      expect(
        evalSlug(
          "overtake-top-competitor",
          baseCtx({ brandCitedCount: 10, topCompetitor: { name: "Globex", citationCount: 8 } }),
        ),
      ).toBeNull();
    });
  });

  describe("defend-rank-loss", () => {
    it("se déclenche quand le rang recule, montre prev → now", () => {
      const t = evalSlug(
        "defend-rank-loss",
        baseCtx({
          rank: { rank: 4, outOf: 6, previousRank: 2, reliable: true, aheadName: "X", gapToAhead: 2 },
        }),
      );
      expect(t?.expectedOutcome).toContain("n°2 à n°4");
    });
    it("ne se déclenche pas si le rang progresse ou stagne", () => {
      expect(
        evalSlug(
          "defend-rank-loss",
          baseCtx({
            rank: { rank: 2, outOf: 6, previousRank: 4, reliable: true, aheadName: null, gapToAhead: null },
          }),
        ),
      ).toBeNull();
    });
  });

  describe("climb-one-rank", () => {
    it("se déclenche pour un rang fiable > 1 et nomme la marque devant", () => {
      const t = evalSlug(
        "climb-one-rank",
        baseCtx({
          rank: { rank: 3, outOf: 6, previousRank: 3, reliable: true, aheadName: "Hooli", gapToAhead: 4 },
        }),
      );
      expect(t?.expectedOutcome).toContain("n°3 à n°2");
      expect(t?.expectedOutcome).toContain("Hooli");
    });
    it("ne se déclenche pas si non fiable ou déjà n°1", () => {
      expect(
        evalSlug(
          "climb-one-rank",
          baseCtx({
            rank: { rank: 3, outOf: 6, previousRank: 3, reliable: false, aheadName: "Hooli", gapToAhead: 4 },
          }),
        ),
      ).toBeNull();
      expect(
        evalSlug(
          "climb-one-rank",
          baseCtx({
            rank: { rank: 1, outOf: 6, previousRank: 1, reliable: true, aheadName: null, gapToAhead: null },
          }),
        ),
      ).toBeNull();
    });
  });

  describe("boost-worst-llm", () => {
    it("se déclenche quand la pire IA est sous la moitié de la meilleure, nomme les deux", () => {
      const t = evalSlug(
        "boost-worst-llm",
        baseCtx({ bestLlm: { label: "Claude", value: 60 }, worstLlm: { label: "Gemini", value: 10 } }),
      );
      expect(t?.expectedOutcome).toContain("Gemini");
      expect(t?.expectedOutcome).toContain("Claude");
    });
    it("ne se déclenche pas si l'écart inter-IA est faible", () => {
      expect(
        evalSlug(
          "boost-worst-llm",
          baseCtx({ bestLlm: { label: "Claude", value: 60 }, worstLlm: { label: "Gemini", value: 40 } }),
        ),
      ).toBeNull();
    });
  });

  describe("convert-appearances", () => {
    it("se déclenche quand peu d'apparitions deviennent des citations", () => {
      const t = evalSlug(
        "convert-appearances",
        baseCtx({ sources: { retrievedCount: 10, retrievalsTotal: 20, citationsCount: 2 } }),
      );
      expect(t?.expectedOutcome).toContain("10 fois");
    });
    it("ne se déclenche pas avec un bon taux de citation", () => {
      expect(
        evalSlug(
          "convert-appearances",
          baseCtx({ sources: { retrievedCount: 10, retrievalsTotal: 20, citationsCount: 18 } }),
        ),
      ).toBeNull();
    });
  });

  describe("run-first-audit / fix-critical-audit", () => {
    it("propose le premier audit si jamais lancé (permanent)", () => {
      expect(
        evalSlug("run-first-audit", baseCtx({ audit: { everRun: false, criticalIssues: 0 } })),
      ).not.toBeNull();
      expect(WEEKLY_ACTIONS.find((a) => a.slug === "run-first-audit")?.permanentOnDone).toBe(true);
    });
    it("propose de corriger les blocages critiques, interpole le nombre", () => {
      const t = evalSlug("fix-critical-audit", baseCtx({ audit: { everRun: true, criticalIssues: 3 } }));
      expect(t?.expectedOutcome).toContain("3 blocages critiques");
    });
    it("les deux actions audit sont exclusives (everRun)", () => {
      const noAudit = baseCtx({ audit: { everRun: false, criticalIssues: 0 } });
      expect(evalSlug("fix-critical-audit", noAudit)).toBeNull();
      const withAudit = baseCtx({ audit: { everRun: true, criticalIssues: 2 } });
      expect(evalSlug("run-first-audit", withAudit)).toBeNull();
    });
  });
});
