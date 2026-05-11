import { Bot, Cat, MessageCircle, Search, Sparkles, type LucideIcon } from "lucide-react";
import { Badge, CornerFrame, LinkButton, Section, StatusDot } from "@/components/ui";

// Home placeholder enrichi avec les patterns du brief 2026-05-11
// (4 screens d'inspiration) : badges colorés avec icônes pour les
// LLMs, CornerFrame en signature print, StatusDot pour les éléments
// "live". La vraie home complète (sans/avec, témoignages, founder,
// FAQ) arrive en PR 8 — l'objectif ici est juste de poser la DA
// pour que Max valide la direction.

export default function HomePage() {
  return (
    <>
      {/* Header */}
      <header className="border-b border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-base font-bold tracking-tight text-[color:var(--color-ink)]">
            Mamie GEO
          </span>
          <nav className="hidden gap-7 sm:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Tarif
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Connexion
            </a>
            <LinkButton href="/login" variant="primary" size="sm">
              Se connecter
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Hero — wrap dans CornerFrame pour signature print subtile */}
      <Section pad="xl">
        <CornerFrame className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center px-2 text-center sm:px-6">
            <Badge tone="accent" icon={<StatusDot tone="accent" pulse />} className="mb-8">
              Beta · Generative Engine Optimization
            </Badge>
            <h1 className="type-display">
              Sache enfin si <strong className="font-bold">ChatGPT</strong> parle de toi.
            </h1>
            <p className="type-body-lg mt-6 max-w-2xl">
              Mamie GEO mesure quotidiennement la visibilité de ta marque dans ChatGPT, Claude,
              Perplexity, Gemini et Le Chat de Mistral. En français, hébergé en Europe, à partir de
              49 €/mois.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/login" variant="primary" size="lg">
                Se connecter →
              </LinkButton>
              <LinkButton href="#features" variant="secondary" size="lg">
                Voir comment ça marche
              </LinkButton>
            </div>
            <p className="type-meta mt-6">
              14 jours d&apos;essai · Sans carte bancaire · 5 minutes pour s&apos;inscrire
            </p>
          </div>
        </CornerFrame>
      </Section>

      {/* Section LLMs trackés — badges colorés signature DA */}
      <Section variant="tinted" pad="lg">
        <div className="mx-auto max-w-4xl text-center">
          <span className="type-eyebrow">Sources trackées dès le jour J</span>
          <h2 className="type-h2 mt-3">
            Les 5 IA qui répondent aux questions de tes futurs clients.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {LLM_BADGES.map((llm) => (
              <Badge
                key={llm.name}
                tone={llm.tone}
                icon={<llm.Icon size={14} strokeWidth={2.2} />}
                className="px-3 py-1.5 text-sm"
              >
                {llm.name}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Section "Comment ça marche" */}
      <Section pad="xl" id="features">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Comment ça marche</span>
          <h2 className="type-h1 mt-3">Trois étapes pour mesurer ta visibilité IA.</h2>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.title}
              className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6"
            >
              <Badge tone={step.tone} className="mb-4">
                {step.eyebrow}
              </Badge>
              <h3 className="type-h3">{step.title}</h3>
              <p className="type-body mt-2">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8">
          <span className="text-sm font-semibold tracking-tight text-[color:var(--color-ink)]">
            Mamie GEO
          </span>
          <p className="type-meta">
            Site en construction. Suivre le journal de bord sur{" "}
            <a href="https://github.com/uimaxence/mamie-geo" className="link">
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </>
  );
}

const LLM_BADGES: {
  name: string;
  tone: "green" | "purple" | "blue" | "orange" | "pink";
  Icon: LucideIcon;
}[] = [
  { name: "ChatGPT", tone: "green", Icon: MessageCircle },
  { name: "Claude", tone: "purple", Icon: Bot },
  { name: "Perplexity", tone: "blue", Icon: Search },
  { name: "Gemini", tone: "orange", Icon: Sparkles },
  { name: "Le Chat", tone: "pink", Icon: Cat },
];

const STEPS: {
  eyebrow: string;
  tone: "blue" | "orange" | "green";
  title: string;
  description: string;
}[] = [
  {
    eyebrow: "Étape 01",
    tone: "blue",
    title: "Connecte ta marque",
    description:
      "Donne ton domaine, on suggère 10 prompts français représentatifs de tes audiences cibles.",
  },
  {
    eyebrow: "Étape 02",
    tone: "orange",
    title: "On interroge les IA pour toi",
    description:
      "Tous les jours à 6h, on demande à ChatGPT, Claude, Perplexity, Gemini et Le Chat les questions de tes futurs clients.",
  },
  {
    eyebrow: "Étape 03",
    tone: "green",
    title: "Tu reçois ton score de visibilité",
    description:
      "Dashboard quotidien, comparatif concurrents, email hebdo. Tu sais quoi corriger pour remonter dans les réponses IA.",
  },
];
