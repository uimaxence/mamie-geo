import { and, between, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { brands, prompts, runs, workspaceMembers } from "@/db/schema";
import { csvResponseHeaders, stringifyCsv } from "@/lib/csv";
import type { ParsedBrandsPayload } from "@/lib/citation/types";

// GET /api/export/runs.csv — export plat de l'historique des runs du
// workspace authentifié, 1 ligne = 1 run = 1 prompt × 1 LLM × 1 date.
//
// Query params :
//   - ?from=YYYY-MM-DD  (défaut J-90)
//   - ?to=YYYY-MM-DD    (défaut today)
//   - ?brandId=<uuid>   (optionnel, sinon toutes les brands du workspace)
//
// Scope : RBAC = membre du workspace (n'importe quel rôle). Brand passée
// en param vérifiée appartenir au workspace, sinon 403.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ROWS = 50_000;
const DEFAULT_DAYS = 90;

interface CsvRow extends Record<string, unknown> {
  executed_at: string;
  brand_name: string;
  prompt_text: string;
  prompt_category: string;
  llm: string;
  status: string;
  brand_cited: string;
  brand_sentiment: string;
  brand_position: string;
  competitors_cited: string;
  sources_count: number | string;
  cost_usd: string;
  duration_ms: number | string;
}

const CSV_HEADERS = [
  "executed_at",
  "brand_name",
  "prompt_text",
  "prompt_category",
  "llm",
  "status",
  "brand_cited",
  "brand_sentiment",
  "brand_position",
  "competitors_cited",
  "sources_count",
  "cost_usd",
  "duration_ms",
] as const satisfies readonly (keyof CsvRow)[];

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const { from, to } = parseDateRange(url);
  const brandIdParam = url.searchParams.get("brandId");

  const memberships = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id));
  const workspaceIds = memberships.map((m) => m.workspaceId);
  if (workspaceIds.length === 0) {
    return new Response(emptyCsv(), { headers: csvResponseHeaders(filename("runs", from, to)) });
  }

  const brandRows = await db
    .select({ id: brands.id, name: brands.name, workspaceId: brands.workspaceId })
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
    return new Response(emptyCsv(), { headers: csvResponseHeaders(filename("runs", from, to)) });
  }

  const promptRows = await db
    .select({
      id: prompts.id,
      brandId: prompts.brandId,
      text: prompts.text,
      category: prompts.category,
    })
    .from(prompts)
    .where(inArray(prompts.brandId, scopedBrandIds));
  if (promptRows.length === 0) {
    return new Response(emptyCsv(), { headers: csvResponseHeaders(filename("runs", from, to)) });
  }

  const promptIds = promptRows.map((p) => p.id);
  const runRows = await db
    .select({
      id: runs.id,
      promptId: runs.promptId,
      llm: runs.llm,
      status: runs.status,
      executedAt: runs.executedAt,
      scheduledAt: runs.scheduledAt,
      costUsd: runs.costUsd,
      durationMs: runs.durationMs,
      parsedBrands: runs.parsedBrands,
      parsedCitations: runs.parsedCitations,
    })
    .from(runs)
    .where(and(inArray(runs.promptId, promptIds), between(runs.scheduledAt, from, to)))
    .limit(MAX_ROWS + 1);

  const truncated = runRows.length > MAX_ROWS;
  const slice = truncated ? runRows.slice(0, MAX_ROWS) : runRows;

  const brandById = new Map(brandRows.map((b) => [b.id, b.name]));
  const promptById = new Map(promptRows.map((p) => [p.id, p]));

  const csvRows: CsvRow[] = slice.map((r) => {
    const prompt = promptById.get(r.promptId);
    const brandId = prompt?.brandId;
    const brandName = (brandId && brandById.get(brandId)) ?? "";
    const parsed = r.parsedBrands as ParsedBrandsPayload | null;

    let cited = "";
    let sentiment = "";
    let position = "";
    let competitorsCited = "";
    if (parsed && "brandMentioned" in parsed.scoring) {
      cited = parsed.scoring.brandMentioned ? "true" : "false";
      sentiment = parsed.scoring.brandSentiment;
      position = parsed.scoring.brandPosition;
      competitorsCited = parsed.scoring.competitorsMentioned.map((c) => c.name).join("; ");
    }

    const sources = Array.isArray(r.parsedCitations) ? r.parsedCitations.length : "";

    return {
      executed_at: (r.executedAt ?? r.scheduledAt).toISOString(),
      brand_name: brandName,
      prompt_text: prompt?.text ?? "",
      prompt_category: prompt?.category ?? "",
      llm: r.llm,
      status: r.status,
      brand_cited: cited,
      brand_sentiment: sentiment,
      brand_position: position,
      competitors_cited: competitorsCited,
      sources_count: sources,
      cost_usd: r.costUsd ?? "",
      duration_ms: r.durationMs ?? "",
    };
  });

  const csv = stringifyCsv(csvRows, CSV_HEADERS);
  const responseHeaders = new Headers(csvResponseHeaders(filename("runs", from, to)));
  if (truncated) {
    responseHeaders.set("X-Export-Truncated", String(MAX_ROWS));
  }
  return new Response(csv, { headers: responseHeaders });
}

function parseDateRange(url: URL): { from: Date; to: Date } {
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const to = toParam ? new Date(`${toParam}T23:59:59.999Z`) : new Date();
  const defaultFrom = new Date(to);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - DEFAULT_DAYS);
  const from = fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : defaultFrom;
  return { from, to };
}

function emptyCsv(): string {
  return stringifyCsv([], CSV_HEADERS);
}

function filename(kind: string, from: Date, to: Date): string {
  const f = from.toISOString().slice(0, 10);
  const t = to.toISOString().slice(0, 10);
  return `mamie-geo-${kind}-${f}_${t}.csv`;
}
