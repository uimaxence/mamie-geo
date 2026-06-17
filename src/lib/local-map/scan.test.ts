import { describe, expect, it, vi } from "vitest";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { dedupeCities, type ScanCity } from "./queries";
import { runLocalMapScan } from "./scan";

const city = (name: string, lat: number | null = null, lng: number | null = null): ScanCity => ({
  name,
  lat,
  lng,
});

describe("dedupeCities", () => {
  it("garde l'ordre, déduplique (casse/accents) et borne à 9", () => {
    const list = dedupeCities(
      [
        city("Tours", 47.39, 0.69),
        city("tours"),
        city("Blois", 47.59, 1.33),
        ...Array.from({ length: 12 }, (_, i) => city(`Ville${i}`, 47, 1)),
      ],
      normalizeText,
    );
    expect(list[0]?.name).toBe("Tours");
    expect(list[0]?.lat).toBe(47.39); // coords conservées
    expect(list.filter((c) => normalizeText(c.name) === "tours")).toHaveLength(1);
    expect(list).toHaveLength(9);
  });
});

describe("runLocalMapScan", () => {
  const fakeExtract = (data: BrandExtraction) => async (): Promise<BrandExtraction> => data;

  it("recommandé via regex, propage les coords, topRival null si recommandé", async () => {
    const result = await runLocalMapScan({
      brand: "Coiffure Léa",
      sector: "coiffeur",
      cities: [city("Tours", 47.39, 0.69), city("Blois", 47.59, 1.33)],
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
    expect(tours?.lat).toBe(47.39);
    expect(tours?.rivals).toEqual(["Studio Hair"]);
    expect(tours?.topRival).toBeNull();
    expect(blois?.recommended).toBe(false);
    expect(blois?.topRival).toBe("Top Hair");
    expect(result.report.recommendedCount).toBe(1);
    expect(result.report.mainCity).toBe("Tours");
  });

  it("recommandé via le jugement d'extraction même si la regex rate la variante", async () => {
    const result = await runLocalMapScan({
      brand: "Boursorama",
      sector: "banque",
      cities: [city("Tours", 47.39, 0.69)],
      execute: vi.fn(async () => ({ text: "Le mieux à Tours, c'est BoursoBank." })),
      extractBrands: fakeExtract({
        brandsPerResponse: [["BoursoBank"]],
        targetCitedPerResponse: [true],
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
      cities: [city("Tours")],
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
