import { LinkButton } from "@/components/ui";
import type { BlogCta } from "@/lib/blog/schemas";

// CTA produit injecté automatiquement en fin de chaque article. Le
// frontmatter `cta:` détermine quelle variante afficher — pas de logique
// par-catégorie ni par-tag pour rester simple. L'auteur choisit.
//
// 4 variantes :
//   solo          → "Commencer avec Solo 9,99 €/mois" + accent terracotta
//   starter       → "Commencer avec Starter 49 €/mois"
//   pro           → "Découvrir Pro"
//   audit-gratuit → "Audit gratuit" + variant ai (gradient terracotta→purple→blue)

interface CTAConfig {
  headline: string;
  body: string;
  href: string;
  buttonLabel: string;
  buttonVariant: "primary" | "ai";
}

const CTA_CONFIG: Record<BlogCta, CTAConfig> = {
  solo: {
    headline: "Mesure ta visibilité IA dès aujourd'hui.",
    body: "5 prompts trackés, 3 concurrents, tous les LLMs, 1 bilan chaque lundi pour 9,99 €/mois. Garantie remboursement 14 jours.",
    href: "/pricing",
    buttonLabel: "Voir les plans →",
    buttonVariant: "primary",
  },
  starter: {
    headline: "Tracking quotidien dès 49 €/mois.",
    body: "25 prompts, 5 concurrents, refresh chaque matin sur ChatGPT, Claude, Perplexity, Gemini et Le Chat. Sans engagement, garantie 14 jours.",
    href: "/pricing",
    buttonLabel: "Voir les plans →",
    buttonVariant: "primary",
  },
  pro: {
    headline: "Pour les équipes marketing qui pilotent la visibilité IA en CODIR.",
    body: "100 prompts, 10 concurrents, scoring premium, alertes, API. À partir de 149 €/mois.",
    href: "/pricing",
    buttonLabel: "Voir le plan Pro →",
    buttonVariant: "primary",
  },
  "audit-gratuit": {
    headline: "Reçois un audit gratuit de ta visibilité IA.",
    body: "5 prompts critiques de ton secteur, testés sur les 5 IA grand public, comparatif avec 3 concurrents. Rapport personnalisé sous 24 h ouvrées.",
    href: "/outils/test-visibilite-ia",
    buttonLabel: "Audit IA gratuit",
    buttonVariant: "ai",
  },
};

export function ArticleCTA({ cta }: { cta: BlogCta }) {
  const config = CTA_CONFIG[cta];
  return (
    <aside className="not-prose mt-16 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-8 shadow-[var(--shadow-sm)]">
      <h3 className="type-h3">{config.headline}</h3>
      <p className="type-body mt-3 max-w-prose text-sm">{config.body}</p>
      <div className="mt-6">
        <LinkButton href={config.href} variant={config.buttonVariant} size="lg">
          {config.buttonLabel}
        </LinkButton>
      </div>
    </aside>
  );
}
