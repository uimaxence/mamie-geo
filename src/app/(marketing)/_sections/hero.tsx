import { CornerFrame, Section } from "@/components/ui";
import { TrackedLinkButton } from "@/components/marketing/tracked-link-button";
import { HeroDataShowcase } from "./hero-data-showcase";
import { HeroLLMRotator } from "./hero-llm-rotator";

// Hero, wrappé dans <CornerFrame> pour signature print subtile.
// PR 2026-05-13 : le mot en gras dans le headline cycle entre les 5
// LLMs trackés via <HeroLLMRotator>. <HeroDataShowcase> ajoute 4 cartes
// data tiltées sous les CTAs (mini-charts + tooltips), desktop only.
// PR 2026-05-20 : pattern signature retiré (fausse bonne idée après tests),
// l'identité visuelle s'appuie sur logo + couleur + CornerFrame.
// PR 2026-06-08 : badge "Beta · Generative Engine Optimization" retiré
// (revendiquait une autorité sans preuve). À remplacer par un vrai trust
// signal quand on aura des logos clients / chiffres concrets.

export function Hero() {
  return (
    <Section pad="xl" className="relative overflow-hidden">
      <CornerFrame className="relative mx-auto max-w-3xl">
        <div className="flex flex-col items-center px-2 text-center sm:px-6">
          <h1 className="type-display">
            Sache enfin si <HeroLLMRotator /> parle de toi.
          </h1>
          <p className="type-body-lg mt-6 max-w-2xl">
            Mamie GEO mesure quotidiennement la visibilité de ta marque dans les 5 IA grand public.
            En français, hébergé en Europe.
          </p>
          {/* CTA primaire avec prix dans le bouton (pattern Linear/Vercel) :
           * anti-friction maximum, lève l'objection "combien ça coûte vraiment".
           * Garantie 14j affichée immédiatement sous les CTAs en microcopy. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <TrackedLinkButton
              href="/pricing"
              variant="primary"
              size="lg"
              trackEvent="home_cta_clicked"
              trackProperties={{ cta_label: "Démarrer — 9,99 €/mois", section: "hero", href: "/pricing" }}
            >
              Démarrer — 9,99&nbsp;€/mois
            </TrackedLinkButton>
            <TrackedLinkButton
              href="/demo"
              variant="secondary"
              size="lg"
              trackEvent="home_cta_clicked"
              trackProperties={{ cta_label: "Voir la démo", section: "hero", href: "/demo" }}
            >
              Voir la démo →
            </TrackedLinkButton>
          </div>
          <p className="type-meta mt-6">
            Garantie remboursement 14&nbsp;jours · Sans engagement · Hébergé EU
          </p>
        </div>
      </CornerFrame>

      {/* Aperçu data, 4 cartes tiltées avec mini-charts. Desktop only. */}
      <HeroDataShowcase />
    </Section>
  );
}
