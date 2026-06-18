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

  it("filtre le générique « métier ville » et agrège les concurrents par ville", async () => {
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

  it("classe top / mentioned / absent et pondère le score local", async () => {
    const out = await runLocalScan({
      brand: "Acme",
      sector: "menuiserie",
      cities: [city("A"), city("B"), city("C")],
      execute: vi.fn(async (q: string) =>
        q.includes("à A ")
          ? { text: "Acme, Rival Un." } // en tête
          : q.includes("à B ")
            ? { text: "Rival Un, Acme, Rival Deux." } // cité, pas en tête
            : { text: "Rival Un, Rival Deux." },
      ), // absente
      extractBrands: fakeExtract({
        brandsPerResponse: [
          ["Acme", "Rival Un"],
          ["Rival Un", "Acme", "Rival Deux"],
          ["Rival Un", "Rival Deux"],
        ],
        targetCitedPerResponse: [true, true, false],
      }),
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const [a, b, c] = out.report.cities;
    expect(a!.status).toBe("top");
    expect(a!.recommended).toBe(true);
    expect(b!.status).toBe("mentioned");
    expect(b!.topRival).toBe("Rival Un"); // concurrent cité devant
    expect(c!.status).toBe("absent");
    expect(out.report.recommendedCount).toBe(1);
    expect(out.report.mentionedCount).toBe(1);
    // (1 + 0,7 + 0) / 3 = 0,567 → 57
    expect(out.report.score).toBe(57);
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
