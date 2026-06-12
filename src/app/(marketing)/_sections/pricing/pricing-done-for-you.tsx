"use client";

import { Check } from "lucide-react";
import { Badge, LinkButton, Section } from "@/components/ui";
import { DFY_SLOTS_BADGE, DFY_SLOTS_LEFT } from "@/lib/done-for-you";
import { capture } from "@/lib/posthog-client";

// Offre « accompagnement done-for-you » (2026-06-12, doc 09) : Max
// s'occupe personnellement du SEO + GEO du client. Rareté centralisée
// dans src/lib/done-for-you.ts (affichée aussi sur /contact et les
// upsells des scans).

const INCLUSIONS = [
  "Audit complet SEO + GEO de ton site et de ta présence dans les 5 IA",
  "Inclusion sur les comparateurs et annuaires que les IA citent dans ton secteur",
  "Implémentation des correctifs avec toi (contenus, données structurées, RP ciblées)",
  "Suivi quotidien Mamie GEO Pro inclus pendant toute la durée",
  "Point mensuel en visio + rapport d'évolution du rang",
];

export function PricingDoneForYou() {
  return (
    <Section variant="tinted" pad="lg">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-[var(--radius-xl)] border-2 border-[color:var(--color-ink)] bg-white p-6 sm:p-10">
          <Badge tone="accent" className="absolute -top-3 left-6 px-2.5 py-1">
            {DFY_SLOTS_BADGE}
          </Badge>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
            <div>
              <span className="type-eyebrow">Accompagnement</span>
              <h2 className="type-h1 mt-3">Tu préfères déléguer&nbsp;? Je m&apos;en occupe.</h2>
              <p className="type-body mt-4">
                Je suis Max, le fondateur de Mamie GEO. Pour quelques clients par trimestre, je
                prends en main personnellement la visibilité SEO + GEO d&apos;une marque : de
                l&apos;audit à l&apos;implémentation, jusqu&apos;à ce que les IA te citent.
              </p>
              <p className="type-meta mt-4">
                Sur devis, engagement trimestriel. {DFY_SLOTS_LEFT} marques maximum par trimestre — je
                fais le travail moi-même, pas une équipe offshore.
              </p>
              <LinkButton
                href="/contact"
                variant="primary"
                size="lg"
                className="mt-6"
                onClick={() =>
                  capture("pricing_done_for_you_cta_clicked", { slots_left: DFY_SLOTS_LEFT })
                }
              >
                Réserver un appel découverte
              </LinkButton>
            </div>

            <ul className="flex flex-col gap-3 md:mt-9">
              {INCLUSIONS.map((inclusion) => (
                <li key={inclusion} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex shrink-0 size-4 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-ink)]">
                    <Check size={10} strokeWidth={3.5} />
                  </span>
                  <span className="text-[color:var(--color-ink-soft)]">{inclusion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
