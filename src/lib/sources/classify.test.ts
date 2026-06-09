import { describe, expect, it } from "vitest";
import { classifySource, normalizeDomain } from "./classify";

const opts = (over: Partial<Parameters<typeof classifySource>[1]> = {}) => ({
  brandDomain: null,
  competitorDomains: [],
  ...over,
});

describe("normalizeDomain", () => {
  it("retire protocole, www et chemin", () => {
    expect(normalizeDomain("https://www.Brand.com/blog/x")).toBe("brand.com");
    expect(normalizeDomain("HTTP://brand.fr")).toBe("brand.fr");
    expect(normalizeDomain("  brand.com  ")).toBe("brand.com");
  });
});

describe("classifySource", () => {
  it("tague ta marque (domaine exact + sous-domaine)", () => {
    expect(classifySource("brand.com", opts({ brandDomain: "brand.com" }))).toBe("you");
    expect(classifySource("blog.brand.com", opts({ brandDomain: "brand.com" }))).toBe("you");
  });

  it("ne confond pas un domaine qui contient le nom (boundary)", () => {
    expect(classifySource("notbrand.com", opts({ brandDomain: "brand.com" }))).toBe("other");
  });

  it("tague les domaines concurrents suivis", () => {
    const o = opts({ competitorDomains: ["peec.ai", "otterly.ai"] });
    expect(classifySource("peec.ai", o)).toBe("competitor");
    expect(classifySource("docs.otterly.ai", o)).toBe("competitor");
  });

  it("you a priorité sur competitor", () => {
    const o = opts({ brandDomain: "brand.com", competitorDomains: ["brand.com"] });
    expect(classifySource("brand.com", o)).toBe("you");
  });

  it("reconnaît reference et ugc", () => {
    expect(classifySource("fr.wikipedia.org", opts())).toBe("reference");
    expect(classifySource("wikidata.org", opts())).toBe("reference");
    expect(classifySource("www.reddit.com", opts())).toBe("ugc");
    expect(classifySource("news.ycombinator.com", opts())).toBe("ugc");
  });

  it("retombe sur other par défaut", () => {
    expect(classifySource("lemonde.fr", opts())).toBe("other");
  });

  it("ignore les domaines concurrents null", () => {
    expect(classifySource("foo.com", opts({ competitorDomains: [null, ""] }))).toBe("other");
  });
});
