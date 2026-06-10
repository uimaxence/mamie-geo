import type { Metadata } from "next";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";
import { PricingComparison } from "../_sections/pricing/pricing-comparison";
import { PricingFAQ } from "../_sections/pricing/pricing-faq";
import { PricingPlans } from "../_sections/pricing/pricing-plans";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "3 plans à partir de 9,99 €/mois pour tracker la visibilité de ta marque dans ChatGPT, Claude, Perplexity, Gemini et Le Chat. Garantie remboursement 14 jours.",
  alternates: { canonical: "/pricing" },
};

// Page /pricing, assemble PricingPlans (toggle + 3 cards Solo/Starter/Pro) +
// PricingComparison (tableau détaillé) + PricingFAQ (questions dédiées billing).
// Agency / Enterprise sont sur devis (mailto hello@mamie-geo.fr).

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
