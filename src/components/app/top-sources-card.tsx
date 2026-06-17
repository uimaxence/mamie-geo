import { Link2 } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { BrandFavicon } from "@/components/app/brand-favicon";
import type { SourceDomain } from "@/lib/sources/domain";

// Carte « Top Sources » : les domaines les plus cités comme sources par
// les IA, en barres proportionnelles + favicon + compteur. Présentation
// pure — la donnée arrive déjà agrégée par domaine (aggregateSourceDomains).
// Réutilisée sur le dashboard et l'onglet Sources des citations.

interface TopSourcesCardProps {
  domains: SourceDomain[];
  /** Titre affiché (défaut « Top Sources »). */
  title?: string;
  description?: string;
}

export function TopSourcesCard({
  domains,
  title = "Top Sources",
  description = "Domaines les plus cités comme sources par les IA",
}: TopSourcesCardProps) {
  const max = domains[0]?.citationCount ?? 1;

  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
      <div className="flex items-center gap-2">
        <Link2 size={18} strokeWidth={2} className="text-[color:var(--color-accent)]" />
        <h3 className="type-h3">{title}</h3>
      </div>
      <p className="type-meta mt-1">{description}</p>

      {domains.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={Link2}
            title="Aucune source citée pour l'instant"
            description="Dès que les IA citeront des URLs dans leurs réponses, leurs domaines apparaîtront ici."
          />
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {domains.map((d) => {
            const pct = Math.max(6, Math.round((d.citationCount / max) * 100));
            return (
              <li
                key={d.domain}
                className="relative flex items-center justify-between gap-3 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] px-3 py-2.5"
              >
                {/* Barre de fond proportionnelle au nombre de citations. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[color:var(--color-accent-faint)]"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative flex min-w-0 items-center gap-2.5">
                  <BrandFavicon domain={d.domain} name={d.domain} size={20} />
                  <span className="truncate text-sm text-[color:var(--color-ink)]">{d.domain}</span>
                </span>
                <span className="relative shrink-0 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-2.5 py-0.5 type-tabular text-sm text-[color:var(--color-ink-soft)]">
                  {d.citationCount}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
