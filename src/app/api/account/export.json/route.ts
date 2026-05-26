import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import {
  brands,
  citationMetricsDaily,
  competitors,
  prompts,
  runs,
  technicalAudits,
  user,
  workspaceMembers,
  workspaces,
} from "@/db/schema";

// Endpoint GET /api/account/export.json — droit à la portabilité RGPD
// (article 20). Retourne un JSON contenant toutes les données
// personnelles + dérivées simples de l'utilisateur authentifié, dans
// un format structuré, lisible et téléchargeable.
//
// Cf. plan V0 pré-lancement (2026-05-26) : RGPD compliance bloquante
// avant lancement public payant.
//
// Champs exclus volontairement :
//   - runs.rawResponse : >5 KB/ligne, ferait exploser la taille pour
//     0 valeur métier côté user (c'est du raw LLM text). On garde les
//     metadata (status, cost, duration, citations parsées).
//   - subscription_events : données comptables Stripe, conservées 10
//     ans par obligation légale (L123-22 Code commerce). Hors RGPD.
//
// Aucune route /api/account/* n'existait avant cette PR — pas d'index
// page.tsx ni de layout à se soucier.

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.user.id;

  // 1. User Better Auth
  const userRow = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!userRow) {
    return new Response(JSON.stringify({ error: "Utilisateur introuvable" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Workspaces où l'user est membre (owner / admin / member / viewer)
  const memberships = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.createdAt,
    })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));

  const workspaceIds = memberships.map((m) => m.workspaceId);

  // 3. Détail de chaque workspace (parallel queries scoped au set d'IDs)
  const [wsRows, brandRows] = await Promise.all([
    workspaceIds.length > 0
      ? db.select().from(workspaces).where(inArray(workspaces.id, workspaceIds))
      : Promise.resolve([]),
    workspaceIds.length > 0
      ? db.select().from(brands).where(inArray(brands.workspaceId, workspaceIds))
      : Promise.resolve([]),
  ]);

  const brandIds = brandRows.map((b) => b.id);

  const [competitorRows, promptRows, metricsRows, auditRows] = await Promise.all([
    brandIds.length > 0
      ? db.select().from(competitors).where(inArray(competitors.brandId, brandIds))
      : Promise.resolve([]),
    brandIds.length > 0
      ? db.select().from(prompts).where(inArray(prompts.brandId, brandIds))
      : Promise.resolve([]),
    brandIds.length > 0
      ? db
          .select()
          .from(citationMetricsDaily)
          .where(inArray(citationMetricsDaily.brandId, brandIds))
      : Promise.resolve([]),
    workspaceIds.length > 0
      ? db
          .select()
          .from(technicalAudits)
          .where(inArray(technicalAudits.workspaceId, workspaceIds))
      : Promise.resolve([]),
  ]);

  const promptIds = promptRows.map((p) => p.id);
  const runRows =
    promptIds.length > 0
      ? await db
          .select({
            id: runs.id,
            promptId: runs.promptId,
            llm: runs.llm,
            status: runs.status,
            costUsd: runs.costUsd,
            durationMs: runs.durationMs,
            cacheHit: runs.cacheHit,
            parsedBrands: runs.parsedBrands,
            scheduledAt: runs.scheduledAt,
            executedAt: runs.executedAt,
            // rawResponse exclu volontairement (cf. commentaire en haut)
          })
          .from(runs)
          .where(inArray(runs.promptId, promptIds))
      : [];

  // 4. Assemblage du payload structuré workspace-par-workspace
  const workspacesPayload = wsRows.map((ws) => {
    const ownBrands = brandRows.filter((b) => b.workspaceId === ws.id);
    const membership = memberships.find((m) => m.workspaceId === ws.id);

    return {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      plan: ws.plan,
      role: membership?.role ?? null,
      joinedAt: membership?.joinedAt ?? null,
      createdAt: ws.createdAt,
      currentPeriodStart: ws.currentPeriodStart,
      currentPeriodEnd: ws.currentPeriodEnd,
      brands: ownBrands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        domain: brand.domain,
        description: brand.description,
        aliases: brand.aliases,
        createdAt: brand.createdAt,
        competitors: competitorRows
          .filter((c) => c.brandId === brand.id)
          .map((c) => ({
            id: c.id,
            name: c.name,
            domain: c.domain,
            aliases: c.aliases,
            createdAt: c.createdAt,
          })),
        prompts: promptRows
          .filter((p) => p.brandId === brand.id)
          .map((p) => ({
            id: p.id,
            text: p.text,
            category: p.category,
            language: p.language,
            isActive: p.isActive,
            createdAt: p.createdAt,
            runs: runRows.filter((r) => r.promptId === p.id),
          })),
        citationMetricsDaily: metricsRows.filter((m) => m.brandId === brand.id),
      })),
      technicalAudits: auditRows.filter((a) => a.workspaceId === ws.id),
    };
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    rgpdNotice:
      "Cet export contient l'ensemble des données personnelles et dérivées " +
      "associées à votre compte Mamie GEO, conformément au droit à la " +
      "portabilité (RGPD article 20). Les factures et événements de " +
      "facturation sont conservés séparément chez Stripe pour 10 ans par " +
      "obligation légale (article L123-22 Code de commerce). Le contenu " +
      "brut des réponses LLM (runs.rawResponse) est exclu volontairement " +
      "(donnée technique > 5 KB/ligne sans valeur métier).",
    user: {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      emailVerified: userRow.emailVerified,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
    },
    workspaces: workspacesPayload,
  };

  const dateStr = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mamie-geo-export-${dateStr}.json"`,
      // Pas de cache : données personnelles, jamais en CDN
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
