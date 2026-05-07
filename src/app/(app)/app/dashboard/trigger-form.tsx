"use client";

import { useState, useTransition } from "react";
import { triggerRunNow, type TriggerResult } from "./actions";

// Composant client minimaliste pour le bouton "Lancer un run". Le polish
// shadcn arrive en Phase B (PR 8). Ici on veut juste valider que la
// chaîne UI → server action → enqueue → revalidatePath fonctionne.

export function TriggerRunForm() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleClick() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result: TriggerResult = await triggerRunNow();
        setFeedback(
          `${result.jobsEnqueued} job(s) enqueué(s), ${result.runsCreated} run(s) créé(s), ${result.skipped} skip (idempotent).`,
        );
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Erreur inconnue");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-md border border-[color:var(--color-warm-gray)] bg-white px-4 py-2 text-sm font-medium hover:bg-[color:var(--color-cream)] disabled:opacity-50"
      >
        {pending ? "Enqueue en cours…" : "Lancer un run maintenant"}
      </button>
      {feedback && <p className="mt-2 text-sm text-[color:var(--color-warm-gray)]">{feedback}</p>}
    </div>
  );
}
