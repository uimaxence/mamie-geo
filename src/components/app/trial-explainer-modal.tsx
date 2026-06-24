"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";

// Affichée juste après que l'utilisateur a FERMÉ le PlanPicker (croix) sans
// choisir de plan. Sans ça, il se retrouve dans l'app avec un badge
// "trialing" sans comprendre ce que ça veut dire (demande 2026-06-16) : on
// lui dit explicitement qu'il est en essai gratuit, que le tracking tourne
// déjà et qu'il n'est pas facturé. Depuis 2026-06-23 (demande Max) on affiche
// le temps RESTANT réel (calculé sur trialEndsAt) + la date de fin, au lieu
// du "14 jours" figé qui ne disait pas quand l'essai se termine.

function describeRemaining(trialEndsAt: string | null, now: number): { left: string; endDate: string } | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt).getTime();
  const msLeft = end - now;
  if (msLeft <= 0) return { left: "Ton essai se termine aujourd'hui", endDate: formatEndDate(end) };

  const daysLeft = Math.floor(msLeft / 86_400_000);
  const hoursLeft = Math.floor((msLeft % 86_400_000) / 3_600_000);

  let left: string;
  if (daysLeft >= 1) {
    left = `Il te reste ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`;
    if (hoursLeft > 0) left += ` et ${hoursLeft} h`;
  } else {
    const totalHours = Math.max(1, Math.ceil(msLeft / 3_600_000));
    left = `Il te reste ${totalHours} h`;
  }
  return { left, endDate: formatEndDate(end) };
}

function formatEndDate(end: number): string {
  return new Date(end).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function TrialExplainerModal({
  open,
  onClose,
  trialEndsAt,
}: {
  open: boolean;
  onClose: () => void;
  trialEndsAt: string | null;
}) {
  // `Date.now()` est impur : interdit en render (react-hooks/purity). On passe
  // la référence `Date.now` comme initialiseur de useState → React l'appelle
  // une fois au mount, hors du corps de render. La modale est éphémère (ouverte
  // une fois par session), pas besoin d'un tick.
  const [now] = useState<number>(Date.now);
  const remaining = describeRemaining(trialEndsAt, now);

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
              essai gratuit sur le plan Solo
            </strong>
            , sans carte.
          </DialogDescription>

          {remaining && (
            <div className="mt-5 w-full rounded-lg bg-[color:var(--color-surface)] px-4 py-3">
              <p className="type-h3 text-[color:var(--color-ink)]">{remaining.left}</p>
              <p className="mt-0.5 text-sm text-[color:var(--color-ink-soft)]">
                Ton essai se termine le {remaining.endDate}.
              </p>
            </div>
          )}
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
