import { describe, expect, it } from "vitest";
import { runExpressScan } from "./run";
import { buildExpressPrompts } from "./templates";
import type { BrandExtraction } from "./extract";

const SECTOR = "menuiserie";

function noExtraction(texts: string[]): BrandExtraction {
  return {
    brandsPerResponse: texts.map(() => []),
    targetCitedPerResponse: texts.map(() => false),
  };
}

describe("buildExpressPrompts", () => {
  it("génère 3 prompts contenant le secteur", () => {
    const prompts = buildExpressPrompts(" menuiserie ");
    expect(prompts).toHaveLength(3);
    for (const p of prompts) expect(p).toContain("menuiserie");
  });

  it("localise les 3 prompts quand une ville est fournie", () => {
    const prompts = buildExpressPrompts("plombier", " Tours ");
    for (const p of prompts) expect(p).toContain("à Tours");
    expect(prompts[0]).not.toContain("en France");
  });
});

describe("runExpressScan", () => {
  it("détecte la marque (regex, accents/casse) et la position", async () => {
    const scan = await runExpressScan({
      brand: "Fenêtres sur Loir",
      sector: SECTOR,
      execute: async (prompt) => ({
        text: prompt.startsWith("Quels sont les meilleurs")
          ? "Les références : FENETRES SUR LOIR, Tryba et Lapeyre dominent le marché."
          : "Je recommande Tryba ou Lapeyre selon le budget.",
      }),
      extractBrands: async (texts) => ({
        brandsPerResponse: texts.map(() => ["Tryba", "Lapeyre"]),
        targetCitedPerResponse: texts.map(() => false),
      }),
    });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;

    expect(scan.report.citedCount).toBe(1);
    expect(scan.report.totalPrompts).toBe(3);
    const [first, second] = scan.report.results;
    expect(first?.cited).toBe(true);
    expect(first?.position).toBe("debut");
    expect(second?.cited).toBe(false);
    expect(second?.position).toBeNull();
    expect(second?.brandsCited).toEqual(["Tryba", "Lapeyre"]);
  });

  it("compte cité quand seul le jugement LLM voit une variante de nom", async () => {
    const scan = await runExpressScan({
      brand: "BoursoBank",
      sector: "banque en ligne",
      execute: async () => ({ text: "Boursorama Banque et Fortuneo dominent le marché." }),
      extractBrands: async (texts) => ({
        brandsPerResponse: texts.map(() => ["Boursorama Banque", "Fortuneo"]),
        targetCitedPerResponse: texts.map(() => true),
      }),
    });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;
    expect(scan.report.citedCount).toBe(3);
    // Position inconnue sans match regex.
    expect(scan.report.results[0]?.position).toBeNull();
  });

  it("ne matche pas une sous-chaîne (frontière de mots)", async () => {
    const scan = await runExpressScan({
      brand: "Loir",
      sector: SECTOR,
      execute: async () => ({ text: "Le couloir des menuiseries franciliennes." }),
      extractBrands: async (texts) => noExtraction(texts),
    });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;
    expect(scan.report.citedCount).toBe(0);
  });

  it("retourne llm_unavailable si un appel LLM échoue", async () => {
    const scan = await runExpressScan({
      brand: "Acme",
      sector: SECTOR,
      execute: async () => {
        throw new Error("rate_limit");
      },
      extractBrands: async (texts) => noExtraction(texts),
    });
    expect(scan.ok).toBe(false);
    if (scan.ok) return;
    expect(scan.code).toBe("llm_unavailable");
  });

  it("classe la position fin quand la mention arrive tard", async () => {
    const filler = "Beaucoup d'options existent sur ce marché très concurrentiel. ".repeat(10);
    const scan = await runExpressScan({
      brand: "Acme",
      sector: SECTOR,
      execute: async () => ({ text: `${filler}Enfin, Acme reste une option.` }),
      extractBrands: async (texts) => ({
        brandsPerResponse: texts.map(() => ["Acme"]),
        targetCitedPerResponse: texts.map(() => true),
      }),
    });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;
    expect(scan.report.results[0]?.position).toBe("fin");
  });
});
