import { LinkButton, PatternBlock, Section } from "@/components/ui";
import { MockupAudit } from "./mockups/mockup-audit";

// Promo audit technique sur la home, PR 2026-05-16 (cf. doc 09).
// Logique : on tient un lead magnet à coût marginal 0 € (pas d'appel
// LLM), donc on l'expose comme « première action concrète » avant de
// parler de tracking quotidien. Placé après <TesConcurrentsPasToi />
// (le problème : les IA citent les concurrents pas toi) → solution
// actionnable immédiate gratuite.
//
// PR 2026-05-18 : ambient blob terracotta remplacé par le pattern
// signature bleu primary (bottom-left). Cohérence avec la nouvelle
// signature graphique en remplacement progressif du terracotta.

export function AuditTeaser() {
  return (
    <Section pad="xl" id="audit-teaser" className="relative overflow-hidden">
      <PatternBlock corner="bottom-left" tone="primary-soft" size="lg" />

      <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Colonne gauche, copy + CTA */}
        <div>
          <span className="type-eyebrow">Première action concrète</span>
          <h2 className="type-h1 mt-3">
            Avant d&apos;apparaître dans les IA,
            <br className="hidden sm:inline" /> ton site doit envoyer les bons signaux.
          </h2>
          <p className="type-body-lg mt-5 text-[color:var(--color-ink-soft)]">
            FAQPage JSON-LD, llms.txt, schema Article, E-E-A-T… 30+ checks que les LLM regardent en
            priorité avant de te citer. Sans IA, sans abonnement, sans inscription.
          </p>

          <div className="mt-8">
            <LinkButton href="/outils/audit-technique" variant="ai" size="lg">
              Auditer mon site →
            </LinkButton>
          </div>

          <p className="type-meta mt-5">
            30+ checks · 10 secondes · 0 € forever · sans inscription
          </p>
        </div>

        {/* Colonne droite, mockup rapport stylisé */}
        <div className="relative">
          <MockupAudit />
        </div>
      </div>
    </Section>
  );
}
