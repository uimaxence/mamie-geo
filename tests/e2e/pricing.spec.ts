import { test, expect } from "@playwright/test";

// Smoke test /pricing — 4 plans + toggle mensuel/annuel + comparison
// table.

test("pricing page renders 4 plans with correct pricing", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByRole("heading", { name: "À chaque profil son plan." })).toBeVisible();

  // 4 plans
  for (const name of ["Starter", "Pro", "Agence", "Enterprise"]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }

  // Tarifs mensuels par défaut visibles
  await expect(page.getByText("49", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("149", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("399", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Sur devis/).first()).toBeVisible();

  // Badge "Le plus populaire" sur Pro
  await expect(page.getByText(/Le plus populaire/).first()).toBeVisible();
});

test("pricing toggle annuel changes prices to discounted values", async ({ page }) => {
  await page.goto("/pricing");

  await page.getByRole("tab", { name: /Annuel/ }).click();

  // 49 × 0.8 = 39.2 → arrondi à 39
  await expect(page.getByText("39", { exact: true }).first()).toBeVisible();
  // 149 × 0.8 = 119.2 → arrondi à 119
  await expect(page.getByText("119", { exact: true }).first()).toBeVisible();
  // 399 × 0.8 = 319.2 → arrondi à 319
  await expect(page.getByText("319", { exact: true }).first()).toBeVisible();
});

test("pricing comparison table shows 3 feature groups", async ({ page }) => {
  await page.goto("/pricing");

  for (const group of ["Tracking", "Reporting", "Compte"]) {
    await expect(page.getByText(group, { exact: true }).first()).toBeVisible();
  }
});
