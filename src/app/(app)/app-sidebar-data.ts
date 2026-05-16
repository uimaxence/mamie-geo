import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";

// Données passées à la sidebar (user + workspace + brands).
// `cache()` mémoïse par requête HTTP — appelé par le layout (sidebar)
// ET potentiellement par des pages enfants sans coût supplémentaire.
//
// Retourne null si pas de workspace (cas pré-onboarding) — l'appelant
// (layout) doit alors rediriger vers /app/onboarding.

export interface SidebarData {
  user: { id: string; email: string };
  workspace: {
    id: string;
    name: string;
    plan: string;
    slug: string;
    /** Timestamp du hard-cap LLM hit — non null = workspace gelé,
     *  utilisé par UpgradeBanner pour afficher le statut. */
    hardCapHitAt: Date | null;
  };
  brands: Array<{ id: string; name: string; domain: string }>;
  currentBrandId: string;
}

export const loadSidebarData = cache(async (): Promise<SidebarData | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const membership = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      name: workspaces.name,
      plan: workspaces.plan,
      slug: workspaces.slug,
      hardCapHitAt: workspaces.hardCapHitAt,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, session.user.id))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);

  const ws = membership[0];
  if (!ws) return null;

  const brandsRows = await db
    .select({ id: brands.id, name: brands.name, domain: brands.domain })
    .from(brands)
    .where(eq(brands.workspaceId, ws.workspaceId))
    .orderBy(brands.createdAt);

  if (brandsRows.length === 0) return null;

  return {
    user: { id: session.user.id, email: session.user.email },
    workspace: {
      id: ws.workspaceId,
      name: ws.name,
      plan: ws.plan,
      slug: ws.slug,
      hardCapHitAt: ws.hardCapHitAt,
    },
    brands: brandsRows,
    // V0 : 1 seule brand par workspace, on prend la plus ancienne. V1
    // mémorisera le choix dans cookie ou URL param.
    currentBrandId: brandsRows[0]!.id,
  };
});
