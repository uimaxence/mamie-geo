import { describe, expect, it } from "vitest";
import { createCompetitorSchema, updateCompetitorSchema } from "./schemas";

describe("createCompetitorSchema", () => {
  it("accepte un payload minimal", () => {
    const parsed = createCompetitorSchema.parse({ name: "Profound" });
    expect(parsed.name).toBe("Profound");
    expect(parsed.aliases).toEqual([]);
    expect(parsed.domain).toBeUndefined();
  });

  it("trim le nom", () => {
    const parsed = createCompetitorSchema.parse({ name: "  Profound  " });
    expect(parsed.name).toBe("Profound");
  });

  it("rejette un nom vide", () => {
    const result = createCompetitorSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepte un domaine valide", () => {
    const parsed = createCompetitorSchema.parse({
      name: "Profound",
      domain: "profound.so",
    });
    expect(parsed.domain).toBe("profound.so");
  });

  it("rejette un domaine invalide", () => {
    const result = createCompetitorSchema.safeParse({
      name: "Profound",
      domain: "pas un domaine",
    });
    expect(result.success).toBe(false);
  });

  it("transforme un domaine vide en null", () => {
    const parsed = createCompetitorSchema.parse({
      name: "Profound",
      domain: "",
    });
    expect(parsed.domain).toBeNull();
  });

  it("dédoublonne les aliases case-insensitive", () => {
    const parsed = createCompetitorSchema.parse({
      name: "Profound",
      aliases: ["Profound", "profound", "PROFOUND", "Profound.so"],
    });
    expect(parsed.aliases).toEqual(["Profound", "Profound.so"]);
  });

  it("trim chaque alias", () => {
    const parsed = createCompetitorSchema.parse({
      name: "Profound",
      aliases: ["  Profound  ", " Profound.so "],
    });
    expect(parsed.aliases).toEqual(["Profound", "Profound.so"]);
  });

  it("ignore les aliases vides après trim", () => {
    const parsed = createCompetitorSchema.parse({
      name: "Profound",
      aliases: ["Profound", "", "   "],
    });
    expect(parsed.aliases).toEqual(["Profound"]);
  });

  it("rejette plus de 10 aliases", () => {
    const result = createCompetitorSchema.safeParse({
      name: "X",
      aliases: Array.from({ length: 11 }, (_, i) => `alias${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCompetitorSchema", () => {
  it("accepte un payload vide", () => {
    const parsed = updateCompetitorSchema.parse({});
    expect(parsed).toEqual({});
  });

  it("accepte une modif partielle (juste aliases)", () => {
    const parsed = updateCompetitorSchema.parse({
      aliases: ["X", "Y"],
    });
    expect(parsed.aliases).toEqual(["X", "Y"]);
  });
});
