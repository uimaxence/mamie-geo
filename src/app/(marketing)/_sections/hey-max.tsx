import { Check } from "lucide-react";
import { Section } from "@/components/ui";

// "Hey, c'est Max 👋" — founder visible (cf. doc 10 § Composants
// obligatoires). Photo placeholder à remplacer par une vraie photo
// par Max (avatar initiales MC sur pastille terracotta en attendant).
// Histoire courte + 4 engagements + liens socials.
//
// Volontairement à la 1re personne pour matcher le ton.

const COMMITMENTS = [
  "Hébergement européen (Vercel cdg1 + Neon Frankfurt)",
  "Pas d'ads, jamais — Mamie GEO vit du SaaS, pas de tes données",
  "Pricing transparent : les 3 plans sur la page Tarif, pas de devis caché",
  "Pas de levée de fonds avant 200 clients payants — Mamie reste indépendante",
];

export function HeyMax() {
  return (
    <Section variant="tinted" pad="xl">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-[auto_1fr] md:items-start">
        {/* Avatar — placeholder initiales en attendant photo réelle */}
        <div className="flex md:flex-col items-center md:items-start gap-4">
          <div
            className="flex size-24 items-center justify-center rounded-full text-3xl font-semibold text-white"
            style={{ backgroundColor: "var(--color-accent)" }}
            aria-hidden
          >
            MC
          </div>
          <div className="flex flex-col gap-1">
            <p className="type-eyebrow">Founder</p>
            <p className="font-semibold text-[color:var(--color-ink)]">Maxence Cailleau</p>
          </div>
        </div>

        {/* Histoire */}
        <div>
          <span className="type-eyebrow">À propos</span>
          <h2 className="type-h1 mt-3">Hey, c&apos;est Max 👋</h2>

          <div className="type-body-lg mt-6 flex flex-col gap-4 max-w-2xl">
            <p>
              Freelance SEO depuis 4 ans, j&apos;ai vu mes clients me demander «&nbsp;et pour
              ChatGPT, on y est ?&nbsp;» pendant des mois. Je haussais les épaules — pas
              d&apos;outil francophone, et payer 500 $/mois Profound pour ne pas tracker Le Chat de
              Mistral, sérieux ?
            </p>
            <p>
              J&apos;ai monté Mamie GEO pour répondre à cette question. Un outil français, hébergé
              en Europe, qui inclut Le Chat dès le 1<sup>er</sup> plan. À 49 €/mois pour les
              freelances et PME.
            </p>
            <p>
              Suivre l&apos;avancée du projet : blog{" "}
              <a href="https://mamie-seo.fr" className="link">
                mamie-seo.fr
              </a>
              , GitHub{" "}
              <a href="https://github.com/uimaxence/mamie-geo" className="link">
                uimaxence/mamie-geo
              </a>
              , ou en{" "}
              <a href="mailto:hello@mamie-geo.fr" className="link">
                me contactant
              </a>
              .
            </p>
          </div>

          {/* Engagements */}
          <div className="mt-10 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
            <p className="type-eyebrow">Mes engagements</p>
            <ul className="mt-4 flex flex-col gap-3">
              {COMMITMENTS.map((commitment) => (
                <li key={commitment} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex shrink-0 size-5 items-center justify-center rounded-full bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[color:var(--color-ink-soft)]">{commitment}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
