"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { TriggerRunForm } from "./trigger-form";

// Barre d'info au-dessus du dashboard : dit EXPLICITEMENT quand le
// prochain run automatique aura lieu (compte à rebours live) et offre le
// bouton « Lancer maintenant » pour ne pas attendre (demande 2026-06-16).
//
// La date cible est calculée serveur (nextScheduledRunAt) et passée en
// ISO ; le compte à rebours est calculé client (Date.now) après le mount
// pour éviter un mismatch d'hydratation.

export function NextRunBar({
  nextRunISO,
  cadence,
}: {
  nextRunISO: string;
  cadence: "daily" | "weekly";
}) {
  const target = new Date(nextRunISO);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Init du compteur avec l'horloge client après le mount (évite un
    // mismatch d'hydratation sur Date.now côté serveur).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const dateText = target.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const countdown = now === null ? null : formatCountdown(target.getTime() - now);
  const cadenceText =
    cadence === "weekly" ? "Tracking hebdomadaire (chaque lundi)" : "Tracking quotidien";

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-gray-50)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white">
          <Clock size={16} className="text-[color:var(--color-accent)]" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-medium text-[color:var(--color-ink)]">
            Prochain run automatique{countdown ? ` ${countdown}` : ""}
          </p>
          <p className="type-meta mt-0.5">
            {cadenceText} · {dateText} à 06:00 UTC · sur toutes les IA suivies
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <TriggerRunForm />
      </div>
    </div>
  );
}

/** « dans 3 j 4 h » / « dans 4 h 12 min » / « dans 8 min » / « imminent ». */
function formatCountdown(ms: number): string {
  if (ms <= 0) return "imminent";
  const totalMin = Math.floor(ms / 60_000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `dans ${days} j ${hours} h`;
  if (hours > 0) return `dans ${hours} h ${mins} min`;
  return `dans ${mins} min`;
}
