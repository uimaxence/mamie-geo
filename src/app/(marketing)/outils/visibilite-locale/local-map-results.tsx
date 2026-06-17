"use client";

import Link from "next/link";
import { Check, Lock, X } from "lucide-react";
import { Badge, Button, LinkButton } from "@/components/ui";
import { FounderPortrait } from "@/components/marketing/founder-portrait";
import { DFY_SLOTS_BADGE } from "@/lib/done-for-you";
import { capture } from "@/lib/posthog-client";
import type { CityVisibility, LocalMapReport } from "@/lib/local-map/types";
import { LocalMap } from "./local-map";

// Résultat de la carte locale : verdict + carte qui s'allume + détail par
// ville, puis les 4 autres IA verrouillées → funnel signup, puis upsell
// accompagnement. Cf. concept GEO local (doc 09 § 2026-06-17).

const LOCKED_LLMS = ["ChatGPT", "Claude", "Gemini", "Perplexity"];
const SIGNUP_HREF = "/login?mode=signup&from=carte-locale";

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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <p className="type-eyebrow text-center">
          {report.brand} · {report.sector} · autour de {report.mainCity} · {report.llmLabel} · en
          direct
        </p>

        <div className="mt-6">
          <LocalMap cities={report.cities} brand={report.brand} />
        </div>

        <p className="type-body mx-auto mt-6 max-w-md text-center">
          {verdictText(report, firstRival)}
        </p>

        {/* Détail par ville */}
        <div className="mt-8 flex flex-col gap-2">
          {report.cities.map((city) => (
            <CityRow key={city.name} city={city} />
          ))}
        </div>
      </div>

      {/* Les 4 autres IA, verrouillées */}
      <div className="mt-6 rounded-[var(--radius-xl)] border-2 border-[color:var(--color-ink)] bg-white p-6 sm:p-8">
        <h3 className="type-h3">Et sur les 4 autres IA, dans tes villes ?</h3>
        <p className="type-body mt-2">
          Tu viens de voir Le Chat. Mais tes prospects demandent aussi à ChatGPT, Claude, Perplexity
          et Gemini — et d&apos;une IA à l&apos;autre, les recommandations changent du tout au tout.
          Le suivi de l&apos;app te montre ta carte locale sur les 5 IA, et son évolution.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {LOCKED_LLMS.map((llm) => (
            <Link
              key={llm}
              href={SIGNUP_HREF}
              onClick={() => trackCta("locked_llm", { llm })}
              className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] px-4 py-3 transition hover:border-[color:var(--color-ink)] hover:bg-white"
            >
              <span className="text-sm font-medium text-[color:var(--color-ink)]">{llm}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-faint)] transition group-hover:text-[color:var(--color-ink)]">
                <Lock size={13} /> débloquer
              </span>
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

function CityRow({ city }: { city: CityVisibility }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        {city.recommended ? (
          <Check size={16} className="shrink-0 text-[color:var(--color-success)]" />
        ) : (
          <X size={16} className="shrink-0 text-[color:var(--color-error)]" />
        )}
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

function AccompagnementUpsell() {
  return (
    <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-6 sm:p-8">
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
