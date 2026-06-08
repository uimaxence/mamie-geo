"use client";

import { useState, useTransition } from "react";
import { Pause, Play } from "lucide-react";
import { pauseBrand, resumeBrand } from "@/lib/brands/actions";

// V0+ : toggle pause/resume sur la brand active de /app/settings.
// Quand `pausedAt` est non null, la brand est skip dans le scheduler
// (cf. lib/scheduler/schedule-runs.ts). Resume = SET NULL → reprend au
// prochain tick cron quotidien.
//
// UX : pas de modal de confirmation pour la mise en pause (action
// réversible instantanément). Confirm sur reprise du fait que ça va
// consommer du quota au prochain cron.

interface Props {
  brandId: string;
  initialPausedAt: Date | null;
}

export function BrandPauseToggle({ brandId, initialPausedAt }: Props) {
  const [pausedAt, setPausedAt] = useState<Date | null>(initialPausedAt);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPaused = pausedAt !== null;

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = isPaused ? await resumeBrand(brandId) : await pauseBrand(brandId);
      if (result.ok) {
        setPausedAt(result.pausedAt);
      } else {
        setError(
          result.error === "unauthorized"
            ? "Tu n'as pas les droits pour cette action."
            : "Marque introuvable.",
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          className={
            isPaused
              ? "inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-ink)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              : "inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-gray-50)] disabled:opacity-50"
          }
        >
          {isPaused ? (
            <>
              <Play className="size-4" aria-hidden /> Reprendre le tracking
            </>
          ) : (
            <>
              <Pause className="size-4" aria-hidden /> Mettre en pause
            </>
          )}
        </button>
        {isPaused && (
          <span className="text-xs text-[color:var(--color-ink-soft)]">
            En pause depuis le {formatDate(pausedAt)}
          </span>
        )}
      </div>
      <p className="text-xs text-[color:var(--color-ink-soft)]">
        {isPaused
          ? "Aucun run n'est planifié tant que la marque est en pause. Tes prompts, concurrents et historique sont conservés."
          : "Mettre la marque en pause stoppe les runs planifiés sans rien supprimer. Tu peux reprendre à tout moment."}
      </p>
      {error && <p className="text-xs text-[color:var(--color-error)]">{error}</p>}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
