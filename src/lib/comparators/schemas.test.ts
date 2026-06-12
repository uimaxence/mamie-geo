import { describe, expect, it } from "vitest";
import { comparatorScanSchema } from "./schemas";

const BASE = {
  email: "test@exemple.fr",
  brandName: "Acme",
  sector: "menuiserie",
};

describe("comparatorScanSchema", () => {
  it("normalise une URL collée dans websiteDomain", () => {
    const parsed = comparatorScanSchema.parse({
      ...BASE,
      websiteDomain: "https://www.fenetres-sur-loir.fr/",
    });
    expect(parsed.websiteDomain).toBe("fenetres-sur-loir.fr");
  });

  it("accepte websiteDomain vide ou absent", () => {
    expect(comparatorScanSchema.parse({ ...BASE, websiteDomain: "" }).websiteDomain).toBe("");
    expect(comparatorScanSchema.parse(BASE).websiteDomain).toBeUndefined();
  });

  it("rejette un websiteDomain sans TLD", () => {
    const parsed = comparatorScanSchema.safeParse({ ...BASE, websiteDomain: "pas un domaine" });
    expect(parsed.success).toBe(false);
  });

  it("rejette un secteur trop court", () => {
    const parsed = comparatorScanSchema.safeParse({ ...BASE, sector: "ab" });
    expect(parsed.success).toBe(false);
  });
});
