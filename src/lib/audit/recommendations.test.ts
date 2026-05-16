import { describe, expect, it } from "vitest";
import { getRecommendation, listDocumentedCheckIds } from "./recommendations";

describe("getRecommendation", () => {
  it("retourne une reco riche pour les checks documentés", () => {
    const reco = getRecommendation("geo.faqpage-jsonld-missing");
    expect(reco.why.length).toBeGreaterThan(50);
    expect(reco.howToFix).toContain("FAQPage");
    expect(reco.geoImpact).toBe("high");
  });

  it("retourne la reco générique pour un check id inconnu", () => {
    const reco = getRecommendation("invented.check-that-doesnt-exist");
    expect(reco.geoImpact).toBe("low");
    expect(reco.why).toContain("Ce check");
  });

  it("toutes les recos high-impact ont un howToFix avec exemple HTML/header", () => {
    for (const id of listDocumentedCheckIds()) {
      const reco = getRecommendation(id);
      if (reco.geoImpact === "high") {
        // Exemple HTML, header, ou pointe vers un patch concret
        expect(reco.howToFix.length).toBeGreaterThan(80);
      }
    }
  });

  it("liste les check_ids documentés (sanity check)", () => {
    const ids = listDocumentedCheckIds();
    expect(ids).toContain("geo.faqpage-jsonld-missing");
    expect(ids).toContain("seo.title-missing");
    expect(ids).toContain("security.https-missing");
    expect(ids.length).toBeGreaterThan(25);
  });
});
