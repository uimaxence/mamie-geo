import { Bot, Cat, Check, MessageCircle, Search, Sparkles, type LucideIcon } from "lucide-react";
import { Badge, Section } from "@/components/ui";
import { MockupReport } from "./mockups/mockup-report";

// "Comment ça marche", 3 étapes (cf. doc 10 § Composants obligatoires).
// PR 11c : chaque card a maintenant un mini-mockup illustré au-dessus
// du texte (cf. screen 3 Max, Outreach services). La card centrale
// est "featured" avec un gradient warm comme dans le screen 2 (Tanj
// testimonials).
//
// Illustrations 100 % CSS/JSX, pas d'images binaires, chaque mockup
// est un mini-bout d'UI Mamie GEO miniaturisé.

export function HowItWorks() {
  return (
    <Section variant="tinted" pad="xl" id="how-it-works">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-eyebrow">Comment ça marche</span>
        <h2 className="type-h1 mt-3">Trois étapes pour mesurer ta visibilité IA, et savoir quoi faire.</h2>
      </div>

      <ol className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StepCard
          eyebrow="Étape 01"
          tone="blue"
          title="Ajoute ta marque et tes concurrents"
          description="30 secondes. Tu donnes ton domaine et 1 à 5 concurrents. Mamie GEO récupère tes aliases automatiquement."
          illustration={<MockupConfigure />}
        />
        <StepCard
          eyebrow="Étape 02"
          tone="orange"
          title="Mamie GEO génère 25 prompts pertinents"
          description="Auto, via IA. Des questions réelles que tes futurs clients posent sur ChatGPT, Claude et consorts."
          illustration={<MockupIA />}
        />
        <StepCard
          eyebrow="Étape 03"
          tone="green"
          title="Reçois ton rapport et tes actions de la semaine"
          description="En 10 minutes, puis chaque semaine : dashboard, comparatif concurrents, et 1 à 2 actions concrètes priorisées avec le résultat attendu pour grimper dans les réponses IA."
          illustration={<MockupReport />}
        />
      </ol>
    </Section>
  );
}

interface StepCardProps {
  eyebrow: string;
  tone: "blue" | "orange" | "green";
  title: string;
  description: string;
  illustration: React.ReactNode;
}

function StepCard({ eyebrow, tone, title, description, illustration }: StepCardProps) {
  return (
    <li className="card-hover-warm relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white">
      <div className="relative h-48 overflow-hidden">{illustration}</div>
      <div className="p-6">
        <Badge tone={tone} className="mb-3">
          {eyebrow}
        </Badge>
        <h3 className="type-h3">{title}</h3>
        <p className="type-body mt-2 text-sm">{description}</p>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Mini-mockups, chaque illustration est un bout d'UI miniaturisé
// ─────────────────────────────────────────────────────────────────────

// Étape 01 : 3 inputs empilés (workspace, marque, domaine) + check
// vert. Reproduit le style du wizard onboarding en miniature.
function MockupConfigure() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-gray-50)] px-6">
      <div className="w-full max-w-[240px] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-3 shadow-[var(--shadow-md)]">
        <MockField label="Workspace" value="Ma société" />
        <MockField label="Marque" value="Mamie GEO" />
        <MockField label="Domaine" value="mamie-geo.fr" />
        <div className="mt-2.5 flex items-center justify-end gap-1.5 text-xs text-[color:var(--color-success)]">
          <span className="flex size-3.5 items-center justify-center rounded-full bg-[color:var(--color-success-bg)]">
            <Check size={9} strokeWidth={3.5} />
          </span>
          <span className="font-medium">Sauvegardé</span>
        </div>
      </div>
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 first:mt-0">
      <p className="text-[9px] font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}

// Étape 02 (featured, sur gradient warm) : bubble "?" centrale +
// les 5 LLMs en cercle autour. La star du show, le moment magique.
function MockupIA() {
  const llms: { Icon: LucideIcon; tone: "green" | "purple" | "blue" | "orange" | "pink" }[] = [
    { Icon: MessageCircle, tone: "green" },
    { Icon: Bot, tone: "purple" },
    { Icon: Search, tone: "blue" },
    { Icon: Sparkles, tone: "orange" },
    { Icon: Cat, tone: "pink" },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      {/* Cercle central, la "question" envoyée aux 5 IA */}
      <div className="relative flex size-16 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-white shadow-[var(--shadow-lg)]">
        <Sparkles size={22} strokeWidth={2.2} />
      </div>

      {/* 5 badges LLM disposés en demi-cercle autour */}
      {llms.map((llm, idx) => {
        const angle = -90 + (idx * 180) / (llms.length - 1); // -90° à +90°
        const rad = (angle * Math.PI) / 180;
        const radius = 88;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        return (
          <div
            key={idx}
            className="absolute flex size-9 items-center justify-center rounded-full bg-white shadow-[var(--shadow-md)]"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <llm.Icon
              size={14}
              strokeWidth={2.2}
              className={
                llm.tone === "green"
                  ? "text-[color:var(--color-green)]"
                  : llm.tone === "purple"
                    ? "text-[color:var(--color-purple)]"
                    : llm.tone === "blue"
                      ? "text-[color:var(--color-blue)]"
                      : llm.tone === "orange"
                        ? "text-[color:var(--color-orange)]"
                        : "text-[color:var(--color-pink)]"
              }
            />
          </div>
        );
      })}
    </div>
  );
}

// Étape 03 : mockup déplacé dans ./mockups/mockup-report.tsx (client
// component avec Recharts AreaChart bleu primaire). Cf. doc 09
// § 2026-05-13 (9ᵉ itération polish UX).
