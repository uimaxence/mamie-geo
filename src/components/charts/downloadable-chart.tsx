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
}

// Wrapper client réutilisable : injecte un petit bouton « Télécharger PNG »
// en haut à droite et expose le contenu via une ref que html-to-image
// capture en sortie @2x. Posté ailleurs dans le dashboard pour offrir
// l'export visuel aux clients qui veulent embed un screenshot dans un
// rapport (cf. doc 02 § V0+ save-as-PNG charts).
//
// La logique de capture suit le pattern déjà éprouvé dans
// src/components/admin/visuals/visual-canvas.tsx, simplifié (pas de
// scaling preview, ici le chart est rendu à sa taille naturelle).

export function DownloadableChart({
  filename,
  backgroundColor = "#ffffff",
  children,
  className,
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
    <div className="relative">
      {/* Bouton PNG positionné À L'INTÉRIEUR du chart (top-right). Avant 2026-06-08
       * il était en `-top-10` (40 px au-dessus du container), ce qui le faisait
       * chevaucher le <SegmentedControl> du header de section. Maintenant il flotte
       * dans le coin top-right du chart, semi-transparent au repos pour ne pas
       * polluer le visuel, opaque au hover. */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        aria-label="Télécharger en PNG"
        title="Télécharger en PNG"
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-white/85 px-3 py-1.5 text-xs font-medium text-[color:var(--color-ink-soft)] shadow-[var(--shadow-sm)] backdrop-blur-sm transition hover:bg-white hover:text-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={12} strokeWidth={2.2} />
        {busy ? "Export…" : "PNG"}
      </button>
      <div ref={ref} className={className} style={{ backgroundColor }}>
        {children}
      </div>
    </div>
  );
}
