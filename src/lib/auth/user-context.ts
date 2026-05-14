import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, workspaceMembers, workspaces } from "@/db/schema";

// Helper : charge le contexte workspace + brand de l'utilisateur
// authentifié pour les server actions / queries.
//
// V0 : 1 workspace par user, 1 brand par workspace. Si l'utilisateur
// a plusieurs workspaces (cas V1), on prend le plus ancien.
//
// Retourne `null` si pas de workspace (cas pré-onboarding) ou pas de
// brand (cas pathologique, workspace sans brand).

export interface UserContext {
  workspace: {
    id: string;
    name: string;
    plan: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    domain: string;
    aliases: string[];
  };
  role: string;
}

export async function getUserContext(userId: string): Promise<UserContext | null> {
  const membership = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
      name: workspaces.name,
      plan: workspaces.plan,
      slug: workspaces.slug,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);

  const ws = membership[0];
  if (!ws) return null;

  const brand = await db.query.brands.findFirst({
    where: eq(brands.workspaceId, ws.workspaceId),
  });
  if (!brand) return null;

  return {
    workspace: {
      id: ws.workspaceId,
      name: ws.name,
      plan: ws.plan,
      slug: ws.slug,
    },
    brand: {
      id: brand.id,
      name: brand.name,
      domain: brand.domain,
      aliases: brand.aliases,
    },
    role: ws.role,
  };
}
