import { describe, expect, it, vi } from "vitest";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { resolveCityList } from "./queries";
import { runLocalMapScan } from "./scan";

describe("resolveCityList", () => {
  it("met la ville principale en premier, déduplique et borne à 5", () => {
    const list = resolveCityList(
      "Tours",
      ["Blois", "tours", "Amboise", "Loches", "Chinon", "Vendôme"],
      normalizeText,
    );
    expect(list[0]).toBe("Tours");
    expect(list).not.toContain("tours"); // dédup insensible à la casse
    expect(list).toHaveLength(5);
  });
});

describe("runLocalMapScan", () => {
  const fakeExtract = (data: BrandExtraction) => async (): Promise<BrandExtraction> => data;

  it("recommandé via regex, concurrents = marques hors la cible, topRival null si recommandé", async () => {
    const result = await runLocalMapScan({
      brand: "Coiffure Léa",
      sector: "coiffeur",
      mainCity: "Tours",
      surroundingCities: ["Blois"],
      // Tours : cite la marque ; Blois : ne la cite pas, cite Top Hair.
      execute: vi.fn(async (q: string) =>
        q.includes("Tours")
          ? { text: "À Tours, je recommande Coiffure Léa et Studio Hair." }
          : { text: "À Blois, le meilleur est Top Hair." },
      ),
      extractBrands: fakeExtract({
        brandsPerResponse: [["Coiffure Léa", "Studio Hair"], ["Top Hair"]],
        targetCitedPerResponse: [true, false],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const [tours, blois] = result.report.cities;
    expect(tours?.recommended).toBe(true);
    expect(tours?.rivals).toEqual(["Studio Hair"]); // exclut la marque cible
    expect(tours?.topRival).toBeNull();
    expect(blois?.recommended).toBe(false);
    expect(blois?.topRival).toBe("Top Hair");
    expect(result.report.recommendedCount).toBe(1);
    expect(result.report.totalCities).toBe(2);
  });

  it("recommandé via le jugement d'extraction même si la regex rate la variante de nom", async () => {
    const result = await runLocalMapScan({
      brand: "Boursorama",
      sector: "banque",
      mainCity: "Tours",
      surroundingCities: [],
      execute: vi.fn(async () => ({ text: "Le mieux à Tours, c'est BoursoBank." })),
      extractBrands: fakeExtract({
        brandsPerResponse: [["BoursoBank"]],
        targetCitedPerResponse: [true], // l'extraction reconnaît la variante
      }),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.cities[0]?.recommended).toBe(true);
  });

  it("remonte une erreur si le LLM échoue", async () => {
    const result = await runLocalMapScan({
      brand: "X",
      sector: "y",
      mainCity: "Tours",
      surroundingCities: [],
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
