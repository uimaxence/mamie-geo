import { describe, expect, it, vi } from "vitest";
import { normalizeText } from "@/lib/comparators/sectors";
import type { WebSearchResult } from "@/lib/comparators/types";
import type { CityGrounding } from "./grounding";
import { brandPatterns, dedupeCities, type ScanCity } from "./queries";
import { runGroundedLocalScan } from "./scan";

const city = (name: string, lat = 47.4, lng = 0.5): ScanCity => ({ name, lat, lng });
const result = (title: string, domain: string): WebSearchResult => ({
  title,
  url: `https://${domain}`,
  domain,
});

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

describe("runGroundedLocalScan", () => {
  const fakeGround = (data: CityGrounding[]) => async (): Promise<CityGrounding[]> => data;

  it("recommandé si la marque est présente ; concurrents filtrés (marque étendue + générique)", async () => {
    const out = await runGroundedLocalScan({
      brand: "Fenêtres sur Loir",
      sector: "menuiserie",
      cities: [city("Seiches-sur-le-Loir"), city("Angers")],
      search: vi.fn(async (q: string) =>
        q.includes("Angers")
          ? [result("ACB Portes", "acb.fr"), result("Menuiserie Angers", "x.fr")]
          : [result("Fenêtres sur Loir", "fenetres-sur-loir.fr")],
      ),
      ground: fakeGround([
        // Seiches : marque présente.
        { city: "Seiches-sur-le-Loir", businesses: ["Fenêtres sur Loir"], present: true },
        // Angers : pas la marque, cite ACB + un générique « Menuiserie Angers ».
        { city: "Angers", businesses: ["ACB Portes", "Menuiserie Angers"], present: false },
      ]),
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const [seiches, angers] = out.report.cities;
    expect(seiches?.recommended).toBe(true);
    expect(seiches?.rivals).toEqual([]); // la marque elle-même n'est pas un rival
    expect(angers?.recommended).toBe(false);
    expect(angers?.rivals).toEqual(["ACB Portes"]); // « Menuiserie Angers » filtré
    expect(angers?.topRival).toBe("ACB Portes");
    expect(out.report.recommendedCount).toBe(1);
  });

  it("agrège les concurrents par nombre de villes", async () => {
    const out = await runGroundedLocalScan({
      brand: "Moi",
      sector: "coiffeur",
      cities: [city("Tours"), city("Blois")],
      search: vi.fn(async () => [] as WebSearchResult[]),
      ground: fakeGround([
        { city: "Tours", businesses: ["Top Hair", "Studio X"], present: false },
        { city: "Blois", businesses: ["Top Hair"], present: false },
      ]),
    });
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.report.topCompetitors[0]).toEqual({ name: "Top Hair", cityCount: 2 });
  });

  it("erreur si la recherche web échoue", async () => {
    const out = await runGroundedLocalScan({
      brand: "X",
      sector: "y",
      cities: [city("Tours")],
      search: vi.fn(async () => {
        throw new Error("brave down");
      }),
      ground: fakeGround([]),
    });
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.code).toBe("llm_unavailable");
  });
});
