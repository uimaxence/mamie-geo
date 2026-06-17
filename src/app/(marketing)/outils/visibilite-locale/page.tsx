import type { Metadata } from "next";
import { Check, MapPin } from "lucide-react";
import { Badge, Section } from "@/components/ui";
import { MarketingFooter } from "../../_sections/marketing-footer";
import { MarketingHeader } from "../../_sections/marketing-header";
import { LocalMapForm } from "./local-map-form";

export const metadata: Metadata = {
  title: "Carte de visibilité IA locale — l'IA te recommande-t-elle dans ta ville ?",
  description:
    "Entre ton site et ta ville : on demande à l'IA « le meilleur {ton activité} » dans ta ville et les communes autour, et on allume ta carte de visibilité locale. Là où tu es absent, l'IA recommande tes concurrents. Gratuit, sans carte bancaire.",
  alternates: { canonical: "/outils/visibilite-locale" },
};

// Le scan interroge l'IA pour ~5 villes (+ 1 appel villes + 1 extraction) :
// marge pour que la server action ne soit jamais coupée.
export const maxDuration = 60;

// Lead magnet « Carte de visibilité IA locale » — concept GEO local
// (doc 09 § 2026-06-17). Personne ne track l'intention LOCALE des IA
// (« meilleur {métier} à {ville} »), alors que la cible PME/freelance FR
// est ultra-locale. La carte qui s'allume = visuel partageable + funnel.

const INCLUSIONS = [
  "Ta ville + 4 communes autour, interrogées à l'IA en direct",
  "Verdict par ville : l'IA te recommande, ou cite un concurrent à ta place",
  "Une carte qui s'allume — vert là où tu es cité, rouge là où tu manques",
  "Récap par email + les deux suites : suivi des 5 IA, ou accompagnement",
  "Gratuit, sans carte bancaire",
];

export default function VisibiliteLocalePage() {
  return (
    <>
      <MarketingHeader />

      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            <MapPin size={12} className="mr-1 inline" /> Outil gratuit · nouveau
          </Badge>
          <h1 className="type-display">
            L&apos;IA te recommande-t-elle <strong className="font-bold">dans ta ville</strong> ?
          </h1>
          <p className="type-body-lg mt-6">
            Tes clients demandent à ChatGPT et Le Chat « le meilleur {"{ton métier}"} à{" "}
            {"{ta ville}"} ». On pose la question pour ta ville et les communes autour, en direct,
            et on allume ta carte : là où tu es absent, l&apos;IA envoie tes clients chez tes
            concurrents.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <LocalMapForm />
        </div>
      </Section>

      <Section variant="tinted" pad="xl">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
          <div>
            <span className="type-eyebrow">Ce que tu obtiens</span>
            <h2 className="type-h1 mt-3">Le référencement local, version IA.</h2>
            <p className="type-body mt-6 max-w-prose">
              Le SEO local a fait vivre des milliers de commerces sur Google. Aujourd&apos;hui, tes
              clients posent la question à une IA — et la réponse n&apos;est pas la même d&apos;une
              ville à l&apos;autre. Cet outil te montre, ville par ville, si tu existes pour
              l&apos;IA ou si elle recommande quelqu&apos;un d&apos;autre à ta place.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {INCLUSIONS.map((inclusion) => (
              <li key={inclusion} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex shrink-0 size-5 items-center justify-center rounded-full bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-[color:var(--color-ink-soft)]">{inclusion}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section pad="xl">
        <div className="mx-auto max-w-3xl">
          <span className="type-eyebrow">Pourquoi c&apos;est différent</span>
          <h2 className="type-h1 mt-3">Tout le monde regarde le national. Toi, tu vis du local.</h2>
          <p className="type-body-lg mt-6 max-w-prose">
            Les outils de visibilité IA testent « le meilleur {"{secteur}"} » au niveau national —
            inutile pour un commerce ou un service local. Mamie GEO est le seul à interroger les IA
            ville par ville. Le scan local est limité à 1 par marque et par jour ; pour suivre ta
            carte sur les 5 IA et dans le temps, l&apos;app démarre à 9,99 €/mois — essai 14 jours.
          </p>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}
