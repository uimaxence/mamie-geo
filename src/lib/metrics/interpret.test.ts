import { describe, expect, it } from "vitest";
import { bestWorstLlm, interpretPartDeVoix } from "./interpret";

describe("interpretPartDeVoix", () => {
  it("success quand tu mènes tes concurrents", () => {
    const r = interpretPartDeVoix({ brandCited: 10, topCompetitorCited: 4, topName: "Acme" });
    expect(r.tone).toBe("success");
  });

  it("warning quand un concurrent te dépasse, nomme le concurrent", () => {
    const r = interpretPartDeVoix({ brandCited: 2, topCompetitorCited: 9, topName: "Acme" });
    expect(r.tone).toBe("warning");
    expect(r.text).toContain("Acme");
  });

  it("neutral au coude-à-coude", () => {
    const r = interpretPartDeVoix({ brandCited: 5, topCompetitorCited: 5, topName: "Acme" });
    expect(r.tone).toBe("neutral");
  });

  it("success si tu es cité et aucun concurrent ne l'est", () => {
    expect(interpretPartDeVoix({ brandCited: 3, topCompetitorCited: 0, topName: null }).tone).toBe(
      "success",
    );
  });

  it("neutral si personne n'est cité", () => {
    expect(interpretPartDeVoix({ brandCited: 0, topCompetitorCited: 0, topName: null }).tone).toBe(
      "neutral",
    );
  });
});

describe("bestWorstLlm", () => {
  it("retourne best + worst parmi les IA avec score > 0", () => {
    const r = bestWorstLlm([
      { label: "Claude", value: 62 },
      { label: "ChatGPT", value: 12 },
      { label: "Gemini", value: 0 },
    ]);
    expect(r?.best.label).toBe("Claude");
    expect(r?.worst?.label).toBe("ChatGPT");
  });

  it("worst null s'il n'y a qu'une seule IA avec du signal", () => {
    const r = bestWorstLlm([
      { label: "Claude", value: 40 },
      { label: "ChatGPT", value: 0 },
    ]);
    expect(r?.best.label).toBe("Claude");
    expect(r?.worst).toBeNull();
  });

  it("null si aucune IA n'a de score", () => {
    expect(bestWorstLlm([{ label: "Claude", value: 0 }])).toBeNull();
  });
});
