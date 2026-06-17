import Link from "next/link";
import { Star } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import type { PromptWithMetrics } from "@/lib/prompts/queries";

// Carte « Mentions récentes » : aperçu compact des derniers prompts
// analysés et de ce qu'ils donnent (rang vs concurrents + top concurrents).
// Pont entre le dashboard et la vue Analytics complète de /app/prompts.
// Présentation pure — données déjà agrégées (listPromptsWithMetrics).

interface RecentMentionsCardProps {
  brandName: string;
  prompts: PromptWithMetrics[];
}

export function RecentMentionsCard({ brandName, prompts }: RecentMentionsCardProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
      <div className="flex items-center gap-2">
        <Star size={18} strokeWidth={2} className="text-[color:var(--color-warning)]" />
        <h3 className="type-h3">Mentions récentes de {brandName}</h3>
      </div>
      <p className="type-meta mt-1">Dernières mentions de marque, prompt par prompt</p>

      {prompts.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={Star}
            title="Aucune analyse pour l'instant"
            description="Dès que tes prompts seront analysés, leurs résultats apparaîtront ici."
          />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[color:var(--color-border)]">
                <th className="type-eyebrow px-2 py-2 text-left" scope="col">
                  Prompt
                </th>
                <th className="type-eyebrow px-2 py-2 text-right" scope="col">
                  Rang
                </th>
                <th className="type-eyebrow hidden px-2 py-2 text-left sm:table-cell" scope="col">
                  Concurrents
                </th>
                <th className="type-eyebrow hidden px-2 py-2 text-right md:table-cell" scope="col">
                  Analysé
                </th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[color:var(--color-border)] last:border-b-0 hover:bg-[color:var(--color-gray-50)]"
                >
                  <td className="px-2 py-3 align-middle">
                    <Link
                      href={`/app/prompts/${p.id}`}
                      className="block max-w-xs truncate text-sm text-[color:var(--color-ink)] hover:underline hover:underline-offset-2"
                      title={p.text}
                    >
                      {p.text}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-right align-middle">
                    {p.rang === null ? (
                      <span className="type-meta">—</span>
                    ) : (
                      <Badge tone={p.rang === 1 ? "success" : p.rang <= 3 ? "accent" : "warning"}>
                        {`#${p.rang}`}
                      </Badge>
                    )}
                  </td>
                  <td className="hidden px-2 py-3 align-middle sm:table-cell">
                    {p.topCompetitors.length === 0 ? (
                      <span className="type-meta">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {p.topCompetitors.map((c) => (
                          <BrandFavicon
                            key={c.name}
                            domain={c.domain ?? c.name}
                            name={c.name}
                            size={20}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="hidden px-2 py-3 text-right align-middle md:table-cell">
                    <span className="type-meta">
                      {p.lastAnalyzedAt ? formatDate(p.lastAnalyzedAt) : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
