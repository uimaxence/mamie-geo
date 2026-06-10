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
  GEO_AXES,
  GEO_CONCLUSION,
  GEO_TIPS,
  GEO_TIPS_BY_AXIS,
  GEO_TIPS_BY_PRIORITY,
  type GeoTip,
} from "@/lib/geo-advice";

// Vue /app/conseils : 10 leviers GEO rendus en plan d'action priorisé
// (2 sections pleine largeur : impact fort puis compléments), numérotés
// dans l'ordre de lecture. Refonte 2026-06-10 : l'ancienne grille 2×2
// par axe donnait des colonnes 1/3/5/1 leviers → trous blancs et ordre
// de lecture illisible (cf. doc 09). L'axe reste visible via un badge
// par levier. Chaque levier est un item dépliable (résumé visible,
// détail au clic). Le suivi des URLs auditées vit sur /app/audits ;
// ici juste un bloc CTA (pas de doublon).

const AUDITABLE_COUNT = GEO_TIPS.filter((t) => t.auditable).length;

export function ConseilsView() {
  const { high, medium } = GEO_TIPS_BY_PRIORITY;

  return (
    <>
      <PageHeader
        icon={Lightbulb}
        title="Conseils GEO"
        summary="10 leviers pour devenir une source citée par les IA, dans l'ordre où les traiter"
      />

      <IntroBlock />

      <TipsSection
        eyebrow="Commence ici"
        title="Les leviers à impact fort"
        description="Le socle. Tant que ces leviers ne sont pas en place, les suivants rapportent peu."
        tips={high}
        startIndex={1}
      />

      <TipsSection
        eyebrow="Ensuite"
        title="Pour aller plus loin"
        description="Des compléments qui élargissent ta surface de citation une fois le socle posé."
        tips={medium}
        startIndex={high.length + 1}
      />

      <ClosingBlock />
    </>
  );
}

// Intro pleine largeur : cadrage + légende des 4 axes (chips avec
// compteur) sur la même carte — pas de 2-col ici, les hauteurs des
// deux contenus divergent trop (c'était une source de vide).
function IntroBlock() {
  return (
    <div className="mt-8 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
      <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-[color:var(--color-ink-soft)]">
        Le SEO IA n&apos;est plus seulement une affaire de blog. Être cité par ChatGPT, Perplexity
        ou Gemini se joue sur un mélange de{" "}
        <strong className="font-semibold text-[color:var(--color-ink)]">
          SEO, de branding et de réputation
        </strong>
        . Ces 10 leviers couvrent 4 axes&nbsp;:
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {GEO_TIPS_BY_AXIS.map(({ axis, tips }) => (
          <span key={axis.id} className="inline-flex items-center gap-1.5">
            <Badge tone={axis.tone}>{axis.label}</Badge>
            <span className="text-[0.8125rem] tabular-nums text-[color:var(--color-muted)]">
              ×{tips.length}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Section de leviers : en-tête (eyebrow + titre + description) puis une
// carte pleine largeur contenant les leviers en rows dépliables
// numérotées — zéro espace perdu, ordre de lecture évident.
function TipsSection({
  eyebrow,
  title,
  description,
  tips,
  startIndex,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tips: GeoTip[];
  startIndex: number;
}) {
  return (
    <section className="mt-10">
      <p className="type-eyebrow">{eyebrow}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="type-h3 text-base">{title}</h2>
        <p className="text-sm text-[color:var(--color-muted)]">{description}</p>
      </div>
      <Card className="mt-4 overflow-hidden">
        <ul className="divide-y divide-[color:var(--color-border)]">
          {tips.map((tip, i) => (
            <TipItem key={tip.slug} tip={tip} order={startIndex + i} />
          ))}
        </ul>
      </Card>
    </section>
  );
}

function TipItem({ tip, order }: { tip: GeoTip; order: number }) {
  const axis = GEO_AXES[tip.axis];
  return (
    <li>
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-[color:var(--color-gray-50)]">
          <span className="mt-0.5 w-6 shrink-0 text-right text-[0.8125rem] font-medium tabular-nums text-[color:var(--color-faint)]">
            {String(order).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-[0.9375rem] font-semibold text-[color:var(--color-ink)]">
                {tip.title}
              </h3>
              <Badge tone={axis.tone}>{axis.label}</Badge>
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
          {/* pl-15 = aligné sur le contenu du trigger (numéro 24px + gap 16px + padding 20px) */}
          <div className="space-y-4 pb-5 pl-[60px] pr-5">
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
    <div className="mt-10 grid items-start gap-4 lg:grid-cols-2">
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
