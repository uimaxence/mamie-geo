"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import type { PromptWithMetrics } from "@/lib/prompts/queries";

// Tableau analytics des prompts : croise chaque prompt avec ce qu'il
// « donne » (rang vs concurrents, visibilité, mentions, persistance, top
// concurrents). Présentation pure — la donnée arrive déjà agrégée +
// filtrée + paginée par le parent (prompts-list).

interface PromptsAnalyticsTableProps {
  rows: PromptWithMetrics[];
  windowDays: number;
}

export function PromptsAnalyticsTable({ rows, windowDays }: PromptsAnalyticsTableProps) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          {/* < md : on garde Prompt + Rang + Visibilité + détail. Le reste
           * (mentions, persistance, tags…) passe en md/lg pour tenir en
           * portrait, comme la vue Liste. */}
          <tr className="border-b border-[color:var(--color-border)]">
            <Th>Prompt</Th>
            <Th align="right">Rang</Th>
            <Th className="hidden md:table-cell">Visibilité</Th>
            <Th className="hidden lg:table-cell">Top concurrents</Th>
            <Th align="right" className="hidden md:table-cell">
              Mentions
            </Th>
            <Th className="hidden lg:table-cell">Persistance</Th>
            <Th className="hidden lg:table-cell">Tags</Th>
            <Th className="hidden xl:table-cell">Zone</Th>
            <Th align="right" className="hidden xl:table-cell">
              Créé
            </Th>
            <Th align="right">
              <span className="sr-only">Détail</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.id}
              className="group border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-gray-50)]"
            >
              <Td>
                <Link
                  href={`/app/prompts/${p.id}`}
                  className="block max-w-xs truncate text-[color:var(--color-ink)] hover:underline hover:underline-offset-2"
                  title={p.text}
                >
                  {p.text}
                </Link>
                <span className="type-meta md:hidden">
                  {p.mentions} mention{p.mentions > 1 ? "s" : ""}
                </span>
              </Td>

              <Td align="right">
                <RangBadge rang={p.rang} />
              </Td>

              <Td className="hidden md:table-cell">
                <Meter value={p.visibilityScore} color="var(--color-accent)" suffix="%" />
              </Td>

              <Td className="hidden lg:table-cell">
                <TopCompetitors competitors={p.topCompetitors} />
              </Td>

              <Td align="right" className="hidden md:table-cell">
                <span className="type-tabular text-sm">{p.mentions}</span>
              </Td>

              <Td className="hidden lg:table-cell">
                <Meter value={p.persistance} color="var(--color-purple)" suffix="%" />
              </Td>

              <Td className="hidden lg:table-cell">
                {p.category ? (
                  <Badge tone="neutral">{categoryLabel(p.category)}</Badge>
                ) : (
                  <span className="type-meta">—</span>
                )}
              </Td>

              <Td className="hidden xl:table-cell">
                <Badge tone="neutral">{p.language.toUpperCase()}</Badge>
              </Td>

              <Td align="right" className="hidden xl:table-cell">
                <span className="type-meta">{formatDate(p.createdAt)}</span>
              </Td>

              <Td align="right">
                <Link
                  href={`/app/prompts/${p.id}`}
                  className="inline-flex items-center gap-1 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
                >
                  <span className="hidden sm:inline">Voir le détail</span>
                  <ChevronRight size={16} strokeWidth={2} />
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="type-meta mt-4">
        Métriques calculées sur les {windowDays} derniers jours. Rang = position de ta marque par
        fréquence de citation parmi les marques citées sur le prompt.
      </p>
    </div>
  );
}

function RangBadge({ rang }: { rang: number | null }) {
  if (rang === null) {
    return <span className="type-meta">—</span>;
  }
  const tone = rang === 1 ? "success" : rang <= 3 ? "accent" : "warning";
  return <Badge tone={tone}>{`#${rang}`}</Badge>;
}

function TopCompetitors({
  competitors,
}: {
  competitors: PromptWithMetrics["topCompetitors"];
}) {
  if (competitors.length === 0) {
    return <span className="type-meta">—</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      {competitors.map((c) => (
        <BrandFavicon key={c.name} domain={c.domain ?? c.name} name={c.name} size={20} />
      ))}
    </div>
  );
}

// Petite barre de progression inline (cellule de tableau). Volontairement
// locale : ScoreBar (ui) est un bloc « cadre » trop large pour une cellule.
function Meter({ value, color, suffix }: { value: number; color: string; suffix?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <span className="type-tabular w-10 text-sm">
        {Math.round(value)}
        {suffix}
      </span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[color:var(--color-gray-100)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </span>
    </div>
  );
}

function Th({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={`type-eyebrow py-2.5 px-3 ${align === "right" ? "text-right" : "text-left"} ${className}`}
      scope="col"
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`py-3 px-3 align-middle ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}

function categoryLabel(category: string): string {
  switch (category) {
    case "commercial":
      return "Commercial";
    case "informational":
      return "Informationnel";
    case "comparison":
      return "Comparatif";
    default:
      return category;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
