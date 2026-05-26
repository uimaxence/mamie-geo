"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

// Notice cookies (RGPD pré-launch 2026-05-27). En V0 le site n'utilise
// QUE des cookies strictement nécessaires (session Better Auth + CSRF).
// → Pas de consent management complet requis par la directive ePrivacy.
// → Information transparente suffisante.
//
// Stockage du choix : localStorage (pas un cookie pour éviter la
// circularité). Si dismissed = "true" → ne plus afficher.
//
// Si plus tard on ajoute PostHog ou tracker tiers : passer à un vrai
// consent management (accept/refuse + granularité). Ce composant
// reste le bon point d'entrée à étendre.

const STORAGE_KEY = "mamie-geo-cookie-notice-dismissed";

export function CookieNotice() {
  // null = pas encore lu localStorage (SSR / 1er render). Évite le flash.
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    // Hydrate depuis localStorage post-mount. Pattern standard SSR-safe :
    // 1er render = null (matche le markup serveur), puis on lit le storage
    // côté client et on déclenche un re-render. eslint over-eager pour ce
    // cas légitime.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setDismissed(stored === "true");
    } catch {
      // localStorage indisponible (mode privé) → traiter comme non-dismissed.
      setDismissed(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function handleDismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Si localStorage refuse, on cache quand même la session courante.
    }
    setDismissed(true);
  }

  if (dismissed !== false) return null;

  return (
    <div
      role="region"
      aria-label="Information cookies"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-[var(--radius-xl)] border border-[color:var(--color-border-strong)] bg-white p-4 shadow-[var(--shadow-lg)] sm:left-auto sm:right-6 sm:bottom-6 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]"
        >
          <Cookie size={16} strokeWidth={2} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[color:var(--color-ink)]">
            Cookies&nbsp;: que des indispensables.
          </p>
          <p className="type-meta mt-1.5">
            On utilise uniquement un cookie de session pour te garder connecté. Pas de tracker, pas
            de pub, pas de cookies tiers.{" "}
            <Link
              href="/legal/privacy"
              className="underline decoration-[color:var(--color-ink-soft)]/40 underline-offset-2 hover:decoration-[color:var(--color-ink)]"
            >
              En savoir plus
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--color-ink)] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[color:var(--color-gray-800)]"
          >
            Compris
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-gray-100)] hover:text-[color:var(--color-ink)]"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
