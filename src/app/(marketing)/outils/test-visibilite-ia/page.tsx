import type { Metadata } from "next";
import { Bot, Cat, Check, MessageCircle, Search, Sparkles } from "lucide-react";
import { Badge, Section } from "@/components/ui";
import { MarketingFooter } from "../../_sections/marketing-footer";
import { MarketingHeader } from "../../_sections/marketing-header";
import { AuditRequestForm } from "./audit-request-form";

export const metadata: Metadata = {
  title: "Test gratuit de visibilité IA",
  description:
    "Reçois un audit personnalisé gratuit de la visibilité de ta marque dans ChatGPT, Claude, Perplexity, Gemini et Le Chat de Mistral. Sous 24h, par email, sans carte bancaire.",
};

// Lead magnet "Test ma visibilité IA" — formulaire de capture
// d'audit gratuit. V0 : pas de génération temps réel pour éviter les
// abus publics ($0.15+ par audit). Le rapport est généré manuellement
// par l'équipe ops puis envoyé par email sous 24h.

const LLM_BADGES = [
  { name: "ChatGPT", tone: "green" as const, Icon: MessageCircle },
  { name: "Claude", tone: "purple" as const, Icon: Bot },
  { name: "Perplexity", tone: "blue" as const, Icon: Search },
  { name: "Gemini", tone: "orange" as const, Icon: Sparkles },
  { name: "Le Chat", tone: "pink" as const, Icon: Cat },
];

const INCLUSIONS = [
  "Score de visibilité IA sur les 5 LLMs",
  "Liste de 5 prompts critiques de ton secteur testés",
  "Comparatif avec 3 concurrents directs",
  "3 actions concrètes pour améliorer ton score",
  "Délai garanti : sous 24 h ouvrées par email",
];

export default function TestVisibiliteIAPage() {
  return (
    <>
      <MarketingHeader />

      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            Outil gratuit · audit personnalisé
          </Badge>
          <h1 className="type-display">
            Reçois un audit gratuit de ta <strong className="font-bold">visibilité IA</strong>.
          </h1>
          <p className="type-body-lg mt-6">
            On mesure pour toi si ChatGPT, Claude, Perplexity, Gemini et Le Chat de Mistral parlent
            de ta marque sur 5 questions critiques de ton secteur. Rapport personnalisé sous 24 h
            ouvrées.
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
          <AuditRequestForm />
        </div>
      </Section>

      <Section variant="tinted" pad="xl">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
          <div>
            <span className="type-eyebrow">Ce que tu reçois</span>
            <h2 className="type-h1 mt-3">Un rapport actionnable, pas un PDF générique.</h2>
            <p className="type-body mt-6 max-w-prose">
              Notre équipe lance ton audit manuellement : on génère 5 prompts pertinents pour ton
              secteur, on interroge les 5 IA, on score les résultats et on te livre un rapport avec
              3 actions concrètes à mettre en œuvre.
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
            On veut que tu puisses voir le niveau de qualité de Mamie GEO avant de t&apos;abonner.
            Le rapport est limité à 1 audit par marque pour qu&apos;on puisse le faire à la main
            avec soin. Si après l&apos;audit tu veux un suivi régulier, tu créeras un compte à
            partir de 9,99 €/mois — sans engagement, garantie remboursement 14 jours.
          </p>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}
