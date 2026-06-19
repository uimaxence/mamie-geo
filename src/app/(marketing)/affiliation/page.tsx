import type { Metadata } from "next";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";
import { AffiliateFAQ } from "../_sections/affiliation/affiliate-faq";
import { AffiliateFinalCTA } from "../_sections/affiliation/affiliate-final-cta";
import { AffiliateHero } from "../_sections/affiliation/affiliate-hero";
import { AffiliateHow } from "../_sections/affiliation/affiliate-how";

// Page /affiliation : programme d'affiliation grand public (créateurs /
// audiences). Design inspiré de taap.it/fr/affiliate (retour Max
// 2026-06-19) en DA Mamie GEO. Modèle commission acté doc 09 § 2026-06-19 :
// 40 % à vie Solo / 25 % Starter / Pro exclus. Pas de back-office affilié
// en V0 (CTA = candidature email) ; tracking Stripe = V1 (doc 02).

export const metadata: Metadata = {
  title: "Programme d'affiliation : 40 % à vie",
  description:
    "Gagne 40 % de commission à vie sur chaque abonnement Solo Mamie GEO que tu génères. Pour les consultants SEO, créateurs et formateurs IA francophones. Validation à la main, paiement chaque mois.",
  alternates: { canonical: "/affiliation" },
  openGraph: {
    title: "Programme d'affiliation Mamie GEO : 40 % à vie",
    description:
      "Tu amènes l'audience, on fournit le produit, tu gardes 40 % de chaque abonnement Solo à vie.",
    url: "https://mamie-geo.fr/affiliation",
    type: "website",
  },
};

export default function AffiliationPage() {
  return (
    <>
      <MarketingHeader />
      <AffiliateHero />
      <AffiliateHow />
      <AffiliateFAQ />
      <AffiliateFinalCTA />
      <MarketingFooter />
    </>
  );
}
