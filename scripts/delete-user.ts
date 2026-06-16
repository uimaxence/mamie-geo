#!/usr/bin/env tsx
import { and, count, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db/client";
import {
  brands,
  prompts,
  runs,
  user,
  verification,
  workspaceMembers,
  workspaces,
} from "@/db/schema";

// Suppression complète d'un compte (RGPD / repartir de zéro).
//   Usage : pnpm tsx scripts/delete-user.ts <email> [--confirm]
// Sans --confirm = DRY-RUN : montre ce qui SERAIT supprimé, ne touche à rien.
//
// Supprime : le user (→ cascade sessions/accounts/memberships) + les
// workspaces dont il est le SEUL propriétaire (→ cascade brands/prompts/
// runs/metrics/audits/…) + les tokens de vérification (magic-link) à son
// email. Refuse l'email du founder admin par sécurité.

const FOUNDER_ADMIN = "maxencecailleau.pro@gmail.com";

function dbHost(): string {
  const url = process.env.DATABASE_URL ?? "";
  const m = url.match(/@([^/?]+)/);
  return m?.[1] ?? "inconnu";
}

async function main() {
  const email = process.argv[2]?.toLowerCase().trim();
  const confirm = process.argv.includes("--confirm");

  if (!email || email.startsWith("--")) {
    console.error("Usage : pnpm tsx scripts/delete-user.ts <email> [--confirm]");
    process.exit(1);
  }
  if (email === FOUNDER_ADMIN) {
    console.error(`Refus : ${FOUNDER_ADMIN} est l'email admin founder.`);
    process.exit(1);
  }

  console.log(`Base ciblée : ${dbHost()}`);
  console.log(`Email : ${email}\n`);

  const found = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (!found[0]) {
    console.log(
      `Aucun compte avec cet email dans CETTE base. Rien supprimé.\n` +
        `→ Si le compte est sur la prod, lance le script avec la DATABASE_URL de prod.`,
    );
    return;
  }
  const u = found[0];
  console.log(`Compte trouvé : id=${u.id} · créé le ${u.createdAt.toISOString().slice(0, 10)}`);

  // Workspaces où ce user est membre.
  const memberships = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
      name: workspaces.name,
      plan: workspaces.plan,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, u.id));

  const toDelete: string[] = [];
  for (const m of memberships) {
    // Autres membres du même workspace ? (on ne supprime pas un workspace partagé)
    const others = await db
      .select({ n: count() })
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, m.workspaceId), ne(workspaceMembers.userId, u.id)));
    const otherMembers = others[0]?.n ?? 0;

    const brandRows = await db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.workspaceId, m.workspaceId));
    const brandIds = brandRows.map((b) => b.id);
    const promptCount = brandIds.length
      ? ((
          await db
            .select({ n: count() })
            .from(prompts)
            .where(inArray(prompts.brandId, brandIds))
        )[0]?.n ?? 0)
      : 0;
    const runCount =
      brandIds.length && promptCount
        ? ((
            await db
              .select({ n: count() })
              .from(runs)
              .innerJoin(prompts, eq(prompts.id, runs.promptId))
              .where(inArray(prompts.brandId, brandIds))
          )[0]?.n ?? 0)
        : 0;

    const willDelete = m.role === "owner" && otherMembers === 0;
    if (willDelete) toDelete.push(m.workspaceId);
    console.log(
      `  · workspace « ${m.name} » (plan=${m.plan}, rôle=${m.role}) — ` +
        `${brandIds.length} brand(s), ${promptCount} prompt(s), ${runCount} run(s) — ` +
        (willDelete
          ? "SERA SUPPRIMÉ (cascade)"
          : otherMembers > 0
            ? `conservé (${otherMembers} autre(s) membre(s))`
            : "conservé (pas owner)"),
    );
  }

  if (!confirm) {
    console.log(`\nDRY-RUN. Relance avec --confirm pour supprimer définitivement.`);
    return;
  }

  // Suppression. Cascades : workspace → brands/prompts/runs/metrics/…,
  // user → sessions/accounts/workspace_members restants.
  if (toDelete.length) {
    await db.delete(workspaces).where(inArray(workspaces.id, toDelete));
    console.log(`\n${toDelete.length} workspace(s) supprimé(s).`);
  }
  await db.delete(user).where(eq(user.id, u.id));
  const verif = await db.delete(verification).where(eq(verification.identifier, email)).returning({
    id: verification.id,
  });
  console.log(
    `Compte ${email} supprimé. ${verif.length} token(s) de vérification nettoyé(s).\n` +
      `Tu peux te réinscrire avec cet email et refaire l'onboarding.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
