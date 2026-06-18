"use client";

import Link from "next/link";
import { ArrowRight, Lock, MapPin, MessageSquare, Trophy } from "lucide-react";
import { Badge, Button, LinkButton, ScoreRing } from "@/components/ui";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { FounderPortrait } from "@/components/marketing/founder-portrait";
import { DFY_SLOTS_BADGE } from "@/lib/done-for-you";
import { capture } from "@/lib/posthog-client";
import type { CityVisibility, LocalMapReport } from "@/lib/local-map/types";
import { LocalMap } from "./local-map";

// Résultat de la carte locale — layout « dashboard » (carte à gauche,
// charts app à droite ≥ lg, responsive en colonne sinon). Réutilise les
// composants de l'app (ScoreRing, BreakdownBars) pour la cohérence DA.
// Cf. concept GEO local (doc 09 § 2026-06-17, itération layout + charts).

// On montre 1 IA grounded web (Perplexity côté moteur, non nommée dans
// l'UI — cf. retour Max) ; les 4 autres sont verrouillées → trial.
const LOCKED_LLMS = ["ChatGPT", "Claude", "Gemini", "Le Chat"];
const SIGNUP_HREF = "/login?mode=signup&from=carte-locale";
const COMP_COLORS = ["#329cff", "#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6", "#64748b"];

function trackCta(cta: string, extra?: Record<string, unknown>) {
  capture("tool_cta_clicked", { tool: "visibilite-locale", cta, ...extra });
}

