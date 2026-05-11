"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { triggerRunNow, type TriggerResult } from "./actions";

// Bouton "Lancer un run" — server action + feedback inline.
// Polish design : utilise Button du design system, message stylé.

export function TriggerRunForm() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );

  function handleClick() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result: TriggerResult = await triggerRunNow();
        setFeedback({
          tone: "success",
          message: `${result.jobsEnqueued} job(s) en attente · ${result.runsCreated} run(s) créé(s) · ${result.skipped} skip (idempotent).`,
        });
      } catch (error) {
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" variant="primary" onClick={handleClick} disabled={pending}>
        {pending ? "Enqueue en cours…" : "Lancer un run →"}
      </Button>
      {feedback && (
        <p
          className={
            feedback.tone === "success"
              ? "type-meta text-[color:var(--color-success)]"
              : "type-meta text-[color:var(--color-error)]"
          }
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
