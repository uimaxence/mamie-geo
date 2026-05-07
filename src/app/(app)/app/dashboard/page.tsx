import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData, type RecentRun } from "@/lib/dashboard/queries";
import { TriggerRunForm } from "./trigger-form";

// Dashboard data en lecture seule + bouton "Lancer un run" en server
// action. Pas de design abouti — Phase B (PR 8) polit avec shadcn et
// les tokens du doc 10. Ici on s'assure juste que les vraies données
// remontent en BDD et s'affichent.

export const dynamic = "force-dynamic"; // session-based, pas cacheable

export default async function DashboardPage() {
  // Le layout (app)/layout.tsx redirige déjà vers /login si pas de
  // session, donc à ce stade on est garanti d'avoir un user. On reload
  // quand même la session pour récupérer le user.id (le layout n'expose
  // pas de context).
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) {
    return <NoWorkspaceState email={session.user.email} />;
  }

  const claudeMetrics = data.metricsToday.find((m) => m.llm === "claude");

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-[color:var(--color-warm-gray)]">
            {data.workspace.name} · plan {data.workspace.plan}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{data.brand.name}</h1>
          <p className="mt-1 text-[color:var(--color-warm-gray)]">{data.brand.domain}</p>
        </div>
        <TriggerRunForm />
      </header>

      <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Score de visibilité"
          value={claudeMetrics ? `${claudeMetrics.visibilityScore.toFixed(1)} / 100` : "—"}
          hint={claudeMetrics ? `aujourd'hui · Claude` : "aucun run aujourd'hui"}
        />
        <StatCard
          label="Marque citée"
          value={
            claudeMetrics ? `${claudeMetrics.brandCitedCount} / ${claudeMetrics.totalRuns}` : "—"
          }
          hint="runs Claude aujourd'hui"
        />
        <StatCard
          label="Top concurrent cité"
          value={claudeMetrics?.topCompetitors[0]?.name ?? "—"}
          hint={
            claudeMetrics?.topCompetitors[0]
              ? `${claudeMetrics.topCompetitors[0].citationCount} mention(s)`
              : "aucune mention"
          }
        />
        <StatCard
          label="Coût LLM ce mois"
          value={`$${data.usage.llmCostUsd.toFixed(2)}`}
          hint={`${data.usage.runsCount} run(s) cumulé(s)`}
        />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Configuration</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
          <ConfigPill label="Prompts actifs" value={String(data.promptsCount)} />
          <ConfigPill label="Concurrents trackés" value={String(data.competitorsCount)} />
          <ConfigPill label="LLMs trackés" value="Claude (Phase A)" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">10 derniers runs</h2>
        {data.recentRuns.length === 0 ? (
          <p className="mt-3 text-[color:var(--color-warm-gray)]">
            Pas encore de run. Le cron quotidien se déclenche à 06:00 UTC, ou clique sur « Lancer un
            run maintenant » plus haut.
          </p>
        ) : (
          <RecentRunsTable rows={data.recentRuns} />
        )}
      </section>

      <footer className="mt-16 border-t border-[color:var(--color-warm-gray)]/30 pt-6 text-xs text-[color:var(--color-warm-gray)]">
        Pipeline en Phase A — moteur sur Haiku 4.5 uniquement. Bascule Sonnet 4.6 et 4 autres LLMs
        en Phase C (cf. <code>geo-project/09-decisions-journal.md</code> § 2026-05-07).
      </footer>
    </main>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-warm-gray)]/30 bg-white p-4">
      <p className="text-xs uppercase tracking-widest text-[color:var(--color-warm-gray)]">
        {label}
      </p>
      <p className="mt-1 font-serif text-3xl">{value}</p>
      <p className="mt-1 text-xs text-[color:var(--color-warm-gray)]">{hint}</p>
    </div>
  );
}

function ConfigPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[color:var(--color-warm-gray)]/30 bg-white px-3 py-2">
      <span className="text-[color:var(--color-warm-gray)]">{label} : </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function RecentRunsTable({ rows }: { rows: RecentRun[] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-[color:var(--color-warm-gray)]/30 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[color:var(--color-warm-gray)]/30 bg-[color:var(--color-cream)]/50 text-xs uppercase tracking-widest text-[color:var(--color-warm-gray)]">
          <tr>
            <th className="px-3 py-2">Prompt</th>
            <th className="px-3 py-2">LLM</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Citée</th>
            <th className="px-3 py-2">Coût</th>
            <th className="px-3 py-2">Durée</th>
            <th className="px-3 py-2">Exécuté</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((run) => (
            <tr
              key={run.id}
              className="border-b border-[color:var(--color-warm-gray)]/20 last:border-b-0"
            >
              <td className="max-w-xs truncate px-3 py-2" title={run.promptText}>
                {run.promptText}
              </td>
              <td className="px-3 py-2">{run.llm}</td>
              <td className="px-3 py-2">
                <StatusBadge status={run.status} />
              </td>
              <td className="px-3 py-2">{renderBrandSignal(run.brandMentioned)}</td>
              <td className="px-3 py-2 tabular-nums">
                {run.costUsd !== null ? `$${run.costUsd.toFixed(4)}` : "—"}
              </td>
              <td className="px-3 py-2 tabular-nums">
                {run.durationMs !== null ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
              </td>
              <td className="px-3 py-2 text-[color:var(--color-warm-gray)]">
                {run.executedAt ? formatRelative(run.executedAt) : "en attente"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClass =
    status === "success"
      ? "text-emerald-700 bg-emerald-50"
      : status === "running"
        ? "text-blue-700 bg-blue-50"
        : status === "failed"
          ? "text-red-700 bg-red-50"
          : "text-[color:var(--color-warm-gray)] bg-[color:var(--color-cream)]/50";
  return <span className={`rounded px-2 py-0.5 text-xs ${colorClass}`}>{status}</span>;
}

function renderBrandSignal(value: RecentRun["brandMentioned"]): string {
  if (value === true) return "✅ oui";
  if (value === false) return "—";
  if (value === "skipped") return "regex 0";
  return "—";
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD}j`;
}

function NoWorkspaceState({ email }: { email: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm uppercase tracking-widest text-[color:var(--color-warm-gray)]">
        /app/dashboard
      </p>
      <h1 className="mt-4 font-serif text-4xl">Bienvenue, {email}</h1>
      <p className="mt-4 text-[color:var(--color-warm-gray)]">
        Tu n&apos;as pas encore de workspace. L&apos;onboarding wizard arrive en PR 6 — en
        attendant, lance{" "}
        <code className="rounded bg-[color:var(--color-cream)] px-1">pnpm seed:dev</code> en dev
        pour générer un workspace de test, ou attends la prochaine livraison.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm underline underline-offset-2">
        Se déconnecter
      </Link>
    </main>
  );
}
