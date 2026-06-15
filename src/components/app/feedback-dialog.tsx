"use client";

import { useState, useTransition } from "react";
import { MessageCircleHeart } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { capture } from "@/lib/posthog-client";
import { submitFeedback } from "@/lib/feedback/actions";

// Widget feedback in-app : bouton discret dans la sidebar → modal. Envoie
// un email à hello@ + event PostHog (cf. submitFeedback). Pensé pour la
// phase beta : capter bugs et idées sans friction (un seul champ + catégorie).

const CATEGORIES = [
  { value: "bug", label: "Bug" },
  { value: "idée", label: "Idée" },
  { value: "autre", label: "Autre" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setCategory("bug");
    setMessage("");
    setDone(false);
    setError(null);
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      reset();
      capture("feedback_widget_opened");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitFeedback({
        category,
        message,
        pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      if (res.ok) {
        setDone(true);
        capture("feedback_submitted", { category });
      } else {
        setError(res.error === "validation" ? res.message : "Envoi impossible, réessaie.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-sm text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-gray-50)] hover:text-[color:var(--color-ink)]"
      >
        <MessageCircleHeart size={15} strokeWidth={2} />
        Donner mon avis
      </button>

      <DialogContent>
        {done ? (
          <div className="py-4 text-center">
            <DialogHeader>
              <DialogTitle>Merci&nbsp;!</DialogTitle>
              <DialogDescription>
                Ton retour est bien arrivé. On lit tout — et on répond souvent.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 sm:justify-center">
              <Button onClick={() => setOpen(false)}>Fermer</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Ton avis nous aide</DialogTitle>
              <DialogDescription>
                Un bug, une idée, une remarque&nbsp;? Dis-nous tout — surtout pendant la beta.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex flex-col gap-4">
              <SegmentedControl
                options={CATEGORIES}
                value={category}
                onValueChange={(v) => setCategory(v)}
                ariaLabel="Catégorie du feedback"
              />
              <textarea
                required
                autoFocus
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décris ce qui s'est passé, ou ce qui te ferait gagner du temps…"
                className="w-full resize-none rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-ink)] focus:outline-none"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || message.trim().length < 3}>
                {isPending ? "Envoi…" : "Envoyer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
