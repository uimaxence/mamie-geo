import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { brands as brandsTable, workspaceMembers } from "@/db/schema";
import { getUserContext } from "@/lib/auth/user-context";
import { listCompetitorsWithMetrics } from "@/lib/competitors/queries";
import { listCitedSources } from "@/lib/sources/queries";
import { parseBrandIdsFromSearchParam } from "@/lib/sources/brand-filter";
import { quotasFor } from "@/lib/plans/quotas";
import { PageContainer } from "@/components/ui";
import { CitationsView } from "./citations-view";

// Page /app/citations — vue unifiée 2026-06-08 (cf. doc 09) : fusionne
// les anciennes routes /app/sources et /app/competitors en deux tabs.
// Argument métier : c'est la même question — « qui apparaît à côté de
// moi dans les réponses IA ? ». Vue marque (concurrents) + vue source
// (URLs).
//
// Server component qui charge en parallèle :
//   - les concurrents trackés du brand actif (CRUD-able)
//   - les URLs sources citées sur le scope brands sélectionné via
//     ?brands=id1,id2 (lecture pure)
//   - la liste des brands du workspace (pour le BrandMultiSelect côté
//     onglet Sources)
//
// Tab par défaut = "competitors". L'override via ?tab=sources est
// supporté pour rester deep-linkable.

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tab?: string; brands?: string | string[] }>;
}

export default async function CitationsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [ctx, competitorsResult, params] = await Promise.all([
    getUserContext(session.user.id),
    listCompetitorsWithMetrics(session.user.id, 30),
    searchParams,
  ]);

  if (!ctx || !competitorsResult) redirect("/app/onboarding");

  const initialTab = params.tab === "sources" ? "sources" : "competitors";

  // Charge les brands du workspace pour le filtre multi-select côté
  // onglet Sources (logique reprise telle quelle de l'ancienne page).
  const membership = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);
  const workspaceId = membership[0]?.workspaceId;
  const workspaceBrands = workspaceId
    ? await db
        .select({ id: brandsTable.id, name: brandsTable.name, domain: brandsTable.domain })
        .from(brandsTable)
        .where(eq(brandsTable.workspaceId, workspaceId))
        .orderBy(brandsTable.createdAt)
    : [];

  const selectedBrandIds = parseBrandIdsFromSearchParam(
    params.brands,
    workspaceBrands.map((b) => b.id),
  );
  const sources = await listCitedSources(selectedBrandIds);

  const quotas = quotasFor(competitorsResult.plan);

  return (
    <PageContainer>
      <CitationsView
        initialTab={initialTab}
        brand={{ id: ctx.brand.id, name: ctx.brand.name, domain: ctx.brand.domain }}
        plan={competitorsResult.plan}
        competitors={competitorsResult.competitors}
        maxCompetitors={quotas.competitors}
        competitorsWindowDays={competitorsResult.windowDays}
        competitorsTotalRuns={competitorsResult.totalRuns}
        brandSelf={competitorsResult.brandSelf}
        suggestions={competitorsResult.suggestions}
        competitorDomains={competitorsResult.competitors.map((c) => c.domain)}
        workspaceBrands={workspaceBrands}
        sources={sources}
        sourcesScopeLabel={
          selectedBrandIds.length === workspaceBrands.length
            ? ctx.brand.name
            : `${selectedBrandIds.length} marque${selectedBrandIds.length > 1 ? "s" : ""}`
        }
      />
    </PageContainer>
  );
}
