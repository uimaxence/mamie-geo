import { describe, expect, it, vi } from "vitest";
import { runComparatorScan } from "./scan";
import type { SearchFn, WebSearchResult } from "./types";

function result(url: string, title = "page"): WebSearchResult {
  return { title, url, domain: new URL(url).hostname.replace(/^www\./, "") };
}

// Fake search : routé par préfixe de requête (découverte vs site:).
function fakeSearch(routes: Record<string, WebSearchResult[]>): SearchFn {
  return vi.fn(async (query: string) => {
    for (const [prefix, results] of Object.entries(routes)) {
      if (query.startsWith(prefix)) return results;
    }
    return [];
  });
}

describe("runComparatorScan", () => {
  it("fusionne curaté + découverte et détecte la présence", async () => {
    const search = fakeSearch({
      "meilleur assurance": [
        result("https://www.lelynx.fr/assurance-auto/", "Comparatif assurance auto"), // déjà curaté → dédupliqué
        result("https://www.hyperassur.com/comparatif/", "Top 10 des assurances 2026"),
        result("https://fr.wikipedia.org/wiki/Assurance", "Assurance — Wikipédia"), // blocklist
      ],
      'site:lelynx.fr "Acme Assur"': [result("https://www.lelynx.fr/avis/acme-assur/", "Avis Acme")],
    });

    const scan = await runComparatorScan({ brand: "Acme Assur", sector: "assurance auto", search });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;

    const domains = scan.report.checks.map((c) => c.domain);
    expect(domains).toContain("lelynx.fr");
    expect(domains).toContain("hyperassur.com");
    expect(domains).not.toContain("fr.wikipedia.org");
    // Curatés d'abord, pas de doublon lelynx.
    expect(domains.filter((d) => d === "lelynx.fr")).toHaveLength(1);

    const lelynx = scan.report.checks.find((c) => c.domain === "lelynx.fr");
    expect(lelynx?.present).toBe(true);
    expect(lelynx?.foundUrl).toBe("https://www.lelynx.fr/avis/acme-assur/");
    expect(lelynx?.origin).toBe("etude");

    const hyperassur = scan.report.checks.find((c) => c.domain === "hyperassur.com");
    expect(hyperassur?.present).toBe(false);
    expect(hyperassur?.origin).toBe("recherche");

    expect(scan.report.presentCount).toBe(1);
    expect(scan.report.totalChecked).toBe(scan.report.checks.length);
    expect(scan.report.scorePct).toBe(
      Math.round((1 / scan.report.checks.length) * 100),
    );
  });

  it("exclut le domaine de la marque de la découverte", async () => {
    const search = fakeSearch({
      "meilleur logiciel de caisse": [
        result("https://www.acme-caisse.fr/", "Acme Caisse — logiciel de caisse"),
        result("https://comparatif-caisse.fr/top-10/", "Comparatif des logiciels de caisse"),
      ],
    });
    const scan = await runComparatorScan({
      brand: "Acme Caisse",
      sector: "logiciel de caisse",
      websiteDomain: "acme-caisse.fr",
      search,
    });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;
    expect(scan.report.checks.map((c) => c.domain)).not.toContain("acme-caisse.fr");
  });

  it("classe les sites d'entreprise en concurrents, pas en comparateurs", async () => {
    const search = fakeSearch({
      "meilleur menuiserie": [
        result("https://www.annuaire-menuisiers.fr/", "Annuaire des menuisiers de France"),
        result("https://www.menuiserie-dupont.fr/", "Menuiserie Dupont — fenêtres et portes à Tours"),
        result("https://www.atelier-bois.fr/", "Atelier Bois : votre menuisier sur mesure"),
      ],
    });
    const scan = await runComparatorScan({ brand: "Acme", sector: "menuiserie", search });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;

    const checkDomains = scan.report.checks.map((c) => c.domain);
    expect(checkDomains).toContain("annuaire-menuisiers.fr");
    expect(checkDomains).not.toContain("menuiserie-dupont.fr");
    expect(checkDomains).not.toContain("atelier-bois.fr");

    const competitorDomains = scan.report.competitorsSpotted.map((c) => c.domain);
    expect(competitorDomains).toEqual(["menuiserie-dupont.fr", "atelier-bois.fr"]);
    expect(scan.report.competitorsSpotted[0]?.url).toBe("https://www.menuiserie-dupont.fr/");
  });

  it("retourne no_comparators pour un secteur introuvable", async () => {
    const scan = await runComparatorScan({
      brand: "Acme",
      sector: "zzzzz introuvable",
      search: fakeSearch({}),
    });
    expect(scan.ok).toBe(false);
    if (scan.ok) return;
    expect(scan.code).toBe("no_comparators");
  });

  it("retourne search_unavailable si la découverte échoue sans curaté", async () => {
    const failing: SearchFn = async () => {
      throw new Error("HTTP 500");
    };
    const scan = await runComparatorScan({
      brand: "Acme",
      sector: "zzzzz introuvable",
      search: failing,
    });
    expect(scan.ok).toBe(false);
    if (scan.ok) return;
    expect(scan.code).toBe("search_unavailable");
  });

  it("continue en mode dégradé si la découverte échoue avec du curaté", async () => {
    let calls = 0;
    const search: SearchFn = async (query: string) => {
      calls += 1;
      if (!query.startsWith("site:")) throw new Error("HTTP 429");
      return query.includes("lelynx.fr")
        ? [result("https://www.lelynx.fr/avis/acme/")]
        : [];
    };
    const scan = await runComparatorScan({ brand: "Acme", sector: "assurance", search });
    expect(scan.ok).toBe(true);
    if (!scan.ok) return;
    expect(scan.report.checks.every((c) => c.origin === "etude")).toBe(true);
    expect(scan.report.presentCount).toBe(1);
    expect(calls).toBeGreaterThan(1);
  });

  it("retire les guillemets de la marque dans les requêtes", async () => {
    const queries: string[] = [];
    const search: SearchFn = async (query: string) => {
      queries.push(query);
      return [];
    };
    await runComparatorScan({ brand: '"Acme"', sector: "banque", search });
    const presenceQueries = queries.filter((q) => q.startsWith("site:"));
    expect(presenceQueries.length).toBeGreaterThan(0);
    for (const q of presenceQueries) {
      expect(q).toContain('"Acme"');
      expect(q).not.toContain('""Acme""');
    }
  });
});
