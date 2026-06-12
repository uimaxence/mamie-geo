"use client";

import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { Badge, Button, LinkButton, ScoreRing } from "@/components/ui";
import { capture } from "@/lib/posthog-client";
import { sortChecksForDisplay } from "@/lib/comparators/sectors";
import type { ComparatorCheck, ComparatorScanReport } from "@/lib/comparators/types";

// Écran de résultat du scan comparateurs : verdict global (ScoreRing —
// même composant que le rapport d'audit de l'app, cohérence DA), détail
// par site (présents d'abord — preuves, puis absents — plan d'action),
// rappel des chiffres de l'étude 50 marques, CTA trial. Chaque CTA émet
// un event PostHog `tool_cta_clicked`.

function trackCta(cta: string, extra?: Record<string, unknown>) {
  capture("tool_cta_clicked", { tool: "comparateurs", cta, ...extra });
}

export function ComparatorResults({
  report,
  onReset,
  onEdit,
}: {
  report: ComparatorScanReport;
  onReset: () => void;
  /** Repasse le form en mode manuel pré-rempli (corriger marque/secteur/zone détectés). */
  onEdit: () => void;
}) {
  const checks = sortChecksForDisplay(report.checks);
  const absent = report.totalChecked - report.presentCount;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Verdict global */}
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="type-eyebrow">
            {report.brand} · {report.sector}
            {report.location ? ` (${report.location})` : ""}
          </p>
          <ScoreRing
            value={report.scorePct}
            suffix={`présent ${report.presentCount}/${report.totalChecked}`}
          />
          <p className="type-body max-w-md">
            {verdictText(report.presentCount, report.totalChecked)}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          {checks.map((check) => (
            <CheckRow key={check.domain} check={check} />
          ))}
        </div>

        <p className="type-meta mt-4">
          Vérification par recherche web en direct (requête «&nbsp;site:domaine
          &quot;{report.brand}&quot;&nbsp;»). Un site marqué absent peut aussi être mal indexé —
          c&apos;est un signal, pas un jugement définitif.
        </p>
      </div>

      {/* Plan d'action si absences */}
      {absent > 0 && (
        <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-6 sm:p-8">
          <h3 className="type-h3">
            Comment être présent sur {absent > 1 ? `ces ${absent} sites` : "ce site"}
          </h3>
          <ol className="mt-4 flex flex-col gap-3">
            <ActionStep n={1}>
              <strong>Repère la bonne page</strong> — celle qui ranke sur «&nbsp;meilleur{" "}
              {report.sector}&nbsp;». C&apos;est elle que les IA lisent avant de répondre.
            </ActionStep>
            <ActionStep n={2}>
              <strong>Demande l&apos;inclusion</strong> — la plupart de ces sites ont une page
              «&nbsp;ajouter votre entreprise&nbsp;» / «&nbsp;référencer votre produit&nbsp;» ou un
              contact rédaction. Certains sont payants, beaucoup sont gratuits.
            </ActionStep>
            <ActionStep n={3}>
              <strong>Soigne ta fiche</strong> — nom exact, description claire, avis clients. Les
              IA reprennent l&apos;ordre et le vocabulaire de ces pages dans leurs réponses.
            </ActionStep>
          </ol>

          {/* Conseils personnalisés (enrichissement Mistral, best effort). */}
          {checks.some((c) => !c.present && c.inclusionHint) && (
            <div className="mt-6 border-t border-[color:var(--color-border)] pt-5">
              <p className="type-eyebrow">Site par site</p>
              <ul className="mt-3 flex flex-col gap-2">
                {checks
                  .filter((c) => !c.present && c.inclusionHint)
                  .map((c) => (
                    <li
                      key={c.domain}
                      className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]"
                    >
                      <strong className="text-[color:var(--color-ink)]">{c.label}</strong> —{" "}
                      {c.inclusionHint}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Pourquoi ça compte : chiffres étude */}
      <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 sm:p-8">
        <h3 className="type-h3">Pourquoi c&apos;est décisif</h3>
        <p className="type-body mt-3">
          Sur 722 sources citées dans notre étude (50 marques × 5 IA),{" "}
          <strong>32&nbsp;% sont des comparateurs ou annuaires</strong> — et
          seulement 1,7&nbsp;% le site des marques elles-mêmes. Être présent sur ces sites, c&apos;est
          la première action GEO, avant même de toucher à ton propre site.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <LinkButton
            href="/login?mode=signup&from=scan-comparateurs"
            variant="accent"
            size="md"
            className="whitespace-nowrap"
            onClick={() => trackCta("trial", { present_count: report.presentCount })}
          >
            Suivre ma visibilité dans 5 IA
          </LinkButton>
          <LinkButton
            href="/blog/etude-visibilite-ia-50-marques-francaises"
            variant="secondary"
            size="md"
            className="whitespace-nowrap"
            onClick={() => trackCta("etude")}
          >
            Lire l&apos;étude complète
          </LinkButton>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Corriger marque / secteur / zone
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Scanner un autre site
        </Button>
      </div>
    </div>
  );
}

function verdictText(present: number, total: number): string {
  if (present === 0) {
    return "Ta marque est absente des sites que les IA citent sur ton secteur. Quand on leur demande une recommandation, elles citent tes concurrents — pas toi.";
  }
  if (present < total / 2) {
    return "Présence partielle : les IA peuvent te trouver, mais tes concurrents présents sur plus de sites ont statistiquement plus de chances d'être recommandés.";
  }
  if (present < total) {
    return "Bonne couverture. Les derniers sites manquants sont des opportunités rapides pour verrouiller ta présence dans les réponses IA.";
  }
  return "Couverture totale sur les sites vérifiés. Prochaine étape : vérifier ce que les IA disent réellement de toi.";
}

function CheckRow({ check }: { check: ComparatorCheck }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {check.present ? (
          <CheckCircle2 size={18} className="shrink-0 text-[color:var(--color-success)]" />
        ) : (
          <XCircle size={18} className="shrink-0 text-[color:var(--color-error)]" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">
            {check.label}
          </p>
          <p className="truncate text-xs text-[color:var(--color-faint)]">
            {check.domain}
            {check.siteType && ` · ${check.siteType}`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {check.origin === "etude" && (
          <Badge tone="accent" className="hidden sm:inline-flex">
            source étude
          </Badge>
        )}
        {check.present && check.foundUrl ? (
          <a
            href={check.foundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--color-accent)] hover:underline"
          >
            voir la page <ExternalLink size={13} />
          </a>
        ) : check.present ? (
          <Badge tone="success">référencé</Badge>
        ) : (
          <Badge tone="error">absent</Badge>
        )}
      </div>
    </div>
  );
}

function ActionStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">{children}</span>
    </li>
  );
}
