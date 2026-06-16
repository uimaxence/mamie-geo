#!/usr/bin/env tsx
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";

// Seed dédié à la création de captures dashboard marketing (cf. plan V0
// P0.5 belle home, 2026-05-26).
//
// Crée une marque fictive crédible + 30 jours de metrics réalistes pour
// que les captures /app/dashboard, /app/prompts/[id], /app/competitors
// et /app/runs/[id] aient l'air d'un produit utilisé en condition réelle.
//
// Usage : pnpm seed:demo [email]
//   - email par défaut : demo@mamie-geo.fr (mais cette adresse n'a pas
//     de boîte mail réelle — utiliser ton propre email pour recevoir
//     le magic-link Brevo)
//   - ex. pnpm seed:demo maxencecailleau.pro@gmail.com
//
// IMPORTANT :
//   - refuse de tourner en NODE_ENV=production.
//   - idempotent : on peut le relancer sans recréer de doublons.
//   - les data sont déterministes (seed = brandId+llm+dateIdx) pour que
//     les captures soient reproductibles.

async function loadEnvLocal(): Promise<void> {
  try {
    const raw = await readFile(".env.local", "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  } catch {
    // pas de .env.local → on s'appuie uniquement sur l'env shell
  }
}

const DEMO_EMAIL = process.argv[2] ?? "demo@mamie-geo.fr";
const WORKSPACE_SLUG = "demo-boutique";
const BRAND_NAME = "La Maison Verte";
const BRAND_DOMAIN = "lamaisonverte.example.com";

const PROMPTS_FR = [
  "Quels sont les meilleurs sites de cosmétique bio en France ?",
  "Où acheter des produits zéro déchet en ligne ?",
  "Quelle boutique bio française livre rapidement ?",
  "Comparatif des meilleures e-boutiques de cosmétique naturelle",
  "Quelle marque de cosmétique bio française recommandes-tu ?",
];

const COMPETITORS = [
  { name: "Le Verger Bio", domain: "leverger-bio.example.com", aliases: ["Verger Bio"] },
  { name: "Le Potager Naturel", domain: "potager-naturel.example.com", aliases: ["Potager"] },
  { name: "Bio Express", domain: "bio-express.example.com", aliases: ["BioExpress"] },
];

const LLMS = ["claude", "chatgpt", "perplexity", "gemini", "lechat"] as const;

// Trend déterministe par LLM : starting score + drift + jitter.
// Calibré pour avoir des courbes lisibles à 30j avec score qui monte
// (effet "produit qui marche").
const LLM_PROFILES: Record<
  (typeof LLMS)[number],
  { start: number; drift: number; jitter: number }
> = {
  claude: { start: 38, drift: 0.95, jitter: 4 },
  chatgpt: { start: 32, drift: 0.7, jitter: 5 },
  perplexity: { start: 28, drift: 0.6, jitter: 3 },
  gemini: { start: 30, drift: 0.5, jitter: 4 },
  lechat: { start: 22, drift: 0.85, jitter: 3 },
};

// Pseudo-random déterministe simple (Mulberry32-like) seedé par string.
function seededFloat(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = (h ^ (h >>> 16)) >>> 0;
  return (h % 10_000) / 10_000;
}

async function main() {
  await loadEnvLocal();

  if (process.env.NODE_ENV === "production") {
    console.error("❌ seed:demo refuse de tourner en NODE_ENV=production.");
    process.exit(1);
  }

  const { db } = await import("@/db/client");
  const schema = await import("@/db/schema");

  console.log(`🎬 Seed demo workspace pour ${DEMO_EMAIL}…`);

  // 1. User Better Auth
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, DEMO_EMAIL),
  });
  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`  → user déjà présent : ${userId}`);
  } else {
    userId = randomUUID();
    await db.insert(schema.user).values({
      id: userId,
      email: DEMO_EMAIL,
      emailVerified: true,
      name: "Demo Boutique",
    });
    console.log(`  → user créé : ${userId}`);
  }

  // 2. Workspace
  const existingWs = await db.query.workspaces.findFirst({
    where: eq(schema.workspaces.slug, WORKSPACE_SLUG),
  });
  let workspaceId: string;
  if (existingWs) {
    workspaceId = existingWs.id;
    console.log(`  → workspace déjà présent : ${workspaceId}`);
  } else {
    const [created] = await db
      .insert(schema.workspaces)
      .values({ name: "Demo Boutique", slug: WORKSPACE_SLUG, plan: "starter" })
      .returning({ id: schema.workspaces.id });
    if (!created) throw new Error("Échec INSERT workspace");
    workspaceId = created.id;
    console.log(`  → workspace créé : ${workspaceId}`);
  }

  // 3. Membership owner
  await db
    .insert(schema.workspaceMembers)
    .values({ workspaceId, userId, role: "owner" })
    .onConflictDoNothing();

  // 4. Brand
  const existingBrand = await db.query.brands.findFirst({
    where: eq(schema.brands.workspaceId, workspaceId),
  });
  let brandId: string;
  if (existingBrand) {
    brandId = existingBrand.id;
    console.log(`  → brand déjà présente : ${brandId}`);
  } else {
    const [created] = await db
      .insert(schema.brands)
      .values({
        workspaceId,
        name: BRAND_NAME,
        domain: BRAND_DOMAIN,
        description: "Boutique e-commerce de cosmétique et produits du quotidien bio",
        aliases: ["Maison Verte", "lamaisonverte"],
      })
      .returning({ id: schema.brands.id });
    if (!created) throw new Error("Échec INSERT brand");
    brandId = created.id;
    console.log(`  → brand créée : ${brandId}`);
  }

  // 5. Concurrents
  for (const competitor of COMPETITORS) {
    const existing = await db.query.competitors.findFirst({
      where: and(
        eq(schema.competitors.brandId, brandId),
        eq(schema.competitors.name, competitor.name),
      ),
    });
    if (existing) continue;
    await db.insert(schema.competitors).values({ brandId, ...competitor });
  }
  console.log(`  → ${COMPETITORS.length} concurrents OK`);

  // 6. Prompts
  for (const text of PROMPTS_FR) {
    const existing = await db.query.prompts.findFirst({
      where: and(eq(schema.prompts.brandId, brandId), eq(schema.prompts.text, text)),
    });
    if (existing) continue;
    await db.insert(schema.prompts).values({
      brandId,
      text,
      language: "fr",
      isActive: true,
    });
  }
  const promptsCount = await db.$count(schema.prompts, eq(schema.prompts.brandId, brandId));
  console.log(`  → ${promptsCount} prompts actifs sur la brand`);

  // 7. citation_metrics_daily — 30 jours × 5 LLMs (déterministe).
  // ON CONFLICT DO NOTHING → idempotent.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let inserted = 0;
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - d);
    const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD

    for (const llm of LLMS) {
      const profile = LLM_PROFILES[llm];
      const dayIdx = 29 - d; // 0 = il y a 30j, 29 = aujourd'hui
      const seed = `${brandId}:${llm}:${dateStr}`;
      const jitter = (seededFloat(seed) - 0.5) * profile.jitter * 2;
      const score = Math.max(0, Math.min(100, profile.start + profile.drift * dayIdx + jitter));

      // Total runs : 5 prompts × 1 run/jour
      const totalRuns = 5;
      // brandCitedCount : proportionnel au score (un score 60 → ~3/5 cités)
      const brandCitedCount = Math.round((score / 100) * totalRuns);

      await db
        .insert(schema.citationMetricsDaily)
        .values({
          brandId,
          llm,
          date: dateStr,
          totalRuns,
          brandCitedCount,
          visibilityScore: score.toFixed(2),
        })
        .onConflictDoNothing();
      inserted++;
    }
  }
  console.log(`  → ${inserted} lignes citation_metrics_daily (30j × 5 LLMs, idempotent)`);

  console.log("\n✅ Seed demo terminé. Étapes suivantes pour les captures :");
  console.log("     1. Lancer le dev server : pnpm dev");
  console.log(`     2. Te logger avec ${DEMO_EMAIL}`);
  console.log("        → magic-link Brevo (vérifier que l'email est réel et reçoit du courrier)");
  console.log("        → si pas de mail reçu : ré-exécuter avec ton propre email :");
  console.log("          pnpm seed:demo ton@email.fr");
  console.log("     3. Capturer en 1440×900 :");
  console.log("        • /app/dashboard");
  console.log("        • /app/prompts");
  console.log("        • /app/competitors");
  console.log("        • /app/runs (ou /app/prompts/[id])");
  console.log("     4. Compresser en .webp (cwebp -q 85) → public/marketing/dashboard/");
  console.log("     5. Uncomment <ProductTour /> dans src/app/(marketing)/page.tsx");
}

main().catch((error) => {
  console.error("❌ Seed demo échoué :", error);
  process.exit(1);
});
