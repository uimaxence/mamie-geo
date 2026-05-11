import type { Metadata } from "next";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";
import { PricingComparison } from "../_sections/pricing/pricing-comparison";
import { PricingFAQ } from "../_sections/pricing/pricing-faq";
import { PricingPlans } from "../_sections/pricing/pricing-plans";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "3 plans à partir de 49 €/mois pour tracker la visibilité de ta marque dans ChatGPT, Claude, Perplexity, Gemini et Le Chat. 14 jours d'essai sans carte bancaire.",
};

// Page /pricing — assemble PricingPlans (toggle + 4 cards) +
// PricingComparison (tableau détaillé) + PricingFAQ (8 questions
// dédiées billing).

export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <PricingPlans />
      <PricingComparison />
      <PricingFAQ />
      <MarketingFooter />
    </>
  );
}
