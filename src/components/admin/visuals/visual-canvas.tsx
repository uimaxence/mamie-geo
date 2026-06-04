"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

interface VisualCanvasProps {
  slug: string;
  width: number;
  height: number;
  children: React.ReactNode;
}

// Wrapper client qui rend le visuel à sa taille native (width × height)
// et propose un bouton de téléchargement PNG retina (pixelRatio 2).
//
// Le visuel est rendu en taille réelle dans le DOM (1080×1350 = très
// grand) mais affiché à 50 % via transform: scale dans un container
// fixe — assez petit pour tenir dans la viewport, suffisamment grand
// pour vérifier la lisibilité.
//
// html-to-image capture le node ref via toPng() en passant explicitement
// width/height pour ignorer le transform parent : on récupère bien le
// PNG en pixel-perfect à la taille native demandée.

export function VisualCanvas({ slug, width, height, children }: VisualCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!ref.current) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        width,
        height,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${slug}-${width}x${height}@2x.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }

  // Scale visuel pour rester dans la viewport. Pour un 1080×1350, on
  // affiche à ~52 % → 562×702 px → tient dans la majorité des écrans.
  const previewScale = 0.52;
  const previewW = Math.round(width * previewScale);
  const previewH = Math.round(height * previewScale);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-[color:var(--color-muted)]">
          Aperçu {previewW}×{previewH} px — export natif {width}×{height} px @2x
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="button-shape inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[color:var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Génération…" : "Télécharger PNG"}
        </button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-error)] bg-[color:var(--color-error-bg)] px-4 py-3 text-sm text-[color:var(--color-error)]">
          Échec export : {error}
        </div>
      )}

      <div
        className="overflow-auto rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
        style={{ maxHeight: "82vh" }}
      >
        <div
          style={{
            width: previewW,
            height: previewH,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
              width,
              height,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <div ref={ref} style={{ width, height }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
