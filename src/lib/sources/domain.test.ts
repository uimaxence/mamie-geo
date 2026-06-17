import { describe, expect, it } from "vitest";
import { aggregateSourceDomains, extractHost } from "./domain";
import type { SourceListItem } from "./queries";

function source(url: string, citationCount: number): SourceListItem {
  return { url, title: null, citationCount, llms: [], lastCitedAt: "2026-06-17T00:00:00Z" };
}

describe("extractHost", () => {
  it("retire le www et garde le host", () => {
    expect(extractHost("https://www.decathlon.fr/p/raquette")).toBe("decathlon.fr");
    expect(extractHost("https://youtube.com/watch?v=x")).toBe("youtube.com");
  });

  it("renvoie l'entrée brute si l'URL est invalide", () => {
    expect(extractHost("pas-une-url")).toBe("pas-une-url");
  });
});

describe("aggregateSourceDomains", () => {
  it("replie les URLs par domaine et somme les citations", () => {
    const sources = [
      source("https://www.decathlon.fr/p/a", 100),
      source("https://decathlon.fr/p/b", 14),
      source("https://youtube.com/x", 38),
    ];
    const domains = aggregateSourceDomains(sources);
    expect(domains[0]).toEqual({ domain: "decathlon.fr", citationCount: 114 });
    expect(domains[1]).toEqual({ domain: "youtube.com", citationCount: 38 });
  });

  it("trie par citations décroissantes et borne au limit", () => {
    const sources = [
      source("https://a.com/1", 1),
      source("https://b.com/1", 5),
      source("https://c.com/1", 3),
    ];
    const domains = aggregateSourceDomains(sources, 2);
    expect(domains).toHaveLength(2);
    expect(domains.map((d) => d.domain)).toEqual(["b.com", "c.com"]);
  });

  it("renvoie un tableau vide sans sources", () => {
    expect(aggregateSourceDomains([])).toEqual([]);
  });
});
