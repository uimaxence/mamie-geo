import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronRight, Info, Minus, Target, Trophy } from "lucide-react";
import { RANKING_RELIABLE_AFTER_DAYS } from "@/lib/competitors/ranking";
import type { RankSummary } from "@/lib/competitors/queries";

// Carte « se situer » du dashboard : remonte le statut de rang déjà calculé
// (enterré dans Citations → Classement) au premier plan, pour répondre à
// « mes données sont-elles bonnes ou pas ? » par du RELATIF (rang vs
// concurrents + delta vs J-7). Cf. doc 09 § 2026-06-17. Server component :
// la phrase vient de buildRankStatus (pur), pas d'interactivité.

const TONE_ACCENT: Record<RankSummary["status"]["tone"], string> = {
  success: "text-[color:var(--color-accent)]",
  warning: "text-[color:var(--color-warning)]",
  neutral: "text-[color:var(--color-muted)]",
};

export function RankSummaryCard({ summary }: { summary: RankSummary }) {
  const { status } = summary;
  const Icon = status.icon === "trophy" ? Trophy : Target;

  // Delta de rang vs la fenêtre précédente : previousRank - rank > 0 = on a
  // gagné des places (le rang baisse en valeur = on monte).
  const rankDelta =
    status.rank !== null && status.previousRank !== null ? status.previousRank - status.rank : null;

  return (
    <section className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-gray-50)]">
            <Icon size={18} strokeWidth={2} className={TONE_ACCENT[status.tone]} aria-hidden />
          </span>
          <div>
            <p className="type-eyebrow">Où tu te situes</p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
              {status.headline && (
                <strong className="font-semibold text-[color:var(--color-ink)]">
                  {status.headline}
                </strong>
              )}
              {status.detail}
              {rankDelta !== null && rankDelta !== 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center gap-0.5 align-middle text-xs font-medium ${
                    rankDelta > 0
                      ? "text-[color:var(--color-success)]"
                      : "text-[color:var(--color-error)]"
                  }`}
                >
                  {rankDelta > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(rankDelta)} vs J-{summary.deltaDays}
                </span>
              )}
              {rankDelta === 0 && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-xs font-medium text-[color:var(--color-muted)]">
                  <Minus size={12} /> stable vs J-{summary.deltaDays}
                </span>
              )}
            </p>
          </div>
        </div>

        <Link
          href="/app/citations?tab=ranking"
          className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-[color:var(--color-ink-soft)] no-underline hover:text-[color:var(--color-ink)]"
        >
          Voir le classement
          <ChevronRight size={15} />
        </Link>
      </div>

      {!summary.reliable && (
        <p className="mt-3 flex items-start gap-1.5 text-[0.8125rem] text-[color:var(--color-muted)]">
          <Info size={13} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
          <span>
            Classement encore jeune ({summary.dataDays} jour{summary.dataDays > 1 ? "s" : ""} de
            données) : il gagne en fiabilité au fil des runs, compte environ{" "}
            {RANKING_RELIABLE_AFTER_DAYS} jours.
          </span>
        </p>
      )}
    </section>
  );
}
