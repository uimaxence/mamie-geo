import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { brands, workspaceMembers } from "@/db/schema";
import { getRunBatches } from "@/lib/runs/batches";
import { BatchesTable } from "@/components/app/batches-table";

// Page liste des runs récents. Réutilise <BatchesTable> avec un limit
// plus large que le dashboard (50 vs 10). Créée 2026-05-26 après
// retour Max : la route /app/runs était dans la sidebar mais
// n'existait pas (404), seule /app/runs/[id] (détail) était présente.

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const membership = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);
  const ws = membership[0];
  if (!ws) redirect("/app/onboarding");

  const brand = await db.query.brands.findFirst({
    where: eq(brands.workspaceId, ws.workspaceId),
  });
  if (!brand) redirect("/app/onboarding");

  const batches = await getRunBatches({ brandId: brand.id, limit: 50 });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <header className="mb-8">
        <h1 className="type-h1">Runs</h1>
        <p className="type-body mt-2 text-[color:var(--color-ink-soft)]">
          Les 50 derniers batches d&apos;exécution (1 ligne = 1 prompt × jour). Clique pour le
          détail par LLM.
        </p>
      </header>

      <BatchesTable
        batches={batches}
        showPromptColumn={true}
        emptyState={{
          title: "Aucun run pour l'instant",
          description:
            "Le cron quotidien se déclenche à 06:00 UTC. Tu peux aussi lancer un run depuis le dashboard.",
        }}
      />
    </div>
  );
}
