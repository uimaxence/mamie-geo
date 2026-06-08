"use client";

import { Plus } from "lucide-react";
import { Section } from "@/components/ui";
import { capture } from "@/lib/posthog-client";

// FAQ dédiée pricing, questions spécifiques au paiement / abonnement /
// changements de plan. cf. doc 10 § Pricing.

const QUESTIONS = [
  {
    q: "Y a-t-il un essai gratuit ?",
    a: "Pas d'essai automatique. Tu peux tester gratuitement notre outil one-shot sur /outils/test-visibilite-ia (un audit complet sans inscription). Si tu t'abonnes ensuite et que Mamie GEO ne te convient pas, remboursement intégral sous 14 jours sur simple demande à hello@mamie-geo.fr.",
  },
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
    a: "Cartes bancaires (Visa, Mastercard, Amex) via Stripe. Pour les besoins agence ou enterprise, on accepte aussi le virement SEPA, écris-nous.",
  },
  {
    q: "Garantie remboursement 14 jours, comment ça marche ?",
    a: "Si tu n'es pas satisfait dans les 14 jours suivant ta souscription, envoie un mail à hello@mamie-geo.fr. Remboursement intégral sous 5 jours ouvrés, pas de questions.",
  },
  {
    q: "TVA et facturation B2B ?",
    a: "TVA appliquée automatiquement selon ton pays (Stripe Tax). Si tu donnes ton numéro de TVA intra-communautaire valide, on applique l'autoliquidation.",
  },
  {
    q: "Pourquoi le plan Solo a-t-il une cadence hebdo ?",
    a: "Solo (9,99 €) lance 1 run le lundi matin sur les 5 IA. Plus de cadence = plus de données = il faut passer sur Starter ou Pro qui tournent tous les jours. C'est la limite qui nous permet de garder Solo aussi accessible.",
  },
  {
    q: "Le Chat de Mistral est-il inclus dès Solo ?",
    a: "Oui, dans tous les plans sans exception. C'est notre engagement n°1. Pas de surcoût, pas de paywall séparé.",
  },
  {
    q: "Besoin de volumes ou d'options agence ?",
    a: "Écris-nous à hello@mamie-geo.fr, on construit un plan sur-mesure (marques illimitées, rapports en marque blanche, sièges, SSO, etc.).",
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
            onToggle={(event) => {
              if ((event.currentTarget as HTMLDetailsElement).open) {
                capture("pricing_faq_expanded", { question_id: idx, question: item.q });
              }
            }}
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
