import { Plus } from "lucide-react";
import { Section } from "@/components/ui";

// FAQ dédiée pricing — questions spécifiques au paiement / abonnement /
// changements de plan. cf. doc 10 § Pricing.

const QUESTIONS = [
  {
    q: "Quelle différence entre mensuel et annuel ?",
    a: "Mensuel : prélèvement chaque mois, annulation à tout moment. Annuel : prélèvement en 1 fois, économie 20 %, annulation possible mais sans remboursement prorata (transparence : c'est la seule contrainte).",
  },
  {
    q: "Je peux changer de plan en cours de route ?",
    a: "Oui, à tout moment. Upgrade immédiat avec prorata au jour près sur la période en cours. Downgrade appliqué à la fin de ta période courante.",
  },
  {
    q: "Quels moyens de paiement acceptés ?",
    a: "Cartes bancaires (Visa, Mastercard, Amex) via Stripe. Pour le plan Enterprise, virement SEPA et facturation annuelle.",
  },
  {
    q: "Garantie satisfait ou remboursé ?",
    a: "30 jours sans question. Un email à hello@mamie-geo.fr, remboursement intégral sous 5 jours ouvrés.",
  },
  {
    q: "TVA et facturation B2B ?",
    a: "TVA appliquée automatiquement selon ton pays (Stripe Tax). Si tu donnes ton numéro de TVA intra-communautaire valide, on applique l'autoliquidation.",
  },
  {
    q: "Le plan Enterprise est-il vraiment sans limite ?",
    a: "Limites « techniques » naturelles (on a discuté ça avec ton account manager : volume de marques, fréquence, intégrations SSO). Pas de paywall caché entre fonctionnalités.",
  },
  {
    q: "Le Chat de Mistral est-il inclus dans le plan Starter ?",
    a: "Oui, et dans tous les plans sans exception. C'est notre engagement n°1. Pas de surcoût, pas de paywall séparé.",
  },
  {
    q: "Que se passe-t-il après les 14 jours d'essai ?",
    a: "Si tu n'as pas saisi ta carte bancaire, l'accès est suspendu sans charge. Si tu as choisi un plan, le prélèvement démarre au jour 15.",
  },
];

export function PricingFAQ() {
  return (
    <Section pad="xl">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">FAQ Pricing</span>
        <h2 className="type-h1 mt-3">Avant de sortir la carte bleue.</h2>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        {QUESTIONS.map((item, idx) => (
          <details
            key={item.q}
            className={`group py-5 ${idx > 0 ? "border-t border-[color:var(--color-border)]" : ""}`}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <span className="text-base font-medium text-[color:var(--color-ink)]">{item.q}</span>
              <span className="flex shrink-0 size-7 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink-soft)] transition-transform group-open:rotate-45">
                <Plus size={14} strokeWidth={2.4} />
              </span>
            </summary>
            <p className="type-body mt-3 text-sm max-w-prose">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
