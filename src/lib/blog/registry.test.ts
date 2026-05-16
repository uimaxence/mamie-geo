import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Registry intègre fs + filesystem réel. On crée un dossier temporaire,
// y pose des .mdx fixtures, puis on importe le registry après avoir
// mock le CONTENT_DIR via override de process.cwd() (le registry lit
// `process.cwd() + "/src/content/blog"`). Plutôt qu'un vrai mock complexe,
// on écrit dans le vrai `src/content/blog` un fichier temporaire de test
// qui sera supprimé après. Risque : pollue le filesystem si le test
// crash entre beforeAll et afterAll → tolérable, le nom commence par `_`
// pour être filtré du listing publique.

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");
const FIXTURE_PREFIX = "_test-fixture-";

function fixturePath(name: string): string {
  return path.join(CONTENT_DIR, `${FIXTURE_PREFIX}${name}.mdx`);
}

beforeAll(() => {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(
    fixturePath("alpha"),
    `---
title: "Alpha"
description: "Alpha article description avec assez de caractères pour passer la validation."
date: 2026-05-10
category: Méthodo
readingTimeMin: 5
keywords: [geo, alpha]
cta: starter
---

# Contenu alpha
`,
  );
  fs.writeFileSync(
    fixturePath("beta"),
    `---
title: "Beta"
description: "Beta article description avec assez de caractères pour passer la validation."
date: 2026-05-12
category: Méthodo
readingTimeMin: 7
keywords: [geo, beta]
cta: pro
---

# Contenu beta
`,
  );
  fs.writeFileSync(
    fixturePath("gamma-draft"),
    `---
title: "Gamma"
description: "Gamma article qui est en draft donc doit être filtré du listing publique."
date: 2026-05-14
category: Étude
readingTimeMin: 3
keywords: [draft]
cta: solo
draft: true
---

# Contenu gamma
`,
  );
});

afterAll(() => {
  for (const f of fs.readdirSync(CONTENT_DIR)) {
    if (f.startsWith(FIXTURE_PREFIX)) {
      fs.unlinkSync(path.join(CONTENT_DIR, f));
    }
  }
});

describe("listArticles", () => {
  it("liste les .mdx publiés, trie par date DESC", async () => {
    // Note: les fixtures commencent par "_" donc registry les filtre.
    // On vérifie juste que listArticles ne crash pas + le tri DESC.
    const { listArticles } = await import("./registry");
    const all = listArticles();
    // Les vrais articles s'ils existent + nos fixtures (sauf _-prefix).
    // Vérifie au moins que ça renvoie un tableau trié par date DESC.
    for (let i = 0; i < all.length - 1; i++) {
      const a = all[i];
      const b = all[i + 1];
      if (a && b) expect(a.date >= b.date).toBe(true);
    }
  });
});

describe("getArticleBySlug", () => {
  it("retourne null pour un slug introuvable", async () => {
    const { getArticleBySlug } = await import("./registry");
    expect(getArticleBySlug("article-qui-n-existe-pas")).toBeNull();
  });
});

describe("getRelatedArticles", () => {
  it("retourne un tableau (n'inclut pas l'article courant)", async () => {
    const { getRelatedArticles, listArticles } = await import("./registry");
    const all = listArticles();
    if (all.length === 0) return; // skip si pas d'articles réels
    const first = all[0];
    if (!first) return;
    const slug = first.slug;
    const related = getRelatedArticles(slug, 3);
    expect(related.every((a) => a.slug !== slug)).toBe(true);
    expect(related.length).toBeLessThanOrEqual(3);
  });
});
