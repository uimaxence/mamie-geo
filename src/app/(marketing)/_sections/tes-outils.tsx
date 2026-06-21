import {
  Activity,
  ListChecks,
  Mail,
  MessageCircle,
  PieChart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui";

// "Tes outils", 5 features nommées (cf. doc 09 § 2026-05-13). Refresh
// inspiré Semrush qui nomme 12 features ; nous en gardons 5 (V0 honnête,
// vocabulaire FR ownable). Position : après HowItWorks, avant PourQui.
//
// Vocabulaire défini dans doc 02 § Glossaire :
//   - Score de visibilité IA : note 0-100 par LLM
//   - Part de voix : % citations vs concurrents sur un prompt
//   - Sentiment : flatteur / neutre / critique (enum qualitatif)

type Tone = "orange" | "blue" | "purple" | "green" | "pink";

interface Feature {
  name: string;
  pitch: string;
  Icon: LucideIcon;
  tone: Tone;
}

const FEATURES: Feature[] = [
  {
    name: "Actions de la semaine",
    pitch:
      "1 à 2 gestes priorisés à partir de tes données, de tes concurrents et de ton marché, avec le résultat attendu. Tu valides, tu recommences.",
    Icon: ListChecks,
    tone: "orange",
  },
  {
    name: "Part de voix",
    pitch:
      "Ton pourcentage de citations vs tes concurrents sur chaque prompt. Repère qui rafle la mise dans ton vertical.",
    Icon: PieChart,
    tone: "blue",
  },
  {
    name: "Sentiment",
    pitch:
      "Quand l'IA te cite, est-ce flatteur, neutre ou critique ? Scoring qualitatif via Claude Haiku 4.5.",
    Icon: MessageCircle,
    tone: "purple",
  },
  {
    name: "Comparatif concurrents",
    pitch:
      "5 à 25 concurrents trackés en parallèle. Mêmes prompts, même fréquence. Tu sais qui te dépasse et sur quoi.",
    Icon: Users,
    tone: "green",
  },
  {
    name: "Rapport hebdo",
    pitch:
      "Email tous les lundis matin avec le delta vs semaine précédente et ton action prioritaire. Dashboard accessible à tout moment.",
    Icon: Mail,
    tone: "pink",
  },
  {
    name: "Score de visibilité IA",
    pitch:
      "Une note 0-100 par LLM, calculée chaque jour à partir des prompts trackés. Combine taux de citation, position dans la réponse, sentiment.",
    Icon: Activity,
    tone: "orange",
  },
];

const TONE_BG: Record<Tone, string> = {
  orange: "bg-[color:var(--color-orange-bg)] text-[color:var(--color-orange)]",
  blue: "bg-[color:var(--color-blue-bg)] text-[color:var(--color-blue)]",
  purple: "bg-[color:var(--color-purple-bg)] text-[color:var(--color-purple)]",
  green: "bg-[color:var(--color-green-bg)] text-[color:var(--color-green)]",
  pink: "bg-[color:var(--color-pink-bg)] text-[color:var(--color-pink)]",
};

export function TesOutils() {
  return (
    <Section pad="xl" id="tes-outils" className="relative overflow-hidden">
      {/* Ambient blue blob, touche de couleur primaire bleu logo,
       * radial gradient très faible dans le coin haut-droit. Cf. doc 09
       * § 2026-05-13 (9ᵉ itération : injection couleur dans sections plates). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 -right-40 size-[560px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(50, 156, 255, 0.14) 0%, rgba(50, 156, 255, 0.05) 35%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Ce que tu as dans le compte</span>
        <h2 className="type-h1 mt-3">Six outils dans le même compte.</h2>
        <p className="type-body-lg mt-4 text-[color:var(--color-ink-soft)]">
          Pas un Frankenstein. Tout est connecté, tout parle au dashboard, tout finit en actions.
        </p>
      </div>

      <ul className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.name}
            className="card-hover-warm flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6"
          >
            <span
              aria-hidden
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${TONE_BG[feature.tone]}`}
            >
              <feature.Icon size={18} strokeWidth={2} />
            </span>
            <h3 className="type-h3 mt-1">{feature.name}</h3>
            <p className="type-body text-sm">{feature.pitch}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
