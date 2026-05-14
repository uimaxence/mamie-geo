import { describe, expect, it } from "vitest";
import { createPromptSchema, updatePromptSchema } from "./schemas";

describe("createPromptSchema", () => {
  it("accepte un payload minimal valide", () => {
    const parsed = createPromptSchema.parse({ text: "Bonjour le monde" });
    expect(parsed.text).toBe("Bonjour le monde");
    expect(parsed.isActive).toBe(true); // default
  });

  it("trim le texte", () => {
    const parsed = createPromptSchema.parse({ text: "   Bonjour le monde   " });
    expect(parsed.text).toBe("Bonjour le monde");
  });

  it("rejette un texte trop court", () => {
    const result = createPromptSchema.safeParse({ text: "ok" });
    expect(result.success).toBe(false);
  });

  it("rejette un texte trop long (> 500 chars)", () => {
    const result = createPromptSchema.safeParse({ text: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("accepte une catégorie valide", () => {
    const parsed = createPromptSchema.parse({
      text: "Question commerciale",
      category: "commercial",
    });
    expect(parsed.category).toBe("commercial");
  });

  it("rejette une catégorie hors enum", () => {
    const result = createPromptSchema.safeParse({
      text: "Test",
      category: "fakecategory",
    });
    expect(result.success).toBe(false);
  });

  it("accepte category null", () => {
    const parsed = createPromptSchema.parse({ text: "Test test", category: null });
    expect(parsed.category).toBeNull();
  });
});

describe("updatePromptSchema", () => {
  it("accepte un payload vide (toutes optionnels)", () => {
    const parsed = updatePromptSchema.parse({});
    expect(parsed).toEqual({});
  });

  it("accepte une modif partielle (juste isActive)", () => {
    const parsed = updatePromptSchema.parse({ isActive: false });
    expect(parsed.isActive).toBe(false);
  });

  it("trim le texte si fourni", () => {
    const parsed = updatePromptSchema.parse({ text: "  Nouveau texte  " });
    expect(parsed.text).toBe("Nouveau texte");
  });
});
