"use client";

import { useEffect, useState } from "react";
import { LLM_KEYS_ORDER, LLMPill, type LLMKey } from "@/components/marketing/llm-pill";

// Rotateur LLM pour le headline hero, pattern slot-machine.
//
// Deux pastilles co-existent pendant la transition :
//   - la sortante glisse vers le haut (`slide-up-out` 500 ms)
//   - la entrante arrive depuis le bas (`slide-up-in` 500 ms)
//
// Toutes les pastilles ont la même largeur (= largeur de la plus longue
// = « Perplexity »), réservée par un spacer invisible. Pas de jump de
// layout entre rotations.
//
// `prefers-reduced-motion` respecté : si l'utilisateur l'a activé,
// on fige sur la 1ʳᵉ pastille (ChatGPT) sans rotation.
// Pause au hover/focus pour laisser lire.

const ROTATION_INTERVAL_MS = 2400;
const ANIMATION_DURATION_MS = 500;

export function HeroLLMRotator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => {
        setPreviousIndex(prev);
        // Dégagement de la pastille sortante du DOM après son animation
        window.setTimeout(() => setPreviousIndex(null), ANIMATION_DURATION_MS + 50);
        return (prev + 1) % LLM_KEYS_ORDER.length;
      });
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [paused]);

  const currentLlm = LLM_KEYS_ORDER[currentIndex] as LLMKey;

  return (
    <span
      role="text"
      aria-live="polite"
      aria-label={currentLlm}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative inline-flex items-center align-middle overflow-hidden rounded-[var(--radius-pill)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)] focus-visible:ring-offset-4"
      title="Survole pour mettre en pause"
    >
      {/* Spacer : réserve la largeur de la plus longue pastille. */}
      <span className="invisible select-none" aria-hidden>
        <LLMPill llm="perplexity" size="lg" rotate={false} />
      </span>

      {/* Pastille sortante (sortante → haut) */}
      {previousIndex !== null && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 inline-flex items-center justify-center"
          style={{ animation: `slide-up-out ${ANIMATION_DURATION_MS}ms ease-out forwards` }}
        >
          <LLMPill llm={LLM_KEYS_ORDER[previousIndex] as LLMKey} size="lg" rotate={false} />
        </span>
      )}

      {/* Pastille entrante (arrive du bas → place) */}
      <span
        key={currentLlm}
        aria-hidden
        className="pointer-events-none absolute inset-0 inline-flex items-center justify-center"
        style={{ animation: `slide-up-in ${ANIMATION_DURATION_MS}ms ease-out forwards` }}
      >
        <LLMPill llm={currentLlm} size="lg" rotate={false} />
      </span>
    </span>
  );
}
