"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { capture } from "@/lib/posthog-client";

// Card "Subscribe" persistante en bas de la sidebar, juste au-dessus du
// UserMenu. Pattern Vercel/Linear/Waalaxy. S'affiche uniquement quand
// le plan a besoin d'une action (trialing sans carte, expired, canceled,
// ou trialing avec trialEndsAt < J+3 = compte à rebours fin de trial).
//
// Au clic : dispatch un CustomEvent que <PlanPickerModalTrigger> écoute
// pour ouvrir la modal. Évite de remonter du state via un Context Provider
// pour ce besoin one-shot.
//
// Variantes visuelles :
//   - "default" : gradient bleu brand, copy "Débloque toutes les features"
//   - "trial" (trial en cours, > 3j) : sobre, copy "Plus que X jours d'essai"
//   - "urgent" (trial en cours, ≤ 3j) : tonalité warning, countdown
//   - "expired" : tonalité error, copy "Réactive ton tracking"

interface Props {
  plan: string;
  trialEndsAt: string | null;
}

type CardVariant = "default" | "trial" | "urgent" | "expired" | null;

function pickVariant(plan: string, trialEndsAt: string | null, now: number): CardVariant {
  if (plan === "expired" || plan === "canceled" || plan === "past_due") return "expired";
  if (plan === "trialing") {
    if (!trialEndsAt) return "default"; // Pas encore démarré, picker à ouvrir
    const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - now) / 86_400_000);
    if (daysLeft <= 3) return "urgent";
    return "trial";
  }
  return null; // Plans actifs : pas de card
}

export function SidebarSubscribeCard({ plan, trialEndsAt }: Props) {
  // useState lazy initializer = Date.now() évalué 1 fois au mount, pas
  // pendant chaque render → conforme à eslint react-hooks/purity sans
  // payer le coût d'un useEffect + re-render.
  const [now] = useState(() => Date.now());

  const variant = pickVariant(plan, trialEndsAt, now);
  const daysLeft = trialEndsAt
    ? Math.ceil((new Date(trialEndsAt).getTime() - now) / 86_400_000)
    : null;

  if (!variant) return null;

  function handleClick() {
    capture("sidebar_subscribe_card_clicked", { plan, variant });
    window.dispatchEvent(
      new CustomEvent("mamie:open-plan-picker", { detail: { trigger: "sidebar_click" } }),
    );
  }

  // Mapping variant → couleurs + copy
  const VARIANTS: Record<
    Exclude<CardVariant, null>,
    { gradient: string; iconBg: string; title: string; subtitle: string; cta: string }
  > = {
    default: {
      gradient:
        "from-[color:var(--color-accent)]/12 to-[color:var(--color-accent)]/4",
      iconBg: "bg-[color:var(--color-accent)]",
      title: "Débloque toutes les features",
      subtitle: "5 IA · tracking quotidien · scoring",
      cta: "S'abonner",
    },
    trial: {
      gradient:
        "from-[color:var(--color-accent)]/12 to-[color:var(--color-accent)]/4",
      iconBg: "bg-[color:var(--color-accent)]",
      title: `Plus que ${daysLeft} j d'essai`,
      subtitle: "Choisis ton plan définitif",
      cta: "Voir mon plan",
    },
    urgent: {
      gradient:
        "from-[color:var(--color-warning-bg)] to-[color:var(--color-warning-bg)]/40",
      iconBg: "bg-[color:var(--color-warning)]",
      title: `Plus que ${daysLeft} j d'essai`,
      subtitle: "Active ton abonnement maintenant",
      cta: "Voir mon plan",
    },
    expired: {
      gradient:
        "from-[color:var(--color-error-bg)] to-[color:var(--color-error-bg)]/40",
      iconBg: "bg-[color:var(--color-error)]",
      title: "Tracking suspendu",
      subtitle: "Réactive ton plan en 1 clic",
      cta: "Réactiver",
    },
  };

  const v = VARIANTS[variant];

  return (
    <div className="px-3 pb-3">
      <div
        className={`rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-gradient-to-br ${v.gradient} p-3`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-white shadow-[var(--shadow-sm)] ${v.iconBg}`}
            aria-hidden
          >
            <Crown size={16} strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[color:var(--color-ink)]">
              {v.title}
            </p>
            <p className="truncate text-[11px] text-[color:var(--color-ink-soft)]">
              {v.subtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="mt-3 inline-flex w-full items-center justify-center rounded-[var(--radius-md)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition hover:bg-[color:var(--color-gray-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ink)]"
        >
          {v.cta}
        </button>
      </div>
    </div>
  );
}
