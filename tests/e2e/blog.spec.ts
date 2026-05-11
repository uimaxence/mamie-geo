import { test, expect } from "@playwright/test";

// Smoke test /blog — index liste 3 articles + clic ouvre l'article.

test("blog index lists the 3 published articles", async ({ page }) => {
  await page.goto("/blog");

  await expect(page.getByRole("heading", { name: /Méthodes, études et opinions/ })).toBeVisible();

  // 3 articles V0 (PR 10a+b)
  for (const title of [
    /Qu.est-ce que le GEO/,
    /Mamie GEO vs Profound/,
    /État de la visibilité IA en France/,
  ]) {
    await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();
  }
});

test("clicking an article card opens the article page", async ({ page }) => {
  await page.goto("/blog");
  await page
    .getByRole("heading", { name: /Qu.est-ce que le GEO/ })
    .first()
    .click();

  await expect(page).toHaveURL("/blog/qu-est-ce-que-le-geo");
  await expect(page.getByRole("heading", { name: /Qu.est-ce que le GEO/ })).toBeVisible();
  // Le contenu MDX doit être rendu — vérifie présence d'un mot-clé
  await expect(page.getByText(/SEO/).first()).toBeVisible();
});

test("article page has back link to /blog", async ({ page }) => {
  await page.goto("/blog/mamie-geo-vs-profound");
  await page.getByRole("link", { name: /Tous les articles/ }).click();
  await expect(page).toHaveURL("/blog");
});
