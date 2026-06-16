import type { Metadata } from "next";
import { Globe, ListChecks, Search } from "lucide-react";
import { Badge, Section } from "@/components/ui";
import { MarketingFooter } from "../../_sections/marketing-footer";
import { MarketingHeader } from "../../_sections/marketing-header";
import { ComparatorForm } from "./comparator-form";

export const metadata: Metadata = {
  title: "Scan comparateurs gratuit — es-tu sur les sites que les IA citent ?",
  description:
    "32 % des sources citées par ChatGPT, Claude, Perplexity, Gemini et Le Chat sont des comparateurs. Vérifie gratuitement en 10 secondes si ta marque est présente sur les comparateurs et annuaires de ton secteur.",
  alternates: { canonical: "/outils/comparateurs" },
};

// Le scan fait ~10 recherches web (parallélisées, mais avec retry 429
// possible) : marge pour que la server action ne soit jamais coupée.
export const maxDuration = 60;

// Lead magnet « scan comparateurs » (doc 06) — né de
// l'enseignement n°1 de l'étude 50 marques (doc 11) : les IA citent
// les comparateurs (32 % des sources), pas les sites de marque (1,7 %).
// Cible PME / petites agences / freelances : verdict immédiat + plan
// d'action. Vérification 100 % recherche web (déterministe) ; seuls la
// classification des sites et les conseils passent par Mistral Small.

export default function ComparateursPage() {
  return (
    <>
      <MarketingHeader />

      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            Outil gratuit · nouveau
          </Badge>
          <h1 className="type-display">
            Les IA ne citent pas ton site.{" "}
            <strong className="font-bold">Elles citent les comparateurs.</strong>
          </h1>
          <p className="type-body-lg mt-6">
            Sur 722 sources citées par ChatGPT, Claude, Perplexity, Gemini et Le Chat dans notre
            étude, <strong>32&nbsp;% sont des comparateurs et annuaires</strong> — contre 1,7&nbsp;%
            seulement le site des marques. Ce scan vérifie ta présence sur ces{" "}
            <strong>sites sources</strong> — les pages que les IA lisent avant de répondre. (Pour
            voir ce que les IA répondent, c&apos;est le{" "}
            <a href="/outils/test-visibilite-ia" className="underline underline-offset-2">
              test de visibilité IA
            </a>
            .)
          </p>
        </div>

        <div className="mt-12">
          <ComparatorForm />
        </div>
      </Section>

      <Section variant="tinted" pad="xl">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="type-eyebrow">Comment ça marche</span>
            <h2 className="type-h1 mt-3">Des vraies recherches web, pas une démo marketing.</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StepCard
              Icon={Search}
              step="1"
              title="On trouve les sites qui comptent"
              text="Recherches web en direct sur « meilleur {ton secteur} » : les pages qui rankent là sont précisément celles que les IA lisent avant de répondre. On y ajoute les comparateurs validés par notre étude."
            />
            <StepCard
              Icon={Globe}
              step="2"
              title="On vérifie ta présence, site par site"
              text="Pour chaque comparateur ou annuaire, une recherche ciblée vérifie si ta marque y est référencée — avec le lien de la page quand elle existe."
            />
            <StepCard
              Icon={ListChecks}
              step="3"
              title="Tu repars avec un plan d'action"
              text="Verdict présent/absent par site, et les 3 étapes concrètes pour être inclus là où tu manques. C'est l'action GEO n°1, avant même de toucher à ton site."
            />
          </div>
        </div>
      </Section>

      <Section pad="xl">
        <div className="mx-auto max-w-3xl">
          <span className="type-eyebrow">Pourquoi les comparateurs ?</span>
          <h2 className="type-h1 mt-3">Le GEO ne se joue pas sur ton site.</h2>
          <p className="type-body-lg mt-6 max-w-prose">
            On a mesuré la visibilité des 50 plus grosses marques françaises dans 5 IA (banque,
            assurance, énergie, télécom…). Résultat : quand une IA cite ses sources, c&apos;est un
            comparateur dans 32&nbsp;% des cas, la presse spécialisée dans 6&nbsp;%, et le site de
            la marque dans 1,7&nbsp;% seulement.
          </p>
          <p className="type-body-lg mt-4 max-w-prose">
            Autrement dit :{" "}
            <strong>
              être premier chez les comparateurs, c&apos;est être premier dans les réponses des IA
            </strong>
            . Et l&apos;inverse est brutal — les IA ne disent jamais de mal d&apos;une marque
            absente. Elles font pire&nbsp;: elles la remplacent par un concurrent.
          </p>
          <p className="type-body-lg mt-4 max-w-prose">
            Ce scan est la version express de ce qu&apos;on mesure en continu dans Mamie GEO&nbsp;:
            qui est cité, à quelle position, par quelle IA, et d&apos;où viennent les sources.
          </p>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}

function StepCard({
  Icon,
  step,
  title,
  text,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-[var(--radius-pill)] bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)] shadow-[var(--shadow-sm)]">
          <Icon size={16} strokeWidth={2} />
        </span>
        <span className="type-eyebrow">Étape {step}</span>
      </div>
      <h3 className="type-h3 mt-4">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">{text}</p>
    </div>
  );
}
