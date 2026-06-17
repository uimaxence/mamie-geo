"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";

interface DownloadableChartProps {
  /** Basename of the PNG file. The component adds `-YYYY-MM-DD.png`. */
  filename: string;
  /** Background to render behind the chart in the PNG. Defaults to white. */
  backgroundColor?: string;
  children: React.ReactNode;
  /** Optional className for the inner wrapper (passes through to the captured node). */
  className?: string;
  /**
   * Contrôles (filtres, SegmentedControl…) rendus dans la barre d'outils
   * du chart, à gauche du bouton PNG dont ils sont séparés par un divider
   * subtil. Sortis du capture PNG (toolbar = sibling de la ref). */
  toolbar?: React.ReactNode;
}

// Wrapper client réutilisable : rend une barre d'outils au-dessus du chart
// avec un bouton « Télécharger PNG » aligné à droite (et, optionnellement,
// les filtres via `toolbar`), puis expose le contenu via une ref que
// html-to-image capture en sortie @2x. Offre l'export visuel aux clients
// qui veulent embed un screenshot dans un rapport (cf. doc 02 § V0+
// save-as-PNG charts).
//
// 2026-06-17 : le bouton était `absolute` par-dessus le coin du chart, ce
// qui le faisait chevaucher le contenu. Déplacé dans une barre d'outils
// dédiée au-dessus du graphe, groupé avec les filtres.
//
// La logique de capture suit le pattern déjà éprouvé dans
// src/components/admin/visuals/visual-canvas.tsx, simplifié (pas de
// scaling preview, ici le chart est rendu à sa taille naturelle).

export function DownloadableChart({
  filename,
  backgroundColor = "#ffffff",
  children,
  className,
  toolbar,
}: DownloadableChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor,
      });
      const link = document.createElement("a");
      const dateSuffix = new Date().toISOString().slice(0, 10);
      link.download = `${filename}-${dateSuffix}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Barre d'outils du chart : filtres optionnels (toolbar) + bouton PNG,
       * séparés par un divider vertical subtil. Sortie du capture PNG. */}
      <div className="mb-2 flex items-center justify-end gap-3">
        {toolbar}
        {toolbar && (
          <span aria-hidden className="h-5 w-px shrink-0 bg-[color:var(--color-border)]" />
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          aria-label="Télécharger en PNG"
          title="Télécharger en PNG"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-gray-50)] hover:text-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={12} strokeWidth={2.2} />
          {busy ? "Export…" : "PNG"}
        </button>
      </div>
      <div ref={ref} className={className} style={{ backgroundColor }}>
        {children}
      </div>
    </div>
  );
}
