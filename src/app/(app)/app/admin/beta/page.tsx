import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { usageCounters, user, workspaceMembers, workspaces } from "@/db/schema";
import { BetaAdminClient, type BetaWorkspaceRow } from "./beta-admin-client";

// Page admin — octroi/révocation des accès gratuits "beta" (beta-testeurs).
// Guard hérité du layout /app/admin/* (allowlist email). force-dynamic :
// on veut toujours la liste à jour après un grant/revoke.
export const dynamic = "force-dynamic";

function startOfCurrentMonthISO(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export default async function BetaAdminPage() {
  const period = startOfCurrentMonthISO();

  // Liste des comptes beta + email du membre le plus ancien (owner probable)
  // + coût LLM cumulé du mois en cours (surveillance budget).
  const rows = await db
    .select({
      workspaceId: workspaces.id,
      workspaceName: workspaces.name,
      compExpiresAt: workspaces.compExpiresAt,
      createdAt: workspaces.createdAt,
      email: sql<string | null>`min(${user.email})`,
      runsThisMonth: sql<number>`coalesce(max(${usageCounters.runsCount}), 0)`,
      costThisMonthUsd: sql<string>`coalesce(max(${usageCounters.llmCostUsd}), '0')`,
    })
    .from(workspaces)
    .leftJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
    .leftJoin(user, eq(user.id, workspaceMembers.userId))
    .leftJoin(
      usageCounters,
      sql`${usageCounters.workspaceId} = ${workspaces.id} and ${usageCounters.periodStart} = ${period}`,
    )
    .where(eq(workspaces.plan, "beta"))
    .groupBy(workspaces.id)
    .orderBy(desc(workspaces.createdAt));

  const betaRows: BetaWorkspaceRow[] = rows.map((r) => ({
    workspaceId: r.workspaceId,
    workspaceName: r.workspaceName,
    email: r.email,
    expiresAt: r.compExpiresAt ? r.compExpiresAt.toISOString() : null,
    runsThisMonth: Number(r.runsThisMonth ?? 0),
    costThisMonthUsd: Number(r.costThisMonthUsd ?? 0),
  }));

  const totalCost = betaRows.reduce((s, r) => s + r.costThisMonthUsd, 0);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-ink)]">
          Beta-testeurs
        </h1>
        <p className="mt-1 text-sm text-[color:var(--color-muted)]">
          Octroi d&apos;un accès gratuit (plan <strong>beta</strong>, weekly, 15 prompts, tous les
          LLMs). Expire automatiquement à la date choisie → repasse en <code>expired</code> + email
          de conversion. Aucun Stripe.
        </p>
      </div>

      <BetaAdminClient rows={betaRows} totalCostThisMonthUsd={totalCost} />
    </div>
  );
}
