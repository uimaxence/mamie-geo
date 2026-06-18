import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Lightbulb } from "lucide-react";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { db } from "@/db/client";
import {
  brands as brandsTable,
  competitors as competitorsTable,
  workspaceMembers,
} from "@/db/schema";
import { Badge, Card, EntityTypeBadge, Stat } from "@/components/ui";
import { LLM_LABELS } from "@/components/charts/llm-colors";
import { decodeSourceSlug, getSourceRuns } from "@/lib/sources/queries";
import { parseBrandIdsFromSearchParam } from "@/lib/sources/brand-filter";
import { classifySource } from "@/lib/sources/classify";
import type { EntityType } from "@/components/ui";

// Page /app/citations/sources/[id] — détail d'une URL citée (drill-down
// depuis l'onglet Sources). [id] = base64url(url). Migrée à la DA
// actuelle 2026-06-09 (Card/Stat partagés, radius resserré, tag de
// type) — elle datait d'avant la refonte Citations.
// Liste tous les runs success où l'URL apparaît dans parsed_citations,
// avec prompt + LLM + date, plus la répartition par LLM.

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ brands?: string | string[] }>;
}

export default async function SourceDetailPage({ params, searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const ctx = await getUserContext(session.user.id);
  if (!ctx) redirect("/app/onboarding");

  const { id } = await params;
  const url = decodeSourceSlug(id);
  if (!url) notFound();

  // Reprend le même filtre brands que la liste pour cohérence : l'user
  // qui a sélectionné « brand A + B » dans /app/citations doit voir le
  // détail filtré sur ces 2 brands. Si rien dans searchParams, on
  // remonte toutes les brands du workspace.
  const membership = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1);
  const workspaceId = membership[0]?.workspaceId;
  const workspaceBrandIds = workspaceId
    ? (
        await db
          .select({ id: brandsTable.id })
          .from(brandsTable)
          .where(eq(brandsTable.workspaceId, workspaceId))
      ).map((r) => r.id)
    : [ctx.brand.id];

  const sp = await searchParams;
  const selectedBrandIds = parseBrandIdsFromSearchParam(sp.brands, workspaceBrandIds);

  const [runs, competitorDomainRows] = await Promise.all([
    getSourceRuns(selectedBrandIds, url),
    db
      .select({ domain: competitorsTable.domain })
      .from(competitorsTable)
      .where(eq(competitorsTable.brandId, ctx.brand.id)),
  ]);
  if (runs.length === 0) notFound();

  let host: string;
  try {
    host = new URL(url).host.replace(/^www\./, "");
  } catch {
    host = url;
  }

  const type = classifySource(host, {
    brandDomain: ctx.brand.domain,
    competitorDomains: competitorDomainRows.map((c) => c.domain),
  });

  // Répartition par LLM pour le résumé en tête de page.
  const byLlm = new Map<string, number>();
  for (const r of runs) {
    byLlm.set(r.llm, (byLlm.get(r.llm) ?? 0) + 1);
  }
  const llmBreakdown = Array.from(byLlm.entries()).sort((a, b) => b[1] - a[1]);

  // Récence pour le badge "dernière citation"
  const lastCitedAt = runs[0]?.executedAt;
  // Set des prompts distincts qui ont remonté l'URL
  const distinctPromptCount = new Set(runs.map((r) => r.promptId)).size;

  // Titre le plus récent (le LLM peut renvoyer plusieurs titres au fil du temps)
  const latestTitle = runs.find((r) => r.title)?.title ?? null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <Link
        href="/app/citations?tab=sources"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={14} strokeWidth={2.2} />
        Retour aux citations
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="type-eyebrow text-[color:var(--color-ink-soft)]">{host}</p>
          <EntityTypeBadge type={type} />
        </div>
        <h1 className="mt-2 break-words text-xl font-semibold tracking-tight text-[color:var(--color-ink)]">
          {latestTitle ?? url}
        </h1>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)] hover:underline"
        >
          <ExternalLink size={12} strokeWidth={2.2} />
          <span className="break-all">{url}</span>
        </a>
      </header>

      <WhyItMatters type={type} />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <Stat label="Citations totales" value={String(runs.length)} />
        </Card>
        <Card className="p-5">
          <Stat
            label="Prompts distincts"
            value={String(distinctPromptCount)}
            hint={`sur ${runs.length} apparition${runs.length > 1 ? "s" : ""}`}
          />
        </Card>
        <Card className="p-5">
          <Stat label="Dernière citation" value={lastCitedAt ? formatRelative(lastCitedAt) : "-"} />
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold tracking-tight text-[color:var(--color-ink)]">
          Répartition par LLM
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {llmBreakdown.map(([llm, count]) => (
            <span
              key={llm}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-sm"
            >
              <span className="font-medium text-[color:var(--color-ink)]">
                {LLM_LABELS[llm] ?? llm}
              </span>
              <Badge tone="neutral">{count}×</Badge>
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold tracking-tight text-[color:var(--color-ink)]">
          Historique des citations
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {runs.map((r) => (
            <li
              key={r.runId}
              className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{LLM_LABELS[r.llm] ?? r.llm}</Badge>
                <span className="type-meta">{formatAbsolute(r.executedAt)}</span>
              </div>
              <Link
                href={`/app/prompts/${r.promptId}`}
                className="mt-2 block text-sm text-[color:var(--color-ink)] hover:underline"
              >
                {r.promptText}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Encart "pourquoi cette source compte", contextuel au type. Donne le
// sens GEO de la page courante plutôt que de laisser l'user deviner.
function WhyItMatters({ type }: { type: EntityType }) {
  const message =
    type === "you"
      ? "C'est ton domaine. Les IA te citent déjà comme source sur ton marché ; continue à publier pour renforcer cette présence."
      : type === "competitor"
        ? "C'est un concurrent suivi. Les IA le citent comme référence sur ton marché : regarde quels contenus le font remonter."
        : "Être mentionné sur cette page peut améliorer ta visibilité : c'est une des sources que les IA jugent crédibles sur ton marché.";

  return (
    <div className="mt-6 flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3">
      <Lightbulb
        size={16}
        strokeWidth={2}
        className="mt-0.5 shrink-0 text-[color:var(--color-accent)]"
        aria-hidden
      />
      <p className="text-[0.8125rem] leading-relaxed text-[color:var(--color-ink-soft)]">
        {message}
      </p>
    </div>
  );
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}

function formatAbsolute(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
