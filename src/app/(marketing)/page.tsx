import { Hero } from "./_sections/hero";
import { HowItWorks } from "./_sections/how-it-works";
import { LLMBadges } from "./_sections/llm-badges";
import { MarketingFooter } from "./_sections/marketing-footer";
import { MarketingHeader } from "./_sections/marketing-header";
import { PourQui } from "./_sections/pour-qui";
import { SansAvec } from "./_sections/sans-avec";

// Home — orchestrateur des sections. Chaque section vit dans
// _sections/ pour rester < 100 LOC et focused.
//
// Ordre travaillé en PR 8a :
//   1. Hero (CornerFrame + badge Beta + mix-weight headline)
//   2. LLMs trackés (badges pastel signature DA)
//   3. Sans / Avec Mamie GEO (différentiation produit)
//   4. Comment ça marche (3 étapes)
//   5. Pour qui c'est (3 personas)
//
// Encore à venir (PR 8b) : "Mamie GEO n'est pas", "Hey c'est Max",
// FAQ, footer enrichi.

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <Hero />
      <LLMBadges />
      <SansAvec />
      <HowItWorks />
      <PourQui />
      <MarketingFooter />
    </>
  );
}
