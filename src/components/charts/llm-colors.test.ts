import { describe, expect, it } from "vitest";
import { LLM_COLORS, LLM_LABELS } from "./llm-colors";

// Garde-fou sur le mapping LLM → couleur/label : tout LLM tracké doit
// avoir une entrée dans les deux maps. Évite qu'un ajout (ex: Grok V2)
// passe en prod avec une couleur grise par défaut sans qu'on s'en rende
// compte.

const TRACKED_LLMS = ["chatgpt", "claude", "perplexity", "gemini", "lechat"];

describe("llm-colors", () => {
  it("définit une couleur pour chaque LLM tracké", () => {
    for (const llm of TRACKED_LLMS) {
      expect(LLM_COLORS[llm], `couleur manquante pour ${llm}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("définit un label pour chaque LLM tracké", () => {
    for (const llm of TRACKED_LLMS) {
      expect(LLM_LABELS[llm], `label manquant pour ${llm}`).toBeTruthy();
    }
  });

  it("aucune couleur dupliquée — chaque LLM a sa teinte propre", () => {
    const colors = TRACKED_LLMS.map((llm) => LLM_COLORS[llm]);
    expect(new Set(colors).size).toBe(TRACKED_LLMS.length);
  });
});
