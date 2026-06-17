import { cache } from "react";
import { headers } from "next/headers";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, prompts, technicalAudits, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin/guard";
import type { CheckResult } from "@/lib/audit/types";

// Données passées à la sidebar (user + workspace + brands).
// `cache()` mémoïse par requête HTTP, appelé par le layout (sidebar)
// ET potentiellement par des pages enfants sans coût supplémentaire.
//
// Retourne null si pas de workspace (cas pré-onboarding), l'appelant
// (layout) doit alors rediriger vers /app/onboarding.

export interface SidebarData {
  user: { id: string; email: string };
  workspace: {
    id: string;
    name: string;
    plan: string;
    slug: string;
    /** Timestamp du hard-cap LLM hit, non null = workspace gelé,
     *  utilisé par UpgradeBanner pour afficher le statut. */
    hardCapHitAt: Date | null;
    /** Fin du trial 14j Stripe, non null = workspace en trial avec carte
     *  posée. Alimente le countdown sidebar + variants picker. */
    trialEndsAt: Date | null;
  };
  brands: Array<{ id: string; name: string; domain: string }>;
  currentBrandId: string;
  /** Nombre de brands du workspace (= brands.length), exposé pour
   *  l'AddBrandDialog qui en a besoin pour le quota check côté UI. */
  currentBrandsCount: number;
  /** Nombre de checks `severity=critical AND status=fail` sur le dernier
   *  audit par URL (owned, pas concurrents). Alimente la bulle de notif
   *  rouge sur l'item "Audits techniques" de la sidebar. 0 = pas de
   *  bulle affichée. */
  criticalIssuesCount: number;
  /** True si la brand courante n'a aucun prompt configuré → on affiche la
   *  coachmark d'activation pointant vers l'onglet « Prompts ». */
  needsPromptSetup: boolean;
  /** True si l'email de la session est dans l'allowlist admin. Sert
   *  UNIQUEMENT à afficher le raccourci Admin dans le menu utilisateur —
   *  la vraie garde d'accès reste le layout serveur /app/admin/* (qui
   *  re-vérifie l'email signé), donc un flag forcé client-side ne donne
   *  aucun accès. */
  isAdmin: boolean;
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
      trialEndsAt: workspaces.trialEndsAt,
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

  const criticalIssuesCount = await countCriticalIssues(ws.workspaceId);

  // Coachmark d'activation : la brand courante a-t-elle au moins 1 prompt ?
  const promptCountRow = await db
    .select({ n: count() })
    .from(prompts)
    .where(eq(prompts.brandId, brandsRows[0]!.id));
  const needsPromptSetup = (promptCountRow[0]?.n ?? 0) === 0;

  return {
    user: { id: session.user.id, email: session.user.email },
    workspace: {
      id: ws.workspaceId,
      name: ws.name,
      plan: ws.plan,
      slug: ws.slug,
      hardCapHitAt: ws.hardCapHitAt,
      trialEndsAt: ws.trialEndsAt,
    },
    brands: brandsRows,
    // V0 : 1 seule brand par workspace, on prend la plus ancienne. V1
    // mémorisera le choix dans cookie ou URL param.
    currentBrandId: brandsRows[0]!.id,
    currentBrandsCount: brandsRows.length,
    criticalIssuesCount,
    needsPromptSetup,
    isAdmin: isAdminEmail(session.user.email),
  };
});

/**
 * Compte les checks `severity=critical && status=fail` sur le dernier
 * audit par URL distincte (owned, pas concurrents) du workspace.
 *
 * Implémentation V0 : on fetch les 50 audits récents triés par
 * `createdAt DESC` + on dédupe par URL côté JS (garde le plus récent
 * par URL). Volume attendu : un workspace tracke ~5-20 URLs au max
 * sur Pro/Agency, donc largement sous le limit 50.
 *
 * Si on passe sous tension > 50 audits, basculer sur une vue
 * matérialisée ou colonne dénormalisée (`failedCriticalCount` sur la
 * table technical_audits, mise à jour à l'insert).
 */
async function countCriticalIssues(workspaceId: string): Promise<number> {
  const audits = await db
    .select({
      url: technicalAudits.url,
      checks: technicalAudits.checks,
      createdAt: technicalAudits.createdAt,
    })
    .from(technicalAudits)
    .where(
      and(eq(technicalAudits.workspaceId, workspaceId), eq(technicalAudits.isCompetitor, false)),
    )
    .orderBy(desc(technicalAudits.createdAt))
    .limit(50);

  // Dédup par URL : on garde le premier (le plus récent grâce au ORDER BY).
  const latestByUrl = new Map<string, (typeof audits)[number]>();
  for (const audit of audits) {
    if (!latestByUrl.has(audit.url)) latestByUrl.set(audit.url, audit);
  }

  let total = 0;
  for (const audit of latestByUrl.values()) {
    const checks = (audit.checks ?? []) as CheckResult[];
    for (const check of checks) {
      if (check.severity === "critical" && check.status === "fail") total += 1;
    }
  }
  return total;
}
