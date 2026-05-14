import { describe, expect, it } from "vitest";
import { updateBrandAliasesSchema, updateWorkspaceNameSchema } from "./schemas";

describe("updateWorkspaceNameSchema", () => {
  it("accepte un nom valide trim", () => {
    const parsed = updateWorkspaceNameSchema.parse({ name: "  Ma société  " });
    expect(parsed.name).toBe("Ma société");
  });

  it("rejette un nom vide", () => {
    const result = updateWorkspaceNameSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejette un nom trop long (> 80)", () => {
    const result = updateWorkspaceNameSchema.safeParse({ name: "a".repeat(81) });
    expect(result.success).toBe(false);
  });
});

describe("updateBrandAliasesSchema", () => {
  it("accepte un payload vide (default [])", () => {
    const parsed = updateBrandAliasesSchema.parse({});
    expect(parsed.aliases).toEqual([]);
  });

  it("dédoublonne les aliases case-insensitive", () => {
    const parsed = updateBrandAliasesSchema.parse({
      aliases: ["Mamie", "mamie", "Mamie GEO"],
    });
    expect(parsed.aliases).toEqual(["Mamie", "Mamie GEO"]);
  });

  it("trim chaque alias", () => {
    const parsed = updateBrandAliasesSchema.parse({
      aliases: ["  Mamie  ", "  Mamie GEO  "],
    });
    expect(parsed.aliases).toEqual(["Mamie", "Mamie GEO"]);
  });

  it("rejette plus de 10 aliases", () => {
    const result = updateBrandAliasesSchema.safeParse({
      aliases: Array.from({ length: 11 }, (_, i) => `alias${i}`),
    });
    expect(result.success).toBe(false);
  });
});
