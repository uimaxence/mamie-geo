import { Bot, Cat, Globe2, MessageCircle, Search, Sparkles, type LucideIcon } from "lucide-react";
import { Section } from "@/components/ui";
import { MockupCompetitors } from "./mockups/mockup-competitors";

// Section "Avant Mamie GEO, après Mamie GEO", refonte PR 12c en
// bento 2×2 (cf. screenshot Max BrightNest/style services). On garde
// la dichotomie Sans/Avec mais on l'exprime en 4 cards visuelles
// plutôt qu'une liste de 12 puces. La douleur "Sans" est résumée
// dans l'intro, puis 4 cards "Avec" montrent les benefits clés avec
// mini-illustration.

export function SansAvec() {
  return (
    <Section pad="xl" id="sans-avec">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">La différence</span>
        <h2 className="type-h1 mt-3">Avant Mamie GEO, après Mamie GEO.</h2>
        <p className="type-body mt-4 mx-auto max-w-2xl">
          Sans Mamie GEO : 4 h d&apos;audits manuels par mois, fichiers Excel hebdomadaires, et un
          concurrent qui te dépasse dans ChatGPT en silence. Voici ce qui change.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        <BentoCard
          title="Les 5 IA grand public, sous contrôle."
          description="ChatGPT, Claude, Perplexity, Gemini et Le Chat, interrogées chaque jour avec tes prompts, sans que tu lèves le petit doigt."
          illustration={<MockupLLMs />}
        />
        <BentoCard
          title="Le Chat de Mistral, inclus sans condition."
          description="Pas tracké chez Profound, RankIQ ou Peec AI. Chez Mamie GEO, c'est dans tous les plans dès 9,99 €/mois."
          illustration={<MockupLeChat />}
        />
        <BentoCard
          title="Hébergé en Europe, RGPD natif."
          description="Vercel Paris (cdg1), Neon Frankfurt, Cloudflare R2 EU. Aucune donnée ne quitte le territoire. DPA disponible sur demande pour tous les plans."
          illustration={<MockupEurope />}
        />
        <BentoCard
          title="Tes concurrents en miroir."
          description="Les 5 concurrents que tu choisis sont trackés en parallèle. Tu vois en temps réel qui te dépasse, avant d'apprendre par hasard."
          illustration={<MockupCompetitors />}
        />
      </div>
    </Section>
  );
}

interface BentoCardProps {
  title: string;
  description: string;
  illustration: React.ReactNode;
}

function BentoCard({ title, description, illustration }: BentoCardProps) {
  return (
    <article className="card-hover-warm flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
      <div className="relative h-44 overflow-hidden">{illustration}</div>
      <div className="p-6">
        <h3 className="type-h3">{title}</h3>
        <p className="type-body mt-2 text-sm">{description}</p>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Mini-mockups, 4 illustrations 100 % CSS/JSX
// ─────────────────────────────────────────────────────────────────────

// Card 1 : 5 LLM badges flottants disposés en cluster, fond gris-50
function MockupLLMs() {
  const llms: { Icon: LucideIcon; tone: string; pos: string }[] = [
    { Icon: MessageCircle, tone: "var(--color-green)", pos: "top-6 left-1/2 -translate-x-1/2" },
    { Icon: Bot, tone: "var(--color-purple)", pos: "top-1/2 left-8 -translate-y-1/2" },
    { Icon: Search, tone: "var(--color-blue)", pos: "top-1/2 right-8 -translate-y-1/2" },
    { Icon: Sparkles, tone: "var(--color-orange)", pos: "bottom-6 left-[28%]" },
    { Icon: Cat, tone: "var(--color-pink)", pos: "bottom-6 right-[28%]" },
  ];

  return (
    <div className="absolute inset-0 bg-[color:var(--color-gray-50)]">
      {/* Dots décoratifs subtils pour le background "graph paper" */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      {llms.map((llm, idx) => (
        <div
          key={idx}
          className={`absolute flex size-12 items-center justify-center rounded-full bg-white shadow-[var(--shadow-md)] ${llm.pos}`}
        >
          <llm.Icon size={18} strokeWidth={2.2} style={{ color: llm.tone }} />
        </div>
      ))}
    </div>
  );
}

// Card 2 : icône Cat dans un grand cercle pink soft + badge "Inclus"
function MockupLeChat() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-gray-50)]">
      <div className="relative">
        <div
          className="flex size-24 items-center justify-center rounded-full shadow-[var(--shadow-md)]"
          style={{ backgroundColor: "var(--color-pink-bg)" }}
        >
          <Cat size={40} strokeWidth={1.8} style={{ color: "var(--color-pink)" }} />
        </div>
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[var(--radius-pill)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-[var(--shadow-md)]"
          style={{ color: "var(--color-pink)" }}
        >
          Inclus
        </span>
      </div>
    </div>
  );
}

// Card 3 : globe icon + drapeau EU style + texte
function MockupEurope() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-gray-50)]">
      <div className="relative flex flex-col items-center gap-3">
        <div
          className="flex size-20 items-center justify-center rounded-full shadow-[var(--shadow-md)]"
          style={{ backgroundColor: "var(--color-blue-bg)" }}
        >
          <Globe2 size={32} strokeWidth={1.8} style={{ color: "var(--color-blue)" }} />
        </div>
        <div className="flex items-center gap-2 rounded-[var(--radius-pill)] bg-white px-3 py-1.5 shadow-[var(--shadow-sm)]">
          <span aria-hidden className="text-base leading-none">
            🇪🇺
          </span>
          <span className="text-xs font-medium text-[color:var(--color-ink)]">EU only</span>
        </div>
      </div>
    </div>
  );
}

// Card 4 : mockup déplacé dans ./mockups/mockup-competitors.tsx (client
// component avec Recharts BarChart bleu primaire). Cf. doc 09
// § 2026-05-13 (9ᵉ itération polish UX).
