import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRunDetail, type RunDetail } from "@/lib/dashboard/queries";
import { Badge, Banner, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

// Page détail d'un run /app/runs/[id] — réponse brute, citations
// détectées (sources web + brands), scoring & coûts. Organisée en
// onglets (PR design foundation) pour réduire le scroll.

export const dynamic = "force-dynamic";

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const run = await getRunDetail(id, session.user.id);
  if (!run) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/app/dashboard"
        className="type-eyebrow inline-flex items-center gap-1.5 hover:text-[color:var(--color-ink)]"
      >
        <ArrowLeft size={12} strokeWidth={2.5} />
        Retour au dashboard
      </Link>

      {/* Header — prompt + métadonnées */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{run.llm}</Badge>
          <StatusBadge status={run.status} />
          <span className="type-meta">
            {run.brand.name} · {run.brand.domain}
          </span>
        </div>
        <h1 className="type-h2 mt-4">{run.prompt.text}</h1>
        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          <Meta label="Coût" value={run.costUsd !== null ? `$${run.costUsd.toFixed(4)}` : "—"} />
          <Meta
            label="Durée"
            value={run.durationMs !== null ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
          />
          <Meta
            label="Exécuté"
            value={run.executedAt ? formatRelative(run.executedAt) : "en attente"}
          />
          <Meta label="Modèle" value={run.model ?? "—"} />
        </dl>
      </header>

      {/* Erreur si run failed — sortie du Tabs pour rester visible */}
      {run.status === "failed" && run.error && (
        <Banner tone="error" title="Erreur d'exécution" className="mt-8">
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-sm">{run.error}</pre>
        </Banner>
      )}

      {/* Tabs : Réponse · Citations · Scoring */}
      <Tabs defaultValue="response" className="mt-8">
        <TabsList>
          <TabsTrigger value="response">Réponse LLM</TabsTrigger>
          <TabsTrigger value="citations">
            Citations
            {run.sources.length > 0 && <span className="type-meta">({run.sources.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="scoring">Scoring & coûts</TabsTrigger>
        </TabsList>

        <TabsContent value="response">
          {run.rawResponse ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-6">
              <div className="flex items-baseline justify-between">
                <span className="type-eyebrow">{countWords(run.rawResponse)} mots</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                {run.rawResponse}
              </p>
            </div>
          ) : (
            <p className="type-body text-sm">Pas de réponse brute enregistrée.</p>
          )}
        </TabsContent>

        <TabsContent value="citations">
          {run.sources.length === 0 ? (
            <p className="type-body text-sm">Aucune source web citée par le LLM.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {run.sources.map((source) => (
                <li
                  key={source.url}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[color:var(--color-ink)] group-hover:underline group-hover:underline-offset-2">
                        {source.title}
                      </p>
                      <p className="type-meta mt-1 truncate">{source.url}</p>
                    </div>
                    <ExternalLink
                      size={14}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-[color:var(--color-muted)]"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="scoring">
          {run.parsedBrands ? (
            <ScoringSection parsedBrands={run.parsedBrands} />
          ) : (
            <p className="type-body text-sm">
              Pas encore de scoring (run pending ou échec en amont). Le scoring tourne après le run
              principal — environ +5s.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <footer className="mt-16 type-meta">
        Run ID :{" "}
        <code className="rounded bg-[color:var(--color-gray-100)] px-1.5 py-0.5">{run.id}</code>
      </footer>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-eyebrow">{label}</dt>
      <dd className="mt-1 text-base font-medium text-[color:var(--color-ink)]">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success") return <Badge tone="success">success</Badge>;
  if (status === "running") return <Badge tone="accent">running</Badge>;
  if (status === "failed") return <Badge tone="error">failed</Badge>;
  return <Badge tone="neutral">{status}</Badge>;
}

function ScoringSection({
  parsedBrands,
}: {
  parsedBrands: NonNullable<RunDetail["parsedBrands"]>;
}) {
  const scoring = parsedBrands.scoring;
  const isSkipped = "skipped" in scoring;

  return (
    <div className="flex flex-col gap-8">
      {/* Detection regex */}
      <div>
        <p className="type-eyebrow">Détections regex</p>
        {parsedBrands.detection.length === 0 ? (
          <p className="type-body mt-2 text-sm">
            Aucune mention détectée par regex sur le texte brut.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {parsedBrands.detection.map((d) => (
              <Badge key={d.targetId} tone={d.type === "brand" ? "accent" : "neutral"}>
                {d.name} · {d.occurrences}×
              </Badge>
            ))}
          </ul>
        )}
      </div>

      {/* Scoring Haiku */}
      <div>
        <p className="type-eyebrow">
          Scoring Haiku 4.5 ·{" "}
          <span className="font-normal normal-case tracking-normal text-[color:var(--color-muted)]">
            scoré {formatRelative(new Date(parsedBrands.scoredAt))}
          </span>
        </p>
        {isSkipped ? (
          <p className="type-body mt-2 text-sm">
            Scoring sauté ({scoring.reason}) — pas d&apos;appel LLM, économie ~$0.003.
          </p>
        ) : (
          <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            <Meta
              label="Marque citée"
              value={
                scoring.brandMentioned
                  ? `oui (${scoring.brandSentiment}, ${scoring.brandPosition})`
                  : "non"
              }
            />
            <Meta
              label="Concurrents cités"
              value={
                scoring.competitorsMentioned.length > 0
                  ? scoring.competitorsMentioned.map((c) => `${c.name} (${c.sentiment})`).join(", ")
                  : "aucun"
              }
            />
            <Meta label="Coût scoring" value={`$${scoring.costUsd.toFixed(4)}`} />
            <Meta label="Durée scoring" value={`${(scoring.durationMs / 1000).toFixed(1)}s`} />
          </dl>
        )}
      </div>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
