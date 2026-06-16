import type { Metadata } from "next";
import { Badge, Section } from "@/components/ui";
import { DFY_SLOTS_BADGE } from "@/lib/done-for-you";
import { CalContactEmbed } from "@/components/marketing/cal-contact-embed";
import { FounderPortrait } from "@/components/marketing/founder-portrait";
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
          <div className="mt-8 flex flex-col items-center gap-3">
            <FounderPortrait size={112} />
            <p className="text-sm font-semibold text-[color:var(--color-ink)]">
              Maxence Cailleau
              <span className="font-normal text-[color:var(--color-ink-soft)]">
                {" "}
                — fondateur de Mamie GEO
              </span>
            </p>
          </div>
          <p className="type-body-lg mt-6">
            30 minutes ensemble : on regarde où en est ta marque dans les IA et dans Google, et si
            l&apos;accompagnement a du sens pour toi. Pas de pitch commercial — si un de nos outils
            gratuits suffit, je te le dirai.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          {/* Récap de l'offre — vente clean, mêmes codes que /pricing. */}
          <div className="mb-8 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="type-h3">Accompagnement SEO + GEO par le fondateur</h2>
              <Badge tone="accent">{DFY_SLOTS_BADGE}</Badge>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                "Audit complet SEO + GEO + visibilité 5 IA",
                "Inclusion sur les comparateurs que les IA citent",
                "Implémentation des correctifs avec toi",
                "Suivi Mamie GEO Pro + point mensuel inclus",
              ].map((item) => (
                <li
                  key={item}
                  className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]"
                >
                  · {item}
                </li>
              ))}
            </ul>
            <p className="type-meta mt-4">
              Sur devis, engagement trimestriel — je fais le travail moi-même, d&apos;où le nombre
              de créneaux limité.
            </p>
          </div>

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
