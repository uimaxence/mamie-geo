import { test, expect } from "@playwright/test";

// Smoke test home / — vérifie que les sections clés se rendent.
// Pas de hover/interactions complexes pour V0, juste la présence des
// éléments business-critiques.

test("home renders all key sections", async ({ page }) => {
  await page.goto("/");

  // Header
  await expect(page.getByRole("link", { name: /^Mamie GEO$/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Connexion/ })).toBeVisible();

  // Hero
  await expect(
    page.getByRole("heading", { name: /Sache enfin si ChatGPT parle de toi/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Tester gratuitement/ })).toHaveAttribute(
    "href",
    "/login",
  );

  // 5 LLMs badges visible
  for (const name of ["ChatGPT", "Claude", "Perplexity", "Gemini", "Le Chat"]) {
    await expect(page.getByText(name).first()).toBeVisible();
  }

  // Sections clés
  await expect(
    page.getByRole("heading", { name: /Avant Mamie GEO, après Mamie GEO/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Trois étapes pour mesurer/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Conçu pour 3 profils/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Questions fréquentes/ })).toBeVisible();
});

test("home navigation to /login via CTA primary", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Tester gratuitement/ }).click();
  await expect(page).toHaveURL("/login");
});