export function LocalMapResults({
  report,
  onReset,
  onEdit,
}: {
  report: LocalMapReport;
  onReset: () => void;
  onEdit: () => void;
}) {
  const missing = report.cities.filter((c) => !c.recommended);
  const firstRival = missing.find((c) => c.topRival)?.topRival ?? null;
  const visibilityPct =
    report.totalCities > 0 ? (report.recommendedCount / report.totalCities) * 100 : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="type-eyebrow text-center">
        {report.brand} · {report.sector} · autour de {report.mainCity} · {report.llmLabel}
      </p>

      {/* Ligne 1 : carte (gauche) + score & concurrents (droite) */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardTitle icon={MapPin}>Ta carte de visibilité IA locale</CardTitle>
          <div className="mt-4">
            <LocalMap cities={report.cities} brand={report.brand} />
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardTitle>Score local</CardTitle>
            <div className="mt-3 flex items-center gap-5">
              <ScoreRing value={visibilityPct} size={104} suffix={null} />
              <div>
                <p className="text-sm font-medium text-[color:var(--color-ink)]">
                  Recommandé dans {report.recommendedCount} ville
                  {report.recommendedCount > 1 ? "s" : ""} sur {report.totalCities}
                </p>
                <p className="type-meta mt-1">
                  % de villes où l&apos;IA te cite quand on cherche ton activité.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle icon={Trophy}>Concurrents les plus cités dans ta zone</CardTitle>
            {report.topCompetitors.length > 0 ? (
              <div className="mt-4">
                <BreakdownBars
                  segments={report.topCompetitors.map((c, i) => ({
                    id: c.name,
                    label: c.name,
                    value: c.cityCount,
                    color: COMP_COLORS[i % COMP_COLORS.length]!,
                    suffix: c.cityCount > 1 ? " villes" : " ville",
                  }))}
                  mode="absolute"
                  maxValue={report.totalCities}
                />
              </div>
            ) : (
              <p className="type-meta mt-3">
                Aucun concurrent clairement identifié — le terrain local est ouvert.
              </p>
            )}
          </Card>
        </div>
      </div>

      <p className="type-body mx-auto mt-6 max-w-xl text-center">
        {verdictText(report, firstRival)}
      </p>

      {/* Ligne 2 : détail par ville (gauche) + questions posées (droite) */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>Détail par ville</CardTitle>
          <div className="mt-4 flex flex-col gap-2">
            {report.cities.map((city, i) => (
              <CityRow key={city.name} city={city} index={i} />
            ))}
          </div>
        </Card>

        <PromptsCard report={report} />
      </div>

      {/* Les 4 autres IA, verrouillées */}
      <div className="mt-8 rounded-[var(--radius-xl)] border-2 border-[color:var(--color-ink)] bg-white p-6 sm:p-8">
        <h3 className="type-h3">Et sur les 4 autres IA, dans tes villes ?</h3>
        <p className="type-body mt-2">
          Tu viens de voir une seule IA en direct. Mais tes prospects demandent aussi à ChatGPT,
          Claude, Gemini et Le Chat — et d&apos;une IA à l&apos;autre, les recommandations changent
          du tout au tout. Le suivi de l&apos;app te montre ta carte locale sur les 5 IA, et son
          évolution.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {LOCKED_LLMS.map((llm) => (
            <Link
              key={llm}
              href={SIGNUP_HREF}
              onClick={() => trackCta("locked_llm", { llm })}
              className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-3 py-2.5 transition hover:border-[color:var(--color-ink)] hover:bg-white"
            >
              <span className="text-sm font-medium text-[color:var(--color-ink)]">{llm}</span>
              <Lock size={13} className="text-[color:var(--color-faint)]" />
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <LinkButton
            href={SIGNUP_HREF}
            variant="accent"
            size="lg"
            className="w-full whitespace-nowrap sm:w-auto"
            onClick={() => trackCta("trial", { recommended_count: report.recommendedCount })}
          >
            Voir ma carte sur les 5 IA
          </LinkButton>
          <span className="type-meta">
            Essai 14 jours · garantie remboursement 14 jours, annulable en 1 clic.
          </span>
        </div>
      </div>

      <AccompagnementUpsell />

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Corriger marque / activité / ville
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Tester un autre site
        </Button>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
      {children}
    </div>
  );
}

function CardTitle({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={15} className="text-[color:var(--color-accent)]" />}
      <h3 className="type-eyebrow">{children}</h3>
    </div>
  );
}

function verdictText(report: LocalMapReport, firstRival: string | null): string {
  const { recommendedCount, totalCities, mainCity } = report;
  if (recommendedCount === 0) {
    return firstRival
      ? `L'IA ne te recommande dans aucune de ces villes — elle envoie tes clients chez « ${firstRival} » et tes autres concurrents. C'est ce que voient tes prospects… et c'est ta fenêtre.`
      : "L'IA ne recommande encore personne clairement dans ces villes : le terrain est vide, à toi de l'occuper en premier.";
  }
  if (recommendedCount === totalCities) {
    return `L'IA te recommande dans les ${totalCities} villes 👏 — reste à savoir si c'est aussi le cas sur les 4 autres IA, et si ça tient dans le temps.`;
  }
  const recommended = report.cities.filter((c) => c.recommended).map((c) => c.name);
  const absent = report.cities.filter((c) => !c.recommended).map((c) => c.name);
  return `Tu es recommandé à ${formatList(recommended)}, mais invisible à ${formatList(absent)}. À ${mainCity} et autour, l'IA n'envoie pas les mêmes clients chez toi.`;
}

function formatList(items: string[]): string {
  if (items.length === 0) return "—";
  if (items.length === 1) return items[0]!;
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function CityRow({ city, index }: { city: CityVisibility; index: number }) {
  // Pastille en miroir de la carte : ★ = ta ville (index 0), n° + couleur
  // (vert recommandé / rouge concurrent) pour les villes autour.
  const isMain = index === 0;
  const badgeStyle = isMain
    ? "bg-[color:var(--color-ink)] text-white"
    : city.recommended
      ? "bg-[color:var(--color-success)] text-white"
      : "bg-[color:var(--color-error)] text-white";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${badgeStyle}`}
        >
          {isMain ? "★" : index}
        </span>
        <span className="text-sm font-medium text-[color:var(--color-ink)]">{city.name}</span>
      </div>
      {city.recommended ? (
        <span className="text-xs font-medium text-[color:var(--color-success)]">
          l&apos;IA te recommande
        </span>
      ) : city.topRival ? (
        <span className="text-xs text-[color:var(--color-ink-soft)]">
          l&apos;IA cite{" "}
          <Badge tone="neutral" className="align-middle">
            {city.topRival}
          </Badge>{" "}
          à ta place
        </span>
      ) : (
        <span className="text-xs text-[color:var(--color-muted)]">aucune marque recommandée</span>
      )}
    </div>
  );
}

// Les recherches locales analysées (1 par ville), cliquables → signup.
// Transparence (ce qu'on a réellement cherché) + conversion.
function PromptsCard({ report }: { report: LocalMapReport }) {
  const examples = report.cities
    .map((c) => c.queries[0])
    .filter((q): q is string => Boolean(q))
    .slice(0, 6);
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <CardTitle icon={MessageSquare}>Les questions qu&apos;on a posées à l&apos;IA</CardTitle>
      <p className="type-meta mt-2">
        Exactement ce que tes clients demandent à l&apos;IA dans tes {report.totalCities} villes.
        Clique pour suivre ces questions dans l&apos;app, chaque jour et sur les 5 IA.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {examples.map((query) => (
          <Link
            key={query}
            href={SIGNUP_HREF}
            onClick={() => trackCta("prompt_click")}
            className="group flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3 transition hover:border-[color:var(--color-ink)] hover:bg-white"
          >
            <span className="text-sm italic text-[color:var(--color-ink-soft)]">
              «&nbsp;{query}&nbsp;»
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[color:var(--color-faint)] transition group-hover:gap-1.5 group-hover:text-[color:var(--color-ink)]">
              suivre <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AccompagnementUpsell() {
  return (
    <div className="mt-8 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <FounderPortrait size={56} />
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="type-h3">Tu veux dominer ta zone&nbsp;?</h3>
          <Badge tone="accent">{DFY_SLOTS_BADGE}</Badge>
        </div>
      </div>
      <p className="type-body mt-3">
        Moi c&apos;est Max, le fondateur. Je prends quelques marques par trimestre pour les rendre
        incontournables dans les IA — y compris localement, ville par ville. On en parle
        30&nbsp;minutes, gratuitement, sans pitch commercial.
      </p>
      <LinkButton
        href="/contact"
        variant="secondary"
        size="md"
        className="mt-4 whitespace-nowrap"
        onClick={() => trackCta("call_max")}
      >
        Réserver un appel découverte
      </LinkButton>
    </div>
  );
}
