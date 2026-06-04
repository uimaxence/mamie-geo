import Link from "next/link";
import { VISUALS } from "@/lib/admin/visuals/registry";

// Index admin visuels — liste tous les visuels marketing produits dans
// ce repo. Chaque carte mène à la page détail où le visuel est rendu
// à sa taille native + bouton téléchargement PNG.

export const dynamic = "force-dynamic";

export default function VisualsIndexPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="type-h1">Visuels marketing</h1>
        <p className="type-body max-w-2xl">
          Tableaux comparatifs, mockups stats, OG images. Chaque visuel est
          rendu à sa taille native et téléchargeable en PNG retina (×2).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {VISUALS.map((visual) => (
          <Link
            key={visual.slug}
            href={`/app/admin/visuals/${visual.slug}`}
            className="card-hover-warm flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="type-eyebrow">{visual.format.label}</span>
              <span className="font-mono text-xs text-[color:var(--color-muted)] tabular-nums">
                {visual.format.width}×{visual.format.height}
              </span>
            </div>
            <h2 className="text-lg font-semibold leading-tight text-[color:var(--color-ink)]">
              {visual.title}
            </h2>
            <p className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
              {visual.description}
            </p>
            {visual.postedOn && (
              <div className="mt-auto pt-2 text-xs text-[color:var(--color-muted)]">
                Pour publication du {visual.postedOn}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
