import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, GitCompare, Lightbulb, Plus, Wrench, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  Badge,
  EmptyState,
  LinkButton,
  PageContainer,
  PageHeader,
  ScoreRing,
} from "@/components/ui";
import { AuditsUpgradeCard } from "@/components/app/audits-upgrade-card";
import { cn } from "@/lib/utils";
import { getDashboardData } from "@/lib/dashboard/queries";
import { getAuditUsage } from "@/lib/audits/counters";
import { quotasFor } from "@/lib/plans/quotas";
import { listAudits } from "./actions";

// /app/audits, historique des audits techniques de la workspace.
// Sprint 6 PR B (cf. doc 09 § 2026-05-17).

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/app/onboarding");

  const audits = await listAudits(data.workspace.id);
  const usage = await getAuditUsage(data.workspace.id, data.workspace.plan);
  const quotas = quotasFor(data.workspace.plan);

  const ownedAudits = audits.filter((a) => !a.isCompetitor);
  const competitorAudits = audits.filter((a) => a.isCompetitor);
  const hasComparison = quotas.comparisonCompetitors > 0;

  return (
    <PageContainer>
      <PageHeader
        icon={Wrench}
        title="Audits techniques"
        summary="Plus de 30 vérifications SEO, GEO, accessibilité et performance. Lancez un audit, suivez son évolution et comparez vos pages."
        right={
          <>
            {hasComparison && (
              <LinkButton href="/app/audits/compare" variant="secondary" size="md">
                <GitCompare size={14} className="mr-1.5" />
                Comparer concurrents
              </LinkButton>
            )}
            <LinkButton href="/app/audits/new" variant="primary" size="md">
              <Plus size={14} className="mr-1.5" />
              Nouvel audit
            </LinkButton>
          </>
        }
      />

      {/* Compteurs d'usage — jauges compactes (icône pastille + barre de
          progression), volontairement distinctes des lignes d'URL
          cliquables en dessous : info de quota, pas une action. */}
      <div className={cn("mt-6 grid gap-3", hasComparison ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
        <UsageMeter
          icon={Wrench}
          tone="blue"
          label="Audits ce mois"
          used={usage.auditsCount}
          max={usage.maxAudits}
          caption={`Renouvelle le mois prochain · depuis le ${usage.periodStart}`}
        />
        {hasComparison && (
          <UsageMeter
            icon={GitCompare}
            tone="purple"
            label="Concurrents audités"
            used={usage.competitorAuditsCount}
            max={usage.maxComparisonCompetitors}
            caption="Inclus dans la comparaison"
          />
        )}
      </div>

      {/* Upsell : plans publics avec un palier supérieur dans le picker. */}
      {(data.workspace.plan === "solo" || data.workspace.plan === "starter") && (
        <div className="mt-6">
          <AuditsUpgradeCard plan={data.workspace.plan} />
        </div>
      )}

      {/* Mes audits */}
      <section className="mt-12">
        <h2 className="type-h2">Mes URLs</h2>
        {ownedAudits.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Aucun audit pour l'instant"
            description="Lance ton premier audit en 10 secondes. URL pré-remplie depuis ta marque trackée."
            className="mt-6"
            action={
              <LinkButton href="/app/audits/new" variant="primary" size="md">
                Auditer mon site
              </LinkButton>
            }
          />
        ) : (
          <ul className="mt-6 divide-y divide-[color:var(--color-border)] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
            {ownedAudits.map((audit) => (
              <AuditRow key={audit.url} audit={audit} />
            ))}
          </ul>
        )}
      </section>

      {/* Concurrents audités */}
      {hasComparison && competitorAudits.length > 0 && (
        <section className="mt-12">
          <h2 className="type-h2">Concurrents</h2>
          <ul className="mt-6 divide-y divide-[color:var(--color-border)] rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
            {competitorAudits.map((audit) => (
              <AuditRow key={audit.url} audit={audit} />
            ))}
          </ul>
        </section>
      )}

      {/* Cross-link éducation ↔ outil : continuité avec /app/conseils. */}
      <Link
        href="/app/conseils"
        className="mt-12 flex items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white px-5 py-4 transition-colors hover:bg-[color:var(--color-gray-50)]"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]"
          >
            <Lightbulb size={16} strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-[color:var(--color-ink)]">
              Comprendre ce que l&apos;audit vérifie
            </p>
            <p className="type-meta">Les 10 leviers GEO pour être cité par les IA</p>
          </div>
        </div>
        <ArrowRight size={16} className="shrink-0 text-[color:var(--color-muted)]" />
      </Link>
    </PageContainer>
  );
}

