"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { capture } from "@/lib/posthog-client";

// Coachmark d'activation ancrée à l'onglet « Prompts » de la sidebar. Tant
// qu'aucun prompt n'est configuré, le tracking ne démarre pas : on pointe
// l'onglet « en gros » avec une bulle sombre + flèche (demande 2026-06-16,
// préférée à la modale centrale).
//
// Positionnement : `fixed` calculé depuis la rect de l'ancre. La nav a
// `overflow-y-auto` qui clipperait un popover `absolute` ; un élément
// `fixed` est positionné par rapport au viewport et échappe au clip.

export function PromptsCoachmark({
  anchor,
  onDismiss,
}: {
  anchor: HTMLElement | null;
  onDismiss: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Mesure de l'ancre + recalage sur resize/scroll (la sidebar est sticky,
  // donc en pratique la position bouge peu — on couvre quand même les cas).
  useEffect(() => {
    if (!anchor) return;
    function measure() {
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      setPos({ top: r.top + r.height / 2, left: r.right + 14 });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchor]);

  useEffect(() => {
    if (anchor) capture("prompts_coachmark_shown");
  }, [anchor]);

  if (!pos) return null;

  return (
    <div
      role="dialog"
      aria-label="Configure tes prompts"
      style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
      className="fixed z-50 w-72 rounded-[var(--radius-lg)] bg-[color:var(--color-ink)] p-5 text-white shadow-xl"
    >
      {/* Flèche pointant vers l'onglet Prompts (à gauche). */}
      <span
        aria-hidden
        className="absolute -left-1.5 top-1/2 size-3 -translate-y-1/2 rotate-45 rounded-[2px] bg-[color:var(--color-ink)]"
      />

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer"
        className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-[var(--radius-sm)] text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <X size={14} />
      </button>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-accent)]">
        Commence ici
      </p>
      <p className="mt-1.5 text-sm font-semibold leading-snug">Configure tes prompts</p>
      <p className="mt-2 text-[13px] leading-relaxed text-white/70">
        Sans prompts, ton tracking ne démarre pas. Ça prend 2 minutes — on peut même te les suggérer
        à partir de ton site.
      </p>

      <Link
        href="/app/prompts"
        onClick={() => capture("prompts_coachmark_clicked")}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-ink)] no-underline transition hover:bg-white/90"
      >
        Configurer mes prompts <ArrowRight size={15} />
      </Link>
    </div>
  );
}
