import { BottomFade } from "@/components/ui";
import { FAQ } from "./_sections/faq";
import { Hero } from "./_sections/hero";
import { HowItWorks } from "./_sections/how-it-works";
import { LLMBadges } from "./_sections/llm-badges";
import { MarketingFooter } from "./_sections/marketing-footer";
import { MarketingHeader } from "./_sections/marketing-header";
import { NEstPas } from "./_sections/nest-pas";
import { PourQui } from "./_sections/pour-qui";
import { PourquoiMaintenant } from "./_sections/pourquoi-maintenant";
import { SansAvec } from "./_sections/sans-avec";
import { TesConcurrentsPasToi } from "./_sections/tes-concurrents-pas-toi";
import { TesOutils } from "./_sections/tes-outils";

// Home — orchestrateur. Chaque section vit dans _sections/.
// PR 12b : BottomFade ajouté (effet d'ambiance fixed bottom).
// PR 2026-05-13 : ajout de PourquoiMaintenant (data) et TesOutils
// (features nommées) — cf. doc 09 § 2026-05-13 (refresh inspiré Semrush).
// PR 2026-05-16 : ajout TesConcurrentsPasToi (démo LLM live) après le
// hero pour cogner sur le problème dès le scroll initial — cf. design
// refs Kree8.

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <Hero />
      <TesConcurrentsPasToi />
      <PourquoiMaintenant />
      <LLMBadges />
      <SansAvec />
      <HowItWorks />
      <TesOutils />
      <PourQui />
      <NEstPas />
      <FAQ />
      <MarketingFooter />
      <BottomFade />
    </>
  );
}
