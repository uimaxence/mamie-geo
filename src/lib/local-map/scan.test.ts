import { describe, expect, it, vi } from "vitest";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { brandPatterns, dedupeCities, type ScanCity } from "./queries";
import { runLocalScan } from "./scan";

const city = (name: string, lat = 47.4, lng = 0.5): ScanCity => ({ name, lat, lng });

const fakeExtract = (data: BrandExtraction) => async (): Promise<BrandExtraction> => data;

describe("brandPatterns", () => {
  it("gère « & » ↔ « et »", () => {
    const p = brandPatterns("ACB Portes & Fenêtres");
    expect(p).toContain("ACB Portes & Fenêtres");
    expect(p).toContain("ACB Portes et Fenêtres");
  });
});

describe("dedupeCities", () => {
  it("garde l'ordre, déduplique et borne à 7", () => {
    const list = dedupeCities(
      [city("Tours"), city("tours"), ...Array.from({ length: 12 }, (_, i) => city(`V${i}`))],
      normalizeText,
    );
    expect(list[0]?.name).toBe("Tours");
    expect(list).toHaveLength(7);
  });
});

describe("runLocalScan", () => {
  it("détecte la marque sous un nom étendu (& ↔ et) et l'exclut des concurrents", async () => {
    const out = await runLocalScan({
      brand: "ACB Portes & Fenêtres",
      sector: "menuiserie",
      cities: [city("Angers")],
      execute: vi.fn(async () => ({
        text: "À Angers : ACB Portes et Fenêtres INTERNORM, et Menuiserie Bouesnard.",
      })),
      extractBrands: fakeExtract({
        brandsPerResponse: [["ACB Portes et Fenêtres INTERNORM", "Menuiserie Bouesnard"]],
        targetCitedPerResponse: [false], // l'extraction rate ; la regex (& → et) rattrape
      }),
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const angers = out.report.cities[0]!;
    expect(angers.recommended).toBe(true);
    expect(angers.rivals).toEqual(["Menuiserie Bouesnard"]); // pas le nom étendu de la marque
  });

  it("recommandé via l'extraction ; filtre générique « métier ville » ; agrège les concurrents", async () => {
    const out = await runLocalScan({
      brand: "Fenêtres sur Loir",
      sector: "menuiserie",
      cities: [city("Cholet"), city("Saumur")],
      execute: vi.fn(async (q: string) =>
        q.includes("Cholet") ? { text: "Menuiserie Cholet, K-LINE." } : { text: "K-LINE, Sogal." },
      ),
      extractBrands: fakeExtract({
        brandsPerResponse: [
          ["Menuiserie Cholet", "K-LINE"],
          ["K-LINE", "Sogal"],
        ],
        targetCitedPerResponse: [false, false],
      }),
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.report.cities[0]?.rivals).toEqual(["K-LINE"]); // « Menuiserie Cholet » filtré
    expect(out.report.topCompetitors[0]).toEqual({ name: "K-LINE", cityCount: 2 });
  });

  it("erreur si l'IA échoue", async () => {
    const out = await runLocalScan({
      brand: "X",
      sector: "y",
      cities: [city("Tours")],
      execute: vi.fn(async () => {
        throw new Error("perplexity down");
      }),
      extractBrands: fakeExtract({ brandsPerResponse: [], targetCitedPerResponse: [] }),
    });
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.code).toBe("llm_unavailable");
  });
});