function AuditRow({
  audit,
}: {
  audit: {
    url: string;
    latestId: string;
    latestScore: number;
    latestFetchedAt: Date;
    previousScore: number | null;
    historyCount: number;
    isCompetitor: boolean;
  };
}) {
  const delta = audit.previousScore !== null ? audit.latestScore - audit.previousScore : null;
  return (
    <li>
      <Link
        href={`/app/audits/${audit.latestId}`}
        className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[color:var(--color-gray-50)]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">{audit.url}</p>
          <p className="type-meta mt-0.5">
            {audit.historyCount} audit{audit.historyCount > 1 ? "s" : ""} ·{" "}
            {formatRelative(audit.latestFetchedAt)}
            {audit.isCompetitor && (
              <Badge tone="neutral" className="ml-2">
                concurrent
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {delta !== null && (
            <p
              className="type-meta hidden tabular-nums sm:block"
              style={{ color: delta < 0 ? "#dc2626" : delta > 0 ? "#16a34a" : undefined }}
            >
              {delta > 0 ? "+" : ""}
              {delta} vs précédent
            </p>
          )}
          <ScoreRing value={audit.latestScore} size={68} strokeWidth={6} suffix={null} />
          <ArrowRight size={16} className="text-[color:var(--color-muted)]" />
        </div>
      </Link>
    </li>
  );
}

// Jauge de quota — icône pastille colorée + fraction + barre de
// progression. La barre vire ambre ≥80 % puis rouge à 100 % pour
// signaler l'approche de la limite. Quota infini : pas de barre, mention
// « Illimité ».
function UsageMeter({
  icon: Icon,
  tone,
  label,
  used,
  max,
  caption,
}: {
  icon: LucideIcon;
  tone: "blue" | "purple";
  label: string;
  used: number;
  max: number;
  caption: string;
}) {
  const infinite = !Number.isFinite(max);
  const pct = infinite || max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const remaining = infinite ? null : Math.max(0, max - used);
  // La couleur signale le restant : rouge à 0, ambre quand ≤20 % dispo.
  const fill = pct >= 100 ? "#dc2626" : pct >= 80 ? "#d97706" : "var(--color-accent)";
  const pastille =
    tone === "blue"
      ? "bg-[color:var(--color-blue-bg)] text-[color:var(--color-blue)]"
      : "bg-[color:var(--color-purple-bg)] text-[color:var(--color-purple)]";

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3">
        <span className="type-eyebrow inline-flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-[var(--radius-md)]",
              pastille,
            )}
          >
            <Icon size={14} strokeWidth={2} />
          </span>
          {label}
        </span>
        {infinite ? (
          <span className="text-sm font-semibold text-[color:var(--color-ink)]">Illimité</span>
        ) : (
          <span className="text-sm tabular-nums text-[color:var(--color-muted)]">
            <strong className="text-base tabular-nums" style={{ color: fill }}>
              {remaining}
            </strong>{" "}
            restant{remaining! > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[color:var(--color-gray-200)]">
        {!infinite && (
          <div
            className="h-full rounded-[var(--radius-pill)]"
            style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: fill }}
          />
        )}
      </div>
      <p className="type-meta mt-2">
        {infinite ? "Illimité sur ton plan" : `${used} sur ${max} utilisés · ${caption}`}
      </p>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
