import { UpgradeBannerLink } from "./upgrade-banner-link";

// Bannière persistante affichée en haut du layout (with-nav) quand le
// plan n'est pas actif OU quand le hard-cap LLM est hit. Server
// component pour rester light (lit les props, pas de state). CTA →
// /app/settings#billing.
//
// Cas :
//   trialing : compte sans paiement → "Choisis un plan pour démarrer"
//   past_due : carte refusée → "Mets à jour ta carte"
//   expired / canceled : abonnement terminé → "Réactive ton abonnement"
//   hardcap : usage anormal détecté (priorité sur le plan)
//   solo / starter / pro / agency / enterprise : pas de bannière

interface UpgradeBannerProps {
  plan: string;
  /** Date hardCapHitAt depuis workspaces, si posé, on affiche la bannière hardcap (priorité). */
  hardCapHitAt?: Date | string | null;
}

interface BannerCopy {
  message: string;
  cta: string;
  tone: "neutral" | "warning" | "error";
  variant: string;
}

const COPY: Record<string, BannerCopy> = {
  trialing: {
    message: "Configure ton tracking en choisissant un plan.",
    cta: "Choisir un plan",
    tone: "neutral",
    variant: "trialing",
  },
  past_due: {
    message: "Paiement refusé, mets à jour ta carte sous 7 jours.",
    cta: "Mettre à jour",
    tone: "error",
    variant: "past_due",
  },
  expired: {
    message: "Ton abonnement est expiré. Réactive-le pour reprendre le tracking.",
    cta: "Réactiver",
    tone: "warning",
    variant: "expired",
  },
  canceled: {
    message: "Ton abonnement est annulé. Réactive-le pour reprendre le tracking.",
    cta: "Réactiver",
    tone: "warning",
    variant: "canceled",
  },
};

const HARDCAP_COPY: BannerCopy = {
  message:
    "Usage anormal détecté, runs suspendus. Contacte hello@mamie-geo.fr ou passe à un plan supérieur.",
  cta: "Gérer mon plan",
  tone: "error",
  variant: "hardcap",
};

const TONE_STYLE: Record<BannerCopy["tone"], string> = {
  neutral: "bg-[color:var(--color-gray-50)] text-[color:var(--color-ink)]",
  warning: "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]",
  error: "bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]",
};

export function UpgradeBanner({ plan, hardCapHitAt }: UpgradeBannerProps) {
  // Hard-cap a priorité sur le plan : un workspace actif qui dépasse
  // doit voir la bannière hard-cap, pas une bannière liée au plan.
  if (hardCapHitAt) {
    return renderBanner(HARDCAP_COPY, plan);
  }

  const copy = COPY[plan];
  if (!copy) return null;
  return renderBanner(copy, plan);
}

function renderBanner(copy: BannerCopy, currentPlan: string) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-2 text-sm ${TONE_STYLE[copy.tone]}`}
    >
      <span>{copy.message}</span>
      <UpgradeBannerLink variant={copy.variant} currentPlan={currentPlan} cta={copy.cta} />
    </div>
  );
}
