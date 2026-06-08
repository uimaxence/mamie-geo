import { and, between, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { brands, citationMetricsDaily, workspaceMembers, workspaces } from "@/db/schema";
import { csvResponseHeaders, stringifyCsv } from "@/lib/csv";
import { deriveSourcesFunnelRatios } from "@/lib/metrics/sources-funnel";
import { captureServerEvent } from "@/lib/posthog-server";

// GET /api/export/metrics.csv — export plat de citation_metrics_daily
// (1 ligne = 1 brand × 1 LLM × 1 jour).
//
// Query params identiques à /api/export/runs.csv :
//   - ?from=YYYY-MM-DD  (défaut J-90)
//   - ?to=YYYY-MM-DD    (défaut today)
//   - ?brandId=<uuid>   (optionnel)

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ROWS = 50_000;
const DEFAULT_DAYS = 90;

interface CsvRow extends Record<string, unknown> {
  date: string;
  brand_name: string;
  llm: string;
  total_runs: number;
  brand_cited_count: number;
  visibility_score: string;
  retrieved_count: number;
  retrievals_total: number;
  citations_count: number;
  apparition_pct: string;
  frequence: string;
  citation_pct: string;
}

const CSV_HEADERS = [
  "date",
  "brand_name",
  "llm",
  "total_runs",
  "brand_cited_count",
  "visibility_score",
  "retrieved_count",
  "retrievals_total",
  "citations_count",
  "apparition_pct",
  "frequence",
  "citation_pct",
] as const satisfies readonly (keyof CsvRow)[];

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const { fromStr, toStr } = parseDateRange(url);
  const brandIdParam = url.searchParams.get("brandId");

  const memberships = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
      plan: workspaces.plan,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, session.user.id));
  const workspaceIds = memberships.map((m) => m.workspaceId);
  if (workspaceIds.length === 0) {
    return new Response(emptyCsv(), {
      headers: csvResponseHeaders(filename("metrics", fromStr, toStr)),
    });
  }
  const primary = memberships[0]!;

  const fromDate = new Date(`${fromStr}T00:00:00.000Z`);
  const toDate = new Date(`${toStr}T23:59:59.999Z`);
  const dateRangeDays = Math.max(
    1,
    Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000),
  );
  await captureServerEvent({
    event: "csv_export_clicked",
    distinctId: session.user.id,
    ctx: { workspaceId: primary.workspaceId, plan: primary.plan, role: primary.role },
    properties: { kind: "metrics", date_range_days: dateRangeDays, brand_id: brandIdParam },
  });

  const brandRows = await db
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .where(inArray(brands.workspaceId, workspaceIds));

  let scopedBrandIds = brandRows.map((b) => b.id);
  if (brandIdParam) {
    if (!brandRows.find((b) => b.id === brandIdParam)) {
      return new Response("brand_not_in_workspace", { status: 403 });
    }
    scopedBrandIds = [brandIdParam];
  }
  if (scopedBrandIds.length === 0) {
    return new Response(emptyCsv(), {
      headers: csvResponseHeaders(filename("metrics", fromStr, toStr)),
    });
  }

  const rows = await db
    .select({
      brandId: citationMetricsDaily.brandId,
      llm: citationMetricsDaily.llm,
      date: citationMetricsDaily.date,
      totalRuns: citationMetricsDaily.totalRuns,
      brandCitedCount: citationMetricsDaily.brandCitedCount,
      visibilityScore: citationMetricsDaily.visibilityScore,
      retrievedCount: citationMetricsDaily.retrievedCount,
      retrievalsTotal: citationMetricsDaily.retrievalsTotal,
      citationsCount: citationMetricsDaily.citationsCount,
    })
    .from(citationMetricsDaily)
    .where(
      and(
        inArray(citationMetricsDaily.brandId, scopedBrandIds),
        between(citationMetricsDaily.date, fromStr, toStr),
      ),
    )
    .limit(MAX_ROWS + 1);

  const truncated = rows.length > MAX_ROWS;
  const slice = truncated ? rows.slice(0, MAX_ROWS) : rows;

  const brandById = new Map(brandRows.map((b) => [b.id, b.name]));

  const csvRows: CsvRow[] = slice.map((r) => {
    const ratios = deriveSourcesFunnelRatios({
      totalRuns: r.totalRuns,
      retrievedCount: r.retrievedCount,
      retrievalsTotal: r.retrievalsTotal,
      citationsCount: r.citationsCount,
    });
    return {
      date: r.date,
      brand_name: brandById.get(r.brandId) ?? "",
      llm: r.llm,
      total_runs: r.totalRuns,
      brand_cited_count: r.brandCitedCount,
      visibility_score: r.visibilityScore ?? "",
      retrieved_count: r.retrievedCount,
      retrievals_total: r.retrievalsTotal,
      citations_count: r.citationsCount,
      apparition_pct: ratios.apparitionPct.toFixed(2),
      frequence: ratios.frequence.toFixed(2),
      citation_pct: ratios.citationPct.toFixed(2),
    };
  });

  const csv = stringifyCsv(csvRows, CSV_HEADERS);
  const responseHeaders = new Headers(csvResponseHeaders(filename("metrics", fromStr, toStr)));
  if (truncated) {
    responseHeaders.set("X-Export-Truncated", String(MAX_ROWS));
  }
  return new Response(csv, { headers: responseHeaders });
}

function parseDateRange(url: URL): { fromStr: string; toStr: string } {
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const today = new Date();
  const toStr = toParam ?? today.toISOString().slice(0, 10);
  const defaultFrom = new Date(today);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - DEFAULT_DAYS);
  const fromStr = fromParam ?? defaultFrom.toISOString().slice(0, 10);
  return { fromStr, toStr };
}

function emptyCsv(): string {
  return stringifyCsv([], CSV_HEADERS);
}

function filename(kind: string, from: string, to: string): string {
  return `mamie-geo-${kind}-${from}_${to}.csv`;
}
