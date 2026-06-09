"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Lightbulb, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import {
  Badge,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  LinkButton,
  PageHeader,
} from "@/components/ui";
import {
  GEO_CONCLUSION,
  GEO_TIPS,
  GEO_TIPS_BY_AXIS,
  type GeoAxisMeta,
  type GeoTip,
} from "@/lib/geo-advice";

// Vue /app/conseils : 10 leviers GEO regroupés en 4 blocs thématiques
// (un par axe), disposés en grille 2 colonnes — layout en blocs plutôt
// qu'une pile verticale (cf. doc 10 § Layout app). Chaque levier est un
// item dépliable (résumé visible, détail au clic). Le suivi des URLs
// auditées vit sur /app/audits ; ici juste un bloc CTA (pas de doublon).

const AUDITABLE_COUNT = GEO_TIPS.filter((t) => t.auditable).length;

export function ConseilsView() {
  return (
    <>
      <PageHeader
        icon={Lightbulb}
        title="Conseils GEO"
        summary="10 leviers pour devenir une source citée par les IA"
      />

      <IntroBlock />

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
        {GEO_TIPS_BY_AXIS.map(({ axis, tips }) => (
          <AxisCard key={axis.id} axis={axis} tips={tips} />
        ))}
      </div>

      <ClosingBlock />
    </>
  );
}

// Bloc d'intro en 2 colonnes : cadrage à gauche, légende des 4 axes
// (avec compteur de leviers) à droite — sert de carte de lecture.
function IntroBlock() {
  return (
    <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
        <p className="text-[0.9375rem] leading-relaxed text-[color:var(--color-ink-soft)]">
          Le SEO IA n&apos;est plus seulement une affaire de blog. Être cité par ChatGPT, Perplexity
          ou Gemini se joue sur un mélange de{" "}
          <strong className="font-semibold text-[color:var(--color-ink)]">
            SEO, de branding et de réputation
          </strong>
          . Ces 10 leviers se rangent en 4 axes.
        </p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6">
        <p className="type-eyebrow">Les 4 axes</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {GEO_TIPS_BY_AXIS.map(({ axis, tips }) => (
            <li key={axis.id} className="flex items-center justify-between gap-3">
              <Badge tone={axis.tone}>{axis.label}</Badge>
              <span className="text-[0.8125rem] tabular-nums text-[color:var(--color-muted)]">
                {tips.length} levier{tips.length > 1 ? "s" : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Carte d'un axe : en-tête (badge coloré + compteur) puis la liste de
// ses leviers en items dépliables.
function AxisCard({ axis, tips }: { axis: GeoAxisMeta; tips: GeoTip[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <Badge tone={axis.tone}>{axis.label}</Badge>
        <span className="text-[0.8125rem] tabular-nums text-[color:var(--color-muted)]">
          {tips.length} levier{tips.length > 1 ? "s" : ""}
        </span>
      </div>
      <ul className="divide-y divide-[color:var(--color-border)] border-t border-[color:var(--color-border)]">
        {tips.map((tip) => (
          <TipItem key={tip.slug} tip={tip} />
        ))}
      </ul>
    </Card>
  );
}

function TipItem({ tip }: { tip: GeoTip }) {
  return (
    <li>
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[color:var(--color-gray-50)]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-[0.9375rem] font-semibold text-[color:var(--color-ink)]">
                {tip.title}
              </h3>
              {tip.auditable && (
                <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-[color:var(--color-accent)]">
                  <ShieldCheck size={12} strokeWidth={2.2} />
                  vérifiable par l&apos;audit
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-[color:var(--color-muted)]">{tip.summary}</p>
          </div>
          <ChevronRight
            size={16}
            strokeWidth={2}
            className="mt-1 shrink-0 text-[color:var(--color-muted)] transition-transform duration-150 group-data-[state=open]:rotate-90"
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 px-5 pb-5">
            {tip.body.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                {para}
              </p>
            ))}

            {tip.bullets && (
              <ul className="flex flex-col gap-1.5">
                {tip.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-[color:var(--color-ink-soft)]"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--color-muted)]"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {tip.takeaway && (
              <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3">
                <Sparkles
                  size={15}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-[color:var(--color-accent)]"
                />
                <p className="text-sm text-[color:var(--color-ink)]">
                  <span className="font-semibold">À retenir · </span>
                  {tip.takeaway}
                </p>
              </div>
            )}

            {tip.appHint && (
              <Link
                href={tip.appHint.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-accent)] underline-offset-2 hover:underline"
              >
                {tip.appHint.label}
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

// Bloc de clôture en 2 colonnes : synthèse à gauche, CTA audit à droite
// (remplace l'ancien tableau d'URLs — celui-ci vit sur /app/audits).
function ClosingBlock() {
  return (
    <div className="mt-8 grid items-start gap-4 lg:grid-cols-2">
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6">
        <h2 className="type-h3 text-base">En résumé</h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-[color:var(--color-ink-soft)]">
          {GEO_CONCLUSION.intro}
        </p>
        <p className="mt-4 type-eyebrow">Les contenus les plus cités combinent</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GEO_CONCLUSION.ingredients.map((ing) => (
            <Badge key={ing} tone="neutral">
              {ing}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]"
        >
          <Wrench size={18} strokeWidth={2} />
        </span>
        <h2 className="mt-3 type-h3 text-base">Vérifie tes pages</h2>
        <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-muted)]">
          {AUDITABLE_COUNT} des {GEO_TIPS.length} leviers sont concrètement vérifiables par
          l&apos;audit technique (socle SEO, structure, title, E-E-A-T). Lance-le sur tes URLs pour
          voir où tu en es.
        </p>
        <div className="mt-4">
          <LinkButton href="/app/audits" variant="primary" size="md">
            Lancer un audit
            <ArrowRight size={14} className="ml-1.5" />
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
