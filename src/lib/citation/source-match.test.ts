import { describe, expect, it } from "vitest";
import { countBrandSources, urlMatchesBrand } from "./source-match";

const BRAND = { domain: "mamie-geo.fr", aliases: ["Mamie GEO", "mamie-seo.fr"] };

describe("urlMatchesBrand", () => {
  it("match exact host", () => {
    expect(urlMatchesBrand("https://mamie-geo.fr/pricing", BRAND)).toBe(true);
  });

  it("match avec www.", () => {
    expect(urlMatchesBrand("https://www.mamie-geo.fr/blog", BRAND)).toBe(true);
  });

  it("match sous-domaine", () => {
    expect(urlMatchesBrand("https://blog.mamie-geo.fr/article", BRAND)).toBe(true);
  });

  it("match alias domaine", () => {
    expect(urlMatchesBrand("https://www.mamie-seo.fr/outils", BRAND)).toBe(true);
  });

  it("ignore les aliases non-domaines (labels libres)", () => {
    expect(urlMatchesBrand("https://mamie-geo.com/", BRAND)).toBe(false);
  });

  it("ne match pas un autre domaine", () => {
    expect(urlMatchesBrand("https://example.com/mamie-geo", BRAND)).toBe(false);
  });

  it("ne match pas un suffixe trompeur", () => {
    // not-mamie-geo.fr ne doit pas matcher mamie-geo.fr
    expect(urlMatchesBrand("https://not-mamie-geo.fr/", BRAND)).toBe(false);
  });

  it("retourne false sur une URL invalide", () => {
    expect(urlMatchesBrand("not-a-url", BRAND)).toBe(false);
  });

  it("accepte un hostname brut (sans protocol)", () => {
    expect(urlMatchesBrand("mamie-geo.fr/page", BRAND)).toBe(true);
  });
});

describe("countBrandSources", () => {
  it("compte les apparitions sur les sources matchantes", () => {
    const sources = [
      { url: "https://mamie-geo.fr/" },
      { url: "https://blog.mamie-geo.fr/article" },
      { url: "https://example.com/" },
    ];
    const result = countBrandSources(sources, BRAND);
    expect(result.total).toBe(2);
    expect(result.hasAny).toBe(true);
  });

  it("retourne 0 et false si aucune source ne match", () => {
    const result = countBrandSources(
      [{ url: "https://example.com/" }, { url: "https://other.fr/" }],
      BRAND,
    );
    expect(result.total).toBe(0);
    expect(result.hasAny).toBe(false);
  });

  it("gère un set de sources vide", () => {
    expect(countBrandSources([], BRAND)).toEqual({ total: 0, hasAny: false });
  });
});
