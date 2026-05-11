import { test, expect } from "@playwright/test";

// Smoke test /login — rendering du form + validation client. Pas de
// soumission réelle (besoin de Brevo SMTP fonctionnel — testé
// séparément via `pnpm test:smtp`).

test("login page renders split panel + form", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /On t.envoie un lien magique/ })).toBeVisible();

  // Form fields
  await expect(page.getByLabel(/Adresse email/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Recevoir le lien/ })).toBeVisible();
});

test("login button disabled while email is empty", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Recevoir le lien/ })).toBeDisabled();
});

test("login button enabled when email is valid format", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/Adresse email/).fill("test@example.com");
  await expect(page.getByRole("button", { name: /Recevoir le lien/ })).toBeEnabled();
});
