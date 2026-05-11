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
// PR 11a : section HeyMax retirée (« on s'en fou pour l'instant »).
// Section founder pourra revenir en PR ultérieure si traction commerciale
// le justifie (ex : « About » dédié).

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
    </>
  );
}
