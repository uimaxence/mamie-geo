import { BottomFade } from "@/components/ui";
import { FAQ } from "./_sections/faq";
import { Hero } from "./_sections/hero";
import { HowItWorks } from "./_sections/how-it-works";
import { LLMBadges } from "./_sections/llm-badges";
import { MarketingFooter } from "./_sections/marketing-footer";
import { MarketingHeader } from "./_sections/marketing-header";
import { NEstPas } from "./_sections/nest-pas";
import { PourQui } from "./_sections/pour-qui";
import { SansAvec } from "./_sections/sans-avec";

// Home — orchestrateur. Chaque section vit dans _sections/.
// PR 12b : BottomFade ajouté (effet d'ambiance fixed bottom).

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <Hero />
      <LLMBadges />
      <SansAvec />
      <HowItWorks />
      <PourQui />
      <NEstPas />
      <FAQ />
      <MarketingFooter />
      <BottomFade />
    </>
  );
}
