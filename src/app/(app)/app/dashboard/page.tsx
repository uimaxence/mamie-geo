import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData, type RecentRun } from "@/lib/dashboard/queries";
import { Badge, Card, CardBody, Stat } from "@/components/ui";
import { TriggerRunForm } from "./trigger-form";

// Dashboard data en lecture seule + bouton "Lancer un run" en server
// action. Direction A — éditorial chaud (cf. doc 10) : grammaire serif
// pour les chiffres clés, sans-serif Geist pour les data tables, badges
// chauds. Pas de gradient, pas d'ombre violente.

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) {
    return <NoWorkspaceState email={session.user.email} />;
  }

  const claudeMetrics = data.metricsToday.find((m) => m.llm === "claude");
  const visibilityScore = claudeMetrics?.visibilityScore ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Header éditorial : eyebrow workspace, titre brand, sous-titre domaine */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="type-eyebrow">
            {data.workspace.name}
            <span aria-hidden> · </span>
            <Badge tone={data.workspace.plan === "trialing" ? "mustard" : "neutral"}>
              plan {data.workspace.plan}
            </Badge>
          </span>
          <h1 className="type-h1">{data.brand.name}</h1>
          <span className="type-meta">{data.brand.domain}</span>
        </div>
        <TriggerRunForm />
      </header>

      <hr className="rule mt-8" />

      {/* Stats clés — grid 4 colonnes desktop, 2 tablette, 1 mobile */}
      <section className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Score de visibilité"
          value={claudeMetrics ? visibilityScore.toFixed(1) : "—"}
          hint={claudeMetrics ? `aujourd'hui · Claude (sur 100)` : "aucun run aujourd'hui"}
          tone={visibilityScore >= 50 ? "success" : visibilityScore > 0 ? "warning" : "muted"}
        />
        <Stat
          label="Marque citée"
          value={
            claudeMetrics ? `${claudeMetrics.brandCitedCount}/${claudeMetrics.totalRuns}` : "—"
          }
          hint="runs Claude aujourd'hui"
        />
        <Stat
          label="Top concurrent cité"
          value={
            <span className="font-serif">{claudeMetrics?.topCompetitors[0]?.name ?? "—"}</span>
          }
          hint={
            claudeMetrics?.topCompetitors[0]
              ? `${claudeMetrics.topCompetitors[0].citationCount} mention(s)`
              : "aucune mention"
          }
        />
        <Stat
          label="Coût LLM ce mois"
          value={`$${data.usage.llmCostUsd.toFixed(2)}`}
          hint={`${data.usage.runsCount} run(s) cumulé(s)`}
          tone="muted"
        />
      </section>

      {/* Configuration rapide */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="type-h3">Configuration</h2>
          <span className="type-meta">{data.brand.domain}</span>
        </div>
        <hr className="rule mt-3" />
        <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          <ConfigItem label="Prompts actifs" value={String(data.promptsCount)} />
          <ConfigItem label="Concurrents trackés" value={String(data.competitorsCount)} />
          <ConfigItem label="LLMs trackés" value="Claude" hint="Phase A" />
          <ConfigItem
            label="Période en cours"
            value={data.usage.periodStart}
            hint="mois calendrier"
          />
        </dl>
      </section>

      {/* Concurrents top 3 si data dispo */}
      {claudeMetrics && claudeMetrics.topCompetitors.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="type-h3">Top concurrents cités aujourd&apos;hui</h2>
            <span className="type-meta">via Claude</span>
          </div>
          <hr className="rule mt-3" />
          <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {claudeMetrics.topCompetitors.map((c, i) => (
              <li key={c.name}>
                <Card>
                  <CardBody>
                    <div className="flex items-baseline justify-between">
                      <span className="type-eyebrow">#{i + 1}</span>
                      <Badge tone="accent">{c.citationCount} mention(s)</Badge>
                    </div>
                    <p className="type-h3 mt-2">{c.name}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Runs récents — table */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="type-h3">10 derniers runs</h2>
          <span className="type-meta">tous statuts</span>
        </div>
        <hr className="rule mt-3" />
        {data.recentRuns.length === 0 ? (
          <p className="type-body mt-6">
            Pas encore de run. Le cron quotidien se déclenche à 06:00 UTC, ou clique sur
            «&nbsp;Lancer un run maintenant&nbsp;» plus haut.
          </p>
        ) : (
          <RecentRunsTable rows={data.recentRuns} />
        )}
      </section>

      <footer className="mt-20">
        <hr className="rule" />
        <p className="type-meta mt-4">
          Phase A — moteur sur Claude Haiku 4.5 uniquement. Bascule Sonnet 4.6 et 4 autres LLMs en
          Phase C. Détail dans <code>geo-project/09-decisions-journal.md</code> § 2026-05-07.
        </p>
      </footer>
    </main>
  );
}

function ConfigItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="type-meta">{label}</dt>
      <dd className="mt-1 text-base font-medium text-[color:var(--color-ink)]">
        {value}
        {hint && (
          <span className="ml-2 text-xs font-normal text-[color:var(--color-warm-gray)]">
            ({hint})
          </span>
        )}
      </dd>
    </div>
  );
}

function RecentRunsTable({ rows }: { rows: RecentRun[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[color:var(--color-warm-gray-soft)]">
            <Th>Prompt</Th>
            <Th>LLM</Th>
            <Th>Statut</Th>
            <Th>Citée</Th>
            <Th align="right">Coût</Th>
            <Th align="right">Durée</Th>
            <Th align="right">Exécuté</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((run) => (
            <tr
              key={run.id}
              className="border-b border-[color:var(--color-warm-gray-soft)]/50 last:border-b-0 hover:bg-[color:var(--color-cream-dim)]/40"
            >
              <Td>
                <span className="block max-w-md truncate" title={run.promptText}>
                  {run.promptText}
                </span>
              </Td>
              <Td>
                <span className="type-mono">{run.llm}</span>
              </Td>
              <Td>
                <StatusBadge status={run.status} />
              </Td>
              <Td>
                <BrandSignal value={run.brandMentioned} />
              </Td>
              <Td align="right">
                <span className="type-mono">
                  {run.costUsd !== null ? `$${run.costUsd.toFixed(4)}` : "—"}
                </span>
              </Td>
              <Td align="right">
                <span className="type-mono">
                  {run.durationMs !== null ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
                </span>
              </Td>
              <Td align="right">
                <span className="type-meta">
                  {run.executedAt ? formatRelative(run.executedAt) : "en attente"}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`type-eyebrow py-2.5 px-3 ${align === "right" ? "text-right" : "text-left"}`}
      scope="col"
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td className={`py-3 px-3 align-middle ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success") return <Badge tone="success">success</Badge>;
  if (status === "running") return <Badge tone="accent">running</Badge>;
  if (status === "failed") return <Badge tone="error">failed</Badge>;
  if (status === "pending") return <Badge tone="neutral">pending</Badge>;
  return <Badge tone="neutral">{status}</Badge>;
}

function BrandSignal({ value }: { value: RecentRun["brandMentioned"] }) {
  if (value === true) return <Badge tone="success">citée</Badge>;
  if (value === false) return <span className="type-meta">non</span>;
  if (value === "skipped") return <span className="type-meta">regex 0</span>;
  return <span className="type-meta">—</span>;
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

function NoWorkspaceState({ email }: { email: string }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <span className="type-eyebrow">Bienvenue</span>
      <h1 className="type-display mt-3">{email}</h1>
      <hr className="rule mt-8" />
      <p className="type-body-lg mt-8">
        Tu n&apos;as pas encore de workspace. L&apos;onboarding wizard arrive en PR 9 — en
        attendant, lance{" "}
        <code className="rounded bg-[color:var(--color-cream-dim)] px-1.5 py-0.5 type-mono">
          pnpm seed:dev
        </code>{" "}
        en dev pour générer un workspace de test.
      </p>
      <p className="type-meta mt-10">
        <Link
          href="/login"
          className="text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-terracotta)]"
        >
          ← Se déconnecter
        </Link>
      </p>
    </main>
  );
}
