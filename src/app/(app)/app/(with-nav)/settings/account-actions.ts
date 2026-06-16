"use server";

import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { user, workspaceMembers, workspaces } from "@/db/schema";
import { captureServerEvent } from "@/lib/posthog-server";
import { getStripe } from "@/lib/stripe/client";

// Server actions du compte utilisateur — droit à l'effacement RGPD
// (article 17). Cf. plan V0 pré-lancement (2026-05-26).
//
// Stratégie de delete :
//   1. Annule les subscriptions Stripe actives pour chaque workspace
//      dont l'user est owner (refund manuel si garantie 14j en cours).
//      ON N'EFFACE PAS le customer Stripe : Stripe garde les factures
//      pour conformité comptable (L123-22 Code commerce, 10 ans).
//   2. Delete chaque workspace owned → cascade DB sur brand, competitors,
//      prompts, runs, audits, audit_counters, queue_jobs, etc. (cf.
//      contraintes onDelete:"cascade" du schema).
//   3. Delete l'user → cascade DB sur sessions, accounts (OAuth tokens),
//      workspace_members. Les workspaces où l'user était simple member
//      restent (le membership disparaît, les autres owners gardent
//      l'accès).
//
// Idempotent : si on relance après crash, les workspaces déjà supprimés
// sont absents → pas d'erreur. Le user delete final est unique.
//
// En V0 = 1 user → 1 workspace (cf. CLAUDE.md). Donc cas simple :
// 1 subscription à annuler + 1 workspace à supprimer + user à supprimer.

export type DeleteAccountResult = { ok: true; redirectTo: "/" } | { ok: false; error: string };

export async function deleteAccount(confirmation: string): Promise<DeleteAccountResult> {
  // Garde-fou contre les déclenchements accidentels. Le user DOIT taper
  // "SUPPRIMER" exactement. Vérifié à nouveau côté serveur (le client
  // peut bypasser).
  if (confirmation !== "SUPPRIMER") {
    return { ok: false, error: "Confirmation invalide. Tape SUPPRIMER en majuscules." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "Non authentifié." };

  const userId = session.user.id;
  const userEmail = session.user.email;

  try {
    // 1. Workspaces où l'user est owner
    const ownedMemberships = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        stripeSubscriptionId: workspaces.stripeSubscriptionId,
        plan: workspaces.plan,
        wsCreatedAt: workspaces.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.role, "owner")));

    // Capture l'event AVANT le delete pour que le distinctId existe encore
    // côté PostHog et qu'on garde la trace de la suppression dans les events.
    const firstWorkspace = ownedMemberships[0];
    await captureServerEvent({
      event: "account_deletion_requested",
      distinctId: userId,
      ctx: firstWorkspace
        ? { workspaceId: firstWorkspace.workspaceId, plan: firstWorkspace.plan }
        : undefined,
      properties: {
        owned_workspaces: ownedMemberships.length,
        plan: firstWorkspace?.plan,
        had_subscription: ownedMemberships.some((m) => Boolean(m.stripeSubscriptionId)),
      },
    });

    // 2. Annulation Stripe pour chaque subscription active.
    // On utilise `subscriptions.cancel()` (annulation immédiate, pas
    // `cancel_at_period_end`). Logique : si l'user supprime son compte,
    // il ne veut plus être facturé même pour la période en cours. Le
    // refund éventuel (garantie 14j) doit être traité manuellement.
    for (const m of ownedMemberships) {
      if (!m.stripeSubscriptionId) continue;
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(m.stripeSubscriptionId);
      } catch (err) {
        // Subscription peut déjà être canceled → on log mais on ne
        // bloque pas la suppression. RGPD article 17 prime sur la
        // synchronisation Stripe (qu'on rattrapera côté webhook).
        console.error("[deleteAccount] Stripe cancel échec", {
          subscriptionId: m.stripeSubscriptionId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // 3. Delete chaque workspace owned → cascade DB.
    const ownedWorkspaceIds = ownedMemberships.map((m) => m.workspaceId);
    if (ownedWorkspaceIds.length > 0) {
      await db.delete(workspaces).where(inArray(workspaces.id, ownedWorkspaceIds));
    }

    // 4. Delete l'user → cascade DB (sessions, accounts, memberships
    // restants). La session courante est invalidée par le cascade.
    await db.delete(user).where(eq(user.id, userId));

    console.info("[deleteAccount] compte supprimé", {
      userId,
      email: userEmail,
      workspacesDeleted: ownedWorkspaceIds.length,
    });

    return { ok: true, redirectTo: "/" };
  } catch (err) {
    console.error("[deleteAccount] échec", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      error:
        "Erreur lors de la suppression. Si elle persiste, contacte hello@mamie-geo.fr et on traite manuellement sous 24h.",
    };
  }
}
