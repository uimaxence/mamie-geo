#!/usr/bin/env tsx
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";

// Initialise un workspace dev complet pour valider le moteur de tracking
// sans passer par l'UI d'onboarding (qui arrive en PR 6). Idempotent : on
// peut le relancer sans recréer de doublons.
//
// Usage : pnpm seed:dev [email]
// (email par défaut: hello@mamie-geo.fr)
//
// IMPORTANT : refuse de tourner en NODE_ENV=production.

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

const DEV_EMAIL = process.argv[2] ?? "hello@mamie-geo.fr";
const WORKSPACE_SLUG = "mamie-geo-dev";

const PROMPTS_FR = [
  "Quels sont les meilleurs outils SEO francophones en 2026 ?",
  "Quel SaaS choisir pour suivre sa visibilité dans ChatGPT et Claude ?",
  "Comment mesurer son AI Search visibility en France ?",
  "Top 5 des outils GEO pour les agences SEO francophones",
  "Mamie GEO ou Profound : que choisir pour le tracking IA en français ?",
];

const COMPETITORS = [
  { name: "Profound", domain: "tryprofound.com", aliases: ["profound.so", "Profound AI"] },
  { name: "Peec AI", domain: "peec.ai", aliases: ["Peec"] },
  { name: "AthenaHQ", domain: "athenahq.ai", aliases: ["Athena HQ", "Athena"] },
];

async function main() {
  await loadEnvLocal();

  if (process.env.NODE_ENV === "production") {
    console.error("❌ seed:dev refuse de tourner en NODE_ENV=production.");
    process.exit(1);
  }

  // Imports tardifs : la validation env (DATABASE_URL etc.) se déclenche au
  // moment de charger ces modules — donc après loadEnvLocal().
  const { db } = await import("@/db/client");
  const schema = await import("@/db/schema");

  console.log(`🌱 Seed dev workspace pour ${DEV_EMAIL}…`);

  // 1. User Better Auth — INSERT idempotent par email
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, DEV_EMAIL),
  });

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`  → user déjà présent : ${userId}`);
  } else {
    userId = randomUUID();
    await db.insert(schema.user).values({
      id: userId,
      email: DEV_EMAIL,
      emailVerified: true,
      name: "Dev User",
    });
    console.log(`  → user créé : ${userId}`);
  }

  // 2. Workspace — INSERT idempotent par slug
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
      .values({
        name: "Mamie GEO Dev",
        slug: WORKSPACE_SLUG,
        plan: "trialing",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      })
      .returning({ id: schema.workspaces.id });
    if (!created) throw new Error("Échec INSERT workspace");
    workspaceId = created.id;
    console.log(`  → workspace créé : ${workspaceId}`);
  }

  // 3. Membership owner — onConflict no-op (PK composite)
  await db
    .insert(schema.workspaceMembers)
    .values({ workspaceId, userId, role: "owner" })
    .onConflictDoNothing();
  console.log(`  → membership owner OK`);

  // 4. Brand "Mamie GEO" — un seul brand par workspace en V0 (cf. doc 02)
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
        name: "Mamie GEO",
        domain: "mamie-geo.fr",
        description: "SaaS francophone de Generative Engine Optimization",
        aliases: ["MamieGEO", "Mamie-GEO", "mamiegeo"],
      })
      .returning({ id: schema.brands.id });
    if (!created) throw new Error("Échec INSERT brand");
    brandId = created.id;
    console.log(`  → brand créée : ${brandId}`);
  }

  // 5. Concurrents — INSERT seulement si absents (par nom)
  for (const competitor of COMPETITORS) {
    const existing = await db.query.competitors.findFirst({
      where: eq(schema.competitors.name, competitor.name),
    });
    if (existing) {
      console.log(`  → concurrent ${competitor.name} déjà présent`);
      continue;
    }
    await db.insert(schema.competitors).values({ brandId, ...competitor });
    console.log(`  → concurrent ${competitor.name} créé`);
  }

  // 6. Prompts — INSERT seulement si absents (par texte exact)
  for (const text of PROMPTS_FR) {
    const existing = await db.query.prompts.findFirst({
      where: eq(schema.prompts.text, text),
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

  console.log("\n✅ Seed terminé. Tu peux maintenant :");
  console.log(`     • Te logger avec ${DEV_EMAIL} (magic-link Brevo)`);
  console.log(
    `     • Trigger un run manuel : curl -X POST http://localhost:3000/api/runs/trigger -H "Authorization: Bearer $CRON_SECRET" -d '{"workspaceId":"${workspaceId}"}'`,
  );
  console.log(`     • Attendre le cron schedule-runs (06:00 UTC) en prod`);
}

main().catch((error) => {
  console.error("❌ Seed échoué :", error);
  process.exit(1);
});
