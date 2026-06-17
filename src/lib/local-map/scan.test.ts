import { describe, expect, it, vi } from "vitest";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { brandPatterns, dedupeCities, type ScanCity } from "./queries";
import { runLocalMapScan } from "./scan";

const city = (name: string, lat: number | null = null, lng: number | null = null): ScanCity => ({
  name,
  lat,
  lng,
});

const fakeExtract = (data: BrandExtraction) => async (): Promise<BrandExtraction> => data;

describe("brandPatterns", () => {
  it("gère « & » ↔ « et »", () => {
    const p = brandPatterns("ACB Portes & Fenêtres");
    expect(p).toContain("ACB Portes & Fenêtres");
    expect(p).toContain("ACB Portes et Fenêtres");
  });
});

describe("dedupeCities", () => {
  it("garde l'ordre, déduplique (casse/accents) et borne à 7", () => {
    const list = dedupeCities(
      [
        city("Tours", 47.39, 0.69),
        city("tours"),
        ...Array.from({ length: 12 }, (_, i) => city(`Ville${i}`, 47, 1)),
      ],
      normalizeText,
    );
    expect(list[0]?.name).toBe("Tours");
    expect(list[0]?.lat).toBe(47.39);
    expect(list).toHaveLength(7);
  });
});

describe("runLocalMapScan", () => {
  it("détecte la marque sous un nom étendu via « & »↔« et » (regex), même si l'extraction la rate", async () => {
    const result = await runLocalMapScan({
      brand: "ACB Portes & Fenêtres",
      sector: "menuiserie",
      cities: [city("Angers", 47.47, -0.55)],
      intents: ["meilleur menuisier"],
      execute: vi.fn(async () => ({
        text: "À Angers : ACB Portes et Fenêtres INTERNORM TSCHOEPPE, et Sogefi.",
      })),
      extractBrands: fakeExtract({
        brandsPerResponse: [["ACB Portes et Fenêtres INTERNORM TSCHOEPPE", "Sogefi"]],
        targetCitedPerResponse: [false], // l'extraction rate, la regex doit rattraper
      }),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const angers = result.report.cities[0]!;
    expect(angers.recommended).toBe(true);
    // Le nom étendu de la marque n'est PAS compté comme concurrent.
    expect(angers.rivals).toEqual(["Sogefi"]);
  });

  it("2 intentions par ville : recommandé si cité dans AU MOINS une", async () => {
    const result = await runLocalMapScan({
      brand: "Léa",
      sector: "coiffeur",
      cities: [city("Tours", 47.39, 0.69)],
      intents: ["meilleur coiffeur", "coloration"],
      // 1ʳᵉ question : pas cité ; 2ᵉ : cité.
      execute: vi.fn(async (q: string) =>
        q.startsWith("coloration")
          ? { text: "Léa fait de super colorations." }
          : { text: "Top Hair." },
      ),
      extractBrands: fakeExtract({
        brandsPerResponse: [["Top Hair"], ["Léa"]],
        targetCitedPerResponse: [false, true],
      }),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.cities[0]?.recommended).toBe(true);
    expect(result.report.cities[0]?.queries).toHaveLength(2);
  });

  it("jette les libellés génériques et agrège les concurrents par nb de villes", async () => {
    const result = await runLocalMapScan({
      brand: "Fenêtres sur Loir",
      sector: "menuiserie",
      cities: [city("Cholet", 47.06, -0.88), city("Saumur", 47.26, -0.08)],
      intents: ["meilleur menuisier"],
      execute: vi.fn(async (q: string) =>
        q.includes("Cholet")
          ? { text: "Menuiserie Cholet, K-LINE." }
          : { text: "K-LINE et Sogal." },
      ),
      extractBrands: fakeExtract({
        brandsPerResponse: [
          ["Menuiserie Cholet", "K-LINE"],
          ["K-LINE", "Sogal"],
        ],
        targetCitedPerResponse: [false, false],
      }),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // « Menuiserie Cholet » filtré (générique pour Cholet).
    expect(result.report.cities[0]?.rivals).toEqual(["K-LINE"]);
    // K-LINE cité dans 2 villes → en tête du top concurrents.
    expect(result.report.topCompetitors[0]).toEqual({ name: "K-LINE", cityCount: 2 });
  });

  it("remonte une erreur si le LLM échoue", async () => {
    const result = await runLocalMapScan({
      brand: "X",
      sector: "y",
      cities: [city("Tours")],
      intents: ["meilleur y"],
      execute: vi.fn(async () => {
        throw new Error("boom");
      }),
      extractBrands: fakeExtract({ brandsPerResponse: [], targetCitedPerResponse: [] }),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("llm_unavailable");
  });
});
