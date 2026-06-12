import type { Metadata } from "next";
import { Badge, Section } from "@/components/ui";
import { CalContactEmbed } from "@/components/marketing/cal-contact-embed";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";

export const metadata: Metadata = {
  title: "Réserver un appel — accompagnement SEO + GEO",
  description:
    "Réserve un appel découverte avec Max, fondateur de Mamie GEO : accompagnement personnel SEO + GEO, de l'audit à l'implémentation, jusqu'à ce que les IA citent ta marque.",
  alternates: { canonical: "/contact" },
};

// Page contact de l'offre accompagnement (cf. pricing-done-for-you).
// Un seul objectif : réserver l'appel découverte dans le Cal inline.

export default function ContactPage() {
  return (
    <>
      <MarketingHeader />

      <Section pad="lg">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            Accompagnement · appel découverte gratuit
          </Badge>
          <h1 className="type-display">Parlons de ta visibilité.</h1>
          <p className="type-body-lg mt-6">
            30 minutes avec Max, le fondateur : on regarde ensemble où en est ta marque dans les
            IA et dans Google, et si l&apos;accompagnement a du sens pour toi. Pas de pitch
            commercial — si un de nos outils gratuits suffit, je te le dirai.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <CalContactEmbed />
          <p className="type-meta mt-4 text-center">
            Pas de créneau qui convient ? Écris-moi directement :{" "}
            <a
              href="mailto:hello@mamie-geo.fr?subject=Accompagnement%20SEO%20%2B%20GEO"
              className="font-medium text-[color:var(--color-ink)] underline-offset-2 hover:underline"
            >
              hello@mamie-geo.fr
            </a>
          </p>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}
