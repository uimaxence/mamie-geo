import { FAQ } from "./_sections/faq";
import { Hero } from "./_sections/hero";
import { HeyMax } from "./_sections/hey-max";
import { HowItWorks } from "./_sections/how-it-works";
import { LLMBadges } from "./_sections/llm-badges";
import { MarketingFooter } from "./_sections/marketing-footer";
import { MarketingHeader } from "./_sections/marketing-header";
import { NEstPas } from "./_sections/nest-pas";
import { PourQui } from "./_sections/pour-qui";
import { SansAvec } from "./_sections/sans-avec";

// Home — orchestrateur. Chaque section vit dans _sections/.
// Ordre travaillé en PR 8a + 8b selon doc 10 § Composants obligatoires.

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
      <HeyMax />
      <FAQ />
      <MarketingFooter />
    </>
  );
}
