"use client";

import { Check } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";

// Affichée juste après que l'utilisateur a FERMÉ le PlanPicker (croix) sans
// choisir de plan. Sans ça, il se retrouve dans l'app avec un badge
// "trialing" sans comprendre ce que ça veut dire (demande 2026-06-16) : on
// lui dit explicitement qu'il est en essai gratuit 14 jours, que le tracking
// tourne déjà et qu'il n'est pas facturé.

export function TrialExplainerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[color:var(--color-success)]/10">
            <Check size={26} strokeWidth={2.4} className="text-[color:var(--color-success)]" />
          </span>
          <DialogTitle className="mt-4 type-h2">Ton essai gratuit a démarré</DialogTitle>
          <DialogDescription className="mt-2 max-w-sm">
            Pas besoin de choisir un plan maintenant : tu es en{" "}
            <strong className="text-[color:var(--color-ink)]">
              essai gratuit de 14 jours sur le plan Solo
            </strong>
            , sans carte.
          </DialogDescription>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {[
            "Ton tracking sur les 5 IA tourne déjà.",
            "Tu n'es pas facturé pendant l'essai.",
            "Choisis un plan avant la fin pour continuer (sinon l'accès se met en pause).",
          ].map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 text-sm text-[color:var(--color-ink-soft)]"
            >
              <Check
                size={14}
                strokeWidth={3}
                className="mt-0.5 shrink-0 text-[color:var(--color-success)]"
              />
              {line}
            </li>
          ))}
        </ul>

        <Button variant="primary" size="lg" className="mt-6 w-full" onClick={onClose}>
          C&apos;est parti
        </Button>
      </DialogContent>
    </Dialog>
  );
}
