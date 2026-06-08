import { BottomFade } from "@/components/ui";
import { AuditTeaser } from "./_sections/audit-teaser";
import { FAQ } from "./_sections/faq";
import { FinalCTA } from "./_sections/final-cta";
import { Hero } from "./_sections/hero";
import { HomeDemoPreview } from "./_sections/home-demo-preview";
import { HowItWorks } from "./_sections/how-it-works";
import { LLMBadges } from "./_sections/llm-badges";
import { MarketingFooter } from "./_sections/marketing-footer";
import { MarketingHeader } from "./_sections/marketing-header";
import { NEstPas } from "./_sections/nest-pas";
import { PourQui } from "./_sections/pour-qui";
import { PourquoiMaintenant } from "./_sections/pourquoi-maintenant";
import { ProofStrip } from "./_sections/proof-strip";
import { SansAvec } from "./_sections/sans-avec";
import { TesConcurrentsPasToi } from "./_sections/tes-concurrents-pas-toi";
import { TesOutils } from "./_sections/tes-outils";
import { TrustStrip } from "./_sections/trust-strip";

// Home, orchestrateur. Chaque section vit dans _sections/.
// PR 12b : BottomFade ajouté (effet d'ambiance fixed bottom).
// PR 2026-05-13 : ajout de PourquoiMaintenant (data) et TesOutils
// (features nommées), cf. doc 09 § 2026-05-13 (refresh inspiré Semrush).
// PR 2026-05-16 : ajout TesConcurrentsPasToi (démo LLM live), placée
// juste après PourquoiMaintenant (section noire) pour ne pas casser
// le rythme cards-sous-section-noire qui structure le scroll.
// PR 2026-05-16 (promo audit) : ajout AuditTeaser après
// TesConcurrentsPasToi, solution actionnable gratuite juste après
// la mise en scène du problème.

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <Hero />
      <PourquoiMaintenant />
      {/* TrustStrip placé après PourquoiMaintenant et non sous Hero :
       * sinon le `mb-[-200px]` du <HeroDataShowcase> desktop ferait
       * plonger les 4 cartes tiltées dans un fond gris (tinted) au
       * lieu de la section noire — coupe désign cassée. Ici les
       * garanties apparaissent juste après le 1ᵉʳ chapitre noir du
       * narratif et avant la démo LLM live. */}
      <TrustStrip />
      <TesConcurrentsPasToi />
      <AuditTeaser />
      <LLMBadges />
      <ProofStrip />
      <SansAvec />
      <HowItWorks />
      {/* Pattern DataFast : preview live du dashboard juste après le
       * "comment ça marche". L'utilisateur a compris le concept, on lui
       * montre le résultat avant de cliquer vers /demo. */}
      <HomeDemoPreview />
      <TesOutils />
      <PourQui />
      <NEstPas />
      <FAQ />
      <FinalCTA />
      <MarketingFooter />
      <BottomFade />
    </>
  );
}
