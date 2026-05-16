import { describe, expect, it } from "vitest";
import { blogFrontmatterSchema, BLOG_CATEGORIES, CATEGORY_TONE } from "./schemas";

describe("blogFrontmatterSchema", () => {
  const valid = {
    title: "Test article",
    description: "Description qui doit faire au moins vingt caractères.",
    date: "2026-05-16",
    category: "Méthodo",
    author: "Max",
    readingTimeMin: 8,
    keywords: ["geo", "seo"],
    cta: "starter",
  };

  it("accepte un frontmatter complet valide", () => {
    const r = blogFrontmatterSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("applique les défauts (author Mamie GEO, cta audit-gratuit, draft false)", () => {
    const { author, cta, ...withoutDefaults } = valid;
    void author;
    void cta;
    const r = blogFrontmatterSchema.parse(withoutDefaults);
    expect(r.author).toBe("Mamie GEO");
    expect(r.cta).toBe("audit-gratuit");
    expect(r.draft).toBe(false);
    expect(r.keywords).toEqual(["geo", "seo"]);
  });

  it("rejette une description trop courte", () => {
    const r = blogFrontmatterSchema.safeParse({ ...valid, description: "trop court" });
    expect(r.success).toBe(false);
  });

  it("rejette une date malformée", () => {
    const r = blogFrontmatterSchema.safeParse({ ...valid, date: "16/05/2026" });
    expect(r.success).toBe(false);
  });

  it("accepte une date Date (gray-matter peut renvoyer Date) et la transforme en string YYYY-MM-DD", () => {
    const r = blogFrontmatterSchema.parse({
      ...valid,
      date: new Date("2026-05-16T00:00:00Z"),
    });
    expect(r.date).toBe("2026-05-16");
  });

  it("rejette une catégorie inconnue", () => {
    const r = blogFrontmatterSchema.safeParse({ ...valid, category: "Inconnue" });
    expect(r.success).toBe(false);
  });

  it("rejette un cta inconnu", () => {
    const r = blogFrontmatterSchema.safeParse({ ...valid, cta: "premium" });
    expect(r.success).toBe(false);
  });

  it("rejette readingTimeMin négatif ou nul", () => {
    expect(blogFrontmatterSchema.safeParse({ ...valid, readingTimeMin: 0 }).success).toBe(false);
    expect(blogFrontmatterSchema.safeParse({ ...valid, readingTimeMin: -1 }).success).toBe(false);
  });
});

describe("CATEGORY_TONE", () => {
  it("a un tone pour chacune des 5 catégories", () => {
    for (const cat of BLOG_CATEGORIES) {
      expect(CATEGORY_TONE[cat]).toBeDefined();
    }
  });
});
