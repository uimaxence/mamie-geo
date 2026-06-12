import { describe, expect, it } from "vitest";
import {
  findCuratedComparators,
  isBlockedDomain,
  labelFromDomain,
  normalizeText,
  sortChecksForDisplay,
} from "./sectors";
import type { ComparatorCheck } from "./types";

describe("normalizeText", () => {
  it("minuscules + accents retirés", () => {
    expect(normalizeText("  Électricité Générale ")).toBe("electricite generale");
  });
});

describe("findCuratedComparators", () => {
  it("matche un secteur avec accents et mots autour", () => {
    const comparators = findCuratedComparators("Assurance habitation pour PME");
    expect(comparators.map((c) => c.domain)).toContain("lelynx.fr");
  });

  it("fusionne sans doublon quand plusieurs secteurs matchent", () => {
    const comparators = findCuratedComparators("banque et assurance");
    const domains = comparators.map((c) => c.domain);
    expect(domains).toContain("comparabanques.fr");
    expect(domains).toContain("lelynx.fr");
    expect(new Set(domains).size).toBe(domains.length);
  });

  it("retourne vide pour un secteur inconnu", () => {
    expect(findCuratedComparators("apiculture urbaine")).toEqual([]);
  });
});

describe("isBlockedDomain", () => {
  it("bloque les réseaux sociaux et sous-domaines", () => {
    expect(isBlockedDomain("facebook.com")).toBe(true);
    expect(isBlockedDomain("fr-fr.facebook.com")).toBe(true);
    expect(isBlockedDomain("fr.wikipedia.org")).toBe(true);
  });
  it("laisse passer les comparateurs", () => {
    expect(isBlockedDomain("lelynx.fr")).toBe(false);
    expect(isBlockedDomain("fr.trustpilot.com")).toBe(false);
  });
});

describe("labelFromDomain", () => {
  it("capitalise et remplace les tirets", () => {
    expect(labelFromDomain("hello-watt.fr")).toBe("Hello Watt");
    expect(labelFromDomain("appvizer.fr")).toBe("Appvizer");
  });
});

describe("sortChecksForDisplay", () => {
  it("présents d'abord, ordre stable sinon", () => {
    const checks: ComparatorCheck[] = [
      { domain: "a.fr", label: "A", origin: "etude", present: false },
      { domain: "b.fr", label: "B", origin: "recherche", present: true },
      { domain: "c.fr", label: "C", origin: "etude", present: false },
    ];
    expect(sortChecksForDisplay(checks).map((c) => c.domain)).toEqual(["b.fr", "a.fr", "c.fr"]);
  });
});
