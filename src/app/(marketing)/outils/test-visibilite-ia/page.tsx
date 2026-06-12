import type { Metadata } from "next";
import { Bot, Cat, Check, MessageCircle, Search, Sparkles } from "lucide-react";
import { Badge, Section } from "@/components/ui";
import { MarketingFooter } from "../../_sections/marketing-footer";
import { MarketingHeader } from "../../_sections/marketing-header";
import { ExpressScanForm } from "./express-scan-form";

export const metadata: Metadata = {
  title: "Test gratuit de visibilité IA, résultat immédiat",
  description:
    "Teste en direct si une IA cite ta marque : 3 questions de ton secteur posées en live, verdict en 15 secondes. Puis compare sur ChatGPT, Claude, Perplexity, Gemini et Le Chat. Gratuit, sans carte bancaire.",
  alternates: { canonical: "/outils/test-visibilite-ia" },
};

// Le scan pose 3 prompts en live à Mistral (+ 1 appel d'extraction) :
// marge pour que la server action ne soit jamais coupée.
export const maxDuration = 60;

// Lead magnet « Test ma visibilité IA » — funnel refondu 2026-06-12
// (doc 09) : scan express live (3 prompts × Le Chat) avec verdict
// immédiat, les 4 autres IA verrouillées → CTA trial. L'audit manuel
// 24 h (ex-funnel principal) devient l'upsell post-scan.

const LLM_BADGES = [
  { name: "ChatGPT", tone: "green" as const, Icon: MessageCircle },
  { name: "Claude", tone: "purple" as const, Icon: Bot },
  { name: "Perplexity", tone: "blue" as const, Icon: Search },
  { name: "Gemini", tone: "orange" as const, Icon: Sparkles },
  { name: "Le Chat", tone: "pink" as const, Icon: Cat },
];

const INCLUSIONS = [
  "3 questions de ton secteur posées à une IA, en direct",
  "Verdict immédiat : cité ou pas, à quelle position",
  "Les marques que l'IA recommande à ta place",
  "Récap par email + les deux suites possibles : app ou accompagnement",
  "Gratuit, sans carte bancaire",
];

export default function TestVisibiliteIAPage() {
  return (
    <>
      <MarketingHeader />

      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            Outil gratuit · résultat immédiat
          </Badge>
          <h1 className="type-display">
            Teste ta <strong className="font-bold">visibilité IA</strong>, en direct.
          </h1>
          <p className="type-body-lg mt-6">
            On pose 3 vraies questions de ton secteur à une IA, sous tes yeux. En 15 secondes tu
            sais si elle te cite — ou si elle recommande tes concurrents à ta place. (Pour vérifier
            ta présence sur les sites sources que les IA consultent, c&apos;est le{" "}
            <a href="/outils/comparateurs" className="underline underline-offset-2">
              scan comparateurs
            </a>
            .)
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {LLM_BADGES.map((llm) => (
              <Badge key={llm.name} tone={llm.tone} icon={<llm.Icon size={12} strokeWidth={2.2} />}>
                {llm.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <ExpressScanForm />
        </div>
      </Section>

      <Section variant="tinted" pad="xl">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
          <div>
            <span className="type-eyebrow">Ce que tu obtiens</span>
            <h2 className="type-h1 mt-3">Un vrai test, pas une démo marketing.</h2>
            <p className="type-body mt-6 max-w-prose">
              Le scan interroge une IA en direct avec les questions que tes prospects posent
              réellement. Tu vois la réponse telle qu&apos;elle est : qui est cité, dans quel
              ordre, et si tu en fais partie. Pour les 4 autres IA — où les résultats varient
              jusqu&apos;à ×8 — c&apos;est le suivi quotidien de l&apos;app qui prend le relais.
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
          <span className="type-eyebrow">Pourquoi gratuit ?</span>
          <h2 className="type-h1 mt-3">Pas de paywall, pas de carte bancaire.</h2>
          <p className="type-body-lg mt-6 max-w-prose">
            On veut que tu voies le niveau de qualité de Mamie GEO avant de t&apos;abonner. Le scan
            express est limité à 1 par marque et par jour. Pour les 5 IA et le suivi quotidien,
            l&apos;app démarre à 9,99 €/mois — essai 14 jours, garantie remboursement 14 jours. Et
            si tu préfères déléguer, Max prend quelques marques par trimestre en accompagnement.
          </p>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}
