import { test, expect } from "@playwright/test";

// Smoke test /outils/test-visibilite-ia — form lead capture rendu
// + validation client. Soumission réelle pas testée ici (besoin Brevo).

test("lead magnet page renders form with all fields", async ({ page }) => {
  await page.goto("/outils/test-visibilite-ia");

  await expect(page.getByRole("heading", { name: /Reçois un audit gratuit de ta/ })).toBeVisible();

  await expect(page.getByLabel(/Ton email/)).toBeVisible();
  await expect(page.getByLabel(/Nom de la marque/)).toBeVisible();
  await expect(page.getByLabel(/Domaine principal/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Recevoir mon audit/ })).toBeVisible();
});

test("lead magnet shows 5 LLM badges visible in hero", async ({ page }) => {
  await page.goto("/outils/test-visibilite-ia");
  for (const name of ["ChatGPT", "Claude", "Perplexity", "Gemini", "Le Chat"]) {
    await expect(page.getByText(name).first()).toBeVisible();
  }
});
